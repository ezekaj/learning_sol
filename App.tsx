
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ModuleContent from './components/ModuleContent';
import GeminiChat from './components/GeminiChat';
import AchievementsPage from './components/AchievementsPage';
import { LEARNING_MODULES } from './constants';
import { LearningModule, ChatMessage, ChatMessageRole } from './types';
import { initializeChatForModule, sendMessageToGeminiChat } from './services/geminiService';
import BotIcon from './components/icons/BotIcon';
import { useProgress } from './hooks/useProgress';

interface MainAppProps {
  onLogout?: () => void; // Made optional
}

type MainView = 'modules' | 'achievements';

const MIN_CHAT_HEIGHT_PX = 150;
const DEFAULT_CHAT_HEIGHT_PX = 300;

const MainApp: React.FC<MainAppProps> = ({ onLogout }) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null);
  const [geminiServiceError, setGeminiServiceError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<MainView>('modules'); 

  const { completedModules, addCompletedModule, resetProgress } = useProgress();
  const isApiKeyMissing = !process.env.API_KEY || process.env.API_KEY === 'undefined';

  // State and refs for chat resizing
  const [chatHeightPx, setChatHeightPx] = useState<number>(DEFAULT_CHAT_HEIGHT_PX);
  const moduleChatContainerRef = useRef<HTMLDivElement>(null);
  const isResizingChat = useRef(false);
  const chatResizeStartY = useRef(0);
  const chatInitialHeightOnResize = useRef(0);

  useEffect(() => {
    if (isApiKeyMissing) {
      setGeminiServiceError("Gemini API Key is not configured. AI features will be unavailable. Please ensure the API_KEY environment variable is correctly set and accessible.");
      console.error("Gemini API Key is missing. AI features disabled. Ensure API_KEY is set in your environment or build process.");
    } else {
      setGeminiServiceError(null); 
    }
  }, [isApiKeyMissing]);

  const handleQuizComplete = (moduleId: string) => {
    addCompletedModule(moduleId);
  };

  const handleSelectModule = useCallback(async (id: string) => {
    setCurrentView('modules'); 
    setSelectedModuleId(id);
    const module = LEARNING_MODULES.find(m => m.id === id) || null;
    setCurrentModule(module);
    setChatMessages([]); 

    if (module && !isApiKeyMissing) {
      setIsLoadingAiResponse(true);
      const initError = await initializeChatForModule(module.title, module.geminiPromptSeed);
      if (initError) {
        setGeminiServiceError(initError);
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: ChatMessageRole.ERROR,
          text: `Error initializing AI assistant for this module: ${initError}`,
          timestamp: new Date(),
        }]);
      } else {
         setGeminiServiceError(null); 
         setChatMessages([{
            id: Date.now().toString(),
            role: ChatMessageRole.MODEL,
            text: `Hello! I'm ready to discuss "${module.title}". Ask me anything about this topic.`,
            timestamp: new Date(),
         }]);
      }
      setIsLoadingAiResponse(false);
    } else if (isApiKeyMissing && module) {
        setChatMessages([{
            id: Date.now().toString(),
            role: ChatMessageRole.ERROR,
            text: "AI assistant is unavailable because the Gemini API Key is not configured.",
            timestamp: new Date(),
         }]);
    }
  }, [isApiKeyMissing]); 

  useEffect(() => {
    if (currentView === 'achievements') return; 

    const firstBeginnerModule = LEARNING_MODULES.find(m => m.level === 'Beginner');
    if (!selectedModuleId && !currentModule && !isApiKeyMissing) {
        if (firstBeginnerModule) {
            handleSelectModule(firstBeginnerModule.id);
        } else {
            const initGeneralChat = async () => {
                setIsLoadingAiResponse(true);
                const initError = await initializeChatForModule("General Blockchain Topics");
                if (initError) {
                    setGeminiServiceError(initError);
                     setChatMessages([{
                        id: Date.now().toString(),
                        role: ChatMessageRole.ERROR,
                        text: `Error initializing AI assistant: ${initError}`,
                        timestamp: new Date(),
                    }]);
                } else {
                    setGeminiServiceError(null);
                    setChatMessages([{
                        id: Date.now().toString(),
                        role: ChatMessageRole.MODEL,
                        text: "Welcome! Select a module or ask me any general questions about Solidity and Blockchain.",
                        timestamp: new Date(),
                    }]);
                }
                setIsLoadingAiResponse(false);
            };
            initGeneralChat();
        }
    } else if (isApiKeyMissing && !currentModule) {
         setChatMessages([{
            id: Date.now().toString(),
            role: ChatMessageRole.ERROR,
            text: "AI assistant is unavailable. Please configure the Gemini API Key. Select a module to view its content.",
            timestamp: new Date(),
         }]);
    }
  }, [isApiKeyMissing, selectedModuleId, currentModule, handleSelectModule, currentView]); 

  const handleSendMessage = async (messageText: string) => {
    if (isApiKeyMissing) {
       setChatMessages(prev => [...prev, 
        { id: Date.now().toString(), role: ChatMessageRole.USER, text: messageText, timestamp: new Date() },
        { id: (Date.now()+1).toString(), role: ChatMessageRole.ERROR, text: "Cannot send message: Gemini API Key is not configured.", timestamp: new Date() }
      ]);
      return;
    }
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: ChatMessageRole.USER,
      text: messageText,
      timestamp: new Date(),
    };
    setChatMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoadingAiResponse(true);

    try {
      const responseText = await sendMessageToGeminiChat(messageText);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: responseText.startsWith("Error:") || responseText.startsWith("Gemini AI Service not initialized") ? ChatMessageRole.ERROR : ChatMessageRole.MODEL,
        text: responseText,
        timestamp: new Date(),
      };
      setChatMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: ChatMessageRole.ERROR,
        text: "An unexpected error occurred. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoadingAiResponse(false);
    }
  };

  const switchToAchievementsView = () => {
    setCurrentView('achievements');
    setSelectedModuleId(null); 
    setCurrentModule(null);
    setChatMessages([]); 
  };

  // Chat Resize Handlers
  const handleMouseDownOnResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingChat.current = true;
    chatResizeStartY.current = e.clientY;
    chatInitialHeightOnResize.current = chatHeightPx;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!isResizingChat.current || !moduleChatContainerRef.current) return;

    const deltaY = e.clientY - chatResizeStartY.current;
    let newHeight = chatInitialHeightOnResize.current - deltaY; // Dragging up increases height

    const parentHeight = moduleChatContainerRef.current.clientHeight;
    const resizerHeight = 10; // Approximate height of the resizer bar
    const maxChatHeight = parentHeight * 0.85 - resizerHeight;

    if (newHeight < MIN_CHAT_HEIGHT_PX) newHeight = MIN_CHAT_HEIGHT_PX;
    if (newHeight > maxChatHeight && maxChatHeight > MIN_CHAT_HEIGHT_PX) newHeight = maxChatHeight;
    else if (newHeight > maxChatHeight) newHeight = parentHeight - resizerHeight - 20; // Fallback if maxChatHeight is too small

    setChatHeightPx(newHeight);
  };

  const handleGlobalMouseUp = () => {
    if (isResizingChat.current) {
        isResizingChat.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  };

  // Cleanup global listeners on component unmount or if resizing is interrupted
  useEffect(() => {
    return () => {
      if (isResizingChat.current) {
        handleGlobalMouseUp(); // Call the existing cleanup logic
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen antialiased text-brand-text-primary bg-brand-bg-dark">
      <Sidebar 
        modules={LEARNING_MODULES} 
        selectedModuleId={selectedModuleId} 
        onSelectModule={handleSelectModule}
        completedModuleIds={completedModules}
      />
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden bg-brand-bg-dark">
        <div className="flex justify-between items-center flex-shrink-0">
          {geminiServiceError && !currentModule && currentView === 'modules' && ( 
              <div className="p-3 bg-red-700/80 border border-red-500 text-white rounded-md flex items-center gap-2 shadow-lg text-sm">
                  <BotIcon className="w-6 h-6 text-red-300 shrink-0"/>
                  <div>
                      <h3 className="font-semibold text-xs">AI Assistant Config Error</h3>
                      <p className="text-xs text-red-100">{geminiServiceError}</p>
                  </div>
              </div>
          )}
          <div className="ml-auto flex items-center space-x-3">
            <button
              onClick={switchToAchievementsView}
              className="px-4 py-2 bg-brand-accent hover:bg-violet-500 text-white text-sm rounded-md transition-colors"
              aria-label="View my achievements"
            >
              My Achievements
            </button>
            <button
              onClick={resetProgress}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
              aria-label="Reset all learning progress"
            >
              Reset Progress
            </button>
            <button
              onClick={() => onLogout && onLogout()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {currentView === 'modules' && (
          <div ref={moduleChatContainerRef} className="flex-1 flex flex-col overflow-hidden rounded-lg bg-brand-surface-2 shadow-md">
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-brand-bg-light scrollbar-track-brand-surface-1">
                <ModuleContent 
                  module={currentModule} 
                  isApiKeyMissing={isApiKeyMissing}
                  onQuizComplete={handleQuizComplete}
                />
            </div>
            <div
              onMouseDown={handleMouseDownOnResize}
              className="h-2.5 bg-brand-bg-medium hover:bg-brand-primary cursor-ns-resize w-full flex-shrink-0 border-t border-b border-brand-bg-dark flex items-center justify-center"
              aria-label="Resize chat panel"
              role="separator"
              aria-orientation="horizontal"
            >
              <div className="w-10 h-1 bg-brand-text-muted rounded-full opacity-50 group-hover:opacity-100"></div>
            </div>
            <div 
                className="flex-shrink-0 bg-brand-surface-2"
                style={{ height: `${chatHeightPx}px` }}
            >
                 <GeminiChat 
                    chatMessages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoadingAiResponse}
                    currentModuleTitle={currentModule?.title || (isApiKeyMissing ? "" : "General Topics")}
                />
            </div>
          </div>
        )}

        {currentView === 'achievements' && (
           <div className="flex-grow overflow-y-auto rounded-lg shadow-lg bg-brand-surface-2 text-brand-text-secondary scrollbar-thin scrollbar-thumb-brand-bg-light scrollbar-track-brand-surface-1 p-6 md:p-8">
             <AchievementsPage
                completedModuleIds={completedModules}
                allModules={LEARNING_MODULES}
                onSwitchToModulesView={() => setCurrentView('modules')}
              />
           </div>
        )}
      </main>
    </div>
  );
};

export default MainApp;
