import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { shortcutContext } from "./shortCutContext";

type keyboardContextType = {
  keys: Set<string>;
};

const initialValue: keyboardContextType = {
  keys: new Set(),
};

const keyboardContext = createContext<keyboardContextType>(initialValue);

const KeybaordContextProvider = ({ children }: { children: ReactNode }) => {
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const {triggerListener} = useContext(shortcutContext)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const newKeys = new Set([...Array.from(keys), e.key.toLocaleLowerCase()])

    triggerListener(newKeys)
    setKeys(newKeys);
    // console.log("down ", e.key);
  },[keys, triggerListener])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const newKeys = new Set([...Array.from(keys).filter((k) => k !== e.key.toLocaleLowerCase())])
    setKeys(newKeys);
    // console.log("up ", e.key);
  },[keys])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup function to remove the event listeners on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // console.log("keys", keys)
  
  return (
    <keyboardContext.Provider value={{ keys }}>
      {children}
    </keyboardContext.Provider>
  );
};

export default KeybaordContextProvider;
