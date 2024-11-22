import React from "react";
import { FaShareSquare } from "react-icons/fa"; // Importing the share square icon

export function SharedBlocksTab() {
  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar text-[--textColor]">
      <p>You do not have any shared block yet.</p>
    </div>
  );
}
