import React, { useState } from "react";

export function TeamTab() {
  const [teamName, setTeamName] = useState<string>("");

  const handleCreateTeam = () => {
    setTeamName("");
  };
  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar">
      <h2 className="custom-font-size font-bold mb-2">Teams</h2>
      <h3 className="custom-font-size font-semibold mb-2">Create a team</h3>
      <p className="custom-font-size text-[--textColor] mb-4">
        When you create a team, you can collaborate async or in real-time with
        shared notebooks (runbooks), workflows (like aliases), and terminal
        sessions.
      </p>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Team name"
          className="flex-grow bg-[--grayColor] p-2 rounded"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <button
          className="bg-[--blueColor] text-[--textColor] px-4 py-2 rounded hover:bg-[--darkBlueColor] transition-colors"
          onClick={handleCreateTeam}
        >
          Create
        </button>
      </div>
    </div>
  );
}
