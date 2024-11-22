
declare global {
  interface Window {
      electron: {
          openFile: () => Promise<string[]>;
          readFile: (filePath: string) => Promise<string>;
      };
  }
}

export {};