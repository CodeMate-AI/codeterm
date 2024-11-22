import React, { useState } from "react";

import { IoMdClose } from "react-icons/io";
import { FaCheck, FaBan, FaArrowRight } from "react-icons/fa";

export function SubShellTab() {
  const [addedCommand, setAddedCommand] = useState<string>("");
  const [blockedCommand, setBlockedCommand] = useState<string>("");
  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar">
      <p className="custom-font-size text-[--textColor] mb-2">
        Configure whether CodeMate.ai attempts to "CodeMate.aiify" the subshell
        for certain commands. CodeMate.ai supports bash, zsh, and fish
        subshells.
      </p>
      <a
        href="#"
        className="text-[--blueColor] hover:underline mb-4 inline-block"
      >
        Learn more
      </a>

      <div className="mb-4">
        <h3 className="custom-font-size font-semibold flex items-center mb-2">
          <FaCheck className="mr-2 text-[--greenColor]" /> Added commands
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="command (supports regex)"
            className="w-full bg-[--grayColor] p-2 pr-8 rounded"
            value={addedCommand}
            onChange={(e) => setAddedCommand(e.target.value)}
          />
          <FaArrowRight className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[--textColor]" />
        </div>
      </div>

      <div>
        <h3 className="custom-font-size font-semibold flex items-center mb-2">
          <FaBan className="mr-2 text-[--redColor]" /> Blocklisted commands
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="command"
            className="w-full bg-[--grayColor] p-2 pr-8 rounded"
            value={blockedCommand}
            onChange={(e) => setBlockedCommand(e.target.value)}
          />
          <FaArrowRight className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[--textColor]" />
        </div>
      </div>
    </div>
  );
}
