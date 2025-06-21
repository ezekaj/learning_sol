
import React from 'react';
import { LearningModule, LearningLevel } from '../types';
import CheckIcon from './icons/CheckIcon';

interface AchievementsPageProps {
  completedModuleIds: string[];
  allModules: LearningModule[];
  onSwitchToModulesView: () => void;
}

const getLevelClassNames = (level: LearningLevel): string => {
  switch (level) {
    case 'Beginner':
      return 'bg-green-500/80 text-green-50';
    case 'Intermediate':
      return 'bg-yellow-500/80 text-yellow-50';
    case 'Advanced':
      return 'bg-red-500/80 text-red-50';
    case 'Master':
      return 'bg-purple-500/80 text-purple-50';
    default:
      return 'bg-gray-500/80 text-gray-50';
  }
};

const AchievementsPage: React.FC<AchievementsPageProps> = ({
  completedModuleIds,
  allModules,
  onSwitchToModulesView,
}) => {
  const completedModulesDetails = allModules.filter(module =>
    completedModuleIds.includes(module.id)
  );

  // Optional: Sort completed modules, e.g., by level or title
  // For now, they will appear in the order they are defined in LEARNING_MODULES if completed
  
  // Group by level for display
  const groupedByLevel: { [level: string]: LearningModule[] } = {};
  const LEVEL_ORDER: LearningLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Master'];

  completedModulesDetails.forEach(module => {
    if (!groupedByLevel[module.level]) {
      groupedByLevel[module.level] = [];
    }
    groupedByLevel[module.level].push(module);
  });


  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex justify-between items-center pb-4 border-b border-brand-bg-light/50">
        <h1 className="text-3xl font-bold text-brand-accent">My Learning Achievements</h1>
        <button
          onClick={onSwitchToModulesView}
          className="px-4 py-2 bg-brand-primary hover:bg-violet-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          &larr; Back to Learning
        </button>
      </header>

      {completedModulesDetails.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-brand-text-muted p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-brand-bg-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m6 3H9m3-6h6m-1.5 0h.01" />
             <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a1 1 0 00-1.414 0l-3.04 3.04a1 1 0 000 1.414l.707.707a1 1 0 001.414 0l3.04-3.04a1 1 0 000-1.414l-.707-.707z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.572 8.572a1 1 0 000 1.414l3.04 3.04a1 1 0 001.414 0l.707-.707a1 1 0 000-1.414l-3.04-3.04a1 1 0 00-1.414 0l-.707.707z" />
          </svg>
          <h2 className="text-2xl font-semibold text-brand-text-primary mb-2">No Achievements Yet!</h2>
          <p className="text-lg">
            Start learning and complete module quizzes to see your progress here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {LEVEL_ORDER.map(level => (
            groupedByLevel[level] && groupedByLevel[level].length > 0 && (
              <section key={level}>
                <h2 className={`text-xl font-semibold text-brand-text-primary mb-3 pb-1 border-b border-brand-bg-light/20 ${
                    level === 'Beginner' ? 'text-green-300' : 
                    level === 'Intermediate' ? 'text-yellow-300' : 
                    level === 'Advanced' ? 'text-red-300' : 
                    level === 'Master' ? 'text-purple-300' : ''
                }`}>
                  {level} Modules Completed
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedByLevel[level].map(module => (
                    <li
                      key={module.id}
                      className="bg-brand-surface-1 p-4 rounded-lg shadow-md border border-brand-bg-light/30 hover:shadow-xl transition-shadow duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-brand-accent">{module.title}</h3>
                            <CheckIcon className="w-6 h-6 text-green-400 shrink-0" />
                        </div>
                        <p className="text-xs text-brand-text-muted mb-1">
                          Category: {module.category}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-brand-bg-light/20 flex justify-end">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${getLevelClassNames(
                            module.level
                          )}`}
                        >
                          {module.level}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
