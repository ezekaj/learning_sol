import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Award, Target, Calendar, Clock, 
  BookOpen, Code, Zap, Users, Star, Trophy,
  BarChart3, PieChart, Activity, CheckCircle
} from 'lucide-react';
import { Card } from '../ui/card';

interface ProgressStats {
  totalXP: number;
  currentLevel: string;
  completedLessons: number;
  totalLessons: number;
  currentStreak: number;
  longestStreak: number;
  timeSpent: number; // in minutes
  achievements: Achievement[];
  weeklyProgress: Array<{ day: string; xp: number; lessons: number }>;
  skillProgress: Array<{ skill: string; level: number; maxLevel: number }>;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  xpReward: number;
}

interface ProgressDashboardProps {
  userId?: string;
  className?: string;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadProgressStats();
  }, [userId, selectedTimeframe]);

  const loadProgressStats = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real app, fetch from API
      const mockStats: ProgressStats = {
        totalXP: 2450,
        currentLevel: 'Intermediate',
        completedLessons: 23,
        totalLessons: 45,
        currentStreak: 7,
        longestStreak: 15,
        timeSpent: 1240, // 20.67 hours
        achievements: [
          {
            id: '1',
            title: 'First Steps',
            description: 'Complete your first Solidity lesson',
            icon: '🎯',
            rarity: 'common',
            unlockedAt: new Date('2024-01-15'),
            xpReward: 100
          },
          {
            id: '2',
            title: 'Code Warrior',
            description: 'Write 100 lines of Solidity code',
            icon: '⚔️',
            rarity: 'rare',
            unlockedAt: new Date('2024-01-20'),
            xpReward: 250
          },
          {
            id: '3',
            title: 'Smart Contract Master',
            description: 'Deploy your first smart contract',
            icon: '🏆',
            rarity: 'epic',
            unlockedAt: new Date('2024-01-25'),
            xpReward: 500
          }
        ],
        weeklyProgress: [
          { day: 'Mon', xp: 150, lessons: 2 },
          { day: 'Tue', xp: 200, lessons: 3 },
          { day: 'Wed', xp: 100, lessons: 1 },
          { day: 'Thu', xp: 300, lessons: 4 },
          { day: 'Fri', xp: 250, lessons: 3 },
          { day: 'Sat', xp: 180, lessons: 2 },
          { day: 'Sun', xp: 120, lessons: 1 }
        ],
        skillProgress: [
          { skill: 'Solidity Basics', level: 8, maxLevel: 10 },
          { skill: 'Smart Contracts', level: 6, maxLevel: 10 },
          { skill: 'DeFi Development', level: 4, maxLevel: 10 },
          { skill: 'Security Auditing', level: 2, maxLevel: 10 },
          { skill: 'Gas Optimization', level: 5, maxLevel: 10 }
        ]
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load progress stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getXPProgress = () => {
    if (!stats) return { current: 0, next: 1000, percentage: 0 };
    
    const levelThresholds = {
      'Beginner': { min: 0, max: 1000 },
      'Intermediate': { min: 1000, max: 5000 },
      'Advanced': { min: 5000, max: 10000 }
    };
    
    const threshold = levelThresholds[stats.currentLevel as keyof typeof levelThresholds];
    const current = stats.totalXP - threshold.min;
    const next = threshold.max - threshold.min;
    const percentage = Math.min((current / next) * 100, 100);
    
    return { current, next, percentage };
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    const colors = {
      common: 'text-gray-400 bg-gray-400/10',
      rare: 'text-blue-400 bg-blue-400/10',
      epic: 'text-purple-400 bg-purple-400/10',
      legendary: 'text-yellow-400 bg-yellow-400/10'
    };
    return colors[rarity];
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
            <div className="animate-pulse">
              <div className="h-4 bg-white/20 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-white/20 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const xpProgress = getXPProgress();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/10 backdrop-blur-md border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalXP.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Total XP</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/10 backdrop-blur-md border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completedLessons}</p>
              <p className="text-sm text-gray-400">Lessons Done</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/10 backdrop-blur-md border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
              <p className="text-sm text-gray-400">Day Streak</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/10 backdrop-blur-md border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{Math.round(stats.timeSpent / 60)}h</p>
              <p className="text-sm text-gray-400">Time Spent</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Level Progress</h3>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
            {stats.currentLevel}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">XP Progress</span>
            <span className="text-white">{xpProgress.current} / {xpProgress.next}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {Math.round(100 - xpProgress.percentage)}% to next level
          </p>
        </div>
      </Card>

      {/* Weekly Progress Chart */}
      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Weekly Progress</h3>
          <div className="flex space-x-2">
            {(['week', 'month', 'year'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {stats.weeklyProgress.map((day, index) => (
            <div key={day.day} className="text-center">
              <div className="text-xs text-gray-400 mb-2">{day.day}</div>
              <motion.div
                className="bg-blue-500/20 rounded-lg p-2 relative overflow-hidden"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-blue-500/40 rounded-lg"
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.xp / 300) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                />
                <div className="relative z-10">
                  <div className="text-sm font-semibold text-white">{day.xp}</div>
                  <div className="text-xs text-gray-400">XP</div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </Card>

      {/* Skills Progress */}
      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-6">Skill Progress</h3>
        
        <div className="space-y-4">
          {stats.skillProgress.map((skill, index) => (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between">
                <span className="text-white font-medium">{skill.skill}</span>
                <span className="text-gray-400 text-sm">
                  {skill.level}/{skill.maxLevel}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Recent Achievements */}
      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Achievements</h3>
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>

        <div className="grid gap-4">
          {stats.achievements.slice(0, 3).map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-white">{achievement.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{achievement.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-yellow-400">
                  +{achievement.xpReward} XP
                </div>
                <div className="text-xs text-gray-400">
                  {achievement.unlockedAt.toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            View All Achievements ({stats.achievements.length})
          </button>
        </div>
      </Card>

      {/* Learning Goals */}
      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Learning Goals</h3>
          <Target className="w-5 h-5 text-green-400" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white">Complete Solidity Basics</span>
            </div>
            <span className="text-green-400 text-sm">Completed</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <span className="text-white">Build First DApp</span>
            </div>
            <span className="text-blue-400 text-sm">In Progress</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
              <span className="text-gray-400">Learn DeFi Development</span>
            </div>
            <span className="text-gray-400 text-sm">Upcoming</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressDashboard;
