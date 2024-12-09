import { Socket } from "socket.io-client";
import { useEffect, useState } from "react";

interface AITabProps {
  socket: Socket | null;
  isConnected: boolean;
}

export function AITab({ socket, isConnected }: AITabProps) {
  // States to hold the rate limit data
  const [rateLimitData, setRateLimitData] = useState({
    remaining: 0,
    total: 0,
    resetTime: "", // Format: "Jan 03, 2025"
  });

  // Function to format the reset time (assuming it's a Unix timestamp)
  const formatResetTime = (timestamp: number) => {
    const resetDate = new Date(timestamp * 1000); // Convert to milliseconds
    return resetDate.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Effect to listen for the rate limit data from the backend
  useEffect(() => {
    // Check for session_token in localStorage
    const sessionToken = localStorage.getItem('session_token');

    // If the session_token is present, proceed with socket logic
    if (sessionToken && socket && isConnected) {

      socket.emit("user_request_rate_limit");

      // Listen for the event that provides rate limit data
      socket.on("rateLimitData", (data: { remaining: number, total: number, reset: number }) => {

        setRateLimitData({
          remaining: data.total - data.remaining,
          total: data.total,
          resetTime: formatResetTime(data.reset),
        });
      });

      // Cleanup the event listener on unmount
      return () => {
        socket.off("rateLimitData");
      };
    }

    // If no session_token, log or handle accordingly
    else {
      console.log("No session_token found in localStorage. Socket call not made.");
    }
  }, [socket, isConnected]);

  const sessionToken = localStorage.getItem('session_token');


  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar text-[--textColor]">
      <h1 className="text-2xl font-semibold mb-6">AI</h1>

      {sessionToken ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-[--secondaryTextColor] text-sm">Request Usage</h2>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[--secondaryTextColor]">
                This is the monthly limit of AI requests for your account.{" "}
                <button className="text-[--darkBlueColor] hover:underline" onClick={() => window.electron.openExternalLink("https://codemate.ai/#pricing")}>
                  Upgrade
                </button>
                {" "}to get more requests.
              </p>
              <div className="text-right">
                {/* Dynamic display of current usage, total limit, and remaining requests */}
                <p className="text-sm font-medium">{rateLimitData.remaining}/{rateLimitData.total}</p>
                {/* <p className="text-xs text-[#8F8F8F]">Resets {rateLimitData.resetTime}</p> */}
                <p className="text-xs text-[--secondaryTextColor]">
                  Resets {new Date(rateLimitData.resetTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xl text-center text-[--secondaryTextColor]">
            Please sign in to use CodeMate.ai and access AI features.
          </p>
        </div>
      )}
    </div>
  );
}
