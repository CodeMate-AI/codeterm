const { contextBridge, ipcRenderer } = require("electron");

// Expose a limited API to the renderer process
contextBridge.exposeInMainWorld("electron", {
  // Function to open a file dialog and return the selected file paths
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  // Function to read the content of a file
  readFile: (filePath: string) => ipcRenderer.invoke("file:read", filePath),
  // Function to save content to a file
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke("file:save", filePath, content),
  // Function to create a new file with the specified content in the current directory
  createFile: (fileName: string, content: string, currentDir: string) =>
    ipcRenderer.invoke("file:create", fileName, content, currentDir),
  // Function to open an external link in the default browser
  openExternalLink: (url: string) =>
    ipcRenderer.invoke("open:externalLink", url),
});
