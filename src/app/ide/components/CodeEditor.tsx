"use client";

import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

interface CodeEditorProps {
  value?: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  theme?: "vs-dark" | "light";
}

export function CodeEditor({
  value = '// Welcome to ZacAi IDE\n// Start coding...\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();',
  language = "typescript",
  onChange,
  theme = "vs-dark",
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure Monaco settings
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      automaticLayout: true,
    });

    // Phase 2: Add custom IntelliSense, snippets, themes
  };

  return (
    <div className="h-full w-full bg-background">
      <div className="h-full border rounded-md overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue={value}
          theme={theme}
          onMount={handleEditorDidMount}
          onChange={onChange}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: "line",
            automaticLayout: true,
          }}
        />
      </div>

      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Phase 2: Multi-tab, IntelliSense, custom themes
      </div>
    </div>
  );
}
