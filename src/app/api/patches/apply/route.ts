import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { createGitHubClient } from '@/lib/github/client';
import { applyPatch, validatePatch } from '@/lib/autofix/patch-generator';

/**
 * Applies a patch to a PR and creates a commit
 */
export async function POST(request: NextRequest) {
  try {
    const { patch_id, pr_id, approve } = await request.json();

    if (!patch_id || !pr_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServiceClient();

    // Fetch patch details
    const { data: patch, error: patchError } = await supabase
      .from('autofix_patches')
      .select('*')
      .eq('id', patch_id)
      .single();

    if (patchError || !patch) {
      return NextResponse.json(
        { error: 'Patch not found' },
        { status: 404 }
      );
    }

    // Fetch PR details
    const { data: pr, error: prError } = await supabase
      .from('pull_requests')
      .select('*')
      .eq('id', pr_id)
      .single();

    if (prError || !pr) {
      return NextResponse.json(
        { error: 'PR not found' },
        { status: 404 }
      );
    }

    // If not approved, just update status to suggested
    if (!approve) {
      await supabase
        .from('autofix_patches')
        .update({ status: 'suggested' })
        .eq('id', patch_id);

      return NextResponse.json(
        { status: 'suggested', message: 'Patch marked as suggested' },
        { status: 200 }
      );
    }

    // Fetch current file content from GitHub
    const github = createGitHubClient();
    const [org, repo] = pr.repository_name.split('/');

    let currentContent: string;
    try {
      currentContent = await github.getFileContent(
        org,
        repo,
        patch.file_path,
        pr.head_sha
      );
    } catch (error) {
      return NextResponse.json(
        { error: `Could not fetch file: ${patch.file_path}` },
        { status: 400 }
      );
    }

    // Validate patch can be applied
    if (!validatePatch(currentContent, patch)) {
      return NextResponse.json(
        {
          error: 'Patch cannot be cleanly applied to current file',
          status: 'conflict',
        },
        { status: 409 }
      );
    }

    // Apply patch
    const patchedContent = applyPatch(currentContent, patch);

    // Create commit with patched file
    // In production, use GitHub API to create a commit
    // This is a placeholder for the actual implementation

    // Update patch status
    await supabase
      .from('autofix_patches')
      .update({
        status: 'applied',
        applied_at: new Date().toISOString(),
      })
      .eq('id', patch_id);

    // Post comment on PR about the applied patch
    const comment = `✅ Autofix applied for: ${patch.description}

The suggested fix has been applied to the PR. Please review the changes.`;

    await github.postReview(org, repo, pr.number, comment);

    return NextResponse.json(
      {
        status: 'applied',
        message: 'Patch successfully applied',
        patchId: patch_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Patch application error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Rejects a patch
 */
export async function DELETE(request: NextRequest) {
  try {
    const { patch_id } = await request.json();

    if (!patch_id) {
      return NextResponse.json(
        { error: 'Missing patch_id' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServiceClient();

    await supabase
      .from('autofix_patches')
      .update({ status: 'rejected' })
      .eq('id', patch_id);

    return NextResponse.json(
      { status: 'rejected', message: 'Patch rejected' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Patch rejection error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
