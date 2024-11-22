import React from "react";
import { useTheme } from "../../../context/themeContext";
import { IoChevronDown } from "react-icons/io5";

const ThemeSwitcher = () => {
  const { allThemes, theme, toggleThemeToRemoveCustomColor } = useTheme();

  return (
    <div className="mb-6">
      <label
        htmlFor="theme-select"
        className="block custom-font-size font-medium text-[--textColor] mb-2"
      >
        Select Theme
      </label>
      <div className="relative">
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => toggleThemeToRemoveCustomColor(e.target.value)}
          className="block w-full bg-[--bgColor] border-[--borderColor] rounded-md py-2 pl-3 pr-10 text-[--textColor] focus:outline-none focus:ring-1 focus:ring-[--blueColor] focus:border-[--blueColor] sm:custom-font-size appearance-none hide-scrollbar max-h-[100px] overflow-auto"
        >
          {allThemes.map((theme) => (
            <option key={theme} value={theme}>
              {theme.replace("-", " ")}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[--textColor]">
          <IoChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
