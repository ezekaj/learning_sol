'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Shield, 
  Database,
  Activity,
  TrendingUp
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/hooks/useAuth';
import { GlassCard } from '@/components/ui/Glassmorphism';

export default function AdminDashboard() {
  const { user } = useAuth();

  const adminStats = [
    { title: 'Total Users', value: '1,234', icon: Users, color: 'blue' },
    { title: 'Active Courses', value: '56', icon: BookOpen, color: 'green' },
    { title: 'Completion Rate', value: '78%', icon: TrendingUp, color: 'purple' },
    { title: 'System Health', value: '99.9%', icon: Activity, color: 'cyan' },
  ];

  const adminActions = [
    { title: 'User Management', description: 'Manage user accounts and roles', icon: Users },
    { title: 'Course Management', description: 'Create and edit learning content', icon: BookOpen },
    { title: 'Analytics Dashboard', description: 'View platform analytics and reports', icon: BarChart3 },
    { title: 'System Settings', description: 'Configure platform settings', icon: Settings },
    { title: 'Security Center', description: 'Monitor security and access logs', icon: Shield },
    { title: 'Database Admin', description: 'Database management and backups', icon: Database },
  ];

  return (
    <ProtectedRoute requireAuth={true} requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
            <p className="text-xl text-gray-300">
              Welcome back, {user?.name}! Manage your Solidity learning platform.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {adminStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Admin Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Admin Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminActions.map((action, index) => (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                        <action.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{action.description}</p>
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { action: 'New user registration', user: 'john.doe@example.com', time: '2 minutes ago' },
                  { action: 'Course completion', user: 'jane.smith@example.com', time: '15 minutes ago' },
                  { action: 'System backup completed', user: 'System', time: '1 hour ago' },
                  { action: 'New instructor added', user: 'admin@example.com', time: '2 hours ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-gray-400 text-sm">{activity.user}</p>
                    </div>
                    <span className="text-gray-400 text-sm">{activity.time}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-8"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <Database className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Database</h3>
                  <p className="text-green-400 text-sm">Operational</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Security</h3>
                  <p className="text-green-400 text-sm">Secure</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Performance</h3>
                  <p className="text-green-400 text-sm">Excellent</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
