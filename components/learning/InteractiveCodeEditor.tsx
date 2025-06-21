import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Save, Download, Upload, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import CustomToast from '../ui/CustomToast';

interface CompilationResult {
  success: boolean;
  errors: CompilationError[];
  warnings: CompilationError[];
  bytecode?: string;
  abi?: any[];
}

interface CompilationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface InteractiveCodeEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onCompile?: (result: CompilationResult) => void;
  readOnly?: boolean;
  theme?: 'light' | 'dark';
  showMinimap?: boolean;
  enableAutoSave?: boolean;
  className?: string;
}

const defaultSolidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title HelloWorld
 * @dev A simple smart contract to demonstrate Solidity basics
 */
contract HelloWorld {
    string private message;
    address public owner;
    
    event MessageChanged(string newMessage, address changedBy);
    
    constructor() {
        message = "Hello, Blockchain World!";
        owner = msg.sender;
    }
    
    function setMessage(string memory _newMessage) public {
        require(bytes(_newMessage).length > 0, "Message cannot be empty");
        message = _newMessage;
        emit MessageChanged(_newMessage, msg.sender);
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function changeOwner(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}`;

export const InteractiveCodeEditor: React.FC<InteractiveCodeEditorProps> = ({
  initialCode = defaultSolidityCode,
  onCodeChange,
  onCompile,
  readOnly = false,
  theme = 'dark',
  showMinimap = true,
  enableAutoSave = true,
  className = ''
}) => {
  const [code, setCode] = useState(initialCode);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editorTheme, setEditorTheme] = useState(theme);
  const [fontSize, setFontSize] = useState(14);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  
  const editorRef = useRef<any>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (enableAutoSave && autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    if (enableAutoSave) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('solidity-editor-code', code);
        showToastMessage('Code auto-saved', 'success');
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [code, enableAutoSave]);

  // Load saved code on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('solidity-editor-code');
    if (savedCode && savedCode !== initialCode) {
      setCode(savedCode);
    }
  }, [initialCode]);

  const showToastMessage = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure Solidity language support
    monaco.languages.register({ id: 'solidity' });
    
    // Set up Solidity syntax highlighting
    monaco.languages.setMonarchTokensProvider('solidity', {
      tokenizer: {
        root: [
          [/pragma\s+solidity/, 'keyword'],
          [/contract|interface|library|abstract/, 'keyword'],
          [/function|modifier|constructor|fallback|receive/, 'keyword'],
          [/public|private|internal|external/, 'keyword'],
          [/view|pure|payable|nonpayable/, 'keyword'],
          [/memory|storage|calldata/, 'keyword'],
          [/uint\d*|int\d*|address|bool|string|bytes\d*/, 'type'],
          [/mapping|struct|enum|event/, 'keyword'],
          [/require|assert|revert/, 'keyword'],
          [/msg\.sender|msg\.value|block\.timestamp/, 'variable.predefined'],
          [/".*?"/, 'string'],
          [/'.*?'/, 'string'],
          [/\/\/.*$/, 'comment'],
          [/\/\*[\s\S]*?\*\//, 'comment'],
          [/\d+/, 'number'],
        ]
      }
    });

    // Set up auto-completion
    monaco.languages.registerCompletionItemProvider('solidity', {
      provideCompletionItems: () => ({
        suggestions: [
          {
            label: 'contract',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'contract ${1:ContractName} {\n\t$0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'function ${1:functionName}(${2:parameters}) ${3:public} ${4:returns (${5:returnType})} {\n\t$0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: 'require',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'require(${1:condition}, "${2:error message}");',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
        ]
      })
    });
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      onCodeChange?.(value);
    }
  };

  const compileCode = async () => {
    setIsCompiling(true);
    
    try {
      // Simulate compilation (in a real implementation, you'd use solc-js)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock compilation result
      const mockResult: CompilationResult = {
        success: true,
        errors: [],
        warnings: [
          {
            line: 15,
            column: 5,
            message: 'Unused parameter in function',
            severity: 'warning'
          }
        ],
        bytecode: '0x608060405234801561001057600080fd5b50...',
        abi: [
          {
            "inputs": [],
            "name": "getMessage",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
          }
        ]
      };
      
      setCompilationResult(mockResult);
      onCompile?.(mockResult);
      
      if (mockResult.success) {
        showToastMessage('Compilation successful!', 'success');
      } else {
        showToastMessage('Compilation failed with errors', 'error');
      }
    } catch (error) {
      const errorResult: CompilationResult = {
        success: false,
        errors: [
          {
            line: 1,
            column: 1,
            message: 'Compilation error occurred',
            severity: 'error'
          }
        ],
        warnings: []
      };
      
      setCompilationResult(errorResult);
      showToastMessage('Compilation failed', 'error');
    } finally {
      setIsCompiling(false);
    }
  };

  const saveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contract.sol';
    a.click();
    URL.revokeObjectURL(url);
    showToastMessage('Code saved to file', 'success');
  };

  const loadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        showToastMessage('Code loaded from file', 'success');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Toolbar */}
      <Card className="mb-4 p-4 bg-white/10 backdrop-blur-md border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={compileCode}
              disabled={isCompiling || readOnly}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {isCompiling ? 'Compiling...' : 'Compile'}
            </Button>
            
            <Button
              onClick={saveCode}
              variant="outline"
              className="border-white/30 text-gray-700 dark:text-gray-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
            
            <label className="cursor-pointer">
              <Button variant="outline" className="border-white/30 text-gray-700 dark:text-gray-300">
                <Upload className="w-4 h-4 mr-2" />
                Load
              </Button>
              <input
                type="file"
                accept=".sol"
                onChange={loadCode}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            {compilationResult && (
              <div className="flex items-center space-x-2">
                {compilationResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                {compilationResult.warnings.length > 0 && (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            )}
            
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="border-white/30 text-gray-700 dark:text-gray-300"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 right-0 z-50 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-4">Editor Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value as 'light' | 'dark')}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{fontSize}px</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Editor */}
      <Card className="overflow-hidden bg-white/5 backdrop-blur-md border border-white/20">
        <Editor
          height="500px"
          language="solidity"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme={editorTheme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly,
            minimap: { enabled: showMinimap },
            fontSize,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            contextmenu: true,
            mouseWheelZoom: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            bracketPairColorization: { enabled: true },
          }}
        />
      </Card>

      {/* Compilation Results */}
      {compilationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Card className="p-4 bg-white/10 backdrop-blur-md border border-white/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              Compilation Results
              {compilationResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 ml-2" />
              )}
            </h3>
            
            {compilationResult.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="text-red-500 font-medium mb-2">Errors:</h4>
                {compilationResult.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-400 mb-1">
                    Line {error.line}: {error.message}
                  </div>
                ))}
              </div>
            )}
            
            {compilationResult.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="text-yellow-500 font-medium mb-2">Warnings:</h4>
                {compilationResult.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-400 mb-1">
                    Line {warning.line}: {warning.message}
                  </div>
                ))}
              </div>
            )}
            
            {compilationResult.success && (
              <div className="text-green-400 text-sm">
                ✓ Contract compiled successfully
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Toast Notifications */}
      <AnimatePresence>
        {showToast && (
          <CustomToast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveCodeEditor;
