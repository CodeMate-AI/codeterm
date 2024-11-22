import React, { useState } from "react";
import { ToggleSwitch } from "./ToggleSwitchFeatures";
import { FaInfoCircle } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";

interface ToggleState {
  [key: string]: boolean;
}

export function FeaturesTab() {
  const [toggleStates, setToggleStates] = useState<ToggleState>({
    shortcutScreen: false,
    restoreWindows: false,
    stickyHeader: false,
    tooltipOnClick: false,
    markdownViewer: false,
    warningBeforeQuitting: false,
    warningBeforeLoggingOut: false,
    changelogAfterUpdates: false,
    sshWrapper: false,
  });

  const handleToggleChange = (key: string) => {
    setToggleStates((prevStates) => ({
      ...prevStates,
      [key]: !prevStates[key],
    }));
  };

  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar">
      <h2 className="custom-font-size font-bold mb-4">General</h2>

      <ToggleSwitch
        label="Shortcut screen on new tab"
        isChecked={toggleStates.shortcutScreen}
        onChange={() => handleToggleChange("shortcutScreen")}
      />
      <ToggleSwitch
        label="Restore windows, tabs, and panes on startup"
        isChecked={toggleStates.restoreWindows}
        onChange={() => handleToggleChange("restoreWindows")}
        info
      />
      <ToggleSwitch
        label="Show sticky command header"
        isChecked={toggleStates.stickyHeader}
        onChange={() => handleToggleChange("stickyHeader")}
        info
      />
      <ToggleSwitch
        label="Show tooltip on click on links"
        isChecked={toggleStates.tooltipOnClick}
        onChange={() => handleToggleChange("tooltipOnClick")}
      />

      <div className="py-2">
        <label className="custom-font-size block mb-1">
          Choose an editor to open file links
        </label>
        <select className="w-full bg-[--selectionBackgroundColor] p-2 rounded custom-font-size">
          <option>Default App</option>
        </select>
      </div>

      <ToggleSwitch
        label="Open Markdown files in CodeMate.ai's Markdown Viewer by default"
        isChecked={toggleStates.markdownViewer}
        onChange={() => handleToggleChange("markdownViewer")}
        info
      />
      <ToggleSwitch
        label="Show warning before quitting"
        isChecked={toggleStates.warningBeforeQuitting}
        onChange={() => handleToggleChange("warningBeforeQuitting")}
      />
      <ToggleSwitch
        label="Show warning before logging out"
        isChecked={toggleStates.warningBeforeLoggingOut}
        onChange={() => handleToggleChange("warningBeforeLoggingOut")}
      />
      <ToggleSwitch
        label="Show changelog after updates"
        isChecked={toggleStates.changelogAfterUpdates}
        onChange={() => handleToggleChange("changelogAfterUpdates")}
      />

      <div className="py-2 flex items-center justify-between">
        <div className="flex items-center">
          <span className="custom-font-size">
            Lines scrolled by mouse wheel interval
          </span>
          <FaInfoCircle size={16} className="ml-1 text-[--textColor]" />
        </div>
        <input
          type="number"
          className="w-16 bg-[--selectionBackgroundColor] p-1 rounded custom-font-size"
          defaultValue={3}
        />
      </div>

      <h3 className="custom-font-size font-bold mt-4 mb-2">Session</h3>
      <ToggleSwitch
        label="CodeMate.ai SSH Wrapper"
        isChecked={toggleStates.sshWrapper}
        onChange={() => handleToggleChange("sshWrapper")}
        info
      />
      <div className="py-2">
        <label className="custom-font-size block mb-1">Tab key behavior</label>
        <div className="relative">
          <select className="w-full bg-[--selectionBackgroundColor] p-2 rounded custom-font-size appearance-none">
            <option>Open completions menu</option>
          </select>
          <IoChevronDown
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[--textColor]"
            size={16}
          />
        </div>
        <p className="custom-font-size text-[--textColor] mt-1">
          → accepts autosuggestions.{" "}
          <a href="#" className="text-[--blueColor]">
            Change keybinding
          </a>
        </p>
      </div>
      <h3 className="custom-font-size font-bold mt-4 mb-2">Terminal</h3>
      <div className="py-2">
        <label className="custom-font-size block mb-1">New tab placement</label>
        <div className="relative">
          <select className="w-full bg-[--selectionBackgroundColor] p-2 rounded custom-font-size appearance-none">
            <option>After current tab</option>
          </select>
          <IoChevronDown
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[--textColor]"
            size={16}
          />
        </div>
      </div>
      <h3 className="custom-font-size font-bold mt-4 mb-2">Workflows</h3>
    </div>
  );
}
