import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCopy, FiCheck } from "react-icons/fi";
import { FaTerminal } from "react-icons/fa6";
import { FaRegFileAlt } from "react-icons/fa";

// Define the properties that the EnhancedMarkdown component can accept
interface EnhancedMarkdownProps {
  markdownContent: string; // Markdown content to render
  onCopyCommand: (command: string) => void; // Function to handle command copy
  onExecuteCommand: (command: string) => void; // Function to handle command execution
  onCopyCode: (code: string) => void; // Function to handle code copy
  onCreateCode: (code: string) => void; // Function to handle code creation
  isStreaming: boolean; // Flag to indicate if content is streaming
}

const CustomH1: React.FC<{ children: React.ReactNode }> = ({
  children,
  ...props
}) => (
  <h1
    className="custom-font-size font-bold mb-4 border-b-2 border-[--darkBlueColor] text-[--textColor] pb-2"
    {...props}
  >
    {children}
  </h1>
);

const CustomH2: React.FC<{ children: React.ReactNode }> = ({
  children,
  ...props
}) => (
  <h2 className=" font-semibold mb-3 text-[--textColor] mt-6" {...props}>
    {children}
  </h2>
);

const CustomH3: React.FC<{ children: React.ReactNode }> = ({
  children,
  ...props
}) => (
  <h3 className=" font-medium mb-2 text-[--textColor] mt-4" {...props}>
    {children}
  </h3>
);

const CustomParagraph: React.FC<{ children: React.ReactNode }> = ({
  children,
  ...props
}) => (
  <p className="mb-4 leading-relaxed text-[--textColor]" {...props}>
    {children}
  </p>
);

const CustomList: React.FC<{
  children: React.ReactNode;
  ordered?: boolean;
}> = ({ children, ordered }) => {
  const ListComponent = ordered ? "ol" : "ul";
  return (
    <ListComponent className="mb-4 pl-5 text-[--textColor]">
      {children}
    </ListComponent>
  );
};

const CustomListItem: React.FC<{ children: React.ReactNode }> = ({
  children,
  ...props
}) => (
  <li className="mb-2 text-[--textColor]" {...props}>
    {children}
  </li>
);

const CustomBlockquote: React.FC<{ children: React.ReactNode }> = ({
  children,
  ...props
}) => (
  <blockquote
    className="border-l-4 border-[--darkBlueColor] pl-4 italic my-4 text-[--darkGrayColor]"
    {...props}
  >
    {children}
  </blockquote>
);

const CustomLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
  ...props
}) => (
  <a
    href={href}
    className="text-[--darkBlueColor] hover:underline"
    target="_blank"
    rel="noopener noreferrer"
    {...props}
  >
    {children}
  </a>
);

const CustomCode: React.FC<any> = ({
  node,
  inline,
  className,
  children,
  onCopyCode,
  onCreateCode,
  isStreaming,
}) => {
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);
  const [created, setCreated] = useState(false);

  const handleCopy = () => {
    if (!isStreaming) return;
    const codeToCopy = String(children).trim();
    navigator.clipboard.writeText(codeToCopy).then(() => {
      onCopyCode(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreate = () => {
    if (!isStreaming) return;
    const codeToCreate = String(children).trim();
    onCreateCode(codeToCreate);
    setCreated(true);
    setTimeout(() => setCreated(false), 2000);
  };

  const buttonClass = isStreaming
    ? "text-[--darkBlueColor] hover:text-[--blueColor] cursor-pointer"
    : "text-[--darkGrayColor] cursor-not-allowed";

  return !inline && match ? (
    <div className="relative hide-scrollbar">
      <button
        onClick={handleCopy}
        className={`absolute top-0 right-10 m-2 ${buttonClass}`}
        title="Copy Code"
        disabled={!isStreaming}
      >
        {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
      </button>
      <button
        onClick={handleCreate}
        className={`absolute top-0 right-2 m-2 ${buttonClass}`}
        title="Create Code"
        disabled={!isStreaming}
      >
        {created ? <FiCheck size={20} /> : <FaRegFileAlt size={20} />}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        className="rounded-md hide-scrollbar"
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-[--selectionBackgroundColor] text-[--greenColor] px-1 rounded">
      {children}
    </code>
  );
};

const CustomCommand: React.FC<any> = ({
  children,
  className,
  onCopyCommand,
  onExecuteCommand,
  isStreaming,
}) => {
  const [copied, setCopied] = useState(false);
  const [executed, setExecuted] = useState(false);

  const handleCopy = () => {
    if (!isStreaming) return;
    const commandToCopy = String(children).trim();
    navigator.clipboard.writeText(commandToCopy).then(() => {
      onCopyCommand(commandToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExecute = () => {
    if (!isStreaming) return;
    const commandToExecute = String(children).trim();
    onExecuteCommand(commandToExecute);
    setExecuted(true);
    setTimeout(() => setExecuted(false), 2000);
  };

  const buttonClass = isStreaming
    ? "text-[--darkBlueColor] hover:text-[--blueColor] cursor-pointer"
    : "text-[--darkGrayColor] cursor-not-allowed";

  return (
    <div className="relative mb-4 hide-scrollbar">
      <button
        onClick={handleCopy}
        className={`absolute top-0 right-10 m-2 ${buttonClass}`}
        title="Copy Command"
        disabled={!isStreaming}
      >
        {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
      </button>
      <button
        onClick={handleExecute}
        className={`absolute top-0 right-2 m-2 ${buttonClass}`}
        title="Execute Command"
        disabled={!isStreaming}
      >
        {executed ? <FiCheck size={20} /> : <FaTerminal size={20} />}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language="bash"
        PreTag="div"
        className="rounded-md hide-scrollbar"
      >
        {String(children).trim()}
      </SyntaxHighlighter>
    </div>
  );
};

// EnhancedMarkdown component definition
const EnhancedMarkdown: React.FC<EnhancedMarkdownProps> = ({
  markdownContent,
  onCopyCommand,
  onExecuteCommand,
  onCopyCode,
  onCreateCode,
  isStreaming,
}) => {
  return (
    <div className="w-full mx-auto p-2 shadow-lg rounded-lg overflow-x-auto hide-scrollbar">
      <ReactMarkdown
        components={{
          // Custom components for rendering markdown headers and paragraphs
          h1: CustomH1,
          h2: CustomH2,
          h3: CustomH3,
          p: CustomParagraph,
          ul: ({ children }) => (
            <CustomList ordered={false}>{children}</CustomList>
          ),
          ol: ({ children }) => (
            <CustomList ordered={true}>{children}</CustomList>
          ),
          li: CustomListItem,
          blockquote: CustomBlockquote,
          a: CustomLink,
          // Custom component for rendering code blocks
          code: (props) => {
            // Check for both language-bash and language-sh
            if (
              props.className?.includes("language-bash") ||
              props.className?.includes("language-sh")
            ) {
              return (
                <CustomCommand
                  {...props}
                  onCopyCommand={onCopyCommand}
                  onExecuteCommand={onExecuteCommand}
                  isStreaming={isStreaming}
                />
              );
            } else {
              return (
                <CustomCode
                  {...props}
                  onCopyCode={onCopyCode}
                  onCreateCode={onCreateCode}
                  isStreaming={isStreaming}
                />
              );
            }
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default EnhancedMarkdown;
