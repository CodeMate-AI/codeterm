import React, { useState } from "react";
import { FaApple, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";

interface ShortcutItemProps {
  command: string;
  shortcut: string[];
  isActive?: boolean;
}

const shortcuts: ShortcutItemProps[] = [
  { command: "for Auto completion", shortcut: ["Arrow", "->"] },
  { command: "Mode Switching", shortcut: ["Ctrl", "I"] },
  { command: "Activate Next Tab", shortcut: ["Ctrl", "Shift", "T"] },
  { command: "Deactivate Current Tab", shortcut: ["Ctrl", "Esc"] },
  { command: "Open Settings", shortcut: ["Ctrl", ","] },
  { command: "Close Settings", shortcut: ["Ctrl", "."] },
  { command: "Close Codemate Essentials", shortcut: ["Ctrl", "Shift", "R"] },
  { command: "Open New Split Plane", shortcut: ["Ctrl", "Shift", "P"] },
  { command: "Close Current Plane", shortcut: ["Ctrl", "Shift", "B"] },
  { command: "Open File Menu", shortcut: ["Ctrl", "Shift", "O"] },
  { command: "Change to terminal", shortcut: ["Ctrl", "Shift", "C"] },
  { command: "Change to AI", shortcut: ["Ctrl", "Shift", "I"] },
  { command: "Attach message to context", shortcut: ["Double-click"] },
];

export function KeyboardShortcutsTab() {
  const [activeMenuItem, setActiveMenuItem] = useState("Keyboard shortcuts");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommand, setSelectedCommand] = useState(shortcuts[0].command);

  const ShortcutItem: React.FC<ShortcutItemProps> = ({
    command,
    shortcut,
    isActive,
  }) => (
    <div
      className={`flex justify-between items-center p-2 rounded cursor-pointer ${
        command === selectedCommand
          ? "bg-[--greenColorGradientStart] text-[--textColor]"
          : isActive
          ? "bg-[--darkGreenColor]"
          : "bg-[--selectionBackgroundColor]"
      }`}
      onClick={() => setSelectedCommand(command)}
    >
      <span>{command}</span>
      <div className="flex space-x-1">
        {shortcut.map((key, index) => (
          <span
            key={index}
            className="bg-[--selectionBackgroundColor] px-1 rounded custom-font-size"
          >
            {key === "⌘" ? (
              <FaApple />
            ) : key === "↑" ? (
              <FaArrowUp />
            ) : key === "↓" ? (
              <FaArrowDown />
            ) : (
              key
            )}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[440px] hide-scrollbar">
      <h2 className="custom-font-size font-bold mb-2">
        Configure keyboard shortcuts
      </h2>
      {/* <p className="custom-font-size text-gray-400 mb-4">
        Add your own custom keybindings to existing actions below.
        Use <span className="bg-gray-700 px-1 rounded">⌘</span> / <span className="bg-gray-700 px-1 rounded">/</span> to reference these keybindings in a side pane at anytime.
      </p> */}

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-gray-800 p-2 pl-8 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <IoMdSearch
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      <div className="space-y-2">
        {shortcuts
          .filter((shortcut) =>
            shortcut.command.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((shortcut, index) => (
            <ShortcutItem key={index} {...shortcut} />
          ))}
      </div>
    </div>
  );
}
