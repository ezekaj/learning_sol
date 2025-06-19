'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  Brain,
  Zap,
  Users,
  Play
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLearning } from '@/lib/context/LearningContext';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  isCompleted: boolean;
}

export function LearningDashboard() {
  const { state } = useLearning();
  const [courses, setCourses] = useState<Course[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/user/progress');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: 'Current Level',
      value: state.level,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Total XP',
      value: state.xp.toLocaleString(),
      icon: Zap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Learning Streak',
      value: `${state.streak} days`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Courses Active',
      value: courses.filter(c => c.progress > 0 && c.progress < 100).length,
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const recentAchievements = achievements
    .filter(a => a.isCompleted)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          className="text-4xl font-bold gradient-text mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Welcome Back, Developer!
        </motion.h1>
        <motion.p
          className="text-xl text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Continue your journey to Solidity mastery
        </motion.p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 glass">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {/* Continue Learning Section */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Play className="w-5 h-5" />
                Continue Learning
              </CardTitle>
              <CardDescription>
                Pick up where you left off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses
                  .filter(course => course.progress > 0 && course.progress < 100)
                  .slice(0, 3)
                  .map((course) => (
                    <motion.div
                      key={course.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {course.difficulty}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {Math.round(course.progress)}%
                        </span>
                      </div>
                      <h3 className="font-semibold text-white mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <Progress value={course.progress} className="mb-3" />
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        <span>{course.totalModules} modules</span>
                      </div>
                      <Button asChild className="w-full" size="sm">
                        <Link href={`/learn/course/${course.id}`}>
                          Continue
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* All Courses */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5" />
                All Courses
              </CardTitle>
              <CardDescription>
                Explore our comprehensive curriculum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        variant={course.progress === 100 ? "default" : course.progress > 0 ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {course.progress === 100 ? 'Completed' : course.progress > 0 ? 'In Progress' : course.difficulty}
                      </Badge>
                      {course.progress > 0 && (
                        <span className="text-sm text-gray-400">
                          {Math.round(course.progress)}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    {course.progress > 0 && (
                      <Progress value={course.progress} className="mb-4" />
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>{course.totalLessons} lessons</span>
                      <span>{course.totalModules} modules</span>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/learn/course/${course.id}`}>
                        {course.progress === 0 ? 'Start Course' : 'Continue'}
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="w-5 h-5" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Your latest accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h3 className="font-semibold text-white mb-1">{achievement.title}</h3>
                      <p className="text-xs text-gray-300 mb-2">{achievement.description}</p>
                      <p className="text-xs text-yellow-400">
                        Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your learning activity over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Activity tracking coming soon!</p>
                <p className="text-sm">We're building detailed analytics for your learning journey.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
