import React, { useState, useCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "../components/Terminal";
import { FaTimes, FaFolder, FaTerminal } from "react-icons/fa";
import EditorComponent from "../components/Editor/aceEditor";
import { AiChat } from "../components/AiChat";
import { CodePreview } from "../utils/codePreview";
import { TbMessageChatbotFilled } from "react-icons/tb";

// Interface for Electron API methods
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

// Extending the global window object to include the Electron API
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

// SplitPane component interface defining the props
const SplitPane: React.FC<{
  child: ChildData;
  onSplit: (id: string, type: SplitType) => void;
  onClose: (id: string) => void;
  onChangeContent: (
    id: string,
    contentType: ContentType,
    filePath: string
  ) => void;
  socket: Socket | null;
  isConnected: boolean;
  tabId: string;
  addTerminalData: (tabId: string, childId: string, data: TerminalData) => void;
  isRootLevel: boolean;
  onAddTab: (filePath?: string, type?: ContentType) => string;
  clearTerminalData: (tabId: string, childId: string) => void;
  onResize: (id: string, deltaX: number) => void;
  width: number;
  isLastPane: boolean;
  onShowPreview: (childId: string, codeBlocks: CodeBlock[]) => void;
}> = ({
  child,
  onSplit,
  onClose,
  socket,
  isConnected,
  onChangeContent,
  tabId,
  addTerminalData,
  isRootLevel,
  onAddTab,
  clearTerminalData,
  onResize,
  width,
  isLastPane,
  onShowPreview,
}) => {
  // State to manage context menu position
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // State to manage dragging state
  const [isDragging, setIsDragging] = useState(false);

  // State to manage the file path
  const [filePath, setFilePath] = useState<string>("");
  const paneRef = useRef<HTMLDivElement>(null);

  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Function to handle mouse down event for resizing
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
  }, []);

  // Effect to handle mouse move and mouse up events for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !paneRef.current || !dragHandleRef.current) return;

      const containerRect =
        paneRef.current.parentElement?.getBoundingClientRect();
      const paneRect = paneRef.current.getBoundingClientRect();

      if (!containerRect) return;

      const minWidth = 100; // Minimum width in pixels
      const maxWidth = containerRect.width - minWidth;

      let newX = e.clientX - containerRect.left;
      newX = Math.max(minWidth, Math.min(maxWidth, newX));

      const deltaX =
        newX - paneRect.right + dragHandleRef.current.offsetWidth / 2;

      requestAnimationFrame(() => {
        onResize(child.id, deltaX);
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "default";
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, child.id, onResize]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleClickOutside = useCallback(() => {
    setContextMenuPosition(null);
  }, []);

  useEffect(() => {
    const handleClick = () => handleClickOutside();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [handleClickOutside]);

  const handleFileSelected = (filePath: string) => {
    setFilePath(filePath);
    const newTabId = onAddTab(filePath, "editor");
  };

  const handleFileOpen = async () => {
    const paths = await window.electron.openFile();
    if (paths.length > 0) {
      const selectedFilePath = paths[0];
      onChangeContent(child.id, "editor", selectedFilePath);
    }
  };

  const handleCreateFile = async (
    fileCode: string,
    fileName: string,
    curr_dir: string
  ) => {
    try {
      const filePath = await window.electron.createFile(
        fileName,
        fileCode,
        curr_dir
      );

      const newTabId = onAddTab(filePath, "editor");
    } catch (error) {
      console.error("Failed to create file:", error);
    }
  };

  // Function to handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
          case "O":
            handleFileOpen();
            break;
          case "C":
            onChangeContent(child.id, "terminal", "");
            break;
          case "A":
            onChangeContent(child.id, "ai", "");
            break;
          case "P":
            onSplit(child.id, "vertical");
            break;
          case "B":
            onClose(child.id);
            break;
          default:
            break;
        }
      }
    },
    [handleFileOpen, onChangeContent, onSplit, onClose, child.id]
  );

  // Effect to add and remove keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Function to render the content of the child pane
  const renderChildContent = (childData: ChildData) => {
    switch (childData.contentType) {
      case "terminal":
        return (
          <Terminal
            socket={socket}
            isConnected={isConnected}
            terminalId={childData.id}
            tabId={tabId}
            content={childData.content}
            addTerminalData={addTerminalData}
            onFileSelect={handleFileSelected}
            handleCreateFile={handleCreateFile}
            clearTerminalData={clearTerminalData}
            onShowPreview={(codeBlocks) =>
              onShowPreview(childData.id, codeBlocks)
            }
          />
        );
      case "editor":
        return <EditorComponent tabId={tabId} editorId={childData.id} />;
      case "ai":
        return (
          <AiChat
            socket={socket}
            isConnected={isConnected}
            chatId={childData.id}
            tabId={tabId}
            content={childData.content}
            addTerminalData={addTerminalData}
            handleCreateFile={handleCreateFile}
            clearTerminalData={clearTerminalData}
            onShowPreview={(codeBlocks) =>
              onShowPreview(childData.id, codeBlocks)
            }
          />
        );
      case "preview":
        return (
          <CodePreview
            codeBlocks={childData.preview as unknown as CodeBlock[]}
          />
        );
      default:
        return null;
    }
  };

  const handleOpenTerminal = (childId) => {
    onChangeContent(childId, "terminal", "");

    clearTerminalData(tabId, childId);
  };

  const handleOpenAI = (childId) => {
    onChangeContent(childId, "ai", "");
    clearTerminalData(tabId, childId);
  };

  return (
    <div
      ref={paneRef}
      className={`relative h-full flex min-w-0 min-h-0 ${
        child.direction === "horizontal" ? "flex-col" : "flex-row"
      }`}
      onContextMenu={handleContextMenu}
      style={{ width: `${width}%` }}
    >
      <div className="w-full h-full">{renderChildContent(child)}</div>
      {!isRootLevel && (
        <button
          className="absolute top-2 right-2 p-1 bg-[--darkGrayColor] rounded hover:bg-[--darkGrayColor] z-10"
          onClick={() => onClose(child.id)}
          aria-label="Close pane"
        >
          <FaTimes />
        </button>
      )}
      {contextMenuPosition && (
        <div
          className="fixed bg-opacity-50 bg-gradient-to-b from-[--bgGradientStart] to-[--bgGradientEnd] shadow-md rounded-md py-2 z-50"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-[--primaryTextColor] hover:text-[--darkGrayColor]"
            onClick={() => onSplit(child.id, "vertical")}
          >
            Split Vertical
          </button>
          <hr className="my-2" />
          <button
            className="block w-full text-left px-4 py-2 hover:bg-[--primaryTextColor] hover:text-[--darkGrayColor]"
            onClick={() => handleOpenTerminal(child.id)}
          >
            <FaTerminal className="inline mr-2" /> Open Terminal
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-[--primaryTextColor] hover:text-[--darkGrayColor]"
            onClick={() => handleOpenAI(child.id)}
          >
            <TbMessageChatbotFilled className="inline mr-2" /> AI Chat
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-[--primaryTextColor] hover:text-[--darkGrayColor]"
            onClick={handleFileOpen}
          >
            <FaFolder className="inline mr-2" /> Open File
          </button>
        </div>
      )}
      {!isRootLevel && !isLastPane && (
        <div
          ref={dragHandleRef}
          className="absolute top-0 right-0 bottom-0 w-1 bg-gray-300 cursor-col-resize"
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
};

const AdvancedSplitScreen: React.FC<AdvancedSplitScreenProps> = ({
  activeTabId,
  tabContents,
  socket,
  isConnected,
  onSplit,
  onClose,
  onUpdateChild,
  addTerminalData,
  addTabCreateFile,
  clearTerminalData,
  tabs,
  addPreviewCode,
  splitChildAndAddPreview,
}) => {
  const activeTabContent = tabContents[activeTabId];
  const [widths, setWidths] = useState<{ [key: string]: number }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const distributeEqualWidths = useCallback((children: ChildData[]) => {
    if (children.length === 0) {
      return;
    }

    const equalWidth = 100 / children.length;

    const newWidths = children.reduce((acc, child) => {
      acc[child.id] = equalWidth;
      return acc;
    }, {} as { [key: string]: number });

    setWidths(newWidths);
  }, []);

  const handleClose = useCallback(
    (childId: string) => {
      onClose(activeTabId, childId);

      const remainingChildren =
        tabContents[activeTabId]?.children.filter(
          (child) => child.id !== childId
        ) || [];

      distributeEqualWidths(remainingChildren);
    },
    [activeTabId, onClose, tabContents, distributeEqualWidths]
  );

  const handleSplit = useCallback(
    (childId: string, direction: "horizontal" | "vertical") => {
      onSplit(activeTabId, childId, direction);

      const updatedChildren = tabContents[activeTabId]?.children || [];

      distributeEqualWidths(updatedChildren);
    },
    [activeTabId, onSplit, tabContents, distributeEqualWidths]
  );

  const handleChangeContent = useCallback(
    (childId: string, contentType: ContentType, filePath?: string) => {
      onUpdateChild(activeTabId, childId, { contentType }, filePath);
    },
    [activeTabId, onUpdateChild]
  );

  const handleAddTab = useCallback(
    (filePath?: string, type: "ai" | "editor" | "terminal" = "terminal") => {
      const newTabId = addTabCreateFile(filePath, type);
      return newTabId;
    },
    [addTabCreateFile]
  );

  const handleResize = useCallback(
    (childId: string, deltaX: number) => {
      setWidths((prevWidths) => {
        const children = tabContents[activeTabId]?.children || [];
        const childIndex = children.findIndex((child) => child.id === childId);

        if (childIndex === -1 || childIndex === children.length - 1)
          return prevWidths;

        const containerWidth = containerRef.current?.offsetWidth || 1;
        const deltaPercentage = (deltaX / containerWidth) * 100;

        const currentWidth = prevWidths[childId] || 100 / children.length;
        const nextChildId = children[childIndex + 1].id;
        const nextWidth = prevWidths[nextChildId] || 100 / children.length;

        const newCurrentWidth = Math.max(
          10,
          Math.min(90, currentWidth + deltaPercentage)
        );
        const newNextWidth = Math.max(
          10,
          Math.min(90, nextWidth - deltaPercentage)
        );

        return {
          ...prevWidths,
          [childId]: newCurrentWidth,
          [nextChildId]: newNextWidth,
        };
      });
    },
    [activeTabId, tabContents]
  );

  const handleShowPreview = useCallback(
    (childId: string, codeBlocks: CodeBlock[]) => {
      splitChildAndAddPreview(activeTabId, childId, "vertical", codeBlocks);
    },
    [activeTabId, splitChildAndAddPreview]
  );

  const renderSplitPanes = (children: ChildData[]) => {
    const defaultWidth = 100 / children.length;
    return (
      <div
        className={`flex ${
          children[0]?.direction === "horizontal" ? "flex-col" : "flex-row"
        } w-full h-full overflow-auto hide-scrollbar`}
      >
        {children.map((child, index) => (
          <React.Fragment key={child.id}>
            <SplitPane
              child={child}
              onSplit={handleSplit}
              onClose={handleClose}
              onChangeContent={handleChangeContent}
              socket={socket}
              isConnected={isConnected}
              tabId={activeTabId}
              addTerminalData={addTerminalData}
              isRootLevel={children.length === 1}
              onAddTab={handleAddTab}
              clearTerminalData={clearTerminalData}
              onResize={handleResize}
              width={widths[child.id] || defaultWidth}
              isLastPane={index === children.length - 1}
              onShowPreview={handleShowPreview}
            />
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="flex flex-grow h-full w-full">
      {activeTabContent && renderSplitPanes(activeTabContent.children)}
    </div>
  );
};

export default AdvancedSplitScreen;
