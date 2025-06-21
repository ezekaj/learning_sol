
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
  Users,
  LogOut,
  User,
  Settings,
  Shield,
  AlertTriangle
} from 'lucide-react';

type DemoView = 'learning' | 'animations' | 'design' | 'overview';

interface MainAppProps {
  onLogout?: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ onLogout = () => {} }) => {
  const [currentView, setCurrentView] = useState<DemoView>('overview');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Mock user session data
  const [userSession] = useState({
    username: 'Demo User',
    email: 'demo@solanalearn.com',
    avatar: null,
    lastLogin: new Date().toISOString(),
    sessionDuration: '2h 15m',
    progress: {
      completedLessons: 12,
      totalXP: 2450,
      currentStreak: 7
    }
  });

  // Logout functionality handlers
  const handleLogoutClick = () => {
    setShowUserMenu(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);

    try {
      // Simulate session cleanup
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Clear local storage/session storage
      localStorage.removeItem('userSession');
      localStorage.removeItem('learningProgress');
      sessionStorage.clear();

      // Call the onLogout prop to handle parent component logout
      onLogout();

      // Close modal
      setShowLogoutModal(false);

      // Optional: Redirect to login page or home
      // window.location.href = '/login';

    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

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

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{userSession.username}</span>
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{userSession.username}</div>
                            <div className="text-sm text-gray-400">{userSession.email}</div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-blue-400">{userSession.progress.completedLessons}</div>
                            <div className="text-gray-400">Lessons</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-yellow-400">{userSession.progress.totalXP}</div>
                            <div className="text-gray-400">XP</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-400">{userSession.progress.currentStreak}</div>
                            <div className="text-gray-400">Streak</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Privacy</span>
                        </button>
                        <div className="border-t border-white/10 my-2"></div>
                        <button
                          onClick={handleLogoutClick}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>

                      <div className="p-3 border-t border-white/10 text-xs text-gray-400">
                        <div>Session: {userSession.sessionDuration}</div>
                        <div>Last login: {new Date(userSession.lastLogin).toLocaleDateString()}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleLogoutCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Confirm Logout</h3>
                  <p className="text-sm text-gray-400">Are you sure you want to logout?</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Current session:</span>
                    <span className="text-blue-400">{userSession.sessionDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unsaved progress:</span>
                    <span className="text-yellow-400">Will be saved automatically</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current streak:</span>
                    <span className="text-green-400">{userSession.progress.currentStreak} days</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleLogoutCancel}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainApp;
