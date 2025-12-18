import * as monaco from "monaco-editor";

// Enhanced Monaco editor configuration with advanced features
export const monacoConfig = {
  // Editor options
  options: {
    fontSize: 14,
    fontFamily:
      "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
    fontLigatures: true,
    lineNumbers: "on" as const,
    rulers: [80, 120],
    renderWhitespace: "selection" as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: "off" as const,
    minimap: { enabled: true, autohide: false },
    bracketPairColorization: { enabled: true },
    cursorBlinking: "smooth" as const,
    cursorSmoothCaretAnimation: "on" as const,
    smoothScrolling: true,
    folding: true,
    foldingStrategy: "indentation" as const,
    showFoldingControls: "mouseover" as const,
    matchBrackets: "always" as const,
    autoClosingBrackets: "always" as const,
    autoClosingQuotes: "always" as const,
    autoSurround: "languageDefined" as const,
    formatOnPaste: true,
    formatOnType: true,
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showClasses: true,
      showFunctions: true,
      showVariables: true,
      showModules: true,
      showProperties: true,
      showMethods: true,
      showConstructors: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showInterfaces: true,
      showStructs: true,
      showTypeParameters: true,
      showFields: true,
      showReferences: true,
      showFolders: true,
      showColors: true,
      showFiles: true,
      showIcons: true,
      snippetsPreventQuickSuggestions: false,
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true,
    },
    parameterHints: { enabled: true },
    acceptSuggestionOnEnter: "on" as const,
    tabCompletion: "on" as const,
    wordBasedSuggestions: "matchingDocuments",
    // Find options
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: "never" as const,
      seedSearchStringFromSelection: "always" as const,
    },
    // Multi-cursor options
    multiCursorModifier: "alt" as const,
    multiCursorMergeOverlapping: true,
    // Scrollbar options
    scrollbar: {
      vertical: "auto" as const,
      horizontal: "auto" as const,
      useShadows: true,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
  },

  // Custom ZacAi Dark Theme
  theme: {
    base: "vs-dark" as const,
    inherit: true,
    rules: [
      { token: "comment", foreground: "6A9955", fontStyle: "italic" },
      { token: "keyword", foreground: "C586C0" },
      { token: "string", foreground: "CE9178" },
      { token: "number", foreground: "B5CEA8" },
      { token: "regexp", foreground: "D16969" },
      { token: "type", foreground: "4EC9B0" },
      { token: "class", foreground: "4EC9B0" },
      { token: "function", foreground: "DCDCAA" },
      { token: "variable", foreground: "9CDCFE" },
      { token: "constant", foreground: "4FC1FF" },
      { token: "operator", foreground: "D4D4D4" },
    ],
    colors: {
      "editor.background": "#1e1e1e",
      "editor.foreground": "#d4d4d4",
      "editorLineNumber.foreground": "#858585",
      "editorLineNumber.activeForeground": "#c6c6c6",
      "editorCursor.foreground": "#aeafad",
      "editor.selectionBackground": "#264f78",
      "editor.inactiveSelectionBackground": "#3a3d41",
      "editorIndentGuide.background": "#404040",
      "editorIndentGuide.activeBackground": "#707070",
      "editor.lineHighlightBackground": "#282828",
      "editorBracketMatch.background": "#0064001a",
      "editorBracketMatch.border": "#888888",
    },
  },

  // TypeScript/JavaScript IntelliSense configuration
  typescript: {
    compilerOptions: {
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      lib: ["ESNext", "DOM", "DOM.Iterable"],
      jsx: monaco.languages.typescript.JsxEmit.React,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      allowSyntheticDefaultImports: true,
    },
    diagnosticOptions: {
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    },
  },
};

// Custom snippets for common patterns
export const customSnippets = (monaco: typeof import('monaco-editor')) => ({
  typescript: [
    {
      label: "rfc",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: [
        'import React from "react";',
        "",
        "interface ${1:ComponentName}Props {",
        "  $2",
        "}",
        "",
        "export function ${1:ComponentName}({ $3 }: ${1:ComponentName}Props) {",
        "  return (",
        "    <div>",
        "      $0",
        "    </div>",
        "  );",
        "}",
      ].join("\n"),
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: "React Function Component",
      range: undefined,
    },
    {
      label: "useState",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText:
        "const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState$2($3);$0",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: "React useState hook",
      range: undefined,
    },
    {
      label: "useEffect",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: [
        "useEffect(() => {",
        "  $1",
        "  ",
        "  return () => {",
        "    $2",
        "  };",
        "}, [$3]);$0",
      ].join("\n"),
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: "React useEffect hook",
      range: undefined,
    },
    {
      label: "async",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: [
        "async function ${1:functionName}($2) {",
        "  try {",
        "    $3",
        "  } catch (error) {",
        "    console.error(error);",
        "  }",
        "}$0",
      ].join("\n"),
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: "Async function with try-catch",
      range: undefined,
    },
  ],
  javascript: [
    {
      label: "cl",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "console.log($1);$0",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: "Console log",
      range: undefined,
    },
    {
      label: "arrow",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "const ${1:functionName} = ($2) => {$3};$0",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: "Arrow function",
      range: undefined,
    },
  ],
});

// Register custom commands
export function registerCustomCommands(
  editor: monaco.editor.IStandaloneCodeEditor,
) {
  // Format document
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
    () => {
      editor.getAction("editor.action.formatDocument")?.run();
    },
  );

  // Duplicate line
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD,
    () => {
      editor.getAction("editor.action.copyLinesDownAction")?.run();
    },
  );

  // Delete line
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK,
    () => {
      editor.getAction("editor.action.deleteLines")?.run();
    },
  );

  // Toggle comment
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
    editor.getAction("editor.action.commentLine")?.run();
  });

  // Go to definition
  editor.addCommand(monaco.KeyCode.F12, () => {
    editor.getAction("editor.action.revealDefinition")?.run();
  });

  // Find all references
  editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.F12, () => {
    editor.getAction("editor.action.goToReferences")?.run();
  });

  // Rename symbol
  editor.addCommand(monaco.KeyCode.F2, () => {
    editor.getAction("editor.action.rename")?.run();
  });
}

// Configure language features
export function configureLanguageFeatures(monaco: typeof import('monaco-editor')) {
  // Register TypeScript/JavaScript snippets
  monaco.languages.registerCompletionItemProvider("typescript", {
    provideCompletionItems: (
      model: monaco.editor.IReadOnlyModel,
      position: monaco.Position,
    ) => {
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: model.getWordUntilPosition(position).startColumn,
        endColumn: model.getWordUntilPosition(position).endColumn,
      };
      const snippets = customSnippets(monaco).typescript.map((s) => ({
        ...s,
        range,
      }));
      return { suggestions: snippets };
    },
  });

  monaco.languages.registerCompletionItemProvider("javascript", {
    provideCompletionItems: (
      model: monaco.editor.IReadOnlyModel,
      position: monaco.Position,
    ) => {
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: model.getWordUntilPosition(position).startColumn,
        endColumn: model.getWordUntilPosition(position).endColumn,
      };
      const snippets = customSnippets(monaco).javascript.map((s) => ({
        ...s,
        range,
      }));
      return { suggestions: snippets };
    },
  });

  // Configure TypeScript compiler options
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    monacoConfig.typescript.compilerOptions,
  );

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
    monacoConfig.typescript.diagnosticOptions,
  );

  // Configure JavaScript compiler options
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    monacoConfig.typescript.compilerOptions,
  );

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
    monacoConfig.typescript.diagnosticOptions,
  );
}
