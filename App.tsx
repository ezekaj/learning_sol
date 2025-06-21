
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComprehensiveLearningPlatform } from './components/learning/ComprehensiveLearningPlatform';
import AnimationShowcase from './components/ui/AnimationShowcase';
import GlassNeumorphDemo from './components/ui/GlassNeumorphDemo';
import {
  BookOpen,
  Rocket,
  Palette,
  Zap,
  Github,

  Play,
  Code,
  Trophy,
  Users
} from 'lucide-react';

type DemoView = 'learning' | 'animations' | 'design' | 'overview';

interface MainAppProps {
  onLogout?: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ onLogout = () => {} }) => {
  const [currentView, setCurrentView] = useState<DemoView>('overview');

  const navigationItems = [
    {
      id: 'overview',
      label: 'Platform Overview',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Complete feature showcase'
    },
    {
      id: 'learning',
      label: 'Learning Platform',
      icon: <Rocket className="w-5 h-5" />,
      description: 'Interactive Solidity education'
    },
    {
      id: 'animations',
      label: 'Advanced Animations',
      icon: <Zap className="w-5 h-5" />,
      description: 'GSAP, Lottie, Three.js showcase'
    },
    {
      id: 'design',
      label: 'Modern Design',
      icon: <Palette className="w-5 h-5" />,
      description: 'Glassmorphism & Neumorphism'
    }
  ];

  const features = [
    {
      icon: <Code className="w-8 h-8 text-blue-400" />,
      title: 'Interactive Code Editor',
      description: 'Monaco Editor with Solidity syntax highlighting, real-time compilation, and auto-completion'
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      title: 'Gamification System',
      description: 'XP/levels, achievements, badges, leaderboards inspired by CryptoZombies'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-green-400" />,
      title: 'Structured Curriculum',
      description: 'Progressive learning paths from beginner to advanced with certificates'
    },
    {
      icon: <Rocket className="w-8 h-8 text-purple-400" />,
      title: 'Project-Based Learning',
      description: 'Hands-on smart contract projects with testnet deployment'
    },
    {
      icon: <Zap className="w-8 h-8 text-orange-400" />,
      title: 'Advanced Animations',
      description: 'GSAP, Lottie, Three.js for immersive blockchain visualizations'
    },
    {
      icon: <Users className="w-8 h-8 text-pink-400" />,
      title: 'Modern UX/UI',
      description: 'Glassmorphism, neumorphism, and responsive design patterns'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Solana Learn</h1>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/ezekaj/learning_sol"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as DemoView)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <div className="text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="relative">
        <AnimatePresence mode="wait">
          {currentView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            >
              {/* Hero Section */}
              <div className="text-center mb-16">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-bold text-white mb-6"
                >
                  Comprehensive Solidity Learning Platform
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
                >
                  A next-generation learning platform that combines interactive coding, gamification,
                  advanced animations, and modern design patterns to create the ultimate Solidity education experience.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  <button
                    onClick={() => setCurrentView('learning')}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>Try Learning Platform</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('animations')}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                    <span>View Animations</span>
                  </button>
                </motion.div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      {feature.icon}
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    </div>
                    <p className="text-gray-300">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Competitive Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8"
              >
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Platform Advantages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-white">vs CryptoZombies</h4>
                        <p className="text-gray-300 text-sm">More comprehensive curriculum + advanced visualizations</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-white">vs Alchemy University</h4>
                        <p className="text-gray-300 text-sm">Enhanced gamification + interactive features</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-white">vs Buildspace</h4>
                        <p className="text-gray-300 text-sm">Stronger individual learning paths + community features</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-white">vs OpenZeppelin Learn</h4>
                        <p className="text-gray-300 text-sm">Broader scope with integrated security focus</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-white">vs Solidity by Example</h4>
                        <p className="text-gray-300 text-sm">Interactive environment + guided learning</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {currentView === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ComprehensiveLearningPlatform />
            </motion.div>
          )}

          {currentView === 'animations' && (
            <motion.div
              key="animations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8"
            >
              <AnimationShowcase />
            </motion.div>
          )}

          {currentView === 'design' && (
            <motion.div
              key="design"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8"
            >
              <GlassNeumorphDemo />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MainApp;
