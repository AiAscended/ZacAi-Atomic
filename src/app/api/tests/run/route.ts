/**
 * File: src/app/api/tests/run/route.ts
 * Purpose: API endpoint for running AI system tests programmatically
 */

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { suite } = await request.json();

    if (!suite) {
      return NextResponse.json(
        { error: 'Suite parameter is required' },
        { status: 400 }
      );
    }

    // Map suite IDs to test file paths
    const testFiles: Record<string, string> = {
      orchestration: 'src/ai/tests/orchestration/mainOrchestrator.test.ts',
      inference: 'src/ai/tests/inference/inferenceEngine.test.ts',
      domains: 'src/ai/tests/domains/domainRegistry.test.ts',
      models: 'src/ai/tests/models/multiModalLayers.test.ts',
      integration: 'src/ai/tests/integration/endToEnd.test.ts',
    };

    const testFile = testFiles[suite];
    if (!testFile) {
      return NextResponse.json(
        { error: 'Invalid test suite' },
        { status: 400 }
      );
    }

    // Run the test using vitest
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(
        `npx vitest run ${testFile} --reporter=json`,
        {
          cwd: process.cwd(),
          timeout: 60000, // 60 second timeout
        }
      );

      const duration = Date.now() - startTime;

      // Parse vitest JSON output
      let result;
      try {
        // vitest may output multiple JSON objects, get the last one
        const jsonLines = stdout.trim().split('\n').filter(line => line.startsWith('{'));
        const lastJsonLine = jsonLines[jsonLines.length - 1];
        result = JSON.parse(lastJsonLine);
      } catch (parseError) {
        // If JSON parsing fails, provide summary from stderr
        console.error('Failed to parse test output:', parseError);
        result = {
          numPassedTests: 0,
          numFailedTests: 1,
          numTotalTests: 1,
        };
      }

      return NextResponse.json({
        suite,
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0,
        total: result.numTotalTests || 1,
        duration,
        success: result.numFailedTests === 0,
      });
    } catch (execError: any) {
      // Test execution completed but some tests may have failed
      const duration = Date.now() - startTime;
      
      // Try to parse output even on error
      let passed = 0;
      let failed = 1;
      let total = 1;

      if (execError.stdout) {
        try {
          const jsonLines = execError.stdout.trim().split('\n').filter((line: string) => line.startsWith('{'));
          if (jsonLines.length > 0) {
            const lastJsonLine = jsonLines[jsonLines.length - 1];
            const result = JSON.parse(lastJsonLine);
            passed = result.numPassedTests || 0;
            failed = result.numFailedTests || 0;
            total = result.numTotalTests || 1;
          }
        } catch (parseError) {
          // Use defaults
        }
      }

      return NextResponse.json({
        suite,
        passed,
        failed,
        total,
        duration,
        success: failed === 0,
      });
    }
  } catch (error) {
    console.error('Error in test execution:', error);
    return NextResponse.json(
      {
        error: 'Test execution failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
