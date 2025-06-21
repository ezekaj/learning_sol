'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface LearningState {
  currentCourse: string | null;
  currentModule: string | null;
  currentLesson: string | null;
  progress: Record<string, number>;
  achievements: string[];
  xp: number;
  level: number;
  streak: number;
  completedChallenges: number;
  goalsCompleted: number;
  totalGoals: number;
  isLoading: boolean;
  error: string | null;
}

type LearningAction =
  | { type: 'SET_CURRENT_COURSE'; payload: string }
  | { type: 'SET_CURRENT_MODULE'; payload: string }
  | { type: 'SET_CURRENT_LESSON'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'ADD_ACHIEVEMENT'; payload: string }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'UPDATE_STREAK'; payload: number }
  | { type: 'COMPLETE_CHALLENGE'; payload?: number }
  | { type: 'COMPLETE_GOAL'; payload?: number }
  | { type: 'SET_TOTAL_GOALS'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

const initialState: LearningState = {
  currentCourse: null,
  currentModule: null,
  currentLesson: null,
  progress: {},
  achievements: [],
  xp: 0,
  level: 1,
  streak: 0,
  completedChallenges: 0,
  goalsCompleted: 0,
  totalGoals: 5,
  isLoading: false,
  error: null,
};

function learningReducer(state: LearningState, action: LearningAction): LearningState {
  switch (action.type) {
    case 'SET_CURRENT_COURSE':
      return { ...state, currentCourse: action.payload };
    case 'SET_CURRENT_MODULE':
      return { ...state, currentModule: action.payload };
    case 'SET_CURRENT_LESSON':
      return { ...state, currentLesson: action.payload };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: { ...state.progress, [action.payload.id]: action.payload.progress },
      };
    case 'ADD_ACHIEVEMENT':
      return {
        ...state,
        achievements: [...state.achievements, action.payload],
      };
    case 'ADD_XP':
      const newXP = state.xp + action.payload;
      const newLevel = Math.floor(newXP / 1000) + 1;
      return { ...state, xp: newXP, level: newLevel };
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    case 'UPDATE_STREAK':
      return { ...state, streak: action.payload };
    case 'COMPLETE_CHALLENGE':
      return {
        ...state,
        completedChallenges: state.completedChallenges + (action.payload || 1)
      };
    case 'COMPLETE_GOAL':
      return {
        ...state,
        goalsCompleted: Math.min(state.goalsCompleted + (action.payload || 1), state.totalGoals)
      };
    case 'SET_TOTAL_GOALS':
      return { ...state, totalGoals: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

interface LearningContextType {
  state: LearningState;
  setCurrentCourse: (courseId: string) => void;
  setCurrentModule: (moduleId: string) => void;
  setCurrentLesson: (lessonId: string) => void;
  updateProgress: (id: string, progress: number) => void;
  addAchievement: (achievementId: string) => void;
  addXP: (amount: number) => void;
  updateStreak: (streak: number) => void;
  completeChallenge: (count?: number) => void;
  completeGoal: (count?: number) => void;
  setTotalGoals: (total: number) => void;
  completeLesson: (lessonId: string, xpReward: number) => void;
  resetLearningState: () => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(learningReducer, initialState);
  const { data: session } = useSession();

  // Load user progress on mount
  useEffect(() => {
    if (session?.user) {
      loadUserProgress();
    }
  }, [session]);

  const loadUserProgress = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch('/api/user/progress');
      if (response.ok) {
        const data = await response.json();
        // Update state with loaded data
        dispatch({ type: 'ADD_XP', payload: data.totalXP || 0 });
        dispatch({ type: 'SET_LEVEL', payload: data.currentLevel || 1 });
        dispatch({ type: 'UPDATE_STREAK', payload: data.streak || 0 });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load progress' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setCurrentCourse = (courseId: string) => {
    dispatch({ type: 'SET_CURRENT_COURSE', payload: courseId });
  };

  const setCurrentModule = (moduleId: string) => {
    dispatch({ type: 'SET_CURRENT_MODULE', payload: moduleId });
  };

  const setCurrentLesson = (lessonId: string) => {
    dispatch({ type: 'SET_CURRENT_LESSON', payload: lessonId });
  };

  const updateProgress = async (id: string, progress: number) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: { id, progress } });
    
    // Sync with backend
    try {
      await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, progress }),
      });
    } catch (error) {
      console.error('Failed to sync progress:', error);
    }
  };

  const addAchievement = async (achievementId: string) => {
    dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievementId });
    
    // Sync with backend
    try {
      await fetch('/api/user/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId }),
      });
    } catch (error) {
      console.error('Failed to sync achievement:', error);
    }
  };

  const addXP = async (amount: number) => {
    dispatch({ type: 'ADD_XP', payload: amount });
    
    // Sync with backend
    try {
      await fetch('/api/user/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
    } catch (error) {
      console.error('Failed to sync XP:', error);
    }
  };

  const updateStreak = async (streak: number) => {
    dispatch({ type: 'UPDATE_STREAK', payload: streak });
    
    // Sync with backend
    try {
      await fetch('/api/user/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streak }),
      });
    } catch (error) {
      console.error('Failed to sync streak:', error);
    }
  };

  const completeLesson = async (lessonId: string, xpReward: number) => {
    updateProgress(lessonId, 100);
    addXP(xpReward);
    
    // Check for achievements
    const completedLessons = Object.keys(state.progress).filter(
      id => state.progress[id] === 100
    ).length + 1;
    
    if (completedLessons === 1) {
      addAchievement('first-lesson');
    } else if (completedLessons === 10) {
      addAchievement('ten-lessons');
    } else if (completedLessons === 50) {
      addAchievement('fifty-lessons');
    }
  };

  const completeChallenge = (count: number = 1) => {
    dispatch({ type: 'COMPLETE_CHALLENGE', payload: count });
  };

  const completeGoal = (count: number = 1) => {
    dispatch({ type: 'COMPLETE_GOAL', payload: count });
  };

  const setTotalGoals = (total: number) => {
    dispatch({ type: 'SET_TOTAL_GOALS', payload: total });
  };

  const resetLearningState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  return (
    <LearningContext.Provider
      value={{
        state,
        setCurrentCourse,
        setCurrentModule,
        setCurrentLesson,
        updateProgress,
        addAchievement,
        addXP,
        updateStreak,
        completeChallenge,
        completeGoal,
        setTotalGoals,
        completeLesson,
        resetLearningState,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}
