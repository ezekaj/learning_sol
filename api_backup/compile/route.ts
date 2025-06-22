import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { SolidityCompiler } from '@/lib/compiler/SolidityCompiler';
import { prisma } from '@/lib/prisma';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      code, 
      contractName = 'Contract',
      version = '0.8.21',
      optimize = true,
      lessonId 
    } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Initialize compiler
    const compiler = SolidityCompiler.getInstance();
    
    // Compile the code
    const result = await compiler.compile(code, contractName, version, optimize);

    // Save submission to database
    if (lessonId) {
      await prisma.codeSubmission.create({
        data: {
          userId: session.user.id,
          lessonId,
          code,
          language: 'solidity',
          status: result.success ? 'COMPILED' : 'FAILED',
          score: result.success ? 100 : 0,
          feedback: result.errors?.join('\n') || null,
          gasUsed: result.gasEstimate?.toString(),
          testResults: {
            compiled: result.success,
            errors: result.errors || [],
            warnings: result.warnings || [],
            securityIssues: result.securityIssues || [],
            optimizationSuggestions: result.optimizationSuggestions || [],
          },
        },
      });
    }

    // Return compilation result
    return NextResponse.json({
      success: result.success,
      bytecode: result.bytecode,
      abi: result.abi,
      errors: result.errors || [],
      warnings: result.warnings || [],
      gasEstimate: result.gasEstimate,
      securityIssues: result.securityIssues || [],
      optimizationSuggestions: result.optimizationSuggestions || [],
    });

  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Compilation failed',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    // Get user's submissions for this lesson
    const submissions = await prisma.codeSubmission.findMany({
      where: {
        userId: session.user.id,
        lessonId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Last 10 submissions
    });

    return NextResponse.json({ submissions });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
