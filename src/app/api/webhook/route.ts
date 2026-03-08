import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  parseWebhookPayload,
  isRelevantPREvent,
} from '@/lib/github/webhook';
import { createGitHubClient } from '@/lib/github/client';
import { runAllAnalyzers } from '@/lib/analyzers';
import { getSupabaseServer } from '@/lib/supabase/server';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const payload = await request.text();
    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookPayload = parseWebhookPayload(payload);

    // Only process relevant PR events
    if (!isRelevantPREvent(webhookPayload)) {
      return NextResponse.json({ status: 'skipped' });
    }

    const pr = webhookPayload.pull_request!;
    const repo = webhookPayload.repository!;
    const org = webhookPayload.organization?.login || repo.owner.login;

    // Store PR in database
    const supabase = getSupabaseServer();
    const github = createGitHubClient();

    // Fetch full PR details
    const prDetails = await github.getPR(org, repo.name, pr.number);

    // Create PR record
    const { data: prRecord } = await supabase
      .from('pull_requests')
      .insert({
        org_name: org,
        repo_name: repo.name,
        pr_number: pr.number,
        title: pr.title,
        body: pr.body,
        author: pr.user.login,
        url: `https://github.com/${org}/${repo.name}/pull/${pr.number}`,
        status: 'analyzing',
        head_sha: pr.head.sha,
      })
      .select()
      .single();

    console.log('[v0] PR record created:', prRecord?.id);

    // Analyze each file
    const analyses: any[] = [];
    for (const file of prDetails.files) {
      if (!file.patch) continue;

      // Run analyzers
      const result = await runAllAnalyzers([file.filename], file.patch);

      // Store each finding
      for (const analysis of result.analyses) {
        for (const finding of analysis.findings) {
          await supabase.from('findings').insert({
            pr_id: prRecord?.id,
            analyzer: analysis.analyzer,
            severity: finding.severity,
            message: finding.message,
            file: file.filename,
            line: finding.line,
            data: finding,
          });
        }
      }

      analyses.push(result);
    }

    // Update PR status
    await supabase
      .from('pull_requests')
      .update({
        status: 'reviewed',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', prRecord?.id);

    // Post summary comment
    const totalIssues = analyses.reduce((sum, a) => sum + (a.totalIssues || 0), 0);
    const autoFixable = analyses.reduce((sum, a) => sum + (a.autoFixableCount || 0), 0);

    const comment = `## 🔍 RepoLens Review

**Summary**: Analyzed ${prDetails.files.length} files
- 🚨 Issues found: ${totalIssues}
- 🔧 Auto-fixable: ${autoFixable}

**Analyzers Run**: Code Quality, Security, Performance, Architecture, Linting, Documentation

[View full review details](${env.NEXT_PUBLIC_BASE_URL}/review/${prRecord?.id})`;

    await github.postReview(org, repo.name, pr.number, comment);

    return NextResponse.json({
      status: 'analyzed',
      prId: prRecord?.id,
      filesAnalyzed: prDetails.files.length,
      totalIssues,
      autoFixable,
    });
  } catch (error) {
    console.error('[v0] Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
