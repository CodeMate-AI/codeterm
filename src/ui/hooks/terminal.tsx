import { useCallback, useEffect, useState } from "react";
import { TerminalHistory, TerminalHistoryItem } from "../types/terminalTypes";

// Custom hook for managing terminal history state
export const useTerminal = () => {
  // State to hold the terminal history
  const [history, setHistory] = useState<TerminalHistory>([]);

  // Function to add a new item to the terminal history
  const pushToHistory = useCallback((item: TerminalHistoryItem) => {
    setHistory((oldHistory) => [...oldHistory, item]);
  }, []);

  // Function to reset the terminal history
  const resetTerminal = useCallback(() => {
    setHistory([]);
  }, []);

  // Return the terminal history and functions to manipulate it
  return {
    history, // The current terminal history
    pushToHistory, // Function to add an item to the history
    resetTerminal, // Function to reset the history
  };
};
