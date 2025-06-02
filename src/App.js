import React, { useRef, useEffect, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

function App() {
  const editorRef = useRef(null);
  const monaco = useMonaco();
  const [code, setCode] = useState(`void main() {\n  print('Hello from Monaco!');\n}`);

  // Theme + Dart setup
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("custom-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "7f848e", fontStyle: "italic" },
          { token: "keyword", foreground: "c586c0" },
          { token: "number", foreground: "b5cea8" },
        ],
        colors: {
          "editor.background": "#1e1e1e",
          "editorLineNumber.foreground": "#858585",
          "editorLineHighlightBackground": "#2b2b2b",
          "editorCursor.foreground": "#ffffff",
          "editor.foreground": "#cccccc",
        },
      });

      monaco.languages.register({ id: "dart" });

      monaco.languages.setMonarchTokensProvider("dart", {
        tokenizer: {
          root: [
            [/[a-z_$][\w$]*/, {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier'
              }
            }],
            [/[A-Z][\w\$]*/, 'type.identifier'],
            { include: '@whitespace' },
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/@symbols/, {
              cases: {
                '@operators': 'operator',
                '@default': ''
              }
            }],
            [/\d+/, 'number'],
            [/[;,.]/, 'delimiter'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }]
          ],
          string: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape.invalid'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
          ],
          whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*\*(?!\/)/, 'comment.doc', '@jsdoc'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment']
          ],
          comment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
          ],
          jsdoc: [
            [/[^\/*]+/, 'comment.doc'],
            [/\*\//, 'comment.doc', '@pop'],
            [/[\/*]/, 'comment.doc']
          ]
        },
        keywords: [
          "abstract", "else", "import", "super", "as", "enum", "in", "switch",
          "assert", "export", "interface", "sync", "async", "extends", "is", "this",
          "await", "extension", "late", "throw", "break", "external", "library", "true",
          "case", "factory", "mixin", "try", "catch", "false", "new", "typedef", "class",
          "final", "null", "var", "const", "finally", "on", "void", "continue", "for",
          "operator", "while", "covariant", "Function", "part", "with", "default", "get",
          "required", "yield", "deferred", "hide", "rethrow", "do", "if", "return",
          "dynamic", "implements", "set"
        ],
        operators: [
          '=', '>', '<', '!', '~', '?', '??', '==', '<=', '>=', '!=', '&&', '||',
          '++', '--', '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '>>>',
          '+=', '-=', '*=', '/=', '&=', '|=', '^=', '%=', '<<=', '>>=', '>>>='
        ],
        symbols: /[=><!~?:&|+\-*\/\^%]+/
      });
    }
  }, [monaco]);

  // Listen for postMessage from Flutter WebView
  useEffect(() => {
    const handleMessage = (event) => {
      if (typeof event.data === "string") {
        setCode(event.data); // Update editor code
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Editor
        height="100%"
        language="dart"
        theme="custom-dark"
        value={code}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}

export default App;
