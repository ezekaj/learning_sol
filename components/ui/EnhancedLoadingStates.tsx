'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Pause,
  Play,
  X,
  Loader2,
  Search,
  Code,
  Video,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/lib/hooks/useSettings';
import { GlassContainer } from '@/components/ui/Glassmorphism';

// Enhanced Form Loading Overlay
interface FormLoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  progress?: number;
  onCancel?: () => void;
  variant?: 'default' | 'upload' | 'processing' | 'saving';
}

export function FormLoadingOverlay({
  isLoading,
  text,
  progress,
  onCancel,
  variant = 'default'
}: FormLoadingOverlayProps) {
  const { settings } = useSettings();
  const shouldAnimate = !settings?.accessibility?.reduceMotion;

  const getVariantConfig = () => {
    switch (variant) {
      case 'upload':
        return {
          icon: Upload,
          defaultText: 'Uploading...',
          color: 'text-blue-500'
        };
      case 'processing':
        return {
          icon: Code,
          defaultText: 'Processing...',
          color: 'text-purple-500'
        };
      case 'saving':
        return {
          icon: CheckCircle,
          defaultText: 'Saving...',
          color: 'text-green-500'
        };
      default:
        return {
          icon: Loader2,
          defaultText: 'Loading...',
          color: 'text-purple-500'
        };
    }
  };

  const { icon: Icon, defaultText, color } = getVariantConfig();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldAnimate ? 0.2 : 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
        >
          <GlassContainer intensity="medium" className="p-6 max-w-sm mx-4">
            <div className="text-center space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <Icon 
                    className={cn(
                      'w-8 h-8',
                      color,
                      shouldAnimate && variant !== 'saving' && 'animate-spin'
                    )}
                  />
                  
                  {progress !== undefined && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-xs font-medium text-white">
                        {Math.round(progress)}%
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-white font-medium">
                  {text || defaultText}
                </div>
                
                {progress !== undefined && (
                  <div className="w-48 bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={cn(
                        "h-2 rounded-full",
                        color.replace('text-', 'bg-')
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: shouldAnimate ? 0.3 : 0 }}
                    />
                  </div>
                )}
              </div>
              
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-sm text-gray-400 hover:text-white transition-colors underline"
                  aria-label="Cancel operation"
                >
                  Cancel
                </button>
              )}
            </div>
          </GlassContainer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// File Upload Progress with Enhanced Features
interface FileUploadProgressProps {
  files: Array<{
    id: string;
    name: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error' | 'paused';
    error?: string;
    size?: number;
    uploadedSize?: number;
    speed?: number; // bytes per second
  }>;
  onCancel?: (fileId: string) => void;
  onPause?: (fileId: string) => void;
  onResume?: (fileId: string) => void;
  onRetry?: (fileId: string) => void;
  onClearCompleted?: () => void;
}

export function FileUploadProgress({
  files,
  onCancel,
  onPause,
  onResume,
  onRetry,
  onClearCompleted
}: FileUploadProgressProps) {
  const { settings } = useSettings();
  const shouldAnimate = !settings?.accessibility?.reduceMotion;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatFileSize(bytesPerSecond) + '/s';
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const activeFiles = files.filter(f => f.status !== 'completed');

  if (files.length === 0) return null;

  return (
    <GlassContainer intensity="medium" className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>File Uploads</span>
        </h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            {completedFiles.length} of {files.length} completed
          </div>
          {completedFiles.length > 0 && onClearCompleted && (
            <button
              onClick={onClearCompleted}
              className="text-xs text-gray-400 hover:text-white transition-colors underline"
            >
              Clear completed
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: shouldAnimate ? 0.2 : 0 }}
            className="bg-white/5 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {file.status === 'uploading' && <Upload className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                {file.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                {file.status === 'error' && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                {file.status === 'paused' && <Pause className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{file.name}</div>
                  {file.size && (
                    <div className="text-xs text-gray-400">
                      {file.uploadedSize && file.status === 'uploading' 
                        ? `${formatFileSize(file.uploadedSize)} / ${formatFileSize(file.size)}`
                        : formatFileSize(file.size)
                      }
                      {file.speed && file.status === 'uploading' && (
                        <span className="ml-2">• {formatSpeed(file.speed)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {file.status === 'uploading' && onPause && (
                  <button
                    onClick={() => onPause(file.id)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    aria-label="Pause upload"
                  >
                    <Pause className="w-3 h-3" />
                  </button>
                )}
                
                {file.status === 'paused' && onResume && (
                  <button
                    onClick={() => onResume(file.id)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    aria-label="Resume upload"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}
                
                {file.status === 'error' && onRetry && (
                  <button
                    onClick={() => onRetry(file.id)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    aria-label="Retry upload"
                  >
                    <AlertCircle className="w-3 h-3" />
                  </button>
                )}
                
                {onCancel && file.status !== 'completed' && (
                  <button
                    onClick={() => onCancel(file.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="Cancel upload"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            
            {file.status !== 'completed' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    {file.status === 'error' ? 'Failed' : `${Math.round(file.progress)}%`}
                  </span>
                  {file.status === 'uploading' && (
                    <span className="text-gray-400">Uploading...</span>
                  )}
                  {file.status === 'paused' && (
                    <span className="text-yellow-400">Paused</span>
                  )}
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <motion.div
                    className={cn(
                      "h-1.5 rounded-full",
                      file.status === 'error' ? 'bg-red-500' :
                      file.status === 'paused' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${file.progress}%` }}
                    transition={{ duration: shouldAnimate ? 0.3 : 0 }}
                  />
                </div>
                
                {file.error && (
                  <div className="text-xs text-red-400 mt-1">{file.error}</div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </GlassContainer>
  );
}

// Enhanced Search Loading State
interface SearchLoadingProps {
  isSearching: boolean;
  query: string;
  resultsCount?: number;
  searchTime?: number;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export function SearchLoading({
  isSearching,
  query,
  resultsCount,
  searchTime,
  suggestions = [],
  onSuggestionClick
}: SearchLoadingProps) {
  const { settings } = useSettings();
  const shouldAnimate = !settings?.accessibility?.reduceMotion;

  return (
    <AnimatePresence>
      {isSearching && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: shouldAnimate ? 0.2 : 0 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center space-x-3">
            <Search className={cn(
              "w-4 h-4 text-purple-500",
              shouldAnimate && "animate-pulse"
            )} />
            <div className="flex-1">
              <div className="text-white text-sm">
                Searching for "{query}"...
              </div>
              {resultsCount !== undefined && (
                <div className="text-gray-400 text-xs">
                  {resultsCount} results found
                  {searchTime && ` in ${searchTime}ms`}
                </div>
              )}
            </div>
          </div>
          
          {suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-xs text-gray-400 mb-2">Suggestions:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick?.(suggestion)}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
