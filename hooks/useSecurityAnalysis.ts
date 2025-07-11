/**
 * React Hook for Security Analysis
 * 
 * Provides easy integration of the SecurityScanner with React components
 * and Monaco Editor instances.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { SecurityScanner, SecurityScanResult, SecurityIssue } from '@/lib/security/SecurityScanner';

interface UseSecurityAnalysisOptions {
  enableRealtime?: boolean;
  enableAIAnalysis?: boolean;
  enablePatternMatching?: boolean;
  debounceMs?: number;
  severityThreshold?: 'low' | 'medium' | 'high' | 'critical';
  maxCodeLength?: number;
  enableAutoFix?: boolean;
}

interface UseSecurityAnalysisReturn {
  scanResult: SecurityScanResult | null;
  isScanning: boolean;
  lastError: Error | null;
  scanner: SecurityScanner | null;
  performAnalysis: () => Promise<void>;
  clearResults: () => void;
  updateConfig: (config: Partial<UseSecurityAnalysisOptions>) => void;
  autoFixIssue: (issue: SecurityIssue) => Promise<boolean>;
  jumpToIssue: (issue: SecurityIssue) => void;
}

export function useSecurityAnalysis(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  userId: string,
  options: UseSecurityAnalysisOptions = {}
): UseSecurityAnalysisReturn {
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [scanner, setScanner] = useState<SecurityScanner | null>(null);
  
  const scannerRef = useRef<SecurityScanner | null>(null);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize scanner when editor is available
  useEffect(() => {
    if (!editor || !userId) {
      return;
    }

    try {
      const newScanner = new SecurityScanner(editor, userId, {
        enableRealtime: options.enableRealtime ?? true,
        enableAIAnalysis: options.enableAIAnalysis ?? true,
        enablePatternMatching: options.enablePatternMatching ?? true,
        debounceMs: options.debounceMs ?? 2000,
        severityThreshold: options.severityThreshold ?? 'low',
        maxCodeLength: options.maxCodeLength ?? 10000,
        enableAutoFix: options.enableAutoFix ?? true,
        enableVisualIndicators: true,
        enableHoverTooltips: true
      });

      // Add listener for scan results
      const handleScanResult = (result: SecurityScanResult | null) => {
        setScanResult(result);
        setIsScanning(false);
        setLastError(null);
      };

      newScanner.addListener(handleScanResult);

      // Listen for scanning state changes
      const originalPerformAnalysis = newScanner.performAnalysis.bind(newScanner);
      newScanner.performAnalysis = async () => {
        setIsScanning(true);
        setLastError(null);
        try {
          return await originalPerformAnalysis();
        } catch (error) {
          setLastError(error instanceof Error ? error : new Error('Analysis failed'));
          setIsScanning(false);
          throw error;
        }
      };

      setScanner(newScanner);
      scannerRef.current = newScanner;

      return () => {
        newScanner.removeListener(handleScanResult);
        newScanner.dispose();
        scannerRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize security scanner:', error);
      setLastError(error instanceof Error ? error : new Error('Scanner initialization failed'));
    }
  }, [editor, userId]);

  // Perform manual analysis
  const performAnalysis = useCallback(async () => {
    if (!scannerRef.current) {
      throw new Error('Scanner not initialized');
    }

    try {
      setIsScanning(true);
      setLastError(null);
      await scannerRef.current.performAnalysis();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Analysis failed');
      setLastError(errorObj);
      setIsScanning(false);
      throw errorObj;
    }
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setScanResult(null);
    setLastError(null);
    setIsScanning(false);
  }, []);

  // Update scanner configuration
  const updateConfig = useCallback((newConfig: Partial<UseSecurityAnalysisOptions>) => {
    if (scannerRef.current) {
      scannerRef.current.updateConfig({
        enableRealtime: newConfig.enableRealtime,
        enableAIAnalysis: newConfig.enableAIAnalysis,
        enablePatternMatching: newConfig.enablePatternMatching,
        debounceMs: newConfig.debounceMs,
        severityThreshold: newConfig.severityThreshold,
        maxCodeLength: newConfig.maxCodeLength,
        enableAutoFix: newConfig.enableAutoFix
      });
    }
    optionsRef.current = { ...optionsRef.current, ...newConfig };
  }, []);

  // Auto-fix an issue
  const autoFixIssue = useCallback(async (issue: SecurityIssue): Promise<boolean> => {
    if (!editor || !issue.autoFixAvailable) {
      return false;
    }

    try {
      const model = editor.getModel();
      if (!model) return false;

      // Generate auto-fix based on issue type
      const fix = generateAutoFix(issue);
      if (!fix) return false;

      // Apply the fix
      const range = new monaco.Range(
        issue.line,
        issue.column,
        issue.endLine,
        issue.endColumn
      );

      editor.executeEdits('security-autofix', [{
        range,
        text: fix,
        forceMoveMarkers: true
      }]);

      // Trigger re-analysis after a short delay
      setTimeout(() => {
        performAnalysis().catch(console.error);
      }, 500);

      return true;
    } catch (error) {
      console.error('Auto-fix failed:', error);
      return false;
    }
  }, [editor, performAnalysis]);

  // Jump to issue location in editor
  const jumpToIssue = useCallback((issue: SecurityIssue) => {
    if (!editor) return;

    const range = new monaco.Range(
      issue.line,
      issue.column,
      issue.endLine,
      issue.endColumn
    );

    editor.setSelection(range);
    editor.revealRangeInCenter(range);
    editor.focus();
  }, [editor]);

  return {
    scanResult,
    isScanning,
    lastError,
    scanner,
    performAnalysis,
    clearResults,
    updateConfig,
    autoFixIssue,
    jumpToIssue
  };
}

// Helper function to generate auto-fixes
function generateAutoFix(issue: SecurityIssue): string | null {
  switch (issue.type) {
    case 'vulnerability':
      if (issue.title.includes('tx.origin')) {
        return 'msg.sender';
      }
      break;
      
    case 'gas-optimization':
      if (issue.title.includes('Function Visibility')) {
        return issue.suggestion.includes('external') ? 'external' : 'public';
      }
      break;
      
    case 'best-practice':
      if (issue.title.includes('Error Message')) {
        // Extract the condition from require statement
        const match = issue.message.match(/require\s*\(\s*([^)]+)\s*\)/);
        if (match) {
          return `require(${match[1]}, "Condition failed")`;
        }
      }
      break;
  }

  return null;
}

// Custom hook for security metrics
export function useSecurityMetrics(scanResult: SecurityScanResult | null) {
  const metrics = {
    totalIssues: scanResult?.issues.length || 0,
    criticalIssues: scanResult?.issues.filter(i => i.severity === 'critical').length || 0,
    highIssues: scanResult?.issues.filter(i => i.severity === 'high').length || 0,
    mediumIssues: scanResult?.issues.filter(i => i.severity === 'medium').length || 0,
    lowIssues: scanResult?.issues.filter(i => i.severity === 'low').length || 0,
    fixableIssues: scanResult?.issues.filter(i => i.autoFixAvailable).length || 0,
    gasOptimizations: scanResult?.issues.filter(i => i.type === 'gas-optimization').length || 0,
    securityScore: scanResult?.overallScore || 0,
    analysisTime: scanResult?.scanTime || 0,
    aiAnalysisUsed: scanResult?.aiAnalysisUsed || false,
    cacheHit: scanResult?.cacheHit || false
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  return {
    ...metrics,
    getScoreColor,
    getScoreLabel
  };
}
