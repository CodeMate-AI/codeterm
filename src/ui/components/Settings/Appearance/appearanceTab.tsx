import React, { useEffect, useState } from "react";
import { CiCircleInfo } from "react-icons/ci"; // Importing the palette icon
import ThemeSwitcher from "./themeSwitcher";
import { MdKeyboardArrowDown } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { useTheme } from "../../../context/themeContext";
import { generateThemeColors } from "../../../utils/colorUtils";
import { useSocket } from "../../../hooks/useSocket";
import { Socket } from "socket.io-client";

interface ModalProps {
  isCustomThemeOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface AppearanceTabProps {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
}

const Modal: React.FC<ModalProps> = ({
  isCustomThemeOpen,
  onClose,
  children,
}) => {
  if (!isCustomThemeOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[--bgColor] rounded-lg min-w-[480px] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export function AppearanceTab({
  socket,
  isConnected,
  sendMessage,
}: AppearanceTabProps) {
  const { toggleTheme, applyCustomColors, addTheme } = useTheme();

  const [syncWithOS, setSyncWithOS] = useState<boolean>(false);
  const [openNewWindows, setOpenNewWindows] = useState<boolean>(false);
  const [windowOpacity, setWindowOpacity] = useState<number>(100);
  const [windowBlurRadius, setWindowBlurRadius] = useState<number>(1);

  const [isCustomThemeOpen, setIsCustomThemeOpen] = useState<boolean>(false);
  const [step, setStep] = useState<"select" | "create">("select"); // Use string literal types for steps
  const [extractedColors, setExtractedColors] = useState<string[]>([
    "#1e3a8a",
    "#3b82f6",
    "#93c5fd",
    "#bfdbfe",
    "#dbeafe",
  ]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [newThemeName, setNewThemeName] = useState<string>("");

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStep("create");
    }
  };

  const handleCreateTheme = () => {
    if (!socket || !isConnected) return;
    if (!newThemeName || !selectedColor) return; // Add validation if needed

    const newTheme = {
      name: newThemeName,
      color: selectedColor,
    };

    // Add the new theme to the list of all themes
    addTheme(newTheme.name);

    const newCreatedTheme = generateThemeColors(newTheme.name, newTheme.color);

    const flattenedColors = newCreatedTheme.colors as unknown as Record<
      string,
      string
    >;

    applyCustomColors(flattenedColors);

    socket.emit("post_theme", {
      themeName: newTheme.name,
      colors: flattenedColors,
    });

    // Apply the new theme
    toggleTheme(newTheme.name);
    setIsCustomThemeOpen(false);
    setSelectedColor("");
    setNewThemeName("");
    setStep("select");
  };

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on("themeSaved", (message: { message: string }) => {});

    socket.on("error", (errorMessage: { error: string }) => {
      console.error(errorMessage.error);
    });

    return () => {
      socket.off("themeSaved");
      socket.off("error");
    };
  }, []);

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
  };

  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar">
      <h2 className="custom-font-size font-bold mb-4">Themes</h2>
      {/* <p className="text-[--textColor] mb-4">Create your own custom theme</p>

      <button
        onClick={() => setIsCustomThemeOpen(true)}
        className="px-4 py-2 bg-[--darkBlueColor] text-[--textColor] rounded-md mb-4"
      >
        Open Theme Creator
      </button> */}

      {/* <Modal
        isCustomThemeOpen={isCustomThemeOpen}
        onClose={() => setIsCustomThemeOpen(false)}
      >
        <div className="flex justify-between items-center p-4 border-b border-[--borderColor]">
          <h2 className="text-[--textColor] text-lg font-semibold">
            Create new theme from image
          </h2>
          <button
            onClick={() => setIsCustomThemeOpen(false)}
            className="text-[--textColor] hover:text-[--secondaryTextColor]"
          >
            <RxCross2 size={20} style={{ color: "var(--textColor)" }} />
          </button>
        </div>
        <div className="p-6">
          {step === "select" ? (
            <>
              <p className="text-gray-400 custom-font-size mb-4">
                Automatically generate a theme based on extracted colors from an
                image (.png, .jpg).
              </p>
              <label className="block w-full py-20 border-2 border-dashed border-[--borderColor] rounded-md text-center cursor-pointer hover:border-[--darkGrayColor] transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <span className="text-[--darkBlueColor] flex items-center justify-center">
                  Select an image
                  <MdKeyboardArrowDown size={20} className="ml-1" />
                </span>
              </label>
            </>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="starry_sky"
                  className="w-full bg-[--bgColor] text-[--textColor] p-2 rounded-md"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                />
              </div>
              <div className="flex space-x-4 mb-4 justify-between w-full">
                {extractedColors.map((color, index) => (
                  <button
                    key={index}
                    className={`w-full h-12 rounded-md cursor-pointer transition-transform hover:scale-110 ${
                      color === selectedColor ? "ring-2 ring-[--textColor]" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorClick(color)}
                  />
                ))}
              </div>
              <label className="block w-full py-20 border-2 border-dashed border-[--borderColor] rounded-md text-center cursor-pointer hover:border-[--darkGrayColor] transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <span className="text-[--darkBlueColor] flex items-center justify-center">
                  Select an image
                  <MdKeyboardArrowDown size={20} className="ml-1" />
                </span>
              </label>
            </>
          )}
        </div>
        <div className="flex justify-end p-4 border-t border-[--darkGrayColor]">
          <button
            onClick={() => setIsCustomThemeOpen(false)}
            className="px-4 py-2 text-[--textColor] hover:text-[--secondaryTextColor] transition-colors"
          >
            Cancel
          </button>
          {step === "create" && (
            <button
              // onClick={() => setStep('select')}
              onClick={handleCreateTheme}
              className="px-4 py-2 bg-[--blueColor] text-[--textColor] rounded-md ml-2 hover:bg-[--darkBlueColor] transition-colors"
            >
              Create Theme
            </button>
          )}
        </div>
      </Modal> */}

      <ThemeSwitcher />

      {/* <div className="flex items-center justify-between mb-2">
        <span>Sync with OS</span>
        <button
          className={`w-12 h-6 rounded-full p-1 ${
            syncWithOS ? "bg-[--blueColor]" : "bg-[--grayColor]"
          }`}
          onClick={() => setSyncWithOS(!syncWithOS)}
        >
          <div
            className={`w-4 h-4 rounded-full bg-[--textColor] transform transition-transform ${
              syncWithOS ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>
      <p className="custom-font-size text-[--textColor] mb-4">
        Automatically switch between light and dark themes when your system
        does.
      </p> */}

      <div className="bg-[--selectionBackgroundColor] p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <span>Current theme</span>
          {/* <span>Cyber Wave</span> */}
        </div>
        <div className="mt-2 bg-[--bgColor] rounded p-2">
          <code className="text-[--greenColor]">ls</code>
          <code className="text-[--redColor]"> executable </code>
          <code className="text-[--blueColor]">file</code>
        </div>
      </div>

      {/* <h2 className="text-xl font-bold mb-2">Window</h2>
      <div className="flex items-center justify-between mb-2">
        <span>Open new windows with custom size</span>
        <button
          className={`w-12 h-6 rounded-full p-1 ${
            openNewWindows ? "bg-[--blueColor]" : "bg-[--grayColor]"
          }`}
          onClick={() => setOpenNewWindows(!openNewWindows)}
        >
          <div
            className={`w-4 h-4 rounded-full bg-[--textColor] transform transition-transform ${
              openNewWindows ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <span>Window Opacity: {windowOpacity}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={windowOpacity}
          onChange={(e) => setWindowOpacity(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <span>Window Blur Radius: {windowBlurRadius}</span>
          <CiCircleInfo size={16} className="text-[--textColor]" />
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={windowBlurRadius}
          onChange={(e) => setWindowBlurRadius(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <h2 className="custom-font-size font-bold mb-2">Input</h2>
      <div className="mb-4">
        <span>Input position</span>
        <select className="w-full bg-[--selectionBackgroundColor] mt-1 p-2 rounded">
          <option>Pin to the bottom (CodeMate.ai default)</option>
        </select>
      </div>

      <h2 className="custom-font-size font-bold mb-2">Prompt</h2>
      <div className="h-8 bg-[--selectionBackgroundColor] rounded"></div> */}
    </div>
  );
}
