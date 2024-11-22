import React from "react";
import { FaInfoCircle } from "react-icons/fa";

interface ToggleSwitchProps {
  label: string;
  isChecked: boolean;
  onChange: () => void;
  info?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  isChecked,
  onChange,
  info,
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <span className="custom-font-size">{label}</span>
        {info && <FaInfoCircle size={16} className="ml-1 text-[--textColor]" />}
      </div>
      <button
        className={`w-10 h-6 rounded-full p-1 ${
          isChecked ? "bg-[--blueColor]" : "bg-[--grayColor]"
        }`}
        onClick={onChange}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
            isChecked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
};
