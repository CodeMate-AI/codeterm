import React, { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiMessageCircle,
  FiCopy,
  FiCheck,
  FiFolder,
  FiLoader,
} from "react-icons/fi";
import EnhancedMarkdown from "../../common/enhancedMarkdown";
import { detectOS } from "../../utils/detectOS";
import extractCodeBlocks from "../../utils/extractedCode";

import Convert from "ansi-to-html";
import {
  CodeBlock,
  Directory,
  FileSystemItem,
  Message,
  TerminalProps,
} from "../../types/terminalTypes";
import { useTabs } from "../../hooks/useTab";
import { parseDirectoryListing } from "../../utils/fileSystem";

// Creating an instance of the Convert class
const convert = new Convert();

interface ElectronAPI {
  openFile: () => Promise<string[]>;
  readFile: (filePath: string) => Promise<string>;
  saveFile: (filePath: string, content: string) => Promise<void>;
  createFile: (
    fileName: string,
    content: string,
    currentDir: string
  ) => Promise<string>;
  openExternalLink: (url: string) => Promise<string>;
}

// Declare the global window object to include the ElectronAPI
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

// Define a debounce delay constant
const DEBOUNCE_DELAY = 300;

// Define the Terminal component
export const Terminal: React.FC<TerminalProps> = ({
  socket,
  isConnected,
  terminalId,
  tabId,
  content,
  addTerminalData,
  onFileSelect,
  handleCreateFile,
  clearTerminalData,
  onShowPreview,
}) => {
  // Destructure the useTabs hook to get and set the sudo password
  const { setSudoPasswordTab, getIsSudoPassword, getSudoPassword } = useTabs();

  // Define references for various DOM elements
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Define state variables for managing terminal state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [input, setInputValue] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [suggestion, setSuggestion] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedCommands, setCopiedCommands] = useState<{
    [key: string]: boolean;
  }>({});
  const [promptLabel, setPromptLabel] = useState<string>("starting bash... ");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [fileCode, setFileCode] = useState<string>("");
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [interactiveOutput, setInteractiveOutput] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const [isPasswordPromptOpen, setIsPasswordPromptOpen] =
    useState<boolean>(false);
  const [sudoPassword, setSudoPassword] = useState<string>("");
  const [previousCmd, setPreviousCmd] = useState<string>("");
  const [prompt, setPrompt] = useState<boolean>(false);

  const [isSudoCommandExecuting, setIsSudoCommandExecuting] =
    useState<boolean>(false);
  const [aiInputValue, setAiInputValue] = useState<string>("");

  const outputRef = useRef<HTMLPreElement>(null);
  const [selectedContext, setSelectedContext] = useState<Message[]>([]);

  const [showDirectoryList, setShowDirectoryList] = useState<boolean>(true);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Detect the operating system
  const platform = detectOS();
  let filePromptLabel = "Enter filename:";

  // Scroll to the bottom of the output when interactiveOutput changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [interactiveOutput]);

  // Ensure selected item is visible in the list when selectedIndex changes
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

  // Handle the F10 key click to end interactive mode
  const handleF10Click = () => {
    if (isInteractiveMode) {
      socket.emit("interactive_end_f10", { terminal_id: terminalId });
      setIsInteractiveMode(false);
      setInteractiveOutput("");
    }
  };

  // Request the current directory when the tabId changes
  useEffect(() => {
    if(!Socket || !isConnected) return ;
    socket.emit("getCurrentDirectory", { terminal_id: terminalId });
  }, [tabId, socket, isConnected]);

  // Add event listener for Ctrl+I keypress to toggle agenting mode
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key === "i") {
        event.preventDefault();
        toggleMode();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // Toggle the prompt mode
  const toggleMode = () => {
    setPrompt((prevPrompt) => !prevPrompt);
  };

  const handleShowCodePreview = async (codeBlocks: CodeBlock[]) => {
    onShowPreview(codeBlocks);
  };

  // Add event listener for Ctrl+Shift+Alt keypress to focus input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.altKey) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // Clear suggestion when input changes
  useEffect(() => {
    if (input.length === 0) {
      setSuggestion("");
    }
  }, [input, suggestion]);

  // Add a message to the terminal
  const addMessage = useCallback(
    (
      text: React.ReactNode,
      type: "error" | "success" | "nlp",
      current_cmd: string,
      commands?: string[],
      fileSystem?: FileSystemItem[],
      isStreaming: boolean = false
    ) => {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const newMessage: Message = {
        id: Date.now(),
        text,
        type,
        timestamp,
        current_cmd,
        commands,
        fileSystem,
        isStreaming,
      };

      setMessages((prevMessages) => [newMessage, ...prevMessages]);

      const newTerminalData: TerminalData = {
        inputCmd: current_cmd,
        output: String(text),
        status: type,
        timestamp,
      };

      addTerminalData(tabId, terminalId, newTerminalData);
    },
    [tabId, terminalId, addTerminalData]
  );

  const fetchTerminalHistory = useCallback(async () => {
    if (!socket) return;
    socket.emit("get_history");
    socket.once("history", (data) => {
      if (data.error) {
        console.error("Error fetching terminal history:", data.error);
        return;
      }
      const { history_cmd } = data;
      setTerminalHistory(history_cmd);
    });
  }, [socket]);

  // Copy a command to the clipboard
  const copyCommand = useCallback((command: string) => {
    navigator.clipboard.writeText(command).then(() => {
      setInputValue(command);
      inputRef.current?.focus();
      setCopiedCommands((prev) => ({ ...prev, [command]: true }));
      setTimeout(() => {
        setCopiedCommands((prev) => ({ ...prev, [command]: false }));
      }, 2000);
    });
  }, []);

  // Execute a command in the terminal
  const executeCommand = useCallback(
    (command: string) => {
      setStreamingContent("");
      setInputValue("");
      if (!socket) return;

      const contextContent = selectedContext.map((msg) => ({
        role: msg.type === "nlp" ? "assistant" : "user",
        content: msg.current_cmd + "\n" + msg.text,
      }));

      const isContext = selectedContext.length > 0;

      const lastMessages = messages.slice(5).map((msg) => ({
        role: msg.type === "nlp" ? "assistant" : "user",
        command: msg.current_cmd,
        content: msg.text,
      }));

      socket.emit("exec", {
        terminal_id: terminalId,
        input: command,
        prompt: true,
        isContext: isContext,
        isTerminal: true,
        lastTerminalMessages: lastMessages,
        context: isContext ? contextContent : undefined,
      });

      setTerminalHistory((prev) => [...prev, command]);
    },
    [socket, terminalId, selectedContext]
  );

  // Handle file system item click
  const handleFileSystemItemClick = useCallback(
    (item: FileSystemItem) => {
      if (item.isDirectory) {
        const command = `cd ${item.name}`;
        // Execute commands if it's a directory
        setInputValue(command);
        if (socket && isConnected) {
          socket.emit("exec", { terminal_id: terminalId, input: command });
          socket.emit("getCurrentDirectory", { terminal_id: terminalId });
          setInputValue("");
        }
        inputRef.current?.focus();
      } else {
        let filePath;

        switch (platform.toLowerCase()) {
          case "windows":
            filePath = `${promptLabel}\\${item.name}`;
            break;

          case "linux":
          case "macos":
            filePath = `${promptLabel}/${item.name}`;
            break;

          default:
            throw new Error("Unsupported platform");
        }
        onFileSelect(filePath);
      }
    },
    [socket, isConnected, terminalId, promptLabel, onFileSelect]
  );

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [terminalId]);

  // Handle interactive mode events
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleInteractiveStart = (data: {
      terminal_id: string;
      command: string;
    }) => {
      if (data.terminal_id === terminalId) {
        setIsInteractiveMode(true);
        setInteractiveOutput("");
      }
    };

    const handleInteractiveOutput = (data: {
      terminal_id: string;
      output: string;
    }) => {
      if (data.terminal_id === terminalId) {
        setIsLoading(false);
        const finalOutput = convert.toHtml(data.output);
        setInteractiveOutput((prev) => prev + finalOutput);
      }
    };

    const handleInteractiveEnd = (data: { terminal_id: string }) => {
      if (data.terminal_id === terminalId) {
        setIsInteractiveMode(false);
        setInteractiveOutput("");
        socket.emit("interactive_end_f10", { terminal_id: terminalId });
      }
    };

    socket.on("interactive_start", handleInteractiveStart);
    socket.on("interactive_output", handleInteractiveOutput);
    socket.on("interactive_end", handleInteractiveEnd);

    return () => {
      socket.off("interactive_start", handleInteractiveStart);
      socket.off("interactive_output", handleInteractiveOutput);
      socket.off("interactive_end", handleInteractiveEnd);
    };
  }, [socket, isConnected, terminalId, addMessage, interactiveOutput]);

  const handleInteractiveInput = useCallback(
    (input: string) => {
      if (socket && isConnected) {
        socket.emit("interactive_input", { terminal_id: terminalId, input });
        if (input === ":wq") {
          setIsInteractiveMode(false);
          setInteractiveOutput("");
        }
      }
    },
    [socket, isConnected, terminalId]
  );

  /**
 * useEffect hook to automatically scroll the history container to the bottom
 * whenever the terminal history or showHistory state changes.
 *
 * Dependencies: [terminalHistory, showHistory]
 */
  useEffect(() => {
    if (historyRef.current && showHistory) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [terminalHistory, showHistory]);

  /**
 * useEffect hook to automatically scroll the messages container to the top
 * whenever the messages state changes.
 *
 * Dependencies: [messages]
 */
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  /**
 * Function to simulate a key press event for the "Ctrl + ," key combination.
 * This creates a new KeyboardEvent and dispatches it to the document.
 */
  function simulateKeyPress() {
    const ctrlKey = new KeyboardEvent("keydown", {
      key: ",",
      code: "Comma",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(ctrlKey);
  }

  useEffect(() => {
    if(!socket || !isConnected) return ;
    const handleSuccessSudoPassword = (data: {
      terminal_id: string;
      password: string;
    }) => {
      if (data.terminal_id === terminalId) {
        if (!getIsSudoPassword(tabId)) {
          setSudoPasswordTab(tabId, data.password);
        }
      }
    };
    socket.on("success_sudo_password", handleSuccessSudoPassword);
    return () => {
      socket.off("success_sudo_password", handleSuccessSudoPassword);
    };
  }, [tabId, terminalId, getIsSudoPassword, setSudoPasswordTab, socket, isConnected]);

  // Handle socket events for current directory and create session
  useEffect(() => {
    if (!socket || !isConnected) return;

    const storedTabs = JSON.parse(
      localStorage.getItem("tabs") || "[]"
    ) as TabData[];
    const currentTab = storedTabs.find((tab) => tab.id === tabId);

    if (currentTab) {
      const terminalChild = currentTab.children.find(
        (child) => child.id === terminalId
      );
      if (terminalChild) {
        if (!terminalChild.curr_dir) {
          socket.emit("getCurrentDirectory", { terminal_id: terminalId });
        } else {
          setPromptLabel(terminalChild.curr_dir);
        }
      }
    }

    const handleCurrentDirectory = (data: {
      directory: string;
      terminal_id: string;
    }) => {
      if (data.terminal_id === terminalId) {
        if (currentTab) {
          const updatedChildren = currentTab.children.map((child) => {
            if (child.id === terminalId) {
              return { ...child, curr_dir: data.directory };
            }
            return child;
          });
          const updatedTab = { ...currentTab, children: updatedChildren };
          const updatedTabs = storedTabs.map((tab) =>
            tab.id === tabId ? updatedTab : tab
          );
          localStorage.setItem("tabs", JSON.stringify(updatedTabs));
        }

        setPromptLabel(data.directory);
      }
    };

    const handle_signUp_model = (data) => {
      if (data.terminal_id === terminalId) {
        simulateKeyPress();
        setIsLoading(false);
      }
    };

    const handleSessionStarted = () => {
      socket.emit("getCurrentDirectory", { terminal_id: terminalId });
    };

    socket.on("currentDirectory", handleCurrentDirectory);
    socket.on("session_started", handleSessionStarted);

    socket.on("require_signup_and_model_selection", handle_signUp_model);

    socket.emit("create_session", { terminal_id: terminalId });

    return () => {
      socket.off("currentDirectory", handleCurrentDirectory);
      socket.off("session_started", handleSessionStarted);
    };
    // }, [socket, terminalId, tabId, isConnected]);
  }, [socket, isConnected]);


  useEffect(() => {
    fetchTerminalHistory();
  }, [fetchTerminalHistory]);

  /**
 * useEffect hook to update the messages state whenever the content changes.
 * This hook maps over the content array and transforms each item into a message object
 * with properties such as id, text, type, timestamp, current_cmd, fileSystem, and isStreaming.
 * If the input command starts with "dir" or "ls", it parses the output to generate a file system structure.
 *
 * Dependencies: [content]
 */
  useEffect(() => {
    setMessages(
      content.map((item, index) => ({
        id: index,
        text: item.output,
        type: item.status,
        timestamp: item.timestamp,
        current_cmd: item.inputCmd,
        fileSystem:
          item.inputCmd.startsWith("dir") || item.inputCmd.startsWith("ls")
            ? parseDirectoryListing(item.output, platform)
            : undefined,
        isStreaming: false,
      }))
    );
  }, [content]);

  // Handle input change Handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setHistoryIndex(-1);
      setShowHistory(false);
      if (value.length === 0) {
        setSuggestion("");
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        socket?.emit("input", { input: value, terminal_id: terminalId });
      }, DEBOUNCE_DELAY);
    },
    [socket, terminalId]
  );
  const scrollToCurrentHistory = useCallback(() => {
    if (historyRef.current && historyIndex !== -1) {
      const currentItem = historyRef.current.children[
        terminalHistory.length - 1 - historyIndex
      ] as HTMLElement;
      if (currentItem) {
        historyRef.current.scrollTop =
          currentItem.offsetTop -
          historyRef.current.clientHeight / 2 +
          currentItem.clientHeight / 2;
      }
    }
  }, [historyIndex, terminalHistory.length]);

  // Handle creation of new code
  const onCreateCode = (code: string) => {
    setFileCode(code);
    setIsCreatingFile(true);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleTabCompletion = useCallback(() => {
    if (input.startsWith("cd ") && !showDirectoryList) {
      setShowDirectoryList(true);
      // fetchDirectories();
    }
  }, [input, showDirectoryList]);

  // Handle key down events for input
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        handleTabCompletion();
        return;
      }

      if (e.key === "Escape") {
        setShowDirectoryList(false);
        setShowHistory(false);
        return;
      }

      // if (showDirectoryList) {
      //   switch (e.key) {
      //     case "Escape":
      //       setShowDirectoryList(false);
      //       break;
      //     case "ArrowUp":
      //       e.preventDefault();
      //       setSelectedIndex(prev => (prev > 0 ? prev - 1 : directories.length - 1));
      //       return;
      //     case "ArrowDown":
      //       e.preventDefault();
      //       setSelectedIndex(prev => (prev < directories.length - 1 ? prev + 1 : 0));
      //       return;
      //     case "Enter":
      //       if (directories[selectedIndex]) {
      //         setInputValue(`cd ${directories[selectedIndex].name}`);
      //         setShowDirectoryList(false);
      //       }
      //       return;
      //   }
      // }

      if (isCreatingFile && socket) {
        if (e.key === "Enter") {
          e.preventDefault();
          const fileName = input.trim();
          if (fileName) {
            handleCreateFile(fileCode, fileName, promptLabel);
            setInputValue("");
            setIsCreatingFile(false);
            socket.emit("getCurrentDirectory", { terminal_id: terminalId });
          }
        }
        return;
      }
      switch (e.key) {
        case "Enter":
          if (socket && isConnected && input.trim()) {
            const commandToExecute = input.trim();
            const finalCommand = commandToExecute;

            const contextContent = selectedContext.map((msg) => ({
              role: msg.type === "nlp" ? "assistant" : "user",
              command: msg.current_cmd,
              content: msg.text,
            }));

            const lastMessages = messages.slice(-5).map((msg) => ({
              role: msg.type === "nlp" ? "assistant" : "user",
              command: msg.current_cmd,
              content: msg.text,
            }));

            const isSudoPassword = getIsSudoPassword(tabId);

            const isContext = selectedContext.length > 0;
            if (
              finalCommand === "clear" &&
              (platform === "Linux" || platform === "MacOS")
            ) {
              clearTerminalData(tabId, terminalId);
              setInputValue("");
              setSuggestion("");
              return;
            } else if (finalCommand === "cls" && platform === "Windows") {
              clearTerminalData(tabId, terminalId);
              setInputValue("");
              setSuggestion("");
              return;
            }
            if (commandToExecute.startsWith("sudo ") && !isSudoPassword) {
              setIsPasswordPromptOpen(true);
              setPreviousCmd(finalCommand);
              setInputValue("");
              setHistoryIndex(-1);
              setSuggestion("");
              setShowHistory(false);
              return;
            }
            if (isInteractiveMode) {
              handleInteractiveInput(finalCommand);
            }

            if (isPasswordPromptOpen) {
              setIsPasswordPromptOpen(false);
              socket.emit("exec", {
                terminal_id: terminalId,
                input: previousCmd,
                sudoPassword: finalCommand,
              });
              setIsSudoCommandExecuting(true);
              setIsLoading(true);
              setShowHistory(false);
              setInputValue("");
              setHistoryIndex(-1);
              setSuggestion("");
              return;
            } else {
              if (commandToExecute.startsWith("sudo ")) {
                setIsSudoCommandExecuting(true);
              }

              socket.emit("exec", {
                terminal_id: terminalId,
                input: finalCommand,
                sudoPassword: isSudoPassword
                  ? getSudoPassword(tabId)
                  : sudoPassword,
                prompt: prompt,
                isContext: isContext,
                isTerminal: true,
                lastTerminalMessages: lastMessages,
                context: isContext ? contextContent : undefined,
              });
            }
            setIsLoading(true);
            setIsAiThinking(true);
            socket.emit("getCurrentDirectory", { terminal_id: terminalId });
            setShowHistory(false);
            setTerminalHistory((prev) => [...prev, input]);
            setInputValue("");
            setHistoryIndex(-1);
            setSuggestion("");
          }

          break;

        case "ArrowUp":
          e.preventDefault();
          if (terminalHistory.length > 0) {
            if (!showHistory) {
              setShowHistory(true);
              setHistoryIndex(terminalHistory.length - 1);
              setInputValue(terminalHistory[terminalHistory.length - 1] || "");
            } else {
              setHistoryIndex((prevIndex) => {
                const newIndex = Math.max(prevIndex - 1, 0);
                setInputValue(terminalHistory[newIndex] || "");
                scrollToCurrentHistory();
                return newIndex;
              });
            }
          } else {
            setShowHistory(true);
          }
          break;

        case "ArrowDown":
          e.preventDefault();
          if (terminalHistory.length > 0) {
            if (showHistory) {
              if (historyIndex < terminalHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setInputValue(terminalHistory[newIndex] || "");
                setHistoryIndex(newIndex);
                scrollToCurrentHistory();
              } else {
                setHistoryIndex(-1);
                setInputValue("");
                setShowHistory(false);
              }
            }
          } else {
            setShowHistory(false);
          }
          break;

        case "ArrowRight":
          e.preventDefault();
          if (suggestion) {
            setInputValue(suggestion);
            setSuggestion("");
            inputRef.current?.focus();
          }
          break;

        default:
          break;
      }
    },
    [
      socket,
      isConnected,
      input,
      terminalId,
      terminalHistory,
      showHistory,
      historyIndex,
      suggestion,
      scrollToCurrentHistory,
      handleCreateFile,
      fileCode,
    ]
  );

  // Handle socket events for command output and suggestions
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleCommandOutput = (data: {
      output: string;
      status: "error" | "success" | "nlp";
      current_cmd: string;
      commands?: string[];
      terminal_id: string;
    }) => {
      if (data.terminal_id === terminalId) {
        setIsLoading(false);
        setIsSudoCommandExecuting(false);
        setIsAiThinking(false);
        const fileSystem =
          data.current_cmd.startsWith("dir") ||
          data.current_cmd.startsWith("ls")
            ? parseDirectoryListing(data.output, platform)
            : undefined;

        const finalOutput = convert.toHtml(data.output);

        addMessage(
          finalOutput,
          data.status,
          data.current_cmd,
          data.commands,
          fileSystem
        );
      }
    };

    const handleSuggestions = (data: {
      suggestions: string | string[];
      terminal_id: string;
    }) => {
      if (data.terminal_id === terminalId) {
        if (typeof data.suggestions === "string") {
          setSuggestion(data.suggestions);
        } else if (Array.isArray(data.suggestions)) {
          setSuggestion(data.suggestions.join(", "));
        } else {
          console.error("Unexpected data format:", data);
          setSuggestion("");
        }
      }
    };

    const handleTerminalCommand = (data: {
      terminal_id: string;
      output: string;
    }) => {
      if (data.terminal_id === terminalId) {
        setIsAiThinking(false);

        let cleanedOutput = data.output.trim();

        const regex = /^```([a-zA-Z]*)\n([\s\S]*)\n```$/;

        const match = cleanedOutput.match(regex);
        if (match) {
          cleanedOutput = match[2].trim();
        }
        const commands = cleanedOutput
          .split("\n")
          .filter((line) => line.trim() !== "");

        if (commands.length > 0) {
          setInputValue(commands[0]);
        } else {
          setInputValue(cleanedOutput);
        }

        setPrompt(false);
      }
    };

    socket.on("command_output", handleCommandOutput);
    socket.on("suggestions", handleSuggestions);
    socket.on("send_terminal_command", handleTerminalCommand);

    return () => {
      socket.off("command_output", handleCommandOutput);
      socket.off("suggestions", handleSuggestions);
    };
  }, [socket, isConnected, terminalId, addMessage]);

  // Handle socket events for streaming chunks and end
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleStreamingChunk = (data: {
      chunk: string;
      terminal_id: string;
      command: string;
    }) => {
      if (data.terminal_id === terminalId) {
        setIsStreaming(true);
        setIsAiThinking(false);
        setIsLoading(false);
        setStreamingContent((prev) => prev + data.chunk);
        setAiInputValue(data.command);
      }
    };

    const handleStreamingEnd = (data: {
      status: "error" | "success" | "nlp";
      output: string;
      current_cmd: string;
      terminal_id: string;
      commands?: string[];
    }) => {
      if (data.terminal_id === terminalId) {
        setAiInputValue("");
        setIsLoading(false);
        const fileSystem =
          data.current_cmd.startsWith("dir") ||
          data.current_cmd.startsWith("ls")
            ? parseDirectoryListing(streamingContent, platform)
            : undefined;

        addMessage(
          data.output,
          data.status,
          data.current_cmd,
          data.commands,
          fileSystem
        );

        const codeBlocks = extractCodeBlocks(streamingContent);

        if (codeBlocks.length > 0) {
          handleShowCodePreview(codeBlocks);
        }

        setStreamingContent("");
        setIsStreaming(false);
      }
    };

    socket.on("streaming_chunk", handleStreamingChunk);
    socket.on("streaming_end", handleStreamingEnd);

    return () => {
      socket.off("streaming_chunk", handleStreamingChunk);
      socket.off("streaming_end", handleStreamingEnd);
    };
  }, [
    socket,
    isConnected,
    terminalId,
    streamingContent,
    addMessage,
    handleShowCodePreview,
  ]);

  useEffect(() => {
    if (input.length === 0) {
      setSuggestion("");
    }
  }, [input]);

  /**
 * Toggles the selection state of a given message in the context.
 * If the message is already selected, it will be removed from the selected context.
 * If the message is not selected, it will be added to the selected context.
 *
 * @param {Message} message - The message object to be toggled in the selected context.
 */
  const toggleMessageSelection = useCallback((message: Message) => {
    setSelectedContext((prevContext) => {
      const isAlreadySelected = prevContext.some(
        (msg) => msg.id === message.id
      );
      if (isAlreadySelected) {
        return prevContext.filter((msg) => msg.id !== message.id);
      } else {
        return [...prevContext, message];
      }
    });
  }, []);

  // Handle creation of copy value
  const onCopyCode = () => {};
  return (
    <>
      <div className="custom-flex-grow-for-message-container flex pb-10 w-full h-full hide-scrollbar">
        {isAiThinking && prompt && (
          <div className="absolute bottom-11 left-4 right-0 bg-[--bgColor] p-2">
            <div className="flex items-center">
              <FiLoader className="animate-spin mr-2" />
              <span>AI is thinking...</span>
            </div>
          </div>
        )}

        {isSudoCommandExecuting && (
          <div className="absolute bottom-11 left-4 right-0 bg-[--bgColor] p-2">
            <div className="flex items-center">
              <FiLoader className="animate-spin mr-2" />
              <span>installing packages</span>
            </div>
          </div>
        )}

        <div
          ref={messagesContainerRef}
          className="overflow-auto flex flex-col-reverse hide-scrollbar w-full"
        >
          {isStreaming && (
            <div className="p-4 bg-opacity-50 bg-gradient-to-l from-[--bgGradientStart] to-[--scrollbarThumbColor] text-[--primaryTextColor] border-l-4 border-l-[--borderColor]">
              <div className="flex items-center mb-1">
                <FiMessageCircle
                  className="mr-2 text-[--darkBlueColor]"
                  size={18}
                />
                <span className="custom-font-size text-[--textColor]">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <span className="custom-font-size pt-2">{aiInputValue}</span>
              <EnhancedMarkdown
                markdownContent={streamingContent}
                onCopyCommand={copyCommand}
                onExecuteCommand={executeCommand}
                onCopyCode={onCopyCode}
                onCreateCode={onCreateCode}
                isStreaming={false}
              />
            </div>
          )}
          {messages
            .slice()
            .reverse()
            .map((message, index) => (
              <div
                key={message.id}
                className={`
        p-4 
        border-b-[1px] 
        border-t-[1px] 
        
        ${
          selectedContext.some((msg) => msg.id === message.id)
            ? "border-2 border-yellow-500"
            : "border-l-4 border-l-[--borderColor]"
        }
        ${
          message.type === "error"
            ? "bg-opacity-50 bg-gradient-to-l from-[--bgGradientStart] to-[--redColorGradientStart] text-[--primaryTextColor] border-l-4 border-l-[--darkRedColor]"
            : message.type === "success"
            ? "bg-opacity-10 text-[--primaryTextColor] border-l-4 border-l-[--darkGreenColor]"
            : "bg-opacity-50 bg-gradient-to-l from-[--bgGradientStart] to-[--scrollbarThumbColor] text-[--primaryTextColor] border-l-4 border-l-[--borderColor]"
        }
                  ${index === 0 && isAiThinking ? "mb-12" : ""}
                  ${index === 0 && isSudoCommandExecuting ? "mb-12" : ""}
                  

      `}
                onDoubleClick={() => {
                  if (prompt) {
                    toggleMessageSelection(message);
                  }
                }}
              >
                <div className="flex items-center mb-1">
                  {message.type === "error" && (
                    <FiAlertTriangle
                      className="mr-2 text-[--darkRedColor]"
                      size={18}
                    />
                  )}
                  {message.type === "success" && (
                    <FiCheckCircle
                      className="mr-2 text-[--darkGreenColor]"
                      size={18}
                    />
                  )}
                  {message.type === "nlp" && (
                    <FiMessageCircle
                      className="mr-2 text-[--darkBlueColor]"
                      size={18}
                    />
                  )}
                  <div className="flex h-full justify-center items-center">
                    <span className="custom-font-size text-[--textColor]">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
                <span className="custom-font-size pt-2">
                  {message.current_cmd}
                </span>
                {message.fileSystem ? (
                  // Check if it's a 'ls -l' command
                  message.current_cmd === "ls -l" ? (
                    <div className="font-mono custom-font-size p-4 rounded-lg overflow-x-auto whitespace-nowrap hide-scrollbar">
                      <table className="w-full">
                        <tbody>
                          {message.fileSystem.map((item, index) => (
                            <tr key={index} className="grid grid-cols-5">
                              <td className="pr-4 col-span-1">{item.mode}</td>
                              <td className="pr-4 col-span-2">
                                {item.lastWriteTime}
                              </td>
                              {/* <td className="pr-4 col-span-2">{item.length}</td> */}
                              <td
                                className="pr-4 col-span-2 cursor-pointer hover:text-[--textColor]"
                                onClick={() => handleFileSystemItemClick(item)}
                              >
                                {item.name}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="font-mono custom-font-size rounded-lg overflow-x-auto hide-scrollbar">
                      <div className="flex flex-wrap">
                        {message.fileSystem.map((item, index) => (
                          <div
                            key={index}
                            className="p-2 cursor-pointer hover:text-[--textColor]"
                            onClick={() => handleFileSystemItemClick(item)}
                          >
                            {item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : message.type === "nlp" ? (
                  <EnhancedMarkdown
                    markdownContent={String(message.text)}
                    onCopyCommand={copyCommand}
                    onExecuteCommand={executeCommand}
                    onCopyCode={onCopyCode}
                    onCreateCode={onCreateCode}
                    isStreaming={true}
                  />
                ) : (
                  <pre
                    className="whitespace-pre-wrap hide-scrollbar overflow-x-auto p-2"
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  >
                    {/* {message.text} */}
                  </pre>
                )}
                {message.commands && (
                  <div className="mt-2 space-y-2">
                    {message.commands.map((command, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-[--darkGrayColor] p-2 rounded"
                      >
                        <code className="flex-grow text-[--textColor]">
                          {command}
                        </code>
                        <button
                          onClick={() => copyCommand(command)}
                          className="ml-2 text-[--lightGrayColor] hover:text-[--textColor] focus:outline-none"
                        >
                          {copiedCommands[command] ? (
                            <FiCheck className="text-[--greenColor]" />
                          ) : (
                            <FiCopy />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
      <div
        className={`absolute z-10 bottom-0 h-10 text-[--textColor] p-2 custom-font-size leading-relaxed font-mono w-full bg-[--bgColor] border-t border-[--borderColor] ${
          prompt ? "border border-yellow-400" : ""
        }`}
      >
        <div
          ref={historyRef}
          className={`absolute left-0 right-0 bottom-10 overflow-y-auto hide-scrollbar bg-[--darkGrayColor]  flex flex-col-reverse z-100 max-h-[8.75rem] p-4 w-full ${
            showHistory ? "" : "hidden"
          }`}
        >
          {terminalHistory.length > 0 ? (
            terminalHistory
              .slice()
              .reverse()
              .map((line, index) => (
                <div
                  key={index}
                  className={`rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mb-2 ${
                    historyIndex === terminalHistory.length - 1 - index
                      ? "bg-gradient-to-br from-[--blueColor] to-[--darkBlueColor] text-[--textColor]"
                      : ""
                  }`}
                >
                  <div
                    className={`p-1 ${
                      historyIndex === terminalHistory.length - 1 - index
                        ? "text-[--textColor]"
                        : "text-[--primaryTextColor]"
                    }`}
                  >
                    <h3 className="custom-font-size font-normal">{line}</h3>
                  </div>
                </div>
              ))
          ) : (
            <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mb-2">
              <div className="p-1 text-[--textColor]">
                <h3 className="custom-font-size font-normal">
                  No Record Found
                </h3>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center w-full overflow-hidden">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-[--promptColorGradientStart] to-[--promptColorGradientEnd]">
            {isPasswordPromptOpen
              ? "Please enter your password:"
              : isCreatingFile
              ? filePromptLabel
              : promptLabel}
          </div>
          <div className="relative flex-1 ml-4 flex items-center text-[--textColor]">
            <div className="relative w-full">
              {isPasswordPromptOpen ? (
                <input
                  type="password"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  ref={inputRef}
                  className="w-full bg-transparent text-transparent border-0 outline-none custom-font-size caret-transparent"
                  autoComplete="off"
                  aria-label="Password input"
                  placeholder="Enter password"
                />
              ) : isInteractiveMode ? (
                <button
                  onClick={handleF10Click}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  F10 (Close)
                </button>
              ) : (
                <input
                  type="text"
                  value={input}
                  onKeyDown={handleInputKeyDown}
                  onChange={handleInputChange}
                  ref={inputRef}
                  className="flex-1 bg-transparent text-[--textColor] border-0 outline-none custom-font-size leading-relaxed font-mono w-full"
                  placeholder={
                    prompt
                      ? "Ask in natural language"
                      : "Use Ctrl + I to enter agenting mode"
                  }
                />
              )}
              {showDirectoryList && (
                <div
                  ref={listRef}
                  className="absolute left-0 right-0 mt-2 max-h-[200px] overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-md"
                >
                  {directories.map((dir, index) => (
                    <div
                      key={dir.name}
                      className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
                        index === selectedIndex
                          ? "bg-pink-500 text-white"
                          : "hover:bg-zinc-700"
                      }`}
                      onClick={() => {
                        setInputValue(`cd ${dir.name}`);
                        setShowDirectoryList(false);
                      }}
                    >
                      <FiFolder className="shrink-0" />
                      <span>{dir.name}</span>
                      <span className="ml-auto custom-font-size text-zinc-400">
                        Directory
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {suggestion && (
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <span className="text-[--textColor]">{input}</span>
                  <span className="text-[--commentColor]">
                    {suggestion.slice(input.length)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};