interface AdvancedSplitScreenProps {
    activeTabId: string;
    tabContents: {
      [key: string]: {
        name: string;
        children: ChildData[];
      };
    };
    socket: Socket | null;
    isConnected: boolean;
    onSplit: (tabId: string, childId: string, direction: SplitType, type?: ContentType) => string;
    onClose: (tabId: string, childId: string) => void;
    onUpdateChild: (
      tabId: string,
      childId: string,
      newData: { contentType: ContentType },
      filePath?: string
    ) => void;
    addTerminalData: (tabId: string, childId: string, data: TerminalData) => void;
    addPreviewCode: (tabId: string, childId: string, data: PreviewData[]) => void;
    addTabCreateFile: (filePath?: string, type?: ContentType) => string;
    clearTerminalData: (tabId: string, childId: string) => void;
    tabs: TabData[];
    splitChildAndAddPreview: (tabId: string, childId: string, direction: SplitType, codeBlocks: PreviewData[]) => string;
  }


  interface PreviewData {
    language: string,
    code: string,
  }



  interface CodeBlock {
    language: string;
    code: string;
  }