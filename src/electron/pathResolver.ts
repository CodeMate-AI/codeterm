import path from "path";
import { app } from "electron";
import { isDev } from "./utils.js";

// Function to get the path to the preload script
export function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    isDev() ? "." : "..",
    "/dist-electron/preload.cjs"
  );
}

// Function to get the path to the UI (index.html)
export function getUIPath() {
  return path.join(app.getAppPath(), "/dist-react/index.html");
}

// Function to get the path to the assets directory
export function getAssetPath() {
  return path.join(app.getAppPath(), isDev() ? "." : "..", "/src/assets");
}

export function getPreviewPath() {
  return path.join(app.getAppPath(), "/dist-react/preview.html");
}
