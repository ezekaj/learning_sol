'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Target,
  Zap,
  Shield,
  Code,
  Users,
  Brain,
  Award,
  Crown,
  Medal,
  Gem
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/Glassmorphism';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'learning' | 'coding' | 'collaboration' | 'mastery';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const achievementCategories = [
  { id: 'all', label: 'All Achievements', icon: Trophy },
  { id: 'learning', label: 'Learning', icon: Brain },
  { id: 'coding', label: 'Coding', icon: Code },
  { id: 'collaboration', label: 'Collaboration', icon: Users },
  { id: 'mastery', label: 'Mastery', icon: Crown },
];

const difficultyColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600',
};

const rarityColors = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

export function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState({
    totalAchievements: 0,
    unlockedAchievements: 0,
    totalXP: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    // Load achievements data
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    // Simulate loading achievements from API
    const mockAchievements: Achievement[] = [
      {
        id: 'first-contract',
        title: 'First Contract',
        description: 'Deploy your first smart contract',
        icon: <Code className="w-6 h-6" />,
        category: 'coding',
        difficulty: 'bronze',
        xpReward: 100,
        unlocked: true,
        unlockedAt: new Date('2024-01-15'),
        progress: 1,
        maxProgress: 1,
        rarity: 'common',
      },
      {
        id: 'security-expert',
        title: 'Security Expert',
        description: 'Complete 10 security challenges',
        icon: <Shield className="w-6 h-6" />,
        category: 'learning',
        difficulty: 'gold',
        xpReward: 500,
        unlocked: false,
        progress: 7,
        maxProgress: 10,
        rarity: 'epic',
      },
      {
        id: 'collaboration-master',
        title: 'Collaboration Master',
        description: 'Participate in 25 collaborative sessions',
        icon: <Users className="w-6 h-6" />,
        category: 'collaboration',
        difficulty: 'silver',
        xpReward: 300,
        unlocked: false,
        progress: 12,
        maxProgress: 25,
        rarity: 'rare',
      },
      {
        id: 'solidity-sage',
        title: 'Solidity Sage',
        description: 'Master all advanced Solidity concepts',
        icon: <Crown className="w-6 h-6" />,
        category: 'mastery',
        difficulty: 'platinum',
        xpReward: 1000,
        unlocked: false,
        progress: 3,
        maxProgress: 15,
        rarity: 'legendary',
      },
    ];

    setAchievements(mockAchievements);
    setUserStats({
      totalAchievements: mockAchievements.length,
      unlockedAchievements: mockAchievements.filter(a => a.unlocked).length,
      totalXP: mockAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0),
      currentStreak: 7,
    });
  };

  const filteredAchievements = achievements.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">Achievements</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Track your progress and unlock rewards as you master Solidity development
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <GlassCard className="p-6 text-center">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{userStats.unlockedAchievements}</div>
          <div className="text-sm text-gray-400">Unlocked</div>
        </GlassCard>
        
        <GlassCard className="p-6 text-center">
          <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{userStats.totalAchievements}</div>
          <div className="text-sm text-gray-400">Total</div>
        </GlassCard>
        
        <GlassCard className="p-6 text-center">
          <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{userStats.totalXP}</div>
          <div className="text-sm text-gray-400">XP Earned</div>
        </GlassCard>
        
        <GlassCard className="p-6 text-center">
          <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{userStats.currentStreak}</div>
          <div className="text-sm text-gray-400">Day Streak</div>
        </GlassCard>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-4"
      >
        {achievementCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center space-x-2"
          >
            <category.icon className="w-4 h-4" />
            <span>{category.label}</span>
          </Button>
        ))}
      </motion.div>

      {/* Achievements Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard 
                className={`p-6 relative overflow-hidden ${
                  achievement.unlocked ? 'border-green-400/50' : 'border-white/20'
                } ${rarityColors[achievement.rarity]}`}
                hover={true}
              >
                {/* Rarity Indicator */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                  achievement.rarity === 'legendary' ? 'bg-yellow-400' :
                  achievement.rarity === 'epic' ? 'bg-purple-400' :
                  achievement.rarity === 'rare' ? 'bg-blue-400' : 'bg-gray-400'
                }`} />

                {/* Achievement Icon */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                  difficultyColors[achievement.difficulty]
                } flex items-center justify-center mb-4 mx-auto ${
                  achievement.unlocked ? '' : 'grayscale opacity-50'
                }`}>
                  {achievement.icon}
                </div>

                {/* Achievement Info */}
                <div className="text-center space-y-2">
                  <h3 className={`text-lg font-semibold ${
                    achievement.unlocked ? 'text-white' : 'text-gray-400'
                  }`}>
                    {achievement.title}
                  </h3>
                  
                  <p className="text-sm text-gray-400">
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {!achievement.unlocked && (
                    <div className="space-y-2">
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100}
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        {achievement.progress} / {achievement.maxProgress}
                      </div>
                    </div>
                  )}

                  {/* XP Reward */}
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">+{achievement.xpReward} XP</span>
                  </div>

                  {/* Difficulty Badge */}
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${
                      achievement.difficulty === 'platinum' ? 'border-purple-400 text-purple-400' :
                      achievement.difficulty === 'gold' ? 'border-yellow-400 text-yellow-400' :
                      achievement.difficulty === 'silver' ? 'border-gray-400 text-gray-400' :
                      'border-amber-400 text-amber-400'
                    }`}
                  >
                    {achievement.difficulty}
                  </Badge>

                  {/* Unlocked Date */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-green-400">
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
