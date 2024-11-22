import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mimeDb from "mime-db";
import { isDev } from "./utils.js";
import { getPreloadPath } from "./pathResolver.js";
import { spawn } from "child_process";
import dotenv from "dotenv";
// import {updateElectronApp} from "update-electron-app"
import pkg from "electron-updater";

const { autoUpdater } = pkg;

let pythonProcess;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Get the filename and directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../../.env") });

let mainWindow: BrowserWindow;

// Function to create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      webSecurity: false,
      preload: getPreloadPath(),
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  pythonServer();

  if (!isDev()) {
    mainWindow.webContents.once("did-finish-load", () => {
      checkForUpdates();
    });
  }

  mainWindow.setMenu(null);
}

function checkForUpdates() {
  autoUpdater.checkForUpdatesAndNotify();
}

// autoUpdater.on("update-not-available", () => {
//   dialog.showMessageBoxSync({
//     type: "info",
//     buttons: ["OK"],
//     title: "No Updates",
//     message: "Your application is up to date.",
//   });
// });

autoUpdater.on("update-available", () => {
  // Show a message box to ask the user if they want to download the update
  const response = dialog.showMessageBoxSync({
    type: "question",
    buttons: ["Download", "Later"],
    title: "Update Available",
    message: "A new update is available. Do you want to download it now?",
  });
});

autoUpdater.on("update-downloaded", () => {
  const response = dialog.showMessageBoxSync({
    type: "question",
    buttons: ["Restart", "Later"],
    title: "Update Ready",
    message:
      "An update has been downloaded. Restart the application to apply it?",
  });

  if (response === 0) {
    autoUpdater.quitAndInstall();
  }
});

// Handle errors
autoUpdater.on("error", (err) => {
  dialog.showMessageBox({
    type: "error",
    title: "Update Failed",
    message: "There was an error checking for updates. Please try again later.",
  });
});

// Handle the 'openExternalLink' IPC event
ipcMain.handle("open:externalLink", async (event, url: string) => {
  try {
    await shell.openExternal(url);
    return "success";
  } catch (error) {
    throw new Error("Failed to open URL");
  }
});

// Handle the 'dialog:openFile' IPC event
ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "All Files", extensions: ["*"] }],
  });
  return result.filePaths;
});

function getMimeTypeFromExtension(fileExt: string): string | null {
  if (fileExt === "ts" || fileExt === "tsx") {
    return "text/typescript";
  }

  if (fileExt === "py") {
    return "text/x-python";
  }

  if (fileExt === "md") {
    return "text/markdown";
  }

  if (fileExt === "csv") {
    return "text/csv";
  }

  if (fileExt === "yaml" || fileExt === "yml") {
    return "text/yaml";
  }

  if (fileExt === "log") {
    return "text/plain";
  }

  if (fileExt === "sh") {
    return "application/x-shellscript";
  }

  const mimeData = [];

  for (const [mimeType, data] of Object.entries(mimeDb)) {
    if (
      data.extensions &&
      Array.isArray(data.extensions) &&
      data.extensions.includes(fileExt)
    ) {
      mimeData.push({
        mimeType: mimeType,
        extensions: data.extensions,
      });
    }
  }

  return mimeData.length > 0 ? mimeData[0].mimeType : null;
}

function getMimeType(filePath: string): string | null {
  const fileExt = path.extname(filePath).slice(1);

  const mimeType = getMimeTypeFromExtension(fileExt);

  return mimeType;
}
// Handle the 'file:read' IPC event
ipcMain.handle("file:read", async (event, filePath: string) => {
  const mime_type = getMimeType(filePath);
  if (
    mime_type &&
    (mime_type.startsWith("text/") ||
      mime_type === "application/javascript" ||
      mime_type === "application/json" ||
      mime_type === "application/typescript" ||
      mime_type === "text/javascript" ||
      mime_type === "text/x-typescript" ||
      mime_type === "text/typescript" ||
      mime_type === "text/x-python" ||
      mime_type === "text/markdown" ||
      mime_type === "text/csv" ||
      mime_type === "text/x-shellscript" ||
      mime_type === "text/plain" ||
      mime_type === "text/yaml")
  ) {
    try {
      const content = await fs.readFile(filePath, "utf8");
      return content;
    } catch (error) {
      throw new Error("Failed to read file: " + error.message);
    }
  } else {
    throw new Error(
      `Selected file is not a text file. MIME type: ${mime_type}`
    );
  }
});

// Handle the 'file:save' IPC event
ipcMain.handle(
  "file:save",
  async (event, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, "utf8");
    } catch (error) {
      throw new Error("Failed to save file: " + error.message);
    }
  }
);

// Handle the 'file:create' IPC event
ipcMain.handle(
  "file:create",
  async (event, fileName: string, content: string, currentDir: string) => {
    const filePath = path.join(currentDir, fileName);

    try {
      await fs.writeFile(filePath, content, "utf8");
      return filePath;
    } catch (error) {
      throw new Error("Failed to save file: " + error.message);
    }
  }
);

app.whenReady().then(createWindow);

function pythonServer() {
  let backendExecutablePath;

  if (isDev()) {
    if (process.platform === "win32") {
      backendExecutablePath = path.join(
        __dirname,
        "../backend/dist/mainSave.exe"
      );
    } else if (process.platform === "darwin") {
      backendExecutablePath = path.join(
        __dirname,
        "../backend/dist/macOS/mainSave"
      );
    } else {
      backendExecutablePath = path.join(
        __dirname,
        "../backend/dist/linux/mainSave"
      );
    }
  } else {
    if (process.platform === "win32") {
      backendExecutablePath = path.join(
        app.getAppPath(),
        "..",
        "backend",
        "mainSave.exe"
      );
    } else if (process.platform === "darwin") {
      backendExecutablePath = path.join(
        app.getAppPath(),
        "..",
        "backend",
        "mainSave"
      );
    } else {
      backendExecutablePath = path.join(
        app.getAppPath(),
        "..",
        "backend",
        "mainSave"
      );
    }
  }

  const env = {
    ...process.env,
  };

  pythonProcess = spawn(backendExecutablePath, [], { shell: true, env });

  pythonProcess.stdout.on("data", (data) => {});

  pythonProcess.stderr.on("data", (data) => {});
}

// Ensure localStorage is cleared when app is closed or quitting
app.on("before-quit", async (event) => {
  if (mainWindow && mainWindow.webContents) {
    try {
      await mainWindow.webContents.executeJavaScript(`
        localStorage.removeItem('activeTabId');
        localStorage.removeItem('tabs');
      `);
    } catch (err) {
      console.error("Error during pre-quit cleanup:", err);
    }
  }

  if (pythonProcess && !pythonProcess.killed) {
    pythonProcess.kill();
  }
});

// Event handler for when all windows are closed
app.on("window-all-closed", async () => {
  if (mainWindow && mainWindow.webContents) {
    try {
      await mainWindow.webContents.executeJavaScript(`
        localStorage.removeItem('activeTabId');
        localStorage.removeItem('tabs');
      `);
    } catch (err) {
      console.error("Error removing localStorage:", err);
    }
  }

  if (pythonProcess && !pythonProcess.killed) {
    pythonProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
