import React, { createContext, useContext, useState } from 'react';

// Create a context for the active split screen
const ActiveSplitScreenContext = createContext<{
  activeSplitScreenId: string | null;
  setActiveSplitScreenId: (id: string | null) => void;
}>({
  activeSplitScreenId: null,
  setActiveSplitScreenId: () => {},
});

// Provider component to wrap your app
export const ActiveSplitScreenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSplitScreenId, setActiveSplitScreenId] = useState<string | null>(null);

  return (
    <ActiveSplitScreenContext.Provider value={{ activeSplitScreenId, setActiveSplitScreenId }}>
      {children}
    </ActiveSplitScreenContext.Provider>
  );
};

// Custom hook to use the context
export const useActiveSplitScreen = () => useContext(ActiveSplitScreenContext);
