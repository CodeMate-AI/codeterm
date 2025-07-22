import { createContext, ReactNode, useContext, useState, useCallback } from "react";

type ShortcutContextType = {
  registerListener: (shortcutKey: Set<string>, eventHandler: () => void) => void;
  removeListener: (shortcutKey: Set<string>) => void;
  triggerListener: (shortcutKey: Set<string>) => void;
};

const initialValue: ShortcutContextType = {
  registerListener: () => {},
  removeListener: () => {},
  triggerListener: () => {},
};

export const shortcutContext = createContext<ShortcutContextType>(initialValue);

const buildShortcutIndex = (keys: Set<string>) => Array.from(keys).join('+');

const ShortcutContextProvider = ({ children }: { children: ReactNode }) => {

  const [listeners, setListeners] = useState<Map<string, () => void>>(new Map());

  const registerListener = useCallback((shortcutKey: Set<string>, eventHandler: () => void) => {
    const keyString = buildShortcutIndex(shortcutKey);
    setListeners((prevListeners) => new Map(prevListeners).set(keyString, eventHandler));
  }, []);
  

  const removeListener = useCallback((shortcutKey: Set<string>) => {
    listeners.delete(buildShortcutIndex(shortcutKey))
  }, []);

  const triggerListener = useCallback((shortcutKey: Set<string>) => {
    const keyString = listeners.get(buildShortcutIndex(shortcutKey))
    if(keyString) keyString()
  }, [listeners]);

  return (
    <shortcutContext.Provider value={{ registerListener, removeListener, triggerListener }}>
      {children}
    </shortcutContext.Provider>
  );
};

const useShortcutContext = () => {
  const context = useContext(shortcutContext);
  if (!context) {
    throw new Error("useShortcutContext must be used within a ShortcutContextProvider");
  }
  return context;
};

export { ShortcutContextProvider, useShortcutContext };
