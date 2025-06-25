import { NextResponse } from 'next/server';
import { LeaderboardCategory } from '@/lib/community/types';

const categories: LeaderboardCategory[] = [
  {
    id: 'global_xp',
    name: 'Global XP Leaders',
    description: 'Top users by total XP earned across all time',
    icon: '🏆',
    sortBy: 'xpTotal',
    timeframe: 'all-time',
    enabled: true
  },
  {
    id: 'weekly_xp',
    name: 'Weekly XP Leaders',
    description: 'Top users by XP earned this week',
    icon: '📅',
    sortBy: 'xpWeekly',
    timeframe: 'weekly',
    enabled: true
  },
  {
    id: 'daily_xp',
    name: 'Daily XP Leaders',
    description: 'Top users by XP earned today',
    icon: '⚡',
    sortBy: 'xpDaily',
    timeframe: 'daily',
    enabled: true
  },
  {
    id: 'completion_rate',
    name: 'Course Completion',
    description: 'Users with highest course completion rates',
    icon: '✅',
    sortBy: 'completionRate',
    timeframe: 'all-time',
    enabled: true
  },
  {
    id: 'streak_leaders',
    name: 'Streak Leaders',
    description: 'Users with longest current learning streaks',
    icon: '🔥',
    sortBy: 'currentStreak',
    timeframe: 'all-time',
    enabled: true
  },
  {
    id: 'top_contributors',
    name: 'Top Contributors',
    description: 'Users with highest community contribution scores',
    icon: '🌟',
    sortBy: 'contributionScore',
    timeframe: 'all-time',
    enabled: true
  },
  {
    id: 'lesson_masters',
    name: 'Lesson Masters',
    description: 'Users who have completed the most lessons',
    icon: '📚',
    sortBy: 'lessonsCompleted',
    timeframe: 'all-time',
    enabled: true
  },
  {
    id: 'high_scorers',
    name: 'High Scorers',
    description: 'Users with highest average quiz scores',
    icon: '🎯',
    sortBy: 'averageScore',
    timeframe: 'all-time',
    enabled: true
  }
];

export async function GET() {
  try {
    // In a real application, you might want to:
    // 1. Check user permissions
    // 2. Filter categories based on user role
    // 3. Get categories from database with admin-configurable settings
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching leaderboard categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard categories' },
      { status: 500 }
    );
  }
}
