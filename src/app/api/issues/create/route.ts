import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { createGitHubClient } from '@/lib/github/client';

/**
 * Creates a GitHub issue from a critical finding
 */
export async function POST(request: NextRequest) {
  try {
    const { finding_id, pr_id, title, description, severity, file_path, line_number } =
      await request.json();

    if (!finding_id || !pr_id || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await getSupabaseServiceClient();

    // Fetch PR details
    const { data: pr, error: prError } = await supabase
      .from('pull_requests')
      .select('*')
      .eq('id', pr_id)
      .single();

    if (prError || !pr) {
      return NextResponse.json({ error: 'PR not found' }, { status: 404 });
    }

    // Create issue on GitHub
    const github = createGitHubClient();
    const [org, repo] = pr.repository_name.split('/');

    const issueBody = `
**Issue Type**: ${severity?.toUpperCase() || 'MEDIUM'}
**Source**: PR #${pr.number} - ${pr.title}
**File**: ${file_path}${line_number ? `:${line_number}` : ''}

## Description
${description || 'No additional description provided'}

## Details
- **Finding ID**: \`${finding_id}\`
- **PR**: [#${pr.number}](${pr.url})
- **Author**: @${pr.author}

---
*This issue was automatically created by RepoLens based on code review findings.*
`;

    const labels = ['automated', `severity-${severity}`, 'code-review'];

    await github.createIssue(org, repo, title, issueBody, labels);

    // Store issue record in database
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .insert({
        pr_id: pr_id,
        finding_id: finding_id,
        title: title,
        description: description,
        severity: severity,
        file_path: file_path,
        line_number: line_number,
        status: 'open',
      })
      .select()
      .single();

    if (issueError) {
      console.error('[v0] Error storing issue:', issueError);
      return NextResponse.json({ error: 'Failed to store issue record' }, { status: 500 });
    }

    // Update finding to mark issue created
    await supabase.from('findings').update({ issue_created: true }).eq('id', finding_id);

    return NextResponse.json(
      {
        status: 'created',
        issue: issue,
        message: `Issue created successfully in ${org}/${repo}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Issue creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Closes an issue related to a finding
 */
export async function PATCH(request: NextRequest) {
  try {
    const { finding_id, status } = await request.json();

    if (!finding_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await getSupabaseServiceClient();

    // Update issue status
    const { error: updateError } = await supabase
      .from('issues')
      .update({ status })
      .eq('finding_id', finding_id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
    }

    return NextResponse.json(
      { status: 'updated', message: `Issue status updated to ${status}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Issue update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
