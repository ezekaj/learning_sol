'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket, useCollaborationSessions } from '@/lib/socket/client';
import { useAuth } from '@/components/auth/EnhancedAuthProvider';
import { 
  Plus, 
  Users, 
  Code, 
  Clock, 
  Play,
  Search,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollaborativeEditor } from './CollaborativeEditor';
import { useToast } from '@/components/ui/use-toast';



export function CollaborationHub() {
  return <RealTimeCollaborationHub />;
}

// Real-time collaboration component with Socket.io integration
function RealTimeCollaborationHub() {
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected, joinSession: socketJoinSession, session, participants, presence } = useSocket();
  const { sessions, loading, createSession, joinSession, fetchSessions } = useCollaborationSessions();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [newSessionType, setNewSessionType] = useState('PAIR_PROGRAMMING');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { toast } = useToast();

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
        <p className="text-gray-400">Please sign in to access collaboration features.</p>
      </div>
    );
  }

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your session.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newSession = await createSession(
        newSessionTitle.trim(),
        newSessionDescription.trim() || 'Collaborative coding session',
        newSessionType
      );

      if (newSession) {
        // Join the session via Socket.io
        socketJoinSession(newSession.id);
        setShowCreateDialog(false);
        setNewSessionTitle('');
        setNewSessionDescription('');
        toast({
          title: "Session created!",
          description: "Your collaboration session is ready.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to create session",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const success = await joinSession(sessionId);
      if (success) {
        // Join the session via Socket.io
        socketJoinSession(sessionId);
        toast({
          title: "Joined session!",
          description: "You're now collaborating with others.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to join session",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If user is in a session, show the collaborative editor
  if (session) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <motion.h1
            className="text-4xl font-bold gradient-text mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Collaborative Coding
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Code together in real-time with {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </motion.p>
        </div>

        <CollaborativeEditor />
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
          Collaboration Hub
        </motion.h1>
        <motion.p
          className="text-xl text-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Learn together, code together, grow together
        </motion.p>
      </div>

      {/* Connection Status */}
      <Card className="glass border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-300">
              {isConnected ? 'Connected to collaboration server' : 'Connecting to collaboration server...'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-5 h-5 mr-2" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Create Collaboration Session</DialogTitle>
              <DialogDescription>
                Start a new coding session and invite others to collaborate.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Session Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Building a DeFi Protocol"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of what you'll be working on"
                  value={newSessionDescription}
                  onChange={(e) => setNewSessionDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-white">Session Type</Label>
                <Select value={newSessionType} onValueChange={setNewSessionType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAIR_PROGRAMMING">Pair Programming</SelectItem>
                    <SelectItem value="CODE_REVIEW">Code Review</SelectItem>
                    <SelectItem value="PROJECT">Project Work</SelectItem>
                    <SelectItem value="STUDY_GROUP">Study Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSession} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Available Sessions */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Available Sessions</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <Card className="glass border-white/10">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-white mb-2">No Active Sessions</h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm ? 'No sessions match your search.' : 'Be the first to create a collaboration session!'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Session
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="glass border-white/10 hover:border-white/20 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {session.type.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{session.participants.length}/{session.maxParticipants || 4}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg text-white line-clamp-2">
                      {session.title}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>Created {new Date(session.createdAt).toLocaleTimeString()}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(session.participants.length, 3))].map((_, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-slate-800 flex items-center justify-center text-white text-xs"
                            >
                              {i + 1}
                            </div>
                          ))}
                          {session.participants.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-slate-800 flex items-center justify-center text-white text-xs">
                              +{session.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleJoinSession(session.id)}
                        disabled={session.participants.length >= 4}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        {session.participants.length >= 4 ? 'Full' : 'Join'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[
          {
            icon: Code,
            title: "Real-time Coding",
            description: "Code together with live cursor tracking and instant synchronization"
          },
          {
            icon: Users,
            title: "Team Collaboration",
            description: "Work with up to 4 people simultaneously on the same codebase"
          },
          {
            icon: Zap,
            title: "Instant Compilation",
            description: "Compile and test your Solidity contracts in real-time"
          }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="glass border-white/10 text-center">
              <CardContent className="pt-6">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Simplified static version for static export
function StaticCollaborationHub() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          className="text-4xl font-bold gradient-text mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Collaboration Hub
        </motion.h1>
        <motion.p
          className="text-xl text-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Learn together, code together, grow together.
          This is a static demo showcasing the collaboration platform.
        </motion.p>
      </div>

      {/* Connection Status */}
      <Card className="glass border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm text-gray-300">
              Static demo mode - Real-time collaboration available in live version
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Demo Sessions */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Demo Sessions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: '1',
              title: 'Building a DeFi Protocol',
              language: 'solidity',
              participants: 3,
              createdAt: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Smart Contract Security',
              language: 'solidity',
              participants: 2,
              createdAt: new Date().toISOString()
            },
            {
              id: '3',
              title: 'NFT Marketplace Development',
              language: 'solidity',
              participants: 4,
              createdAt: new Date().toISOString()
            }
          ].map((session) => (
            <motion.div
              key={session.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="glass border-white/10 hover:border-white/20 transition-all h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {session.language}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      <span>{session.participants}/4</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white line-clamp-2">
                    {session.title}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>Demo Session</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(session.participants, 3))].map((_, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-slate-800 flex items-center justify-center text-white text-xs"
                          >
                            {i + 1}
                          </div>
                        ))}
                        {session.participants > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-slate-800 flex items-center justify-center text-white text-xs">
                            +{session.participants - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled
                      className="opacity-50"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[
          {
            icon: Code,
            title: "Real-time Coding",
            description: "Code together with live cursor tracking and instant synchronization"
          },
          {
            icon: Users,
            title: "Team Collaboration",
            description: "Work with up to 4 people simultaneously on the same codebase"
          },
          {
            icon: Zap,
            title: "Instant Compilation",
            description: "Compile and test your Solidity contracts in real-time"
          }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="glass border-white/10 text-center">
              <CardContent className="pt-6">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
