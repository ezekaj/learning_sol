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

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Get completed lessons count
    const completedLessons = await prisma.userProgress.count({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
      },
    });

    // Get total lessons count
    const totalLessons = await prisma.lesson.count();

    // Get user achievements
    const achievements = await prisma.userAchievement.findMany({
      where: {
        userId: session.user.id,
        isCompleted: true,
      },
      include: {
        achievement: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Calculate weekly progress (last 7 days)
    const weeklyProgress = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dayProgress = await prisma.userProgress.findMany({
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
          completedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          lesson: true,
        },
      });

      const dayXP = dayProgress.reduce((total: number, progress: any) =>
        total + (progress.lesson.xpReward || 50), 0);

      weeklyProgress.push({
        day: days[date.getDay()],
        xp: dayXP,
        lessons: dayProgress.length,
      });
    }

    // Calculate skill progress based on completed lessons by category
    const skillCategories = [
      'Solidity Basics',
      'Smart Contracts', 
      'DeFi Development',
      'Security Auditing',
      'Gas Optimization'
    ];

    const skillProgress = await Promise.all(
      skillCategories.map(async (skill) => {
        // This is simplified - in a real app, you'd have skill categories in your data model
        const skillLessons = await prisma.lesson.count({
          where: {
            title: {
              contains: skill.split(' ')[0], // Simple matching by first word
              mode: 'insensitive',
            },
          },
        });

        const completedSkillLessons = await prisma.userProgress.count({
          where: {
            userId: session.user.id,
            status: 'COMPLETED',
            lesson: {
              title: {
                contains: skill.split(' ')[0],
                mode: 'insensitive',
              },
            },
          },
        });

        const level = skillLessons > 0 ? Math.min(Math.round((completedSkillLessons / skillLessons) * 10), 10) : 0;

        return {
          skill,
          level,
          maxLevel: 10,
        };
      })
    );

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();
    
    while (currentStreak < 365) { // Max check 1 year
      const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));

      const dayActivity = await prisma.userProgress.count({
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
          completedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (dayActivity > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak (simplified - would need streak tracking in real app)
    const longestStreak = Math.max(currentStreak, userProfile?.longestStreak || 0);

    // Calculate time spent (simplified - would need time tracking in real app)
    const timeSpent = completedLessons * 30; // Assume 30 minutes per lesson

    const stats = {
      totalXP: userProfile?.totalXP || 0,
      currentLevel: userProfile?.currentLevel || 'Beginner',
      completedLessons,
      totalLessons,
      currentStreak,
      longestStreak,
      timeSpent,
      achievements: achievements.map((ua: any) => ({
        id: ua.achievement.id,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: '🏆', // Default icon - would be stored in achievement model
        rarity: ua.achievement.rarity?.toLowerCase() || 'common',
        unlockedAt: ua.completedAt,
        xpReward: ua.achievement.xpReward,
      })),
      weeklyProgress,
      skillProgress,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching progress stats:', error);
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
      case 'update_goal':
        const { goalId, completed } = data;
        
        // TODO: Implement goal tracking in database
        console.log(`User ${session.user.id} updated goal ${goalId} to ${completed ? 'completed' : 'incomplete'}`);

        return NextResponse.json({ 
          success: true, 
          message: 'Goal updated successfully' 
        });

      case 'set_study_schedule':
        const { schedule } = data;
        
        // TODO: Implement study schedule in database
        console.log(`User ${session.user.id} set study schedule:`, schedule);

        return NextResponse.json({ 
          success: true, 
          message: 'Study schedule updated successfully' 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing progress stats action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
