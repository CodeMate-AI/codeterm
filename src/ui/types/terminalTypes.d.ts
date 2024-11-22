import {ReactNode} from "react";
import { Socket } from 'socket.io-client';

export type TerminalHistoryItem = string;
export type TerminalHistory = TerminalHistoryItem[];
export type TerminalPushToHistoryWithDelayProps = {
  content: TerminalHistoryItem;
  delay?: number;
};


export type TerminalOnSubmit = (input: string) => void;


export type TerminalCommands = {
  [command: string]: () => void;
};

export interface TerminalProps {
  // history?: TerminalHistory;
  terminalId: string;
  // promptLabel?: string;
  // commands?: { [key: string]: () => void };
  // onSubmit: (input: string) => void;
  socket: Socket | null;
  isConnected: boolean;
  // sendMessage: (event: string, data: any) => void;
};


interface Message {
  id: number;
  text: React.ReactNode;
  type: "error" | "success" | "nlp";
  timestamp: string;
  current_cmd: string;
  commands?: string[];
  fileSystem?: FileSystemItem[];
  isStreaming: boolean
}

interface FileSystemItem {
  mode: string;
  lastWriteTime: string;
  length: string;
  name: string;
  isDirectory: boolean;
}

interface CodeBlock {
  language: string;
  code: string;
}

interface Directory {
  name: string
  type: 'directory' | 'file'
}


interface StreamingMessage {
  content: string
  command: string
  timestamp: string
  type: "error" | "success" | "nlp"
}

interface TerminalProps {
  socket: Socket | null;
  isConnected: boolean;
  terminalId: string;
  tabId: string;
  content: TerminalData[];
  addTerminalData: (tabId: string, childId: string, data: TerminalData) => void;
  onFileSelect: (filePath: string) => void;
  handleCreateFile: (
    fileCode: string,
    fileName: string,
    curr_dir: string
  ) => void;
  clearTerminalData: (tabId: string, childId: string) => void;
  onShowPreview: (codeBlocks: CodeBlock[]) => void;
}