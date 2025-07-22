import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider } from "./context/themeContext";
import "./styles/global.css";
import { ModalProvider } from "./context/modalContext";
import { ActiveSplitScreenProvider } from "./context/activeSplitScreenId";
import KeybaordContextProvider from "./context/keyboardContext";
import { ShortcutContextProvider } from "./context/shortCutContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ShortcutContextProvider>
    <KeybaordContextProvider>
      <ActiveSplitScreenProvider>
        <ThemeProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </ThemeProvider>
      </ActiveSplitScreenProvider>
    </KeybaordContextProvider>
    </ShortcutContextProvider>
  </React.StrictMode>
);

reportWebVitals();
