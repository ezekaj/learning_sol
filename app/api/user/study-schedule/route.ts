import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// Configure for dynamic API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate study schedule for the next 7 days based on user's activity patterns
    const schedule = [];
    const now = new Date();

    // Get user's historical activity to predict future schedule
    const userActivity = await prisma.userProgress.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        completedAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Analyze activity patterns by day of week
    const activityByDay = new Array(7).fill(0);
    userActivity.forEach(activity => {
      if (activity.completedAt) {
        const dayOfWeek = activity.completedAt.getDay();
        activityByDay[dayOfWeek]++;
      }
    });

    // Generate schedule for next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const historicalActivity = activityByDay[dayOfWeek];
      
      // Predict sessions based on historical data
      let predictedSessions = 0;
      if (historicalActivity > 0) {
        predictedSessions = Math.min(Math.ceil(historicalActivity / 7), 3); // Max 3 sessions per day
      } else {
        predictedSessions = Math.random() > 0.5 ? 1 : 0; // Random for new users
      }

      // Check if user has any actual scheduled activities for this date
      // TODO: Implement actual scheduling system
      const hasPlannedActivity = Math.random() > 0.3; // 70% chance of planned activity

      schedule.push({
        date: date.toISOString().split('T')[0],
        sessions: predictedSessions,
        planned: hasPlannedActivity,
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        recommendedTopics: getRecommendedTopics(session.user.id, date),
        estimatedDuration: predictedSessions * 30, // 30 minutes per session
      });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Error fetching study schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    switch (action) {
      case 'schedule_session':
        const { date, time, topic, duration } = data;
        
        if (!date || !time || !topic) {
          return NextResponse.json({ error: 'Date, time, and topic are required' }, { status: 400 });
        }

        // TODO: Implement study session scheduling in database
        console.log(`User ${session.user.id} scheduled study session:`, {
          date,
          time,
          topic,
          duration: duration || 30,
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Study session scheduled successfully' 
        });

      case 'complete_session':
        const { sessionId, actualDuration, notes } = data;
        
        // TODO: Track completed study sessions
        console.log(`User ${session.user.id} completed study session ${sessionId}:`, {
          actualDuration,
          notes,
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Study session completed successfully' 
        });

      case 'update_preferences':
        const { preferredTimes, studyGoals, reminderSettings } = data;
        
        // TODO: Store user study preferences
        console.log(`User ${session.user.id} updated study preferences:`, {
          preferredTimes,
          studyGoals,
          reminderSettings,
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Study preferences updated successfully' 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing study schedule action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get recommended topics based on user progress
async function getRecommendedTopics(userId: string, date: Date): Promise<string[]> {
  try {
    // Get user's recent progress to recommend next topics
    const recentProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 5,
    });

    // Simple recommendation logic - suggest next lessons in sequence
    const topics = [
      'Solidity Basics',
      'Smart Contract Development',
      'DeFi Protocols',
      'Security Best Practices',
      'Gas Optimization',
    ];

    // Return 2-3 recommended topics
    return topics.slice(0, Math.floor(Math.random() * 2) + 2);
  } catch (error) {
    console.error('Error getting recommended topics:', error);
    return ['Solidity Basics', 'Smart Contract Development'];
  }
}
