'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { 
  Play, 
  Save, 
  Download, 
  Upload,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletConnect } from '@/components/blockchain/WalletConnect';
import { ContractDeployer } from '@/components/blockchain/ContractDeployer';
import { useToast } from '@/components/ui/use-toast';

const DEFAULT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev Store and retrieve a value in a variable
 */
contract SimpleStorage {
    uint256 private storedData;
    
    event ValueChanged(uint256 newValue);
    
    /**
     * @dev Store a value
     * @param x The value to store
     */
    function set(uint256 x) public {
        storedData = x;
        emit ValueChanged(x);
    }
    
    /**
     * @dev Retrieve the stored value
     * @return The stored value
     */
    function get() public view returns (uint256) {
        return storedData;
    }
}`;

interface CompilationResult {
  success: boolean;
  bytecode?: string;
  abi?: any[];
  errors?: string[];
  warnings?: string[];
  gasEstimate?: number;
  securityIssues?: any[];
  optimizationSuggestions?: string[];
}

export function CodeLab() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const handleCompile = async () => {
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
          contractName: extractContractName(code) || 'Contract',
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to local storage
      localStorage.setItem('solidity-code', code);
      
      // Also save to database if user wants to persist
      await fetch('/api/code/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code,
          name: extractContractName(code) || 'Untitled',
          language: 'solidity'
        }),
      });

      toast({
        title: "Code saved!",
        description: "Your code has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save your code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const contractName = extractContractName(code) || 'Contract';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contractName}.sol`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File downloaded!",
      description: `${contractName}.sol has been downloaded.`,
    });
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        setCompilationResult(null);
        toast({
          title: "File uploaded!",
          description: `${file.name} has been loaded into the editor.`,
        });
      };
      reader.readAsText(file);
    }
  };

  const extractContractName = (code: string): string | null => {
    const match = code.match(/contract\s+(\w+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          className="text-4xl font-bold gradient-text mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Code Lab
        </motion.h1>
        <motion.p
          className="text-xl text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Write, compile, and deploy Solidity smart contracts
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          <Card className="glass border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCompile}
                    disabled={isCompiling}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isCompiling ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-pulse" />
                        Compiling...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Compile
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-pulse" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".sol"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card className="glass border-white/10">
            <CardContent className="p-0 h-[600px]">
              <Editor
                height="100%"
                language="solidity"
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on',
                  bracketPairColorization: { enabled: true },
                  guides: {
                    bracketPairs: true,
                    indentation: true,
                  },
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Compilation Results */}
          {compilationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Tabs defaultValue="output" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="output">Output</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="optimization">Optimization</TabsTrigger>
                  <TabsTrigger value="deploy">Deploy</TabsTrigger>
                </TabsList>
                
                <TabsContent value="output">
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
                              {compilationResult.warnings.map((warning, index) => (
                                <p key={index} className="text-yellow-300 text-xs mt-1">{warning}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {compilationResult.errors?.map((error, index) => (
                            <p key={index} className="text-red-300 text-sm">{error}</p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm text-white">Security Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {compilationResult.securityIssues && compilationResult.securityIssues.length > 0 ? (
                        <div className="space-y-3">
                          {compilationResult.securityIssues.map((issue, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${
                              issue.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                              issue.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                              issue.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                              'bg-blue-500/10 border-blue-500/30'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-white">{issue.title}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  issue.severity === 'critical' ? 'bg-red-500 text-white' :
                                  issue.severity === 'high' ? 'bg-orange-500 text-white' :
                                  issue.severity === 'medium' ? 'bg-yellow-500 text-black' :
                                  'bg-blue-500 text-white'
                                }`}>
                                  {issue.severity}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 mb-2">{issue.description}</p>
                              {issue.suggestion && (
                                <p className="text-xs text-gray-400">💡 {issue.suggestion}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">No security issues detected.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="optimization">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm text-white">Optimization Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {compilationResult.optimizationSuggestions && compilationResult.optimizationSuggestions.length > 0 ? (
                        <div className="space-y-2">
                          {compilationResult.optimizationSuggestions.map((suggestion, index) => (
                            <div key={index} className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                              <p className="text-sm text-gray-300">💡 {suggestion}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">No optimization suggestions available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="deploy">
                  <ContractDeployer 
                    bytecode={compilationResult.bytecode}
                    abi={compilationResult.abi}
                    contractName={extractContractName(code) || 'Contract'}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <WalletConnect />
        </div>
      </div>
    </div>
  );
}
