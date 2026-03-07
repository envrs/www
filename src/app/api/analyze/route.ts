import { NextRequest, NextResponse } from 'next/server';
import { runAllAnalyzers } from '@/lib/analyzers';
import { autofixEngine } from '@/lib/autofix/engine';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prId, files, code } = body;

    if (!prId || !files || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: prId, files, code' },
        { status: 400 }
      );
    }

    // Run all analyzers
    const analysisResults = await runAllAnalyzers(files, code);

    // Generate autofix patches
    const patches = await autofixEngine.generatePatches(
      analysisResults.analyses.flatMap(a => a.findings),
      code,
      files[0]
    );

    // Store patches in database
    const supabase = getSupabaseServer();
    for (const patch of patches) {
      await supabase.from('patches').insert({
        pr_id: prId,
        analyzer: patch.analyzer,
        finding: patch.finding,
        original: patch.original,
        fixed: patch.fixed,
        line: patch.line,
        file: patch.file,
        confidence: patch.confidence,
      });
    }

    return NextResponse.json({
      success: true,
      analyses: analysisResults.analyses,
      patches,
      summary: {
        totalIssues: analysisResults.totalIssues,
        autoFixableCount: analysisResults.autoFixableCount,
        patchCount: patches.length,
      },
    });
  } catch (error) {
    console.error('[v0] Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
