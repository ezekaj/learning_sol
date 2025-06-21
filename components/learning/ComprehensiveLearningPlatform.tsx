import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  Trophy, 
  Users, 
  Rocket, 
  Brain,
  Target,
  Zap,
  Play,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import InteractiveCodeEditor from './InteractiveCodeEditor';
import GamificationSystem from './GamificationSystem';
import StructuredCurriculum from './StructuredCurriculum';
import ProjectBasedLearning from './ProjectBasedLearning';
import { ParticleBackground } from '../ui/ThreeJSComponents';
import { GSAPScrollAnimation, GSAPTextAnimation } from '../ui/GSAPAnimations';
import { LottieLoading, LottieSuccess } from '../ui/LottieAnimations';

interface LearningPlatformProps {
  className?: string;
}

// Mock data for demonstration
const mockUserProgress = {
  level: 12,
  xp: 8450,
  xpToNextLevel: 10000,
  totalXp: 45230,
  streak: 7,
  lessonsCompleted: 34,
  projectsCompleted: 8,
  challengesWon: 15,
  rank: 156,
  badges: ['first-contract', 'security-expert', 'defi-builder']
};

const mockAchievements = [
  {
    id: 'first-contract',
    title: 'First Contract',
    description: 'Deploy your first smart contract',
    icon: <Code className="w-6 h-6" />,
    category: 'milestone' as const,
    xpReward: 100,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000),
    rarity: 'common' as const
  },
  {
    id: 'security-expert',
    title: 'Security Expert',
    description: 'Complete all security lessons',
    icon: <Trophy className="w-6 h-6" />,
    category: 'learning' as const,
    xpReward: 500,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 172800000),
    rarity: 'epic' as const
  }
];

const mockLeaderboard = [
  {
    id: '1',
    username: 'SolidityMaster',
    avatar: '/api/placeholder/40/40',
    level: 25,
    xp: 125000,
    rank: 1,
    streak: 45
  },
  {
    id: '2',
    username: 'BlockchainDev',
    avatar: '/api/placeholder/40/40',
    level: 22,
    xp: 98000,
    rank: 2,
    streak: 32
  }
];

const mockLearningPaths = [
  {
    id: 'solidity-fundamentals',
    title: 'Solidity Fundamentals',
    description: 'Master the basics of Solidity programming',
    modules: [
      {
        id: 'intro',
        title: 'Introduction to Solidity',
        description: 'Learn the basics of smart contract development',
        icon: <BookOpen className="w-6 h-6 text-blue-400" />,
        category: 'fundamentals' as const,
        difficulty: 'beginner' as const,
        estimatedHours: 4,
        lessons: [
          {
            id: 'lesson-1',
            title: 'What is Solidity?',
            description: 'Introduction to Solidity programming language',
            duration: 30,
            difficulty: 'beginner' as const,
            type: 'video' as const,
            completed: true,
            locked: false,
            xpReward: 50
          }
        ],
        completed: false,
        progress: 25,
        unlocked: true
      }
    ],
    totalHours: 40,
    completionRate: 25,
    studentsEnrolled: 15420,
    rating: 4.8
  }
];

const mockProjects = [
  {
    id: 'hello-world',
    title: 'Hello World Contract',
    description: 'Create your first smart contract',
    difficulty: 'beginner' as const,
    category: 'utility' as const,
    estimatedHours: 2,
    xpReward: 200,
    steps: [
      {
        id: 'step-1',
        title: 'Setup Contract',
        description: 'Create the basic contract structure',
        instructions: [
          'Create a new contract called HelloWorld',
          'Add a state variable to store a message',
          'Create a constructor to initialize the message'
        ],
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message;
    
    constructor() {
        message = "Hello, World!";
    }
}`,
        completed: false,
        estimatedTime: 30
      }
    ],
    currentStep: 0,
    completed: false,
    deployed: false
  }
];

export const ComprehensiveLearningPlatform: React.FC<LearningPlatformProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'curriculum' | 'projects' | 'gamification' | 'code'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Target className="w-5 h-5" /> },
    { id: 'curriculum', label: 'Curriculum', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <Rocket className="w-5 h-5" /> },
    { id: 'gamification', label: 'Achievements', icon: <Trophy className="w-5 h-5" /> },
    { id: 'code', label: 'Code Editor', icon: <Code className="w-5 h-5" /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <LottieLoading size="lg" />
          <GSAPTextAnimation 
            text="Loading Solana Learning Platform..." 
            animationType="typewriter"
            className="text-xl text-white mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 ${className}`}>
      {/* Particle Background */}
      <ParticleBackground className="opacity-30" />
      
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-black/50 backdrop-blur-md border-r border-white/10 lg:relative lg:translate-x-0"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h1 className="text-xl font-bold text-white">Solana Learn</h1>
            <Button
              onClick={() => setSidebarOpen(false)}
              variant="ghost"
              size="sm"
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSidebarOpen(false);
                }}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Button>
            ))}
          </nav>
          
          {/* User Progress Summary */}
          <div className="p-4 border-t border-white/10 mt-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Level {mockUserProgress.level}</div>
              <div className="text-sm text-gray-400 mb-2">Blockchain Developer</div>
              <Progress value={(mockUserProgress.xp / mockUserProgress.xpToNextLevel) * 100} className="h-2" />
              <div className="text-xs text-gray-400 mt-1">
                {mockUserProgress.xp} / {mockUserProgress.xpToNextLevel} XP
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <header className="bg-black/30 backdrop-blur-md border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setSidebarOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                >
                  <Menu className="w-4 h-4" />
                </Button>
                
                <GSAPTextAnimation 
                  text={navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  animationType="reveal"
                  className="text-2xl font-bold text-white"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Current Streak</div>
                  <div className="text-lg font-bold text-orange-400">{mockUserProgress.streak} days</div>
                </div>
                
                <Button variant="outline" size="sm" className="border-white/30">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <GSAPScrollAnimation animationType="fadeUp">
                    <Card className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/20">
                      <h2 className="text-2xl font-bold text-white mb-4">Welcome Back!</h2>
                      <p className="text-gray-300 mb-6">
                        Continue your journey to becoming a Solana blockchain developer. 
                        You're making great progress!
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white/10 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">{mockUserProgress.lessonsCompleted}</div>
                          <div className="text-sm text-gray-400">Lessons Completed</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">{mockUserProgress.projectsCompleted}</div>
                          <div className="text-sm text-gray-400">Projects Built</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-400">#{mockUserProgress.rank}</div>
                          <div className="text-sm text-gray-400">Global Rank</div>
                        </div>
                      </div>
                    </Card>
                  </GSAPScrollAnimation>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GSAPScrollAnimation animationType="slideLeft">
                      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
                        <h3 className="text-xl font-semibold text-white mb-4">Continue Learning</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                              <div className="font-medium text-white">Smart Contract Security</div>
                              <div className="text-sm text-gray-400">Lesson 3 of 8</div>
                            </div>
                            <Button size="sm">
                              <Play className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </GSAPScrollAnimation>

                    <GSAPScrollAnimation animationType="slideRight">
                      <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
                        <h3 className="text-xl font-semibold text-white mb-4">Recent Achievements</h3>
                        <div className="space-y-3">
                          {mockAchievements.slice(0, 2).map((achievement) => (
                            <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                              <div className="text-yellow-400">{achievement.icon}</div>
                              <div>
                                <div className="font-medium text-white">{achievement.title}</div>
                                <div className="text-sm text-gray-400">+{achievement.xpReward} XP</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </GSAPScrollAnimation>
                  </div>
                </motion.div>
              )}

              {activeTab === 'curriculum' && (
                <motion.div
                  key="curriculum"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <StructuredCurriculum
                    learningPaths={mockLearningPaths}
                    currentPath="solidity-fundamentals"
                  />
                </motion.div>
              )}

              {activeTab === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ProjectBasedLearning
                    projects={mockProjects}
                    currentProject="hello-world"
                  />
                </motion.div>
              )}

              {activeTab === 'gamification' && (
                <motion.div
                  key="gamification"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GamificationSystem
                    userProgress={mockUserProgress}
                    achievements={mockAchievements}
                    leaderboard={mockLeaderboard}
                  />
                </motion.div>
              )}

              {activeTab === 'code' && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6">Interactive Code Editor</h2>
                    <InteractiveCodeEditor />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveLearningPlatform;
