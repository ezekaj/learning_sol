'use client';

import { motion } from 'framer-motion';
import { 
  Code, 
  Users, 
  Zap, 
  Shield, 
  BookOpen, 
  Trophy,
  Rocket,
  Brain,
  Globe,
  Sparkles
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Code,
      title: 'Interactive Code Editor',
      description: 'Write, compile, and deploy Solidity contracts with our Monaco-powered editor featuring syntax highlighting and auto-completion.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Get personalized tutoring and code reviews from our advanced AI assistant powered by Google Gemini.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Real-Time Collaboration',
      description: 'Code together with peers in real-time collaborative sessions with live chat and cursor tracking.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Trophy,
      title: 'Gamified Learning',
      description: 'Earn XP, unlock achievements, and climb leaderboards as you master Solidity development.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Security Focus',
      description: 'Learn security best practices with built-in vulnerability detection and smart contract auditing tools.',
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: Globe,
      title: 'Multi-Testnet Support',
      description: 'Deploy and test your contracts on multiple testnets including Sepolia, Goerli, and Mumbai.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: BookOpen,
      title: 'Structured Curriculum',
      description: 'Follow our comprehensive learning path from basics to advanced DeFi and NFT development.',
      gradient: 'from-teal-500 to-blue-500',
    },
    {
      icon: Rocket,
      title: 'Project-Based Learning',
      description: 'Build real-world projects including DeFi protocols, NFT marketplaces, and DAOs.',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: Sparkles,
      title: 'Modern UI/UX',
      description: 'Experience beautiful glassmorphism design with smooth animations and responsive layouts.',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Master Solidity
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge technology with proven learning methodologies 
            to accelerate your blockchain development journey.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative"
            >
              <div className="glass p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Learning Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
