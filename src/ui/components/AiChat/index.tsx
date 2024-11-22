import React, { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import {
  FiMessageCircle,
  FiCopy,
  FiCheck,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";
import EnhancedMarkdown from "../../common/enhancedMarkdown";
import extractCodeBlocks from "../../utils/extractedCode";
import {
  CodeBlock,
  FileSystemItem,
  Message,
  StreamingMessage,
} from "../../types/terminalTypes";
import { useTabs } from "../../hooks/useTab";

// Define the Electron API interface for type safety
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

// Declare the Electron API globally
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

// Debounce delay constant
const DEBOUNCE_DELAY = 300;

// Define the AiChat component
export const AiChat: React.FC<AiChatProps> = ({
  socket,
  isConnected,
  chatId,
  tabId,
  content,
  addTerminalData,
  handleCreateFile,
  clearTerminalData,
  onShowPreview,
}) => {
  // Define refs for input, history, and messages container
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Define state variables
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [input, setInputValue] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [suggestion, setSuggestion] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedCommands, setCopiedCommands] = useState<{
    [key: string]: boolean;
  }>({});
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [streamingContent, setStreamingContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [fileCode, setFileCode] = useState<string>("");
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [aiInputValue, setAiInputValue] = useState<string>("");

  // Custom hook for managing tabs
  const { tabs, updateStreamingContent, clearStreamingContent } = useTabs();

  // Handle showing code preview
  const handleShowCodePreview = async (codeBlocks: CodeBlock[]) => {
    onShowPreview(codeBlocks);
  };

  // Add keypress listener for focusing the input
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

  // Add a new message to the chat
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

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      const newTerminalData: TerminalData = {
        inputCmd: current_cmd,
        output: String(text),
        status: type,
        timestamp,
      };
      addTerminalData(tabId, chatId, newTerminalData);
    },
    [tabId, chatId, addTerminalData]
  );

  // Copy command to clipboard
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

  // Execute a command
  const executeCommand = useCallback(
    (command: string) => {
      setStreamingContent("");
      setInputValue("");
      if (!socket) return;

      const contextContent = messages.map((msg) => ({
        role: msg.type === "nlp" ? "assistant" : "user",
        content: msg.current_cmd + "\n" + msg.text,
      }));

      const isContext = messages.length > 0;

      socket.emit("exec", {
        terminal_id: chatId,
        input: command,
        prompt: true,
        isContext: isContext,
        context: isContext ? contextContent : undefined,
      });

      setChatHistory((prev) => [...prev, command]);
    },
    [socket, chatId, messages]
  );

  // Focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [chatId]);

  // Scroll the history to the bottom when it changes
  useEffect(() => {
    if (historyRef.current && showHistory) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [chatHistory, showHistory]);

  // Scroll the messages container to the top when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  // Simulate keypress for specific conditions
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

  // Handle socket events for session management
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handle_signUp_model = (data) => {
      if (data.terminal_id === chatId) {
        simulateKeyPress();
        setIsAiThinking(false);
      }
    };

    const handleSessionStarted = () => {};

    socket.on("session_started", handleSessionStarted);

    socket.on("require_signup_and_model_selection", handle_signUp_model);

    socket.emit("create_session", { terminal_id: chatId });

    return () => {
      socket.off("session_started", handleSessionStarted);
    };
  }, [socket, isConnected]);

  useEffect(() => {
    setMessages(
      content.map((item, index) => ({
        id: index,
        text: item.output,
        type: item.status,
        timestamp: item.timestamp,
        current_cmd: item.inputCmd,
        fileSystem: undefined,
        isStreaming: false,
      }))
    );
  }, [content]);

  // Handle input change with debounce
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
        socket?.emit("input", { input: value, terminal_id: chatId });
      }, DEBOUNCE_DELAY);
    },
    [socket, chatId]
  );

  // Scroll to the current history item
  const scrollToCurrentHistory = useCallback(() => {
    if (historyRef.current && historyIndex !== -1) {
      const currentItem = historyRef.current.children[
        chatHistory.length - 1 - historyIndex
      ] as HTMLElement;
      if (currentItem) {
        historyRef.current.scrollTop =
          currentItem.offsetTop -
          historyRef.current.clientHeight / 2 +
          currentItem.clientHeight / 2;
      }
    }
  }, [historyIndex, chatHistory.length]);

  // Handle key down events for input
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setShowHistory(false);
        return;
      }

      if (isCreatingFile && socket) {
        if (e.key === "Enter") {
          e.preventDefault();
          const fileName = input.trim();
          if (fileName) {
            setInputValue("");
            setIsCreatingFile(false);
          }
        }
        return;
      }
      switch (e.key) {
        case "Enter":
          if (socket && isConnected && input.trim()) {
            const commandToExecute = input.trim();
            const contextContent = messages.map((msg) => ({
              role: msg.type === "nlp" ? "assistant" : "user",
              command: msg.current_cmd,
              content: msg.text,
            }));

            const isContext = messages.length > 0;

            socket.emit("exec", {
              terminal_id: chatId,
              input: commandToExecute,
              prompt: true,
              isContext: isContext,
              context: isContext ? contextContent : undefined,
            });

            setIsAiThinking(true);
            setShowHistory(false);
            setChatHistory((prev) => [...prev, input]);
            setInputValue("");
            setHistoryIndex(-1);
            setSuggestion("");
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (chatHistory.length > 0) {
            if (!showHistory) {
              setShowHistory(true);
              setHistoryIndex(chatHistory.length - 1);
              setInputValue(chatHistory[chatHistory.length - 1] || "");
            } else {
              setHistoryIndex((prevIndex) => {
                const newIndex = Math.max(prevIndex - 1, 0);
                setInputValue(chatHistory[newIndex] || "");
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
          if (chatHistory.length > 0) {
            if (showHistory) {
              if (historyIndex < chatHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setInputValue(chatHistory[newIndex] || "");
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
      chatId,
      chatHistory,
      showHistory,
      historyIndex,
      suggestion,
      scrollToCurrentHistory,
      handleCreateFile,
    ]
  );

  // Clear suggestion if input is empty
  useEffect(() => {
    if (input.length === 0) {
      setSuggestion("");
    }
  }, [input]);

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
      if (data.terminal_id === chatId) {
        setIsAiThinking(false);
        const fileSystem = undefined;

        addMessage(
          data.output,
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
      if (data.terminal_id === chatId) {
        if (typeof data.suggestions === "string") {
          setSuggestion(data.suggestions);
        } else if (Array.isArray(data.suggestions)) {
          setSuggestion(data.suggestions.join(", "));
        } else {
          setSuggestion("");
        }
      }
    };

    socket.on("command_output", handleCommandOutput);
    socket.on("suggestions", handleSuggestions);

    return () => {
      socket.off("command_output", handleCommandOutput);
      socket.off("suggestions", handleSuggestions);
    };
  }, [socket, isConnected, chatId, addMessage]);

  // Handle socket events for streaming chunks and end
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleStreamingChunk = (data: {
      chunk: string;
      terminal_id: string;
      command: string;
    }) => {
      if (data.terminal_id === chatId) {
        setIsStreaming(true);
        setIsAiThinking(false);

        // Update the content using updateStreamingContent
        updateStreamingContent(tabId, chatId, data.chunk);

        // Set the AI input value
        setAiInputValue(data.command);
      } else {
      }
    };

    const handleStreamingEnd = (data: {
      status: "error" | "success" | "nlp";
      output: string;
      current_cmd: string;
      terminal_id: string;
      commands?: string[];
    }) => {
      if (data.terminal_id === chatId) {
        setIsAiThinking(false);
        setAiInputValue("");
        const fileSystem = undefined;

        addMessage(
          data.output,
          data.status,
          data.current_cmd,
          data.commands,
          fileSystem
        );

        const codeBlocks = extractCodeBlocks(data.output);

        if (codeBlocks.length > 0) {
          handleShowCodePreview(codeBlocks);
        }

        clearStreamingContent(tabId, chatId);
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
    chatId,
    streamingContent,
    addMessage,
    handleShowCodePreview,
    updateStreamingContent,
    clearStreamingContent,
    onShowPreview,
  ]);

  // Update streaming content when tabs change
  useEffect(() => {
    if (tabs) {
      const tab = tabs.find((t) => t.id === tabId); // Assuming you want to track specific tabId
      if (tab) {
        const child = tab.children.find((c) => c.id === chatId);
        if (child) {
          const updatedContent = child.streamingContent;
          setStreamingContent(updatedContent); // You can use the updated content here
        }
      }
    }
  }, [tabs, tabId, chatId]);

  // Clear suggestion if input is empty
  useEffect(() => {
    if (input.length === 0) {
      setSuggestion("");
    }
  }, [input]);

  // Handle creation of new code
  const onCreateCode = (code: string) => {
    setFileCode(code);
    setIsCreatingFile(true);
    setInputValue("");
    inputRef.current?.focus();
  };

  const onCopyCode = () => {};
  return (
    <>
      <div className="custom-flex-grow-for-message-container flex pb-10 w-full h-full hide-scrollbar">
        {isAiThinking && (
          <div className="absolute bottom-11 left-4 right-0 bg-[--bgColor] p-2">
            <div className="flex items-center">
              <FiLoader className="animate-spin mr-2" />
              <span>AI is thinking...</span>
            </div>
          </div>
        )}
        <div
          ref={messagesContainerRef}
          className="overflow-auto flex flex-col-reverse hide-scrollbar w-full"
        >
          {isStreaming && (
            <div className="p-4 bg-opacity-50 bg-gradient-to-l from-[--bgGradientStart] to-[--scrollbarThumbColor] text-[--primaryTextColor] border-l-4 border-l-[--borderColor]">
              <div className="flex items-center">
                <FiMessageCircle
                  className="mr-2 text-[--darkBlueColor]"
                  size={18}
                />
                <span className="text-xs text-[--textColor]">
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
                                          message.type === "error"
                                            ? "bg-opacity-50 bg-gradient-to-l from-[--bgGradientStart] to-[--redColorGradientStart] text-[--primaryTextColor] border-l-4 border-l-[--darkRedColor]"
                                            : message.type === "success"
                                            ? "bg-opacity-10 text-[--primaryTextColor] border-l-4 border-l-[--darkGreenColor]"
                                            : "bg-opacity-50 bg-gradient-to-l from-[--bgGradientStart] to-[--scrollbarThumbColor] text-[--primaryTextColor] border-l-4 border-l-[--borderColor]"
                                        }
                                                  ${
                                                    index === 0 && isAiThinking
                                                      ? "mb-12"
                                                      : ""
                                                  }
                                
                                      `}
              >
                <div className="flex items-center mb-1">
                  {message.type === "error" && (
                    <FiAlertTriangle
                      className="mr-2 text-[--darkRedColor]"
                      size={18}
                    />
                  )}

                  {message.type === "nlp" && (
                    <FiMessageCircle
                      className="mr-2 text-[--darkBlueColor]"
                      size={18}
                    />
                  )}
                  <span className="custom-font-size text-[--textColor]">
                    {message.timestamp}
                  </span>
                </div>
                <span className="custom-font-size pt-2">
                  {message.current_cmd}
                </span>
                {message.type === "nlp" ? (
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
                    className="whitespace-pre-wrap hide-scrollbar overflow-x-auto p-2 custom-font-size"
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
      <div className="absolute z-10 bottom-0 h-10 text-[--textColor] p-2 custom-font-size leading-relaxed font-mono w-full bg-[--bgColor] border-t border-[--borderColor]">
        <div
          ref={historyRef}
          className={`absolute left-0 right-0 bottom-10 overflow-y-auto hide-scrollbar bg-[--darkGrayColor]  flex flex-col-reverse z-100 max-h-40 p-4 w-full ${
            showHistory ? "" : "hidden"
          }`}
        >
          {chatHistory.length > 0 ? (
            chatHistory
              .slice()
              .reverse()
              .map((line, index) => (
                <div
                  key={index}
                  className={`rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mb-2 ${
                    historyIndex === chatHistory.length - 1 - index
                      ? "bg-gradient-to-br from-[--blueColor] to-[--darkBlueColor] text-[--textColor]"
                      : ""
                  }`}
                >
                  <div
                    className={`p-1 ${
                      historyIndex === chatHistory.length - 1 - index
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
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-[--promptColorGradientStart] to-[--promptColorGradientEnd]"></div>
          <div className="relative flex-1 ml-4 flex items-center text-[--textColor]">
            <div className="relative w-full">
              <input
                type="text"
                value={input}
                onKeyDown={handleInputKeyDown}
                onChange={handleInputChange}
                ref={inputRef}
                placeholder="Ask In Natural Language"
                className="flex-1 bg-transparent text-[--textColor] border-0 outline-none custom-font-size leading-relaxed font-mono w-full"
              />
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
