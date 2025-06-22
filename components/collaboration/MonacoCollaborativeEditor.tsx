import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Editor, Monaco } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Save, 
  Download, 
  Copy, 
  Play, 
  Settings, 
  Maximize2, 
  Minimize2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/lib/socket/client';
import { useAuth } from '@/components/auth/EnhancedAuthProvider';
import { useToast } from '@/components/ui/use-toast';

interface MonacoCollaborativeEditorProps {
  sessionId: string;
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
  onSave?: (code: string) => void;
}

interface Operation {
  type: 'insert' | 'delete' | 'replace';
  position: { line: number; column: number };
  content: string;
  length?: number;
  userId: string;
  timestamp: number;
  id: string;
}

interface UserCursor {
  userId: string;
  userName: string;
  position: { line: number; column: number };
  selection?: { start: { line: number; column: number }; end: { line: number; column: number } };
  color: string;
}

interface ConflictResolution {
  operationId: string;
  resolution: 'accept' | 'reject' | 'merge';
  mergedContent?: string;
}

const CURSOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export const MonacoCollaborativeEditor: React.FC<MonacoCollaborativeEditorProps> = ({
  sessionId,
  initialCode = '',
  language = 'solidity',
  readOnly = false,
  onCodeChange,
  onSave
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    socket,
    isConnected,
    session,
    participants,
    updateCode,
    updateCursor,
    updateSelection
  } = useSocket();

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [code, setCode] = useState(initialCode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userCursors, setUserCursors] = useState<UserCursor[]>([]);
  const [pendingOperations, setPendingOperations] = useState<Operation[]>([]);
  const [conflicts, setConflicts] = useState<Operation[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Operational Transformation functions
  const transformOperation = useCallback((op1: Operation, op2: Operation): Operation => {
    // Simple operational transformation for concurrent edits
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position.line < op2.position.line || 
          (op1.position.line === op2.position.line && op1.position.column <= op2.position.column)) {
        return op2; // No transformation needed
      } else {
        // Adjust position based on inserted content
        const lines = op1.content.split('\n');
        if (lines.length > 1) {
          return {
            ...op2,
            position: {
              line: op2.position.line + lines.length - 1,
              column: op2.position.line === op1.position.line 
                ? op2.position.column + lines[lines.length - 1].length
                : op2.position.column
            }
          };
        } else {
          return {
            ...op2,
            position: {
              ...op2.position,
              column: op2.position.line === op1.position.line 
                ? op2.position.column + op1.content.length 
                : op2.position.column
            }
          };
        }
      }
    }
    
    // Add more transformation logic for delete and replace operations
    return op2;
  }, []);

  const applyOperation = useCallback((operation: Operation) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    
    if (!model) return;

    try {
      switch (operation.type) {
        case 'insert':
          const insertPosition = new monacoRef.current!.Position(
            operation.position.line,
            operation.position.column
          );
          model.pushEditOperations(
            [],
            [{
              range: new monacoRef.current!.Range(
                insertPosition.lineNumber,
                insertPosition.column,
                insertPosition.lineNumber,
                insertPosition.column
              ),
              text: operation.content
            }],
            () => null
          );
          break;

        case 'delete':
          const deleteRange = new monacoRef.current!.Range(
            operation.position.line,
            operation.position.column,
            operation.position.line,
            operation.position.column + (operation.length || 1)
          );
          model.pushEditOperations(
            [],
            [{
              range: deleteRange,
              text: ''
            }],
            () => null
          );
          break;

        case 'replace':
          const replaceRange = new monacoRef.current!.Range(
            operation.position.line,
            operation.position.column,
            operation.position.line,
            operation.position.column + (operation.length || 0)
          );
          model.pushEditOperations(
            [],
            [{
              range: replaceRange,
              text: operation.content
            }],
            () => null
          );
          break;
      }
    } catch (error) {
      console.error('Error applying operation:', error);
      // Add to conflicts for manual resolution
      setConflicts(prev => [...prev, operation]);
    }
  }, []);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure Solidity language support
    monaco.languages.register({ id: 'solidity' });
    monaco.languages.setMonarchTokensProvider('solidity', {
      tokenizer: {
        root: [
          [/pragma\s+solidity/, 'keyword'],
          [/contract\s+\w+/, 'keyword'],
          [/function\s+\w+/, 'keyword'],
          [/\b(uint|int|bool|string|address|bytes)\d*\b/, 'type'],
          [/\b(public|private|internal|external|pure|view|payable)\b/, 'keyword'],
          [/\/\/.*$/, 'comment'],
          [/\/\*[\s\S]*?\*\//, 'comment'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/\d+/, 'number'],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop']
        ]
      }
    });

    // Set up cursor and selection tracking
    editor.onDidChangeCursorPosition((e: any) => {
      if (!readOnly && user) {
        updateCursor(e.position.lineNumber, e.position.column);
      }
    });

    editor.onDidChangeCursorSelection((e: any) => {
      if (!readOnly && user) {
        const selection = e.selection;
        updateSelection(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn
        );
      }
    });

    // Set up content change tracking
    editor.onDidChangeModelContent((e: any) => {
      if (!readOnly) {
        const newCode = editor.getValue();
        setCode(newCode);
        setHasUnsavedChanges(true);
        onCodeChange?.(newCode);

        // Create operations for each change
        e.changes.forEach((change: any) => {
          const operation: Operation = {
            type: change.text ? 'insert' : 'delete',
            position: {
              line: change.range.startLineNumber,
              column: change.range.startColumn
            },
            content: change.text || '',
            length: change.rangeLength,
            userId: user?.id || 'anonymous',
            timestamp: Date.now(),
            id: `${user?.id}-${Date.now()}-${Math.random()}`
          };

          // Send operation to other users
          updateCode(newCode, operation);
        });
      }
    });
  };

  // Handle incoming operations from other users
  useEffect(() => {
    if (socket) {
      const handleRemoteOperation = (operation: Operation) => {
        if (operation.userId !== user?.id) {
          // Transform operation against pending operations
          let transformedOp = operation;
          pendingOperations.forEach(pendingOp => {
            transformedOp = transformOperation(pendingOp, transformedOp);
          });

          applyOperation(transformedOp);
        }
      };

      socket.on('code_operation', handleRemoteOperation);
      return () => {
        socket.off('code_operation', handleRemoteOperation);
      };
    }
  }, [socket, user?.id, pendingOperations, transformOperation, applyOperation]);

  // Update user cursors from presence data
  useEffect(() => {
    const cursors: UserCursor[] = participants
      .filter(p => p.id !== user?.id)
      .map((participant, index) => ({
        userId: participant.id,
        userName: participant.name || 'Anonymous',
        position: { line: 1, column: 1 }, // Would come from presence data
        color: CURSOR_COLORS[index % CURSOR_COLORS.length]
      }));
    
    setUserCursors(cursors);
  }, [participants, user?.id]);

  const handleSave = async () => {
    try {
      await onSave?.(code);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast({
        title: 'Code Saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save your changes. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCompile = async () => {
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Compilation Successful',
          description: 'Your code compiled without errors!',
        });
      } else {
        toast({
          title: 'Compilation Failed',
          description: result.error || 'Unknown compilation error',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Compilation Error',
        description: 'Failed to compile code',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code Copied',
      description: 'Code copied to clipboard!',
    });
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract_${Date.now()}.sol`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resolveConflict = (operationId: string, resolution: ConflictResolution) => {
    setConflicts(prev => prev.filter(c => c.id !== operationId));
    
    if (resolution.resolution === 'accept' && resolution.mergedContent) {
      setCode(resolution.mergedContent);
      if (editorRef.current) {
        editorRef.current.setValue(resolution.mergedContent);
      }
    }
    
    toast({
      title: 'Conflict Resolved',
      description: `Conflict resolved with ${resolution.resolution} strategy.`,
    });
  };

  return (
    <div className={`flex flex-col bg-slate-900 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">Collaborative Editor</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              <Clock className="w-3 h-3 mr-1" />
              Unsaved
            </Badge>
          )}
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Participants */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{participants.length}</span>
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((participant, index) => (
                <div
                  key={participant.id}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-800"
                  title={participant.name}
                >
                  {participant.name?.charAt(0) || 'A'}
                </div>
              ))}
            </div>
          </div>
          
          {/* Action buttons */}
          <Button size="sm" onClick={handleSave} disabled={!hasUnsavedChanges}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button size="sm" onClick={handleCompile} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-1" />
            Compile
          </Button>
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={downloadCode}>
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Conflicts notification */}
      <AnimatePresence>
        {conflicts.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-600/20 border-b border-yellow-600/30 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-200">
                  {conflicts.length} merge conflict{conflicts.length > 1 ? 's' : ''} detected
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  // Auto-resolve conflicts by accepting all
                  conflicts.forEach(conflict => {
                    resolveConflict(conflict.id, { 
                      operationId: conflict.id, 
                      resolution: 'accept',
                      mergedContent: code 
                    });
                  });
                }}
              >
                Auto-resolve
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          value={code}
          onMount={handleEditorDidMount}
          options={{
            theme: 'vs-dark',
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            readOnly,
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            folding: true,
            lineNumbers: 'on',
            glyphMargin: true,
            renderWhitespace: 'selection',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
          }}
        />
        
        {/* User cursors overlay */}
        {userCursors.map((cursor) => (
          <div
            key={cursor.userId}
            className="absolute pointer-events-none z-10"
            style={{
              // This would need proper calculation based on Monaco's line height and character width
              top: `${cursor.position.line * 19}px`,
              left: `${cursor.position.column * 7.2}px`,
            }}
          >
            <div
              className="w-0.5 h-5 animate-pulse"
              style={{ backgroundColor: cursor.color }}
            />
            <div
              className="absolute -top-6 left-0 px-1 py-0.5 rounded text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.userName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonacoCollaborativeEditor;
