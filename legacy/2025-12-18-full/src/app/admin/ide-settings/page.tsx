"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Code2, 
  Terminal, 
  Eye, 
  Palette, 
  Shield, 
  Save,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function IDESettingsPage() {
  // Editor settings
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(2);
  const [wordWrap, setWordWrap] = useState(true);
  const [minimap, setMinimap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [formatOnSave, setFormatOnSave] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  // Terminal settings
  const [terminalFontSize, setTerminalFontSize] = useState(14);
  const [terminalScrollback, setTerminalScrollback] = useState(1000);
  const [terminalCursorBlink, setTerminalCursorBlink] = useState(true);

  // Preview settings
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshDelay, setRefreshDelay] = useState(500);

  // Theme settings
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [terminalTheme, setTerminalTheme] = useState('dark');

  // Security settings
  const [codeExecutionTimeout, setCodeExecutionTimeout] = useState(5000);
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [allowWebAssembly, setAllowWebAssembly] = useState(true);

  const handleSaveSettings = () => {
    const settings = {
      editor: {
        fontSize,
        tabSize,
        wordWrap,
        minimap,
        lineNumbers,
        formatOnSave,
        autoSave,
        theme: editorTheme,
      },
      terminal: {
        fontSize: terminalFontSize,
        scrollback: terminalScrollback,
        cursorBlink: terminalCursorBlink,
        theme: terminalTheme,
      },
      preview: {
        autoRefresh,
        refreshDelay,
      },
      security: {
        codeExecutionTimeout,
        maxFileSize,
        allowWebAssembly,
      },
    };

    localStorage.setItem('ide-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all IDE settings to defaults?')) {
      localStorage.removeItem('ide-settings');
      alert('Settings reset to defaults!');
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">IDE Settings</h1>
        <p className="text-muted-foreground">
          Configure your IDE experience, editor preferences, and security settings
        </p>
      </div>

      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="editor">
            <Code2 className="h-4 w-4 mr-2" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="terminal">
            <Terminal className="h-4 w-4 mr-2" />
            Terminal
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Editor Settings */}
        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>Editor Configuration</CardTitle>
              <CardDescription>
                Customize code editor behavior and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Font Size</Label>
                    <p className="text-sm text-muted-foreground">
                      Editor font size in pixels
                    </p>
                  </div>
                  <div className="flex items-center gap-4 w-[300px]">
                    <Slider
                      min={10}
                      max={24}
                      step={1}
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{fontSize}px</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tab Size</Label>
                    <p className="text-sm text-muted-foreground">
                      Number of spaces per tab
                    </p>
                  </div>
                  <Select value={tabSize.toString()} onValueChange={(v) => setTabSize(parseInt(v))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 spaces</SelectItem>
                      <SelectItem value="4">4 spaces</SelectItem>
                      <SelectItem value="8">8 spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Word Wrap</Label>
                  <Switch checked={wordWrap} onCheckedChange={setWordWrap} />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Minimap</Label>
                  <Switch checked={minimap} onCheckedChange={setMinimap} />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Line Numbers</Label>
                  <Switch checked={lineNumbers} onCheckedChange={setLineNumbers} />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Format on Save</Label>
                  <Switch checked={formatOnSave} onCheckedChange={setFormatOnSave} />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Auto Save</Label>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terminal Settings */}
        <TabsContent value="terminal">
          <Card>
            <CardHeader>
              <CardTitle>Terminal Configuration</CardTitle>
              <CardDescription>
                Customize terminal emulator behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Font Size</Label>
                  <div className="flex items-center gap-4 w-[300px]">
                    <Slider
                      min={10}
                      max={20}
                      step={1}
                      value={[terminalFontSize]}
                      onValueChange={(value) => setTerminalFontSize(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{terminalFontSize}px</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Scrollback Lines</Label>
                  <Input
                    type="number"
                    value={terminalScrollback}
                    onChange={(e) => setTerminalScrollback(parseInt(e.target.value))}
                    className="w-[180px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Cursor Blink</Label>
                  <Switch
                    checked={terminalCursorBlink}
                    onCheckedChange={setTerminalCursorBlink}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Settings */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview Configuration</CardTitle>
              <CardDescription>
                Configure code preview and execution behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto Refresh</Label>
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Refresh Delay (ms)</Label>
                  <div className="flex items-center gap-4 w-[300px]">
                    <Slider
                      min={100}
                      max={2000}
                      step={100}
                      value={[refreshDelay]}
                      onValueChange={(value) => setRefreshDelay(value[0])}
                      className="flex-1"
                      disabled={!autoRefresh}
                    />
                    <span className="w-16 text-right">{refreshDelay}ms</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize IDE colors and themes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Editor Theme</Label>
                  <Select value={editorTheme} onValueChange={setEditorTheme}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vs-dark">VS Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="hc-black">High Contrast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Terminal Theme</Label>
                  <Select value={terminalTheme} onValueChange={setTerminalTheme}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Limits</CardTitle>
              <CardDescription>
                Configure code execution security and resource limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Execution Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={codeExecutionTimeout}
                    onChange={(e) => setCodeExecutionTimeout(parseInt(e.target.value))}
                    className="w-[180px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(parseInt(e.target.value))}
                    className="w-[180px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Allow WebAssembly</Label>
                  <Switch
                    checked={allowWebAssembly}
                    onCheckedChange={setAllowWebAssembly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={handleResetSettings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* Status */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-500" />
            IDE Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phase 7 Status:</span>
              <span className="text-green-600 dark:text-green-500 font-semibold">✅ Complete</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin Integration:</span>
              <span className="text-green-600 dark:text-green-500 font-semibold">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
