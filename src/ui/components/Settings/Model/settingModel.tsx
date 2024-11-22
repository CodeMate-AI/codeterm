import React, { useState } from "react";
import { FaTimes } from "react-icons/fa"; // Importing the close icon
import { AccountTab } from "../Account/accountTab";
import { AppearanceTab } from "../Appearance/appearanceTab";
import { FeaturesTab } from "../Features/featuresTab";
import { SharedBlocksTab } from "../SharedBlock/sharedBlocksTab";
import { KeyboardShortcutsTab } from "../KeyboardShortcuts/KeyboardShortcutsTab";
import { AboutTab } from "../About/aboutTab";
import { TeamTab } from "../Team/teamTab";
import { SubShellTab } from "../SubShell/subShellTab";

import { Socket } from "socket.io-client";
import LLMModelTab from "../LLMModels/LLMModelsTab";
import { ProductTab } from "../Products/productTab";

import vsCodeImage from "../../../../assets/vsCode.png";
import webLogoLightImage from "../../../../assets/web-icon.png";
import webLogoDarkImage from "../../../../assets/web-icon-dark.png";

interface SettingsModalProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
}

export default function SettingsModal({
  isModalOpen,
  setIsModalOpen,
  socket,
  isConnected,
  sendMessage,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("appearance");

  const getTheme = localStorage.getItem("theme");

  let logoImage;

  if (getTheme === "codemate-ai-light") {
    logoImage = webLogoLightImage;
  } else {
    logoImage = webLogoDarkImage;
  }

  const products = [
    {
      title: "Visual Studio Code",
      imageSrc: vsCodeImage,
      installText: "Install our VS Code Extension",
      actionLinks: {
        install:
          "vscode:extension/AyushSinghal.Code-Mate",
        marketplace:
          "https://marketplace.visualstudio.com/items?itemName=AyushSinghal.Code-Mate",
        viewDocumentation: "https://docs.codemate.ai/",
      },
      isWeb: false,
    },
    {
      title: "Web",
      imageSrc: logoImage,
      installText: "Try CodeMate on the web",
      actionLinks: {
        install: "https://app.codemate.ai/app/dashboard",
        viewDocumentation: "https://docs.codemate.ai/",
      },
      isWeb: false,
      // description: "Chat with codemate.ai"
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      // case "account":
      // return <AccountTab />;
      case "appearance":
        return (
          <AppearanceTab
            socket={socket}
            isConnected={isConnected}
            sendMessage={sendMessage}
          />
        );
      // case "features":
      //   return <FeaturesTab />;
      case "shared-blocks":
        return <SharedBlocksTab />;
      case "keyboard-shortcuts":
        return <KeyboardShortcutsTab />;
      case "about":
        return <AboutTab />;
      case "team":
        return <TeamTab />;
      case "subShells":
        return <SubShellTab />;
      case "products":
        return <ProductTab products={products} />;
      case "llm-Models":
        return <LLMModelTab socket={socket} isConnected={isConnected} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
        isModalOpen ? "block" : "hidden"
      } z-10`}
    >
      <div className="bg-opacity-50 bg-gradient-to-b from-[--bgGradientStart] to-[--bgGradientEnd] text-[--textColor] rounded-lg w-2/4 shadow-xl h-[500px]">
        <div className="flex justify-between items-center p-4 border-b border-[--borderColor]">
          <h2 className="custom-font-size font-semibold">Settings</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-[--textColor]"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        <div className="flex h-[434px]">
          <nav className="w-1/4  border-r border-[--borderColor] p-2">
            <ul className="space-y-4">
              {/* <li
                className={`w-full text-left p-2 rounded cursor-pointer ${
                  activeTab === "account"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("account")}
              >
                Account
              </li> */}
              <li
                className={`w-full text-left p-2 rounded cursor-pointer ${
                  activeTab === "appearance"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("appearance")}
              >
                Appearance
              </li>
              {/* <li
                className={`w-full text-left p-2 rounded cursor-pointer ${
                  activeTab === "features"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("features")}
              >
                Features
              </li> */}
              <li
                className={`w-full text-left p-2 rounded  cursor-pointer ${
                  activeTab === "llm-Models"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("llm-Models")}
              >
                LLM Models
              </li>
              {/* <li
                className={`w-full text-left p-2 rounded  cursor-pointer ${
                  activeTab === "shared-blocks"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("shared-blocks")}
              >
                Shared blocks
              </li> */}
              <li
                className={`w-full text-left p-2 rounded cursor-pointer ${
                  activeTab === "keyboard-shortcuts"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("keyboard-shortcuts")}
              >
                Keyboard shortcuts
              </li>
              {/* <li
                className={`w-full text-left p-2 rounded cursor-pointer ${
                  activeTab === "team"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("team")}
              >
                Team
              </li> */}
              {/* <li
                className={`w-full text-left p-2 rounded cursor-pointer ${
                  activeTab === "subShells"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("subShells")}
              >
                SubShells
              </li> */}
              <li
                className={`w-full text-left p-2 rounded cursor-pointer ${
                  activeTab === "products"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("products")}
              >
                Products
              </li>
              {/* <li
                className={`w-full text-left p-2 rounded cursor-pointer ${
                  activeTab === "Referrals"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("Referrals")}
              >
                Referrals
              </li> */}
              <li
                className={`w-full text-left p-2 rounded cursor-pointer ${
                  activeTab === "about"
                    ? "bg-opacity-50 bg-gradient-to-r from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--primaryTextColor]"
                    : "text-[--secondaryTextColor] hover:[--darkGrayColor]"
                }`}
                onClick={() => setActiveTab("about")}
              >
                About
              </li>
            </ul>
          </nav>
          <>{renderTabContent()}</>
        </div>
      </div>
    </div>
  );
}
