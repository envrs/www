import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  parseWebhookPayload,
  isRelevantPREvent,
  extractPRMetadata,
} from '@/lib/github/webhook';
import { getPR, postReview } from '@/lib/github/client';
import { runAllAnalyzers } from '@/lib/analyzers';
import {
  getSupabaseServer,
  createPullRequest,
  createFinding,
  updatePullRequestStatus,
} from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { validateGitHubPayload } from '@/lib/validation';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Verify webhook signature
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature) {
      logger.warn('Webhook missing signature');
      return NextResponse.json(
        { error: 'Missing X-Hub-Signature-256 header' },
        { status: 401 }
      );
    }

    const payload = await request.text();
    if (!verifyWebhookSignature(payload, signature)) {
      logger.warn('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Step 2: Parse and validate webhook payload
    const webhookPayload = parseWebhookPayload(payload);
    
    try {
      validateGitHubPayload(webhookPayload);
    } catch (error) {
      logger.warn('Webhook payload validation failed', {}, error as Error);
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Step 3: Check if this is a relevant PR event
    if (!isRelevantPREvent(webhookPayload)) {
      logger.info('Skipping non-relevant webhook event', { action: webhookPayload.action });
      return NextResponse.json({ status: 'skipped' });
    }

    // Step 4: Extract PR metadata
    const prMetadata = extractPRMetadata(webhookPayload);
    const context = {
      orgId: prMetadata.org,
      repoId: prMetadata.repo,
      prId: String(prMetadata.prNumber),
    };

    logger.info('Processing webhook', context);

    // Step 5: Fetch full PR details
    let prDetails;
    try {
      prDetails = await getPR(
        prMetadata.org,
        prMetadata.repo,
        prMetadata.prNumber
      );
    } catch (error) {
      logger.error('Failed to fetch PR details', context, error as Error);
      throw new AppError('GITHUB_ERROR', 'Failed to fetch PR details', 502);
    }

    // Step 6: Create PR record in database
    const supabase = await getSupabaseServer();
    let prRecord;
    try {
      prRecord = await createPullRequest({
        org_name: prMetadata.org,
        repo_name: prMetadata.repo,
        number: prMetadata.prNumber,
        title: prMetadata.title,
        body: prMetadata.body,
        author: prMetadata.author,
        url: prMetadata.htmlUrl,
        status: 'analyzing',
        head_sha: prMetadata.headSha,
      });
    } catch (error) {
      logger.error('Failed to create PR record', context, error as Error);
      throw new AppError('DB_ERROR', 'Failed to store PR data', 500);
    }

    logger.info('PR record created', { ...context, prId: prRecord.id });

    // Step 7: Analyze each file
    const { analyses, totalIssues, autoFixableCount } = await runAllAnalyzers(
      prDetails.files.map((f: any) => f.filename),
      prDetails.files.map((f: any) => f.patch || '').join('\n'),
      context
    );

    // Step 8: Store findings in database
    for (const analysis of analyses) {
      for (const finding of analysis.findings) {
        try {
          await createFinding({
            pr_id: prRecord.id,
            analyzer: analysis.analyzer,
            severity: finding.severity,
            issue: finding.issue,
            file_path: finding.filePath,
            line_number: finding.lineNumber,
            suggestion: finding.suggestion,
            category: finding.category,
          });
        } catch (error) {
          logger.warn('Failed to store finding', context, error as Error);
          // Continue processing other findings
        }
      }
    }

    // Step 9: Update PR status to reviewed
    try {
      await updatePullRequestStatus(prRecord.id, 'completed');
    } catch (error) {
      logger.warn('Failed to update PR status', context, error as Error);
    }

    // Step 10: Post summary comment to PR
    try {
      const comment = `## 🔍 RepoLens Code Review

**Summary**: Analyzed ${prDetails.files.length} file(s)
- **Issues Found**: ${totalIssues}
- **Auto-fixable**: ${autoFixableCount}

**Analyzers Run**:
- ✓ Security Analysis
- ✓ Code Quality Review

[View Full Review](${env.NEXT_PUBLIC_BASE_URL}/dashboard/reviews/${prRecord.id})`;

      await postReview(
        prMetadata.org,
        prMetadata.repo,
        prMetadata.prNumber,
        comment
      );
    } catch (error) {
      logger.warn('Failed to post review comment', context, error as Error);
      // Non-critical failure
    }

    const duration = Date.now() - startTime;
    logger.info('Webhook processing completed', {
      ...context,
      duration,
      totalIssues,
      autoFixableCount,
    });

    return NextResponse.json(
      {
        status: 'analyzed',
        prId: prRecord.id,
        filesAnalyzed: prDetails.files.length,
        totalIssues,
        autoFixable: autoFixableCount,
        duration,
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof AppError) {
      logger.error('Webhook error', { duration }, error);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    logger.error('Webhook error', { duration }, error as Error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
