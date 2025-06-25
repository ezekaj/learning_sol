import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// Configure for dynamic API routes
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's code statistics
    // In a real implementation, you'd track these metrics as users code
    
    // Count completed coding lessons/projects as proxy for lines written
    const completedCodingLessons = await prisma.userProgress.count({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        lesson: {
          type: {
            in: ['CODING', 'PROJECT'],
          },
        },
      },
    });

    // Estimate lines written based on completed lessons
    const estimatedLinesPerLesson = 50;
    const linesWritten = completedCodingLessons * estimatedLinesPerLesson;

    // Count deployed contracts (would be tracked in a real app)
    // For now, use a simple calculation based on completed projects
    const completedProjects = await prisma.userProgress.count({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        lesson: {
          type: 'PROJECT',
        },
      },
    });

    const contractsDeployed = Math.floor(completedProjects * 0.8); // Assume 80% of projects result in deployment

    // Estimate tests written
    const testsWritten = Math.floor(linesWritten * 0.3); // Assume 30% test coverage

    const stats = {
      linesWritten,
      contractsDeployed,
      testsWritten,
      // Additional metrics that could be tracked
      functionsWritten: Math.floor(linesWritten / 10),
      commitsMade: Math.floor(completedCodingLessons * 1.5),
      codeReviews: Math.floor(completedCodingLessons * 0.2),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching code stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    switch (action) {
      case 'track_code_activity':
        const { linesAdded, linesRemoved, language, projectId } = data;
        
        // TODO: Implement real-time code tracking
        console.log(`User ${session.user.id} code activity:`, {
          linesAdded,
          linesRemoved,
          language,
          projectId,
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Code activity tracked successfully' 
        });

      case 'deploy_contract':
        const { contractAddress, networkId, gasUsed } = data;
        
        // TODO: Track contract deployments
        console.log(`User ${session.user.id} deployed contract:`, {
          contractAddress,
          networkId,
          gasUsed,
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Contract deployment tracked successfully' 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing code stats action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
