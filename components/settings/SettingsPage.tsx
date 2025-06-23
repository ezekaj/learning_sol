'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Palette,
  Monitor,
  Moon,
  Sun,
  Save,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GlassCard } from '@/components/ui/Glassmorphism';
// import { useForm, submitForm } from '@/lib/forms/form-handler';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    achievements: boolean;
    courseUpdates: boolean;
    collaborationInvites: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showProgress: boolean;
    showAchievements: boolean;
    allowCollaboration: boolean;
  };
  accessibility: {
    fontSize: number;
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
  learning: {
    autoSave: boolean;
    codeCompletion: boolean;
    syntaxHighlighting: boolean;
    lineNumbers: boolean;
    minimap: boolean;
  };
}

const settingsSections = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'accessibility', label: 'Accessibility', icon: Monitor },
  { id: 'learning', label: 'Learning', icon: User },
];

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('appearance');
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      achievements: true,
      courseUpdates: true,
      collaborationInvites: true,
      weeklyDigest: false,
    },
    privacy: {
      profileVisibility: 'public',
      showProgress: true,
      showAchievements: true,
      allowCollaboration: true,
    },
    accessibility: {
      fontSize: 16,
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
    },
    learning: {
      autoSave: true,
      codeCompletion: true,
      syntaxHighlighting: true,
      lineNumbers: true,
      minimap: false,
    },
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    // Simulate loading settings from API
    // In production, this would fetch from your backend
  };

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as Record<string, any> || {}),
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateTopLevelSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    // Simulate API call to save settings
    console.log('Saving settings:', settings);
    setHasChanges(false);
    
    // Apply theme changes immediately
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  };

  const resetSettings = () => {
    setSettings({
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        achievements: true,
        courseUpdates: true,
        collaborationInvites: true,
        weeklyDigest: false,
      },
      privacy: {
        profileVisibility: 'public',
        showProgress: true,
        showAchievements: true,
        allowCollaboration: true,
      },
      accessibility: {
        fontSize: 16,
        highContrast: false,
        reduceMotion: false,
        screenReader: false,
      },
      learning: {
        autoSave: true,
        codeCompletion: true,
        syntaxHighlighting: true,
        lineNumbers: true,
        minimap: false,
      },
    });
    setHasChanges(true);
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-white">Theme</Label>
        <p className="text-sm text-gray-400 mb-3">Choose your preferred color scheme</p>
        <Select value={settings.theme} onValueChange={(value) => updateTopLevelSetting('theme', value)}>
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </div>
            </SelectItem>
            <SelectItem value="dark">
              <div className="flex items-center space-x-2">
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </div>
            </SelectItem>
            <SelectItem value="system">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4" />
                <span>System</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base font-medium text-white">Language</Label>
        <p className="text-sm text-gray-400 mb-3">Select your preferred language</p>
        <Select value={settings.language} onValueChange={(value) => updateTopLevelSetting('language', value)}>
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Email Notifications</Label>
            <p className="text-sm text-gray-400">Receive notifications via email</p>
          </div>
          <Switch
            checked={settings.notifications.email}
            onCheckedChange={(checked: boolean) => updateSetting('notifications', 'email', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Push Notifications</Label>
            <p className="text-sm text-gray-400">Receive browser push notifications</p>
          </div>
          <Switch
            checked={settings.notifications.push}
            onCheckedChange={(checked: boolean) => updateSetting('notifications', 'push', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Achievement Notifications</Label>
            <p className="text-sm text-gray-400">Get notified when you unlock achievements</p>
          </div>
          <Switch
            checked={settings.notifications.achievements}
            onCheckedChange={(checked) => updateSetting('notifications', 'achievements', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Course Updates</Label>
            <p className="text-sm text-gray-400">Notifications about new courses and content</p>
          </div>
          <Switch
            checked={settings.notifications.courseUpdates}
            onCheckedChange={(checked) => updateSetting('notifications', 'courseUpdates', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Collaboration Invites</Label>
            <p className="text-sm text-gray-400">Notifications for collaboration requests</p>
          </div>
          <Switch
            checked={settings.notifications.collaborationInvites}
            onCheckedChange={(checked) => updateSetting('notifications', 'collaborationInvites', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Weekly Digest</Label>
            <p className="text-sm text-gray-400">Weekly summary of your progress</p>
          </div>
          <Switch
            checked={settings.notifications.weeklyDigest}
            onCheckedChange={(checked) => updateSetting('notifications', 'weeklyDigest', checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-white">Profile Visibility</Label>
        <p className="text-sm text-gray-400 mb-3">Control who can see your profile</p>
        <Select 
          value={settings.privacy.profileVisibility} 
          onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
        >
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="friends">Friends Only</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Show Progress</Label>
            <p className="text-sm text-gray-400">Display your learning progress publicly</p>
          </div>
          <Switch
            checked={settings.privacy.showProgress}
            onCheckedChange={(checked) => updateSetting('privacy', 'showProgress', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Show Achievements</Label>
            <p className="text-sm text-gray-400">Display your achievements on your profile</p>
          </div>
          <Switch
            checked={settings.privacy.showAchievements}
            onCheckedChange={(checked) => updateSetting('privacy', 'showAchievements', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Allow Collaboration</Label>
            <p className="text-sm text-gray-400">Let others invite you to collaborate</p>
          </div>
          <Switch
            checked={settings.privacy.allowCollaboration}
            onCheckedChange={(checked) => updateSetting('privacy', 'allowCollaboration', checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-white">Font Size</Label>
        <p className="text-sm text-gray-400 mb-3">Adjust text size for better readability</p>
        <div className="space-y-2">
          <Slider
            value={[settings.accessibility.fontSize]}
            onValueChange={(value) => updateSetting('accessibility', 'fontSize', value[0])}
            min={12}
            max={24}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>12px</span>
            <span>Current: {settings.accessibility.fontSize}px</span>
            <span>24px</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">High Contrast</Label>
            <p className="text-sm text-gray-400">Increase contrast for better visibility</p>
          </div>
          <Switch
            checked={settings.accessibility.highContrast}
            onCheckedChange={(checked) => updateSetting('accessibility', 'highContrast', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Reduce Motion</Label>
            <p className="text-sm text-gray-400">Minimize animations and transitions</p>
          </div>
          <Switch
            checked={settings.accessibility.reduceMotion}
            onCheckedChange={(checked) => updateSetting('accessibility', 'reduceMotion', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Screen Reader Support</Label>
            <p className="text-sm text-gray-400">Enhanced support for screen readers</p>
          </div>
          <Switch
            checked={settings.accessibility.screenReader}
            onCheckedChange={(checked) => updateSetting('accessibility', 'screenReader', checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderLearningSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Auto Save</Label>
            <p className="text-sm text-gray-400">Automatically save your code changes</p>
          </div>
          <Switch
            checked={settings.learning.autoSave}
            onCheckedChange={(checked) => updateSetting('learning', 'autoSave', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Code Completion</Label>
            <p className="text-sm text-gray-400">Enable intelligent code suggestions</p>
          </div>
          <Switch
            checked={settings.learning.codeCompletion}
            onCheckedChange={(checked) => updateSetting('learning', 'codeCompletion', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Syntax Highlighting</Label>
            <p className="text-sm text-gray-400">Highlight code syntax for better readability</p>
          </div>
          <Switch
            checked={settings.learning.syntaxHighlighting}
            onCheckedChange={(checked) => updateSetting('learning', 'syntaxHighlighting', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Line Numbers</Label>
            <p className="text-sm text-gray-400">Show line numbers in code editor</p>
          </div>
          <Switch
            checked={settings.learning.lineNumbers}
            onCheckedChange={(checked) => updateSetting('learning', 'lineNumbers', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium text-white">Minimap</Label>
            <p className="text-sm text-gray-400">Show code minimap for navigation</p>
          </div>
          <Switch
            checked={settings.learning.minimap}
            onCheckedChange={(checked) => updateSetting('learning', 'minimap', checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'appearance': return renderAppearanceSettings();
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'accessibility': return renderAccessibilitySettings();
      case 'learning': return renderLearningSettings();
      default: return renderAppearanceSettings();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">Settings</h1>
        <p className="text-xl text-gray-300">
          Customize your learning experience and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <GlassCard className="p-4">
            <nav className="space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </GlassCard>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {settingsSections.find(s => s.id === activeSection)?.label}
              </h2>
              {hasChanges && (
                <div className="flex space-x-2">
                  <Button onClick={resetSettings} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={saveSettings} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <Separator className="mb-6" />

            {renderSettingsContent()}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
