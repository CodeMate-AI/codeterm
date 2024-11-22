import React, { useEffect, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import SettingsModal from "../Settings/Model/settingModel";
import { FaTimes } from "react-icons/fa";
import {
  FiChevronDown,
  FiChevronRight,
  FiSend,
  FiFileText,
  FiMessageSquare,
  FiMessageCircle,
} from "react-icons/fi";
import { Socket } from "socket.io-client";

interface Section {
  title: string;
  items: Array<{ text: string; description: string; completed: boolean }>;
}


interface NavHeadProps {
  onTabChange: (id: string) => void; // Change type to string
  onAddTab: () => void;
  onTabRemove: (id: string) => void; // Change type to string
  tabs: TabData[]; // List of tab names
  activeTabId: string; // ID of the active tab
  setActiveTab: (id: string) => void; // Change type to string
  isSliderOpen: boolean;
  setIsSliderOpen: (isOpen: boolean) => void;
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
  updateTabName: (id: string, name: string) => void;
}

const NavHead: React.FC<NavHeadProps> = ({
  onTabChange,
  onAddTab,
  onTabRemove,
  tabs,
  activeTabId,
  setActiveTab,
  isSliderOpen,
  setIsSliderOpen,
  socket,
  isConnected,
  sendMessage,
  updateTabName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

  const handleTabClick = (id: string) => {
    onTabChange(id);
  };

  const handleTabRemove = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onTabRemove(id);
  };

  const [sections, setSections] = useState<Section[]>([
    {
      title: "What's New?",
      items: [],
    },
    {
      title: "Getting Started",
      items: [
        {
          text: "Create your first block",
          description: "Run a command to see your command and output grouped.",
          completed: true,
        },
        {
          text: "Navigate blocks",
          description: "Click to select a block and navigate with arrow keys.",
          completed: true,
        },
        {
          text: "Take an action on block",
          description: "Right click on a block to copy/paste, share, more.",
          completed: true,
        },
        {
          text: "Open command palette",
          description: "Access all of CodeMate.ai via the keyboard.",
          completed: false,
        },
        {
          text: "Set your theme",
          description: "Make CodeMate.ai your own by choosing a theme.",
          completed: false,
        },
      ],
    },
    {
      title: "Maximize CodeMate.ai",
      items: [
        {
          text: "Create your first block",
          description: "Run a command to see your command and output grouped.",
          completed: true,
        },
        {
          text: "Navigate blocks",
          description: "Click to select a block and navigate with arrow keys.",
          completed: true,
        },
        {
          text: "Take an action on block",
          description: "Right click on a block to copy/paste, share, more.",
          completed: true,
        },
        {
          text: "Open command palette",
          description: "Access all of CodeMate.ai via the keyboard.",
          completed: false,
        },
        {
          text: "Set your theme",
          description: "Make CodeMate.ai your own by choosing a theme.",
          completed: false,
        },
      ],
    },
    {
      title: "Advanced Setup",
      items: [
        {
          text: "Create your first block",
          description: "Run a command to see your command and output grouped.",
          completed: true,
        },
        {
          text: "Navigate blocks",
          description: "Click to select a block and navigate with arrow keys.",
          completed: true,
        },
        {
          text: "Take an action on block",
          description: "Right click on a block to copy/paste, share, more.",
          completed: true,
        },
        {
          text: "Open command palette",
          description: "Access all of CodeMate.ai via the keyboard.",
          completed: false,
        },
        {
          text: "Set your theme",
          description: "Make CodeMate.ai your own by choosing a theme.",
          completed: false,
        },
      ],
    },
  ]);

  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    "What's New?": true,
    "Getting Started": true,
    "Maximize CodeMate.ai": false,
    "Advanced Setup": false,
  });

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    setSections((prevSections) => {
      const newSections = [...prevSections];
      newSections[sectionIndex].items[itemIndex].completed =
        !newSections[sectionIndex].items[itemIndex].completed;
      return newSections;
    });
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F2" && activeTabId) {
        setEditingTabId(activeTabId);
        const activeTab = tabs.find((tab) => tab.id === activeTabId);
        if (activeTab) {
          setNewTabName(activeTab.name);
        }
        setIsEditing(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTabId, tabs]);

  const handleTabDoubleClick = (tabId: string) => {
    // Trigger the same behavior as F2 or double-click to start editing
    setEditingTabId(tabId);
    const activeTab = tabs.find((tab) => tab.id === tabId);
    if (activeTab) {
      setNewTabName(activeTab.name);
    }
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTabName(e.target.value);
  };

  const handleInputBlur = () => {
    if (editingTabId) {
      updateTabName(editingTabId, newTabName);
    }
    setIsEditing(false);
    setEditingTabId(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  const [hoverInfo, setHoverInfo] = useState<{
    show: boolean;
    text: string;
    x: number;
    y: number;
  }>({
    show: false,
    text: "",
    x: 0,
    y: 0,
  });

  const showHoverInfo = (text: string, event: React.MouseEvent) => {
    setHoverInfo({ show: true, text, x: event.clientX, y: event.clientY });
  };

  const hideHoverInfo = () => {
    setHoverInfo({ ...hoverInfo, show: false });
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "D":
          if (event.ctrlKey) {
            event.preventDefault();
            onTabRemove(activeTabId);
          }
          break;
        case ",":
          if (event.ctrlKey) {
            event.preventDefault();
            setIsModalOpen(true);
          }
          break;
        case ".":
          if (event.ctrlKey) {
            event.preventDefault();
            setIsModalOpen(false);
          }
          break;
        case "R":
          if (event.ctrlKey && event.shiftKey) {
            event.preventDefault();
            setIsSliderOpen(false);
          }
          break;
        case "T":
          if (event.ctrlKey && event.shiftKey) {
            event.preventDefault();
            onAddTab();
          }
          break;
        case "Escape":
          if (event.ctrlKey) {
            event.preventDefault();
            onTabRemove(activeTabId);
          }
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [activeTabId, onTabRemove, onAddTab, setIsModalOpen, setIsSliderOpen]);

  return (
    <div className="flex  items-center bg-[--bgColor] shadow-lg shadow-[--shadowColor]/50 w-full z-10 relative h-8">
      <div className="flex items-center space-x-1 overflow-x-auto mr-16 hide-scrollbar ">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex text-center text-[--textColor] hover:bg-[--darkGrayColor] transition-colors cursor-pointer h-9 items-center bg-opacity-50 bg-gradient-to-b from-[--bgGradientStart] to-[--bgGradientEnd] px-3 py-1 w-40 isolate  bg-white/20 shadow-lg ring-1 ring-black/5 ${
              tab.id === activeTabId
                ? "relative bg-[--selectionBackgroundColor] font-medium border-b-2 border-gradient hide-scrollbar "
                : ""
            }`}
            onClick={() => handleTabClick(tab.id)}
            onDoubleClick={() => handleTabDoubleClick(tab.id)}
            onMouseEnter={() => setHoveredTabId(tab.id)}
            onMouseLeave={() => setHoveredTabId(null)}
          >
            {isEditing && editingTabId === tab.id ? (
              <input
                type="text"
                value={newTabName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="custom-font-size text-[--textColor] bg-transparent  border-[--textColor] focus:outline-none hide-scrollbar w-full"
                autoFocus
              />
            ) : (
              <span className="custom-font-size text-[--primaryTextColor]">
                {tab.name}
              </span>
            )}
            {hoveredTabId === tab.id && (
              <FaTimes
                className="ml-auto h-4 w-4 text-[--primaryTextColor] cursor-pointer"
                style={{ transform: "scale(0.8)", filter: "contrast(0.5)" }}
                onClick={(event) => handleTabRemove(tab.id, event)}
              />
            )}
          </div>
        ))}
        <button
          className="inline-block text-center px-4 py-2 cursor-pointer text-[--textColor] hover:bg-[--selectionBackgroundColor] transition-colors"
          onClick={onAddTab}
          onMouseEnter={(e) => showHoverInfo("New tab (Ctrl+Shift+T)", e)}
          onMouseLeave={hideHoverInfo}
        >
          +
        </button>
      </div>

      <div
        className={`fixed inset-y-0 right-0 w-80 bg-[--bgColor] shadow-lg transition-transform transform duration-300 ${
          isSliderOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-[--borderColor] text-[--textColor]">
          <h2 className="custom-font-size font-semibold">
            CodeMate.AI Essentials
          </h2>
          <button onClick={() => setIsSliderOpen(false)}>
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-[--bgColor] text-[--textColor] w-full font-sans h-full overflow-y-auto hide-scrollbar">
          <div className="p-4">
            <button className="w-full bg-[--bgColor] text-[--blueColor] border border-[--darkBlueColor] rounded py-2 px-4 flex items-center justify-center mb-4">
              <FiSend className="w-4 h-4 mr-2" />
              Invite a friend to CodeMate.ai
            </button>

            <div className="text-right custom-font-size text-[--secondaryTextColor] mb-4 cursor-pointer">
              Mark all as read
            </div>
          </div>

          <div className="flex-grow px-4">
            {sections.map((section, sectionIndex) => (
              <div key={section.title} className="mb-4">
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => toggleSection(section.title)}
                >
                  <div className="flex items-center">
                    {expandedSections[section.title] ? (
                      <FiChevronDown className="w-4 h-4 mr-1" />
                    ) : (
                      <FiChevronRight className="w-4 h-4 mr-1" />
                    )}
                    <span className="custom-font-size font-medium">
                      {section.title}
                    </span>
                  </div>
                  {section.title === "What's New?" && (
                    <span className="custom-font-size text-[--blueColor]">
                      Read all changelogs
                    </span>
                  )}
                  {section.items.length > 0 &&
                    section.title !== "What's New?" && (
                      <span className="custom-font-size text-[--textColor]">
                        {section.items.filter((item) => item.completed).length}/
                        {section.items.length}
                      </span>
                    )}
                </div>
                {expandedSections[section.title] && (
                  <div className="ml-5 space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <div key={item.text} className="flex items-start">
                        {section.title !== "What's New?" ? (
                          <div
                            className={`w-3 h-3 rounded-full mt-1 mr-2 cursor-pointer ${
                              item.completed
                                ? "bg-[--blueColor]"
                                : "border-2 border-[--borderColor]"
                            }`}
                            onClick={() => toggleItem(sectionIndex, itemIndex)}
                          ></div>
                        ) : null}
                        <div>
                          <div className="custom-font-size">{item.text}</div>
                          <div className="custom-font-size text-[--textColor]">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4">
            <div className="custom-font-size text-[--textColor] mb-4">
              v0.2024.09.03.08.02.stable_03
            </div>

            <div className="flex justify-between custom-font-size text-[--textColor]">
              <div className="flex items-center cursor-pointer">
                <FiFileText className="w-4 h-4 mr-1" />
                Docs
              </div>
              <div className="flex items-center cursor-pointer">
                <FiMessageSquare className="w-4 h-4 mr-1" />
                Discord
              </div>
              <div className="flex items-center cursor-pointer">
                <FiMessageCircle className="w-4 h-4 mr-1" />
                Feedback
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 absolute right-0 h-8 mr-4">
        <IoSettingsOutline
          onClick={() => setIsModalOpen(true)}
          style={{ color: "var(--textColor)" }}
          size={16}
          className="cursor-pointer"
          onMouseEnter={(e) => showHoverInfo("Settings (Ctrl+,)", e)}
          onMouseLeave={hideHoverInfo}
        />
        {/* {!isSliderOpen && (
          <IoBulbOutline
            style={{ color: "var(--textColor)" }}
            size={16}
            className="cursor-pointer"
            onClick={() => setIsSliderOpen(true)}
            onMouseEnter={(e) => showHoverInfo('Codemate Essentials (Ctrl+Shift+E)', e)}
            onMouseLeave={hideHoverInfo}
          />
        )} */}
      </div>

      {hoverInfo.show && (
        <div
          style={{
            position: "fixed",
            top: hoverInfo.y + 10,
            left: hoverInfo.x - 50,
            backgroundColor: "#161b22",
            color: "white",
            padding: "5px",
            borderRadius: "3px",
            zIndex: 1000,
            fontSize: "12px",
          }}
        >
          {hoverInfo.text}
        </div>
      )}

      {isModalOpen && (
        <SettingsModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          socket={socket}
          isConnected={isConnected}
          sendMessage={sendMessage}
        />
      )}
    </div>
    // </div>
  );
};

export default NavHead;
