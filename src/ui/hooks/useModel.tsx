import { useState } from "react";

// Custom hook to manage the state of different modals and sliders
export const useModal = () => {
  // State to manage the visibility of the settings modal
  const [isSettingModelOpen, setIsSettingModelOpen] = useState<boolean>(false);

  // State to manage the visibility of the left slider
  const [isLeftSliderOpen, setIsLeftSliderOpen] = useState<boolean>(false);

  // State to manage the visibility of the right slider theme
  const [isRightSliderThemeOpen, setIsRightSliderThemeOpen] =
    useState<boolean>(false);

  // State to manage the visibility of a second modal
  const [isOpen2, setIsOpen2] = useState<boolean>(false);

  // State to manage the visibility of a third modal
  const [isOpen3, setIsOpen3] = useState<boolean>(false);

  // Function to open the settings modal
  const openSettingModal = (): void => setIsSettingModelOpen(true);

  // Function to close the settings modal
  const closeSettingModal = (): void => setIsSettingModelOpen(false);

  // Function to open the left slider
  const openLeftSlider = (): void => setIsLeftSliderOpen(true);

  // Function to close the left slider
  const closeLeftSlider = (): void => setIsLeftSliderOpen(false);

  // Function to open the right slider theme
  const openRightSliderTheme = (): void => setIsRightSliderThemeOpen(true);

  // Function to close the right slider theme
  const closeRightSliderTheme = (): void => setIsRightSliderThemeOpen(false);

  // Function to open the second modal
  const openModal2 = (): void => setIsOpen2(true);

  // Function to close the second modal
  const closeModal2 = (): void => setIsOpen2(false);

  // Function to open the third modal
  const openModal3 = (): void => setIsOpen3(true);

  // Function to close the third modal
  const closeModal3 = (): void => setIsOpen3(false);

  // Return the state and functions to manage the visibility of modals and sliders
  return {
    isSettingModelOpen, // Boolean state to check if settings modal is open
    isLeftSliderOpen, // Boolean state to check if left slider is open
    isRightSliderThemeOpen, // Boolean state to check if right slider theme is open
    openLeftSlider, // Function to open the left slider
    closeLeftSlider, // Function to close the left slider
    openRightSliderTheme, // Function to open the right slider theme
    closeRightSliderTheme, // Function to close the right slider theme
    isOpen2, // Boolean state to check if second modal is open
    isOpen3, // Boolean state to check if third modal is open
    openSettingModal, // Function to open the settings modal
    closeSettingModal, // Function to close the settings modal
    openModal2, // Function to open the second modal
    closeModal2, // Function to close the second modal
    openModal3, // Function to open the third modal
    closeModal3, // Function to close the third modal
  };
};
