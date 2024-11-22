import React from "react";
import { FaShareAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import { Avatar } from "../../../common/Avatar";

export function AccountTab() {
  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar">
      {/* <div className="flex items-center mb-4">
        <Avatar 
          src={user ? user.avatar : ""} // Assuming there's an avatar property
          fallback={user ? user.name.charAt(0) : "G"} // Fallback for guest
          className="w-10 h-10 rounded-full mr-3" 
        />
        <div>
          {user ? (
            <>
              <p className="font-semibold">Logged in as {user.name}</p>
              <p className="custom-font-size text-[--textColor]">{user.email}</p>
              <button className="bg-[--bgColor] text-[--textColor] border border-[--borderColor] rounded px-3 py-1 hover:[--selectionBackgroundColor]">
                Log out
              </button>
            </>
          ) : (
            <>
              <p className="font-semibold">Guest Account</p>
              <p className="custom-font-size text-[--textColor]">Sign in for more features</p>
            </>
          )}
        </div>
      </div> */}

      <div className="mt-6">
        <h3 className="custom-font-size font-semibold mb-2">
          ABOUT CodeMate.ai
        </h3>
        <p className="custom-font-size text-[--textColor] mb-2">
          Version is v0.2024.02.27.08.01.stable_03 (up to date)
        </p>
        {/* {user && (
          <button className="bg-opacity-50 bg-gradient-to-l from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--textColor] rounded px-3 py-1 custom-font-size flex items-center">
            <FaCheck size={16} className="mr-1" />
            Check for Update
          </button>
        )} */}
      </div>
      <div className="mt-6">
        <div className="flex items-center">
          <FaShareAlt size={12} className="mr-2 text[--orangeColor]" />
          <p className="custom-font-size">
            Share CodeMate.ai with friends and coworkers
          </p>
        </div>
        <button className="mt-2 bg-opacity-50 bg-gradient-to-l from-[--darkBlueColorGradientStart] to-[--purpleColor] text-[--textColor] rounded px-3 py-1 custom-font-size">
          Send an invite
        </button>
      </div>
    </div>
  );
}
