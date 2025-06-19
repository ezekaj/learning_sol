import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Award, 
  Crown, 
  Shield, 
  Flame,
  TrendingUp,
  Users,
  Calendar,
  Gift
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'learning' | 'coding' | 'social' | 'milestone';
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  streak: number;
  lessonsCompleted: number;
  projectsCompleted: number;
  challengesWon: number;
  rank: number;
  badges: string[];
}

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  rank: number;
  streak: number;
}

interface GamificationSystemProps {
  userProgress: UserProgress;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  onClaimReward?: (achievementId: string) => void;
  className?: string;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-600'
};

const rarityBorders = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400'
};

export const GamificationSystem: React.FC<GamificationSystemProps> = ({
  userProgress,
  achievements,
  leaderboard,
  onClaimReward,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Calculate level progress percentage
  const levelProgress = ((userProgress.xp / userProgress.xpToNextLevel) * 100);

  // Filter achievements by category
  const achievementsByCategory = {
    learning: achievements.filter(a => a.category === 'learning'),
    coding: achievements.filter(a => a.category === 'coding'),
    social: achievements.filter(a => a.category === 'social'),
    milestone: achievements.filter(a => a.category === 'milestone')
  };

  // Check for new achievements
  useEffect(() => {
    const recentAchievements = achievements.filter(
      a => a.unlocked && a.unlockedAt && 
      Date.now() - a.unlockedAt.getTime() < 5000 // Last 5 seconds
    );
    
    if (recentAchievements.length > 0) {
      setNewAchievements(recentAchievements);
      setTimeout(() => setNewAchievements([]), 5000);
    }
  }, [achievements]);

  const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative p-4 rounded-lg border-2 ${rarityBorders[achievement.rarity]} 
                  ${achievement.unlocked ? 'bg-white/10' : 'bg-gray-500/20'} 
                  backdrop-blur-md transition-all duration-300`}
    >
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${rarityColors[achievement.rarity]} 
                      opacity-20 ${achievement.unlocked ? 'animate-pulse' : ''}`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-full ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
            {achievement.icon}
          </div>
          <div className="text-xs font-medium text-yellow-400">
            +{achievement.xpReward} XP
          </div>
        </div>
        
        <h3 className={`font-semibold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
          {achievement.title}
        </h3>
        
        <p className={`text-sm ${achievement.unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
          {achievement.description}
        </p>
        
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="mt-2 text-xs text-green-400">
            Unlocked {achievement.unlockedAt.toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );

  const LeaderboardEntry: React.FC<{ entry: LeaderboardEntry; index: number }> = ({ entry, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10"
    >
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold
                        ${index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 
                          'bg-gray-600 text-gray-300'}`}>
          {index < 3 ? <Crown className="w-4 h-4" /> : entry.rank}
        </div>
        
        <img
          src={entry.avatar}
          alt={entry.username}
          className="w-10 h-10 rounded-full border-2 border-white/20"
        />
        
        <div>
          <div className="font-semibold text-white">{entry.username}</div>
          <div className="text-sm text-gray-400">Level {entry.level}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-semibold text-yellow-400">{entry.xp.toLocaleString()} XP</div>
        <div className="text-sm text-gray-400 flex items-center">
          <Flame className="w-3 h-3 mr-1" />
          {entry.streak} day streak
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* New Achievement Notifications */}
      <AnimatePresence>
        {newAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-4 right-4 z-50 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 
                       rounded-lg shadow-lg border border-yellow-300"
          >
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-white" />
              <div>
                <div className="font-bold text-white">Achievement Unlocked!</div>
                <div className="text-yellow-100">{achievement.title}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/10 backdrop-blur-md rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
          { id: 'leaderboard', label: 'Leaderboard', icon: <Users className="w-4 h-4" /> }
        ].map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === tab.id ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Level Progress */}
          <Card className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Level {userProgress.level}</h2>
                <p className="text-gray-300">Blockchain Developer</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">{userProgress.xp.toLocaleString()}</div>
                <div className="text-sm text-gray-400">XP</div>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress to Level {userProgress.level + 1}</span>
                <span>{userProgress.xp} / {userProgress.xpToNextLevel}</span>
              </div>
              <Progress value={levelProgress} className="h-3" />
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userProgress.streak}</div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </Card>
            
            <Card className="p-4 bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userProgress.lessonsCompleted}</div>
              <div className="text-sm text-gray-400">Lessons</div>
            </Card>
            
            <Card className="p-4 bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <Award className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userProgress.projectsCompleted}</div>
              <div className="text-sm text-gray-400">Projects</div>
            </Card>
            
            <Card className="p-4 bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">#{userProgress.rank}</div>
              <div className="text-sm text-gray-400">Global Rank</div>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements
                .filter(a => a.unlocked)
                .slice(0, 6)
                .map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
            <Card key={category} className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 capitalize">
                {category} Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Global Leaderboard</h3>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <LeaderboardEntry key={entry.id} entry={entry} index={index} />
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default GamificationSystem;
