import { NextRequest, NextResponse } from 'next/server';
import { runAllAnalyzers } from '@/lib/analyzers';
import { autofixEngine } from '@/lib/autofix/engine';
import { getSupabaseServer } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { prId, files, code } = body;

    // Validate input
    if (!prId || !files || !code) {
      logger.warn('Analyze endpoint called with missing fields');
      return NextResponse.json(
        { error: 'Missing required fields: prId, files, code' },
        { status: 400 }
      );
    }

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'files must be a non-empty array' },
        { status: 400 }
      );
    }

    logger.info('Analysis requested', {
      prId,
      fileCount: files.length,
      codeLength: code.length,
    });

    // Run all analyzers
    const analysisResults = await runAllAnalyzers(
      files,
      code,
      {
        orgId: 'unknown',
        repoId: 'unknown',
        prId,
      }
    );

    logger.info('Analysis completed', {
      prId,
      totalIssues: analysisResults.totalIssues,
      autoFixable: analysisResults.autoFixableCount,
    });

    // Generate autofix patches
    const patches = await autofixEngine.generatePatches(
      analysisResults.analyses.flatMap((a) => a.findings),
      code,
      files[0]
    );

    logger.info('Patches generated', { prId, patchCount: patches.length });

    // Store patches in database (optional - can fail without breaking response)
    let storedPatches = 0;
    try {
      const supabase = await getSupabaseServer();
      for (const patch of patches) {
        await supabase.from('patches').insert({
          pr_id: prId,
          file_path: patch.file_path,
          finding_id: patch.finding_id,
          original_code: patch.original_code,
          fixed_code: patch.fixed_code,
          explanation: patch.explanation,
          confidence: patch.confidence,
          approved: false,
        });
        storedPatches++;
      }
    } catch (error) {
      logger.warn('Failed to store patches in database', { prId }, error as Error);
    }

    const duration = Date.now() - startTime;
    logger.info('Analysis endpoint completed', {
      prId,
      duration,
      totalIssues: analysisResults.totalIssues,
      storedPatches,
    });

    return NextResponse.json(
      {
        success: true,
        analyses: analysisResults.analyses,
        patches: patches.slice(0, 10), // Return first 10 patches
        summary: {
          totalIssues: analysisResults.totalIssues,
          autoFixable: analysisResults.autoFixableCount,
          patchCount: patches.length,
          storedPatches,
        },
        duration,
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Analysis endpoint error', { duration }, error as Error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Analysis failed',
        code: 'ANALYSIS_ERROR',
      },
      { status: 500 }
    );
  }
}
