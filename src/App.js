import React, { useRef, useEffect, useState, useCallback } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

function App() {
  const editorRef = useRef(null);
  const monaco = useMonaco();
  const [code, setCode] = useState("");
  const [isEditorReady, setEditorReady] = useState(false);

  // Setup theme and Dart language
  useEffect(() => {
    if (!monaco) return;

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

    if (!monaco.languages.getLanguages().some((lang) => lang.id === "dart")) {
      monaco.languages.register({ id: "dart" });
    }

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
  }, [monaco]);

  useEffect(() => {
    document.body.style.backgroundColor = "#1e1e1e";
  }, []);

  // Message listener for updates
  useEffect(() => {
    const handleMessage = (event) => {
      if (typeof event.data === "string") {
        if (editorRef.current) {
          editorRef.current.setValue(event.data);
          setCode(event.data);
        } else {
          // In case editor isn't ready yet
          setCode(event.data);
        }
        setEditorReady(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor;
    if (code) editor.setValue(code);
    setEditorReady(true);
  }, [code]);

  const handleEditorChange = useCallback((value) => {
    setCode(value);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%", backgroundColor: "#1e1e1e" }}>
      {!isEditorReady ? (
        <div style={{ color: "white", textAlign: "center", paddingTop: "40vh", fontSize: "20px" }}>
          Loading Editor...
        </div>
      ) : (
        <Editor
          height="100%"
          language="dart"
          theme="custom-dark"
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          value={code}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      )}
    </div>
  );
}

export default App;