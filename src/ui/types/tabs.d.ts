interface TerminalData {
    inputCmd: string;
    output: string;
    status: "error" | "success" | "nlp";
    timestamp: string;
}

interface PreviewData {
    language: string,
    code: string,
}


interface ChildData {
    id: string;
    type: "ai" | "editor" | "terminal" | "preview";
    content: TerminalData[];
    preview?: PreviewData[];
    splitLevel: number;
    contentType: "terminal" | "ai" | "editor" | "preview";
    depth: number;
    direction: "horizontal" | "vertical";
    filePath?: string;
    curr_dir?: string;
    streamingContent?:  string;
}



interface TabDataWithOutPassword {
    id: string;
    name: string;
    children: ChildData[];
    splitLevel: number;
    isSudoPassword: boolean;
    sudoPassword?: string;
}

type TabData = TabDataWithOutPassword extends { isSudoPassword: true }
    ? TabDataWithOutPassword & { sudoPassword: string }
    : TabDataWithOutPassword;

type SplitType = "horizontal" | "vertical";
type ContentType = "terminal" | "ai" | "editor" | "preview";

interface StreamingContent {
    content: string;
    command: string;
    timestamp: string;
    type: "error" | "success" | "nlp";
  }
