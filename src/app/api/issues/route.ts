import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { createGitHubClient } from '@/lib/github/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prId, org, repo, findings, prNumber } = body;

    if (!prId || !org || !repo || !findings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();
    const github = createGitHubClient();
    const createdIssues: any[] = [];

    // Group findings by severity
    const critical = findings.filter(f => f.severity === 'critical');
    const high = findings.filter(f => f.severity === 'high');

    // Create GitHub issues for critical and high severity findings
    for (const finding of [...critical, ...high]) {
      try {
        const title = `${finding.analyzer}: ${finding.message}`;
        const body = `
## Issue Details

**Analyzer**: ${finding.analyzer}
**Severity**: ${finding.severity}
**File**: ${finding.file}
**Line**: ${finding.line}

### Description
${finding.description || finding.message}

### Recommendation
${finding.recommendation || 'Please review and fix this issue.'}

---
Found in PR #${prNumber}`;

        await github.createIssue(
          org,
          repo,
          title,
          body,
          [finding.severity, finding.analyzer]
        );

        // Store issue reference in database
        const { data } = await supabase
          .from('issues')
          .insert({
            pr_id: prId,
            analyzer: finding.analyzer,
            severity: finding.severity,
            title,
            description: finding.message,
            file: finding.file,
            line: finding.line,
            status: 'open',
          })
          .select()
          .single();

        createdIssues.push(data);
      } catch (error) {
        console.error('[v0] Failed to create issue:', error);
      }
    }

    return NextResponse.json({
      success: true,
      issuesCreated: createdIssues.length,
      issues: createdIssues,
    });
  } catch (error) {
    console.error('[v0] Issues API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create issues' },
      { status: 500 }
    );
  }
}
