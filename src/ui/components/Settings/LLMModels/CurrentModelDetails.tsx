import { useState } from "react";
import { FaEye, FaEyeSlash, FaCopy } from "react-icons/fa";

interface CurrentModelDetailsProps {
  provider: string;
  name: string;
  params: Record<string, string>;
}

export default function CurrentModelDetails({
  provider,
  name,
  params,
}: CurrentModelDetailsProps) {
  const [visibleParams, setVisibleParams] = useState<Record<string, boolean>>(
    {}
  );

  const toggleParamVisibility = (param: string) => {
    setVisibleParams((prev) => ({ ...prev, [param]: !prev[param] }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent form submission
  };

  return (
    <div className="w-full bg-[--bgColor] border border-[--borderColor] rounded-lg p-4 mt-4">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="custom-font-size font-semibold text-[--textColor]">
            Current Model Details
          </h2>
        </div>
        {/* <div className="bg-[--bgGradientEnd] text-[--textColor] px-2 py-1 rounded custom-font-size">
            {provider}
          </div> */}
        <div className="flex items-center space-x-2">
          <h2 className="custom-font-size  text-[--textColor] opacity-70">
            Provider
          </h2>
          <p className="custom-font-size text-[--textColor] opacity-70">
            {provider}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <h2 className="custom-font-size  text-[--textColor] opacity-70">
            Model Name
          </h2>
          <p className="custom-font-size text-[--textColor] opacity-70">
            {name}
          </p>
        </div>
        {/* <p className="custom-font-size text-[--textColor] opacity-70 mt-1">{name}</p> */}
        {/* <p className="custom-font-size text-[--textColor] opacity-70 mt-1">{name}</p> */}
      </div>
      <div className="space-y-4">
        {Object.entries(params).map(([key, value]) => (
          <div key={key}>
            <label className="block custom-font-size font-medium text-[--textColor] opacity-70 mb-1">
              {key}
            </label>
            <div className="flex items-center bg-[--bgGradientEnd] border border-[--borderColor] rounded overflow-hidden">
              <div className="flex-1 overflow-x-auto whitespace-nowrap hide-scrollbar py-2 px-3">
                <code className="font-mono custom-font-size text-[--textColor]">
                  {visibleParams[key] ? value : "•".repeat(value.length)}
                </code>
              </div>
              <div className="flex items-center border-l border-[--borderColor] bg-[--bgGradientEnd] px-2">
                <button
                  onClick={(e) => {
                    toggleParamVisibility(key);
                    handleIconClick(e);
                  }}
                  className="p-1 hover:bg-[--bgColor] rounded transition-colors"
                  aria-label={
                    visibleParams[key] ? `Hide ${key}` : `Show ${key}`
                  }
                >
                  {visibleParams[key] ? (
                    <FaEyeSlash className="w-4 h-4 text-[--textColor]" />
                  ) : (
                    <FaEye className="w-4 h-4 text-[--textColor]" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    copyToClipboard(value);
                    handleIconClick(e);
                  }}
                  className="p-1 hover:bg-[--bgColor] rounded transition-colors ml-1"
                  aria-label={`Copy ${key}`}
                >
                  <FaCopy className="w-4 h-4 text-[--textColor]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
