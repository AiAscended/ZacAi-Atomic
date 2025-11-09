import type * as Monaco from 'monaco-editor';

export interface MonacoAdvancedConfig {
  enableMultiCursor: boolean;
  enableFindReplace: boolean;
  enableCodeFolding: boolean;
  enableGoToDefinition: boolean;
  enableRefactoring: boolean;
  customTheme?: string;
}

export class MonacoAdvancedFeatures {
  private monaco: typeof Monaco | null = null;
  private editor: Monaco.editor.IStandaloneCodeEditor | null = null;

  constructor(monaco: typeof Monaco, editor: Monaco.editor.IStandaloneCodeEditor) {
    this.monaco = monaco;
    this.editor = editor;
  }

  // Multi-cursor editing
  enableMultiCursor() {
    if (!this.editor || !this.monaco) return;

    // Add keyboard shortcut for multi-cursor
    this.editor.addCommand(
      this.monaco.KeyMod.Alt | this.monaco.KeyCode.DownArrow,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.insertCursorBelow', {});
      }
    );

    this.editor.addCommand(
      this.monaco.KeyMod.Alt | this.monaco.KeyCode.UpArrow,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.insertCursorAbove', {});
      }
    );

    // Add all occurrences
    this.editor.addCommand(
      this.monaco.KeyMod.CtrlCmd | this.monaco.KeyMod.Shift | this.monaco.KeyCode.KeyL,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.selectHighlights', {});
      }
    );
  }

  // Enhanced find and replace
  enableFindReplace() {
    if (!this.editor || !this.monaco) return;

    // Open find
    this.editor.addCommand(
      this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyF,
      () => {
        this.editor?.trigger('keyboard', 'actions.find', {});
      }
    );

    // Open replace
    this.editor.addCommand(
      this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyH,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.startFindReplaceAction', {});
      }
    );

    // Find in selection
    this.editor.addCommand(
      this.monaco.KeyMod.CtrlCmd | this.monaco.KeyMod.Alt | this.monaco.KeyCode.KeyF,
      () => {
        const selection = this.editor?.getSelection();
        if (selection) {
          this.editor?.trigger('keyboard', 'actions.find', {
            searchString: this.editor?.getModel()?.getValueInRange(selection),
          });
        }
      }
    );
  }

  // Code folding
  enableCodeFolding() {
    if (!this.editor) return;

    this.editor.updateOptions({
      folding: true,
      foldingStrategy: 'indentation',
      foldingHighlight: true,
      showFoldingControls: 'always',
    });

    // Add keyboard shortcuts
    if (this.monaco) {
      // Fold
      this.editor.addCommand(
        this.monaco.KeyMod.CtrlCmd | this.monaco.KeyMod.Shift | this.monaco.KeyCode.BracketLeft,
        () => {
          this.editor?.trigger('keyboard', 'editor.fold', {});
        }
      );

      // Unfold
      this.editor.addCommand(
        this.monaco.KeyMod.CtrlCmd | this.monaco.KeyMod.Shift | this.monaco.KeyCode.BracketRight,
        () => {
          this.editor?.trigger('keyboard', 'editor.unfold', {});
        }
      );

      // Fold all
      this.editor.addCommand(
        this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyK,
        () => {
          this.editor?.trigger('keyboard', 'editor.foldAll', {});
        }
      );

      // Unfold all
      this.editor.addCommand(
        this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyJ,
        () => {
          this.editor?.trigger('keyboard', 'editor.unfoldAll', {});
        }
      );
    }
  }

  // Go to definition
  enableGoToDefinition() {
    if (!this.editor || !this.monaco) return;

    // F12 or Cmd+Click for go to definition
    this.editor.addCommand(
      this.monaco.KeyCode.F12,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.revealDefinition', {});
      }
    );

    // Peek definition (Alt+F12)
    this.editor.addCommand(
      this.monaco.KeyMod.Alt | this.monaco.KeyCode.F12,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.peekDefinition', {});
      }
    );

    // Go to references (Shift+F12)
    this.editor.addCommand(
      this.monaco.KeyMod.Shift | this.monaco.KeyCode.F12,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.goToReferences', {});
      }
    );
  }

  // Refactoring tools
  enableRefactoring() {
    if (!this.editor || !this.monaco) return;

    // Rename symbol (F2)
    this.editor.addCommand(
      this.monaco.KeyCode.F2,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.rename', {});
      }
    );

    // Format document
    this.editor.addCommand(
      this.monaco.KeyMod.CtrlCmd | this.monaco.KeyMod.Shift | this.monaco.KeyCode.KeyF,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.formatDocument', {});
      }
    );

    // Format selection
    this.editor.addCommand(
      this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyK,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.formatSelection', {});
      }
    );

    // Organize imports
    this.editor.addCommand(
      this.monaco.KeyMod.CtrlCmd | this.monaco.KeyMod.Shift | this.monaco.KeyCode.KeyO,
      () => {
        this.editor?.trigger('keyboard', 'editor.action.organizeImports', {});
      }
    );
  }

  // Custom IntelliSense configuration
  configureIntelliSense(language: string = 'typescript') {
    if (!this.monaco) return;

    // Enhanced TypeScript/JavaScript IntelliSense
    this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: this.monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: this.monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: this.monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    // Add React types
    this.monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      declare module 'react' {
        export interface FC<P = {}> {
          (props: P): JSX.Element | null;
        }
        export function useState<T>(initialState: T): [T, (newState: T) => void];
        export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
        export function useCallback<T extends (...args: unknown[]) => any>(callback: T, deps: unknown[]): T;
        export function useMemo<T>(factory: () => T, deps: unknown[]): T;
      }
      `,
      'ts:react.d.ts'
    );

    // Configure suggestions
    this.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Enable quick suggestions
    if (this.editor) {
      this.editor.updateOptions({
        quickSuggestions: {
          other: 'on',
          comments: 'off',
          strings: 'on',
        },
        parameterHints: {
          enabled: true,
          cycle: true,
        },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: 'on',
        wordBasedSuggestions: 'matchingDocuments',
      });
    }
  }

  // Custom theme setup
  applyCustomTheme(themeName: string = 'zacai-dark') {
    if (!this.monaco) return;

    this.monaco.editor.defineTheme(themeName, {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'regexp', foreground: 'D16969' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'class', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'constant', foreground: '4FC1FF' },
        { token: 'parameter', foreground: '9CDCFE' },
        { token: 'operator', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2A2A2A',
        'editorCursor.foreground': '#AEAFAD',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editor.selectionHighlightBackground': '#ADD6FF26',
        'editorBracketMatch.background': '#0064001a',
        'editorBracketMatch.border': '#888888',
      },
    });

    this.monaco.editor.setTheme(themeName);
  }

  // Git diff inline
  showInlineDiff(originalCode: string, modifiedCode: string) {
    if (!this.monaco || !this.editor) return;

    const originalModel = this.monaco.editor.createModel(originalCode, 'typescript');
    const modifiedModel = this.editor.getModel();

    if (!modifiedModel) return;

    // Create diff editor (simplified - real implementation needs proper diff editor)
    const diffNavigator = this.monaco.editor.createDiffEditor(
      document.createElement('div')
    );

    diffNavigator.setModel({
      original: originalModel,
      modified: modifiedModel,
    });
  }

  // Bracket pair colorization
  enableBracketColorization() {
    if (!this.editor) return;

    this.editor.updateOptions({
      bracketPairColorization: {
        enabled: true,
        independentColorPoolPerBracketType: true,
      },
      guides: {
        bracketPairs: true,
        bracketPairsHorizontal: 'active',
        highlightActiveBracketPair: true,
        indentation: true,
        highlightActiveIndentation: true,
      },
    });
  }

  // Sticky scroll (show current scope at top)
  enableStickyScroll() {
    if (!this.editor) return;

    this.editor.updateOptions({
      stickyScroll: {
        enabled: true,
        maxLineCount: 5,
      },
    });
  }

  // Inline hints (parameter names, type hints)
  enableInlayHints() {
    if (!this.editor) return;

    this.editor.updateOptions({
      inlayHints: {
        enabled: 'on',
        fontSize: 12,
        fontFamily: 'monospace',
      },
    });
  }

  // Minimap configuration
  configureMinimap(enabled: boolean = true) {
    if (!this.editor) return;

    this.editor.updateOptions({
      minimap: {
        enabled,
        autohide: 'none',
        renderCharacters: true,
        maxColumn: 120,
        showSlider: 'always',
      },
    });
  }

  // Initialize all advanced features
  initializeAll(config: MonacoAdvancedConfig) {
    if (!this.monaco || !this.editor) return;

    // Apply custom theme if specified
    if (config.customTheme) {
      this.applyCustomTheme(config.customTheme);
    }

    this.enableMultiCursor();
    this.enableFindReplace();
    this.enableCodeFolding();
    this.enableGoToDefinition();
    this.enableRefactoring();
    this.configureIntelliSense();
    this.enableBracketColorization();
    this.enableStickyScroll();
    this.enableInlayHints();
    this.configureMinimap(true);
  }
}
