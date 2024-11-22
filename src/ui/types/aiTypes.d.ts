interface AiChatProps {
    socket: Socket | null;
    isConnected: boolean;
    chatId: string;
    tabId: string;
    content: TerminalData[];
    addTerminalData: (tabId: string, childId: string, data: TerminalData) => void;
    handleCreateFile: (fileCode: string, fileName: string, curr_dir: string) => void;
    clearTerminalData: (tabId: string, childId: string) => void;
    onShowPreview: (codeBlocks: CodeBlock[]) => void;
}