'use client';

import { useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Play, 
  Share, 
  Settings,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Copy,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollaboration } from '@/lib/context/CollaborationContext';
import { useToast } from '@/components/ui/use-toast';

interface Participant {
  id: string;
  name: string;
  image?: string;
  cursor?: { line: number; column: number };
  isActive: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

export function CollaborativeEditor() {
  const [code, setCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentSession, 
    isConnected, 
    updateCode, 
    updateCursor, 
    sendChatMessage, 
    chatMessages,
    leaveSession 
  } = useCollaboration();
  
  const { toast } = useToast();

  useEffect(() => {
    if (currentSession) {
      setCode(currentSession.code);
    }
  }, [currentSession]);

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && value !== code) {
      setCode(value);
      updateCode(value);
    }
  };

  const handleCursorChange = (position: any) => {
    if (position) {
      updateCursor(position.lineNumber, position.column);
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleCompileCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to compile",
        description: "Please write some Solidity code first.",
        variant: "destructive",
      });
      return;
    }

    setIsCompiling(true);
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          contractName: 'CollaborativeContract',
          version: '0.8.21',
          optimize: true 
        }),
      });

      const result = await response.json();
      setCompilationResult(result);

      if (result.success) {
        toast({
          title: "Compilation successful!",
          description: "Your contract compiled without errors.",
        });
      } else {
        toast({
          title: "Compilation failed",
          description: result.errors?.[0] || "Unknown compilation error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Compilation error",
        description: "Failed to compile the contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied!",
      description: "The code has been copied to your clipboard.",
    });
  };

  const handleShareSession = () => {
    if (currentSession) {
      const shareUrl = `${window.location.origin}/collaborate/session/${currentSession.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Session link copied!",
        description: "Share this link with others to invite them to collaborate.",
      });
    }
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-white mb-2">No Active Session</h3>
          <p className="text-gray-400">Create or join a collaboration session to start coding together.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
      {/* Main Editor Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Session Header */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-400">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <Badge variant="outline">{currentSession.language}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleShareSession}>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" variant="outline" onClick={handleCopyCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleCompileCode}
                  disabled={isCompiling}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isCompiling ? 'Compiling...' : 'Compile'}
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{currentSession.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{currentSession.participants.length} participants</span>
                <span>Created {new Date(currentSession.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Code Editor */}
        <Card className="glass border-white/10 flex-1">
          <CardContent className="p-0 h-[500px]">
            <Editor
              height="100%"
              language="solidity"
              value={code}
              onChange={handleEditorChange}
              onMount={(editor) => {
                editorRef.current = editor;
                editor.onDidChangeCursorPosition((e) => {
                  handleCursorChange(e.position);
                });
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                bracketPairColorization: { enabled: true },
                guides: {
                  bracketPairs: true,
                  indentation: true,
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Compilation Results */}
        <AnimatePresence>
          {compilationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className={`glass border-white/10 ${compilationResult.success ? 'border-green-500/30' : 'border-red-500/30'}`}>
                <CardHeader>
                  <CardTitle className={`text-sm ${compilationResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {compilationResult.success ? '✅ Compilation Successful' : '❌ Compilation Failed'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {compilationResult.success ? (
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">Contract compiled successfully!</p>
                      {compilationResult.gasEstimate && (
                        <p className="text-gray-400">Estimated gas: {compilationResult.gasEstimate.toLocaleString()}</p>
                      )}
                      {compilationResult.warnings && compilationResult.warnings.length > 0 && (
                        <div className="mt-2">
                          <p className="text-yellow-400 font-medium">Warnings:</p>
                          {compilationResult.warnings.map((warning: string, index: number) => (
                            <p key={index} className="text-yellow-300 text-xs mt-1">{warning}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {compilationResult.errors?.map((error: string, index: number) => (
                        <p key={index} className="text-red-300 text-sm">{error}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Participants */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Participants ({currentSession.participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentSession.participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2 p-2 rounded-lg bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{participant.name}</p>
                  <p className="text-xs text-gray-400">
                    {participant.id === currentSession.participants[0]?.id ? 'Host' : 'Participant'}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="glass border-white/10 flex-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowChat(!showChat)}
              >
                {showChat ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showChat && (
            <CardContent className="space-y-4">
              <ScrollArea className="h-64" ref={chatScrollRef}>
                <div className="space-y-2">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="p-2 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-400">{message.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{message.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleSendMessage}>
                  Send
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Session Controls */}
        <Card className="glass border-white/10">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={leaveSession}
              >
                Leave Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
