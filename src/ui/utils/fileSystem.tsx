// fileSystemUtils.ts

export type FileSystemItem = {
    mode: string;
    name: string;
    isDirectory: boolean;
    lastWriteTime: string;
    length: string;
  };
  
  export const parseDirectoryListing = (
    output: string,
    platform: string
  ): FileSystemItem[] => {
    let fileSystemItems: FileSystemItem[] = [];
  
    switch (platform.toLowerCase()) {
      case "windows":
        fileSystemItems = parseWindowsDirectoryListing(output);
        break;
  
      case "linux":
      case "macos":
        fileSystemItems = parseUnixDirectoryListing(output);
        break;
  
      default:
        throw new Error("Unsupported platform");
    }
  
    return fileSystemItems;
  };
  
  const parseWindowsDirectoryListing = (output: string): FileSystemItem[] => {
    const lines = output.trim().split("\n");
  
    if (lines.length < 3) {
      return [];
    }
  
    const dataLines = lines.slice(3); // Skip header lines
  
    return dataLines.map((line) => {
      const parts = line.split(/\s+/);
      const mode = parts[0];
      const date = parts[1];
      const time = parts[2];
      const length = /^\d+$/.test(parts[3]) ? parts[3] : "";
      const nameParts = length ? parts.slice(4) : parts.slice(3);
      const isDirectory = mode.startsWith("d") || parts.includes("<DIR>");
  
      return {
        mode,
        name: nameParts.join(" "),
        isDirectory,
        lastWriteTime: `${date} ${time}`,
        length,
      };
    });
  };
  
  const parseUnixDirectoryListing = (output: string): FileSystemItem[] => {
    const lines = output.trim().split("\n");
  
    if (lines.length === 0) {
      return [];
    }
  
    const dataLines = lines.filter((line) => line && !line.startsWith("total"));
  
    return dataLines.map((line) => {
      const parts = line.split(/\s+/);
      const mode = parts[0];
      const lastWriteTime = `${parts[5]} ${parts[6]} ${parts[7]}`;
      const length = parts[4];
      const name = parts.slice(8).join(" ");
      const isDirectory = mode.startsWith("d");
  
      return {
        mode,
        name,
        isDirectory,
        lastWriteTime,
        length,
      };
    });
  };
  