import React, { useEffect, forwardRef, useState } from "react";
import AceEditor from "react-ace";

// Import Ace Editor themes and modes
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-swift";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-sh";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/mode-kotlin";
import "ace-builds/src-noconflict/mode-r";
import "ace-builds/src-noconflict/mode-lua";
import "ace-builds/src-noconflict/mode-scala";
import "ace-builds/src-noconflict/mode-vbscript";
import "ace-builds/src-noconflict/mode-pascal";
import "ace-builds/src-noconflict/mode-powershell";

const getModeFromFilePath = (filePath: string): string => {
  const extension = filePath.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    case "py":
      return "python";
    case "java":
      return "java";
    case "html":
      return "html";
    case "css":
      return "css";
    case "php":
      return "php";
    case "c":
    case "cpp":
      return "c_cpp";
    case "cs":
      return "csharp";
    case "rb":
      return "ruby";
    case "go":
      return "golang";
    case "swift":
      return "swift";
    case "json":
      return "json";
    case "sql":
      return "sql";
    case "sh":
      return "sh"; 
    case "md":
      return "markdown";
    case "xml":
      return "xml";
    case "yaml":
    case "yml":
      return "yaml";
    case "kt":
      return "kotlin";
    case "r":
      return "r";
    case "lua":
      return "lua";
    case "scala":
      return "scala";
    case "vb":
      return "vbscript";
    case "pas":
      return "pascal";
    case "ps1":
      return "powershell"; 
    default:
      return "text"; 
  }
};

interface TerminalData {
  inputCmd: string;
  output: string;
  status: "error" | "success" | "nlp";
  timestamp: string;
}

interface ChildData {
  id: string;
  type: "ai" | "editor" | "terminal";
  content: TerminalData[];
  splitLevel: number;
  contentType: "terminal" | "ai" | "editor";
  depth: number;
  direction: "horizontal" | "vertical";
  filePath?: string;
}

interface TabData {
  id: string;
  name: string;
  children: ChildData[];
  splitLevel: number;
}
interface CodeBlock {
  language: string;
  code: string;
}

interface ElectronAPI {
  openFile: () => Promise<string[]>;
  readFile: (filePath: string) => Promise<string>;
  saveFile: (filePath: string, content: string) => Promise<void>;
  createFile: (
    fileName: string,
    content: string,
    currentDir: string
  ) => Promise<string>;
  openExternalLink: (url: string) => Promise<string>;
}

interface EditorComponentProps {
  tabId: string;
  editorId: string;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

const EditorComponent = forwardRef<HTMLDivElement, EditorComponentProps>(
  ({ tabId, editorId }, ref) => {
    const [fileContentValue, setFileContentValue] = useState<string>("");
    const [mode, setMode] = useState<string>("text");
    const [filePath, setFilePath] = useState<string>("");

    useEffect(() => {
      const fetchFileContent = async () => {
        // Fetch stored tabs from sessionStorage
        const storedTabs: TabData[] = JSON.parse(
          sessionStorage.getItem("tabs") || "[]"
        );

        // Find the tab with the matching tabId
        const tab = storedTabs.find((tab: TabData) => tab.id === tabId);
        if (!tab) {
          console.warn(`No tab found with id: ${tabId}`);
          return;
        }

        // Find the editor within the tab using the editorId
        const editor = tab.children.find(
          (child: ChildData) => child.id === editorId
        );
        if (!editor) {
          console.warn(`No editor found with id: ${editorId}`);
          return;
        }

        // Check if the editor has a filePath and proceed to load file content
        if (editor.filePath) {
          const currentFilePath = editor.filePath.trim();

          setFilePath(currentFilePath);
          setMode(getModeFromFilePath(currentFilePath));

          if (currentFilePath) {
            try {
              // Attempt to read the file content
              const content = await window.electron.readFile(currentFilePath);
              setFileContentValue(content);
            } catch (error) {
              console.error(`Error reading file at path: ${currentFilePath}`);
              console.error("Error:", error);
              setFileContentValue(""); // Clear content if the file can't be read
              setFilePath(""); // Clear filePath if the file doesn't exist
              alert(
                "File not found or could not be read. Please check the file path."
              );
            }
          } else {
            console.warn("No valid file path available to load content from.");
          }
        } else {
          console.warn("Editor does not have a filePath defined.");
        }
      };

      // Delay the fetching of the file content to simulate debouncing
      const timer = setTimeout(fetchFileContent, 500);
      return () => {
        clearTimeout(timer); // Clean up timeout when component unmounts or dependencies change
      };
    }, [tabId, editorId]); // Dependencies: Re-run effect when tabId or editorId changes

    useEffect(() => {
      const autoSave = async () => {
        // If file path exists but content is empty, provide feedback
        if (filePath && fileContentValue.trim() === "") {
          console.warn("File is empty. No content to save.");
          return; // Do not proceed with auto-save
        }

        // Only proceed if the file path is valid and content is non-empty
        if (filePath && fileContentValue.trim() !== "") {
          try {
            await window.electron.saveFile(filePath, fileContentValue);
          } catch (error) {
            console.error("Error saving file:", error);
          }
        }
      };

      // Only auto-save if the file path and content are valid
      const timer = setTimeout(autoSave, 2000);
      return () => clearTimeout(timer);
    }, [fileContentValue, filePath]);

    return (
      <div ref={ref} className="h-full w-full">
        <AceEditor
          mode={mode}
          theme="twilight"
          value={fileContentValue}
          onChange={setFileContentValue}
          name="editor"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            fontSize: 14,
            showLineNumbers: true,
            tabSize: 4,
            wrap: true,
            highlightActiveLine: true,
            highlightGutterLine: true,
            useWorker: false,
          }}
          width="100%"
          height="100%"
        />
      </div>
    );
  }
);

export default EditorComponent;
