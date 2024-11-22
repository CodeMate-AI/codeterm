import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context value
interface ModalContextType {
  isLeftSliderOpen: boolean;
  openLeftSlider: () => void;
  closeLeftSlider: () => void;
}

// Create a context with a default value of `null` (for TypeScript to infer the type)
const ModalContext = createContext<ModalContextType | null>(null);

// Define the props for the ModalProvider component
interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isLeftSliderOpen, setIsLeftSliderOpen] = useState<boolean>(false);

  const openLeftSlider = () => setIsLeftSliderOpen(true);
  const closeLeftSlider = () => setIsLeftSliderOpen(false);

  return (
    <ModalContext.Provider
      value={{ isLeftSliderOpen, openLeftSlider, closeLeftSlider }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// Create a custom hook to use the ModalContext
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === null) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
