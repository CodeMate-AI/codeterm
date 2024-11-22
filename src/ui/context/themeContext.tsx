import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSocket } from "../hooks/useSocket";

type ThemeContextType = {
  theme: string;
  toggleTheme: (newTheme: string) => void;
  toggleThemeToRemoveCustomColor: (newTheme: string) => void;
  customColors: Record<string, string> | null;
  applyCustomColors: (colors: Record<string, string>) => void;
  setTheme: (newTheme: string) => void;
  allThemes: string[];
  setAllThemes: React.Dispatch<React.SetStateAction<string[]>>;
  addTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const defaultThemes: string[] = [
  "codemate-ai-dark",
  "codemate-ai-light",
  "modern-terminal",
  "dracula",
  "gruvbox-dark",
];

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { socket, isConnected } = useSocket("http://127.0.0.1:5000/");

  const [allThemes, setAllThemes] = useState<string[]>(defaultThemes);

  const loadThemes = (): string[] => {
    const storedThemes = localStorage.getItem("themes");
    return storedThemes ? JSON.parse(storedThemes) : defaultThemes;
  };

  useEffect(() => {
    const getTheme = localStorage.getItem("theme");

    if (getTheme) {
      document.documentElement.classList.remove(`${theme}-theme`);
      document.documentElement.classList.add(`${getTheme}-theme`);
      setTheme(getTheme);
    } else {
      setTheme("codemate-ai-dark");
    }
  }, []);

  const addTheme = (theme: string) => {
    if (!theme) return;

    const updatedThemes = [...allThemes, theme];
    setAllThemes(updatedThemes);
    localStorage.setItem("themes", JSON.stringify(updatedThemes));
  };

  useEffect(() => {
    const initialThemes = loadThemes();
    setAllThemes(initialThemes);
  }, []);

  const [allPresentThemes, setAllPresentThemes] = useState<string[]>([
    "codemate-ai-dark",
    "codemate-ai-light",
  ]);
  const [theme, setTheme] = useState<string>("");
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedColors = JSON.parse(
      localStorage.getItem("customColors") || "null"
    );
    if (savedColors) {
      setCustomColors(savedColors);
      applyCustomColors(savedColors);
    }
  }, []);

  useEffect(() => {
    const getTheme = localStorage.getItem("theme");
    if (getTheme) {
      setTheme(getTheme);
    } else {
      setTheme("codemate-ai-dark");
    }
  }, []);

  const applyCustomColors = (colors: Record<string, string>) => {
    const root = document.documentElement;
    Object.keys(colors).forEach((key) => {
      root.style.setProperty(`--${key}`, colors[key]);
    });
    setCustomColors(colors);
    localStorage.setItem("customColors", JSON.stringify(colors));
  };

  const removeCustomColors = () => {
    const root = document.documentElement;
    Object.keys(customColors).forEach((key) => {
      root.style.removeProperty(`--${key}`);
    });
    setCustomColors({});
    localStorage.removeItem("customColors");
  };

  const toggleThemeToRemoveCustomColor = (newTheme: string) => {
    document.documentElement.classList.remove(`${theme}-theme`);
    if (!allPresentThemes.includes(newTheme)) {
      socket?.emit("get_theme", { themeName: newTheme });

      socket?.on("themeRetrieved", (newTheme) => {
        const flattenedColors = newTheme.colors as unknown as Record<
          string,
          string
        >;
        applyCustomColors(flattenedColors);
      });
    } else {
      removeCustomColors();
    }

    document.documentElement.classList.add(`${newTheme}-theme`);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // removeHtmlStyles();
  };
  const toggleTheme = (newTheme: string) => {
    document.documentElement.classList.remove(`${theme}-theme`);

    document.documentElement.classList.add(`${newTheme}-theme`);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    // removeHtmlStyles();
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        toggleThemeToRemoveCustomColor,
        customColors,
        applyCustomColors,
        setTheme,
        allThemes,
        setAllThemes,
        addTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
