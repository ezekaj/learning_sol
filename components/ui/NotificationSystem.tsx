'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Trophy,
  Star,
  Zap,
  Users,
  Bell
} from 'lucide-react';
import { notificationVariants } from '@/lib/animations/micro-interactions';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'achievement' | 'collaboration' | 'xp' | 'level-up';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: {
    xp?: number;
    level?: number;
    achievement?: string;
    user?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  showAchievement: (title: string, message: string, metadata?: any) => void;
  showXPGain: (xp: number, message?: string) => void;
  showLevelUp: (level: number, message?: string) => void;
  showCollaboration: (message: string, user?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    // Play notification sound
    playNotificationSound(notification.type);

    // Trigger haptic feedback on mobile
    if ('vibrate' in navigator) {
      const vibrationPattern = getVibrationPattern(notification.type);
      navigator.vibrate(vibrationPattern);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showAchievement = useCallback((title: string, message: string, metadata?: any) => {
    addNotification({
      type: 'achievement',
      title,
      message,
      duration: 8000,
      metadata,
    });
  }, [addNotification]);

  const showXPGain = useCallback((xp: number, message?: string) => {
    addNotification({
      type: 'xp',
      title: `+${xp} XP Gained!`,
      message: message || 'Great job! Keep learning!',
      duration: 4000,
      metadata: { xp },
    });
  }, [addNotification]);

  const showLevelUp = useCallback((level: number, message?: string) => {
    addNotification({
      type: 'level-up',
      title: 'Level Up!',
      message: message || `Congratulations! You've reached level ${level}!`,
      duration: 10000,
      metadata: { level },
    });
  }, [addNotification]);

  const showCollaboration = useCallback((message: string, user?: string) => {
    addNotification({
      type: 'collaboration',
      title: 'Collaboration Update',
      message,
      duration: 6000,
      metadata: { user },
    });
  }, [addNotification]);

  const playNotificationSound = (type: Notification['type']) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different notification types
      const frequencies = {
        success: [523, 659, 784], // C, E, G
        error: [392, 311], // G, Eb
        info: [440], // A
        warning: [466, 415], // Bb, Ab
        achievement: [523, 659, 784, 1047], // C, E, G, C
        collaboration: [440, 554], // A, C#
        xp: [659, 784], // E, G
        'level-up': [523, 659, 784, 1047, 1319], // C, E, G, C, E
      };

      const freqs = frequencies[type] || [440];
      
      freqs.forEach((freq, index) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.frequency.setValueAtTime(freq, audioContext.currentTime);
          gain.gain.setValueAtTime(0.1, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.2);
        }, index * 100);
      });
    } catch (error) {
      // Fallback: silent operation
    }
  };

  const getVibrationPattern = (type: Notification['type']): number[] => {
    const patterns = {
      success: [100],
      error: [200, 100, 200],
      info: [50],
      warning: [150, 50, 150],
      achievement: [200, 100, 200, 100, 200],
      collaboration: [100, 50, 100],
      xp: [50, 50, 50],
      'level-up': [300, 100, 300, 100, 300],
    };
    return patterns[type] || [100];
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        showAchievement,
        showXPGain,
        showLevelUp,
        showCollaboration,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onRemove={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationCard({ 
  notification, 
  onRemove 
}: { 
  notification: Notification; 
  onRemove: () => void;
}) {
  const [, setIsHovered] = useState(false);

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (notification.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle {...iconProps} className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle {...iconProps} className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info {...iconProps} className="w-5 h-5 text-blue-400" />;
      case 'achievement':
        return <Trophy {...iconProps} className="w-5 h-5 text-yellow-400" />;
      case 'collaboration':
        return <Users {...iconProps} className="w-5 h-5 text-purple-400" />;
      case 'xp':
        return <Zap {...iconProps} className="w-5 h-5 text-blue-400" />;
      case 'level-up':
        return <Star {...iconProps} className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell {...iconProps} className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBackgroundColor = () => {
    const colors = {
      success: 'from-green-500/20 to-green-600/20 border-green-500/30',
      error: 'from-red-500/20 to-red-600/20 border-red-500/30',
      warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
      info: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      achievement: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
      collaboration: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      xp: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      'level-up': 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    };
    return colors[notification.type] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
  };

  return (
    <motion.div
      variants={notificationVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative p-4 rounded-lg backdrop-blur-md border shadow-lg',
        'bg-gradient-to-r',
        getBackgroundColor()
      )}
    >
      {/* Special effects for achievements and level-ups */}
      {(notification.type === 'achievement' || notification.type === 'level-up') && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-lg"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-300">
            {notification.message}
          </p>
          
          {/* Metadata display */}
          {notification.metadata && (
            <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
              {notification.metadata.xp && (
                <span className="flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>+{notification.metadata.xp} XP</span>
                </span>
              )}
              {notification.metadata.level && (
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>Level {notification.metadata.level}</span>
                </span>
              )}
              {notification.metadata.user && (
                <span className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{notification.metadata.user}</span>
                </span>
              )}
            </div>
          )}
          
          {/* Action button */}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for timed notifications */}
      {!notification.persistent && notification.duration && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}
