"use client";

import React, { useState } from 'react';
import { Settings, Download, Upload, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIDESettings } from '@/lib/ide/ideSettings';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface IDESettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IDESettingsPanel({ open, onOpenChange }: IDESettingsPanelProps) {
  const { settings, updateEditorSettings, updateThemeSettings, updateTerminalSettings, 
          updateAISettings, updateFileSettings, updateGitSettings, updatePreviewSettings,
          resetSettings, exportSettings, importSettings } = useIDESettings();
  const { toast } = useToast();
  const [importValue, setImportValue] = useState('');

  const handleExport = () => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zacai-ide-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Settings Exported',
      description: 'Your IDE settings have been downloaded',
    });
  };

  const handleImport = () => {
    if (!importValue.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste settings JSON first',
        variant: 'destructive',
      });
      return;
    }

    const success = importSettings(importValue);
    if (success) {
      toast({
        title: 'Settings Imported',
        description: 'Your IDE settings have been updated',
      });
      setImportValue('');
    } else {
      toast({
        title: 'Import Failed',
        description: 'Invalid settings JSON',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    resetSettings();
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to defaults',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            IDE Settings
          </DialogTitle>
          <DialogDescription>
            Configure your ZacAi IDE preferences and workspace settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="terminal">Terminal</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  value={settings.editor.fontSize}
                  onChange={(e) => updateEditorSettings({ fontSize: parseInt(e.target.value) })}
                  min={8}
                  max={32}
                />
              </div>

              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Input
                  id="fontFamily"
                  value={settings.editor.fontFamily}
                  onChange={(e) => updateEditorSettings({ fontFamily: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="tabSize">Tab Size</Label>
                <Input
                  id="tabSize"
                  type="number"
                  value={settings.editor.tabSize}
                  onChange={(e) => updateEditorSettings({ tabSize: parseInt(e.target.value) })}
                  min={1}
                  max={8}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="insertSpaces">Insert Spaces</Label>
                <Switch
                  id="insertSpaces"
                  checked={settings.editor.insertSpaces}
                  onCheckedChange={(checked) => updateEditorSettings({ insertSpaces: checked })}
                />
              </div>

              <div>
                <Label htmlFor="wordWrap">Word Wrap</Label>
                <Select
                  value={settings.editor.wordWrap}
                  onValueChange={(value) => updateEditorSettings({ wordWrap: value as 'off' | 'on' | 'bounded' })}
                >
                  <SelectTrigger id="wordWrap">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="on">On</SelectItem>
                    <SelectItem value="bounded">Bounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="minimap">Show Minimap</Label>
                <Switch
                  id="minimap"
                  checked={settings.editor.minimap}
                  onCheckedChange={(checked) => updateEditorSettings({ minimap: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="formatOnSave">Format On Save</Label>
                <Switch
                  id="formatOnSave"
                  checked={settings.editor.formatOnSave}
                  onCheckedChange={(checked) => updateEditorSettings({ formatOnSave: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <div>
              <Label htmlFor="editorTheme">Editor Theme</Label>
              <Select
                value={settings.theme.editorTheme}
                onValueChange={(value) => updateThemeSettings({ editorTheme: value as 'vs-dark' | 'vs-light' | 'hc-black' })}
              >
                <SelectTrigger id="editorTheme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vs-dark">Dark (Default)</SelectItem>
                  <SelectItem value="vs-light">Light</SelectItem>
                  <SelectItem value="hc-black">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="uiTheme">UI Theme</Label>
              <Select
                value={settings.theme.uiTheme}
                onValueChange={(value) => updateThemeSettings({ uiTheme: value as 'dark' | 'light' | 'system' })}
              >
                <SelectTrigger id="uiTheme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="terminal" className="space-y-4">
            <div>
              <Label htmlFor="terminalFontSize">Font Size</Label>
              <Input
                id="terminalFontSize"
                type="number"
                value={settings.terminal.fontSize}
                onChange={(e) => updateTerminalSettings({ fontSize: parseInt(e.target.value) })}
                min={8}
                max={32}
              />
            </div>

            <div>
              <Label htmlFor="terminalScrollback">Scrollback Lines</Label>
              <Input
                id="terminalScrollback"
                type="number"
                value={settings.terminal.scrollback}
                onChange={(e) => updateTerminalSettings({ scrollback: parseInt(e.target.value) })}
                min={100}
                max={10000}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="cursorBlink">Cursor Blink</Label>
              <Switch
                id="cursorBlink"
                checked={settings.terminal.cursorBlink}
                onCheckedChange={(checked) => updateTerminalSettings({ cursorBlink: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="aiEnabled">Enable AI Assistant</Label>
              <Switch
                id="aiEnabled"
                checked={settings.ai.enabled}
                onCheckedChange={(checked) => updateAISettings({ enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoSuggest">Auto Suggestions</Label>
              <Switch
                id="autoSuggest"
                checked={settings.ai.autoSuggest}
                onCheckedChange={(checked) => updateAISettings({ autoSuggest: checked })}
                disabled={!settings.ai.enabled}
              />
            </div>

            <div>
              <Label htmlFor="contextLines">Context Lines</Label>
              <Input
                id="contextLines"
                type="number"
                value={settings.ai.contextLines}
                onChange={(e) => updateAISettings({ contextLines: parseInt(e.target.value) })}
                min={10}
                max={200}
                disabled={!settings.ai.enabled}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of lines to include as context for AI suggestions
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showInlineHints">Show Inline Hints</Label>
              <Switch
                id="showInlineHints"
                checked={settings.ai.showInlineHints}
                onCheckedChange={(checked) => updateAISettings({ showInlineHints: checked })}
                disabled={!settings.ai.enabled}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="autoSave">Auto Save</Label>
              <Select
                value={settings.files.autoSave}
                onValueChange={(value) => updateFileSettings({ autoSave: value as 'off' | 'afterDelay' | 'onFocusChange' })}
              >
                <SelectTrigger id="autoSave">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="afterDelay">After Delay</SelectItem>
                  <SelectItem value="onFocusChange">On Focus Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoRefresh">Auto Refresh Preview</Label>
              <Switch
                id="autoRefresh"
                checked={settings.preview.autoRefresh}
                onCheckedChange={(checked) => updatePreviewSettings({ autoRefresh: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gitEnabled">Enable Git Integration</Label>
              <Switch
                id="gitEnabled"
                checked={settings.git.enabled}
                onCheckedChange={(checked) => updateGitSettings({ enabled: checked })}
              />
            </div>

            <div className="pt-4 space-y-2">
              <Label>Import/Export Settings</Label>
              <div className="flex gap-2">
                <Button onClick={handleExport} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
              <div className="space-y-2">
                <textarea
                  className="w-full h-24 px-3 py-2 text-sm rounded-md border bg-background"
                  placeholder="Paste settings JSON here to import..."
                  value={importValue}
                  onChange={(e) => setImportValue(e.target.value)}
                />
                <Button onClick={handleImport} variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
