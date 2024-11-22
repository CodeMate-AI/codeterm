// Import necessary modules and components from React and other files
import React, { useState } from "react";
import NavHead from "./components/NavHead";
import { useTabs } from "./hooks/useTab";
import { useSocket } from "./hooks/useSocket";
import AdvancedSplitScreen from "./common/SplitScreen";

// Define the structure of a code block
interface CodeBlock {
  language: string;
  code: string;
}

// Define the structure of the Electron API
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

// Extend the global window object to include the Electron API
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

// Main App component
function App() {

  /**
   * Initialize socket connection and its state using the custom hook.
   * The socket is connected to the server running at "http://127.0.0.1:5000/".
   * This is typically the address where your Python backend runs during both
   * development and production.
   */
  
  const { socket, isConnected, sendMessage } = useSocket(
    "http://127.0.0.1:5000/"
  );

  // Initialize tab management using the custom hook
  const {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    handleTabChange,
    splitChild,
    closeChild,
    updateChildData,
    updateTabName,
    addTerminalData,
    addTabAndReturnId,
    clearTerminalData,
    addPreviewCode,
    splitChildAndAddPreview,
  } = useTabs();

  // State to manage the slider's open/close status
  const [isSliderOpen, setIsSliderOpen] = useState<boolean>(false);

  // Function to toggle the slider's open/close status
  const toggleSlider = (isOpen: boolean) => {
    setIsSliderOpen(isOpen);
  };

  // Get the active tab or default to the first tab if no active tab is found
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  return (
    <div
      className={`flex flex-col min-h-screen z-0 relative bg-opacity-50 bg-gradient-to-b from-[--bgGradientStart] to-[--bgGradientEnd] ${
        isSliderOpen
          ? "pr-80 transition-[padding-right]"
          : "transition-[padding-right]"
      } font-mono `}
    >
      <NavHead
        onTabChange={handleTabChange}
        onAddTab={addTab}
        onTabRemove={removeTab}
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTab={handleTabChange}
        isSliderOpen={isSliderOpen}
        setIsSliderOpen={toggleSlider}
        socket={socket}
        isConnected={isConnected}
        sendMessage={sendMessage}
        updateTabName={updateTabName}
      />
      <div className="flex z-0 bg-opacity-50 bg-gradient-to-b from-[--bgGradientStart] to-[--bgGradientEnd] text-[--textColor] overflow-y-auto h-[calc(100vh-40px)] pt-5 w-full">
          <AdvancedSplitScreen
            activeTabId={activeTabId}
            tabContents={tabs.reduce((acc, tab) => {
              acc[tab.id] = {
                name: tab.name,
                children: tab.children,
              };
              return acc;
            }, {} as { [key: string]: { name: string; children: ChildData[] } })}
            socket={socket}
            isConnected={isConnected}
            onSplit={splitChild}
            onClose={closeChild}
            onUpdateChild={updateChildData}
            addTerminalData={addTerminalData}
            addTabCreateFile={addTabAndReturnId}
            clearTerminalData={clearTerminalData}
            tabs={tabs}
            addPreviewCode={addPreviewCode}
            splitChildAndAddPreview={splitChildAndAddPreview}
          />
      </div>
    </div>
  );
}

// Export the App component as the default export
export default App;
