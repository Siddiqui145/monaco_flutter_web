import React, { useRef, useEffect, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

function App() {
  const editorRef = useRef(null);
  const monaco = useMonaco();
  const [code, setCode] = useState(`void main() {\n  print('Hello from Monaco!');\n}`);
  const [isEditorReady, setEditorReady] = useState(false);

  // Error handlers for debugging
  window.addEventListener("error", (e) => {
    console.error("Global error:", e.message, e.error);
  });
  window.addEventListener("unhandledrejection", (e) => {
    console.error("Unhandled Promise Rejection:", e.reason);
  });

  // Monaco Setup (theme + dart)
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

      if (!monaco.languages.getLanguages().some(lang => lang.id === "dart")) {
        monaco.languages.register({ id: "dart" });
      }

      monaco.languages.setMonarchTokensProvider("dart", {
        tokenizer: { /*...*/ }, // keep as-is
        keywords: [ /*...*/ ],
        operators: [ /*...*/ ],
        symbols: /[=><!~?:&|+\-*\/\^%]+/
      });

      setEditorReady(true);
    }
  }, [monaco]);

  // ✅ Receive dynamic code from Flutter and update editor if ready
  useEffect(() => {
    const handleMessage = (event) => {
      if (typeof event.data === "string") {
        const newCode = event.data;

        // ✅ Update editor directly if it's mounted
        if (editorRef.current && editorRef.current.getValue() !== newCode) {
          editorRef.current.setValue(newCode);
        }

        // Also sync internal state
        setCode(newCode);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // When editor mounts, store the ref and sync any pre-loaded code
  function handleEditorDidMount(editor, monacoInstance) {
    editorRef.current = editor;

    if (code && code !== editor.getValue()) {
      editor.setValue(code);
    }
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {isEditorReady && (
        <Editor
          height="100%"
          language="dart"
          theme="custom-dark"
          value={code}
          onChange={(val) => setCode(val)}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      )}
    </div>
  );
}

export default App;