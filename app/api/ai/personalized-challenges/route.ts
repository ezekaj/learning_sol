// Personalized Coding Challenges API
// Generates and manages AI-powered personalized coding challenges

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { enhancedTutor } from '@/lib/ai/EnhancedTutorSystem';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topic, difficulty, customRequirements } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate personalized challenge using AI
    const challenge = await enhancedTutor.generatePersonalizedChallenge(user.id, topic);

    // Save challenge to database
    const savedChallenge = await prisma.personalizedChallenge.create({
      data: {
        userId: user.id,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        topic,
        starterCode: challenge.starterCode,
        testCases: challenge.testCases,
        hints: challenge.hints,
        learningObjectives: challenge.learningObjectives,
        aiGenerated: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: savedChallenge.id,
        ...challenge
      }
    });

  } catch (error) {
    console.error('Personalized challenge creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('id');
    const status = searchParams.get('status'); // completed, pending, all

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (challengeId) {
      // Get specific challenge
      const challenge = await prisma.personalizedChallenge.findFirst({
        where: {
          id: challengeId,
          userId: user.id
        },
        include: {
          submissions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!challenge) {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: challenge });
    } else {
      // Get user's challenges
      const whereClause: any = { userId: user.id };
      
      if (status === 'completed') {
        whereClause.isCompleted = true;
      } else if (status === 'pending') {
        whereClause.isCompleted = false;
      }

      const challenges = await prisma.personalizedChallenge.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          submissions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      return NextResponse.json({ success: true, data: challenges });
    }

  } catch (error) {
    console.error('Get challenges error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, code, timeSpent } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify challenge belongs to user
    const challenge = await prisma.personalizedChallenge.findFirst({
      where: {
        id: challengeId,
        userId: user.id
      }
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Analyze submitted code
    const analysis = await enhancedTutor.analyzeCodeSecurity(code, user.id);
    
    // Calculate score based on analysis
    const score = Math.max(0, Math.min(100, analysis.overallScore));
    const isCorrect = score >= 70; // 70% threshold for correctness

    // Create submission
    const submission = await prisma.personalizedSubmission.create({
      data: {
        challengeId,
        userId: user.id,
        code,
        score,
        feedback: `Security Score: ${analysis.overallScore}/100`,
        aiAnalysis: analysis,
        isCorrect,
        timeSpent: timeSpent || 0
      }
    });

    // Update challenge progress
    const updateData: any = {
      attempts: challenge.attempts + 1,
      timeSpent: challenge.timeSpent + (timeSpent || 0)
    };

    if (isCorrect && !challenge.isCompleted) {
      updateData.isCompleted = true;
      updateData.completedAt = new Date();
      updateData.bestScore = Math.max(challenge.bestScore || 0, score);
    } else if (score > (challenge.bestScore || 0)) {
      updateData.bestScore = score;
    }

    await prisma.personalizedChallenge.update({
      where: { id: challengeId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        submission,
        analysis,
        isCorrect,
        score
      }
    });

  } catch (error) {
    console.error('Challenge submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit solution' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('id');

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete challenge and related submissions
    await prisma.personalizedSubmission.deleteMany({
      where: { challengeId }
    });

    await prisma.personalizedChallenge.delete({
      where: {
        id: challengeId,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete challenge error:', error);
    return NextResponse.json(
      { error: 'Failed to delete challenge' }, 
      { status: 500 }
    );
  }
}
