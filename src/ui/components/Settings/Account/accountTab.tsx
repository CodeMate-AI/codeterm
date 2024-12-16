import React, { useEffect, useState } from "react";
import { FaShareAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import { Avatar } from "../../../common/Avatar";
import { Socket } from "socket.io-client";



interface AccountTabProps {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
}


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

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}


export function AccountTab({ socket, isConnected, sendMessage }: AccountTabProps) {
  const [user, setUser] = useState<any>(null); // Holds user data
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if user is authenticated
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    // Ensure the socket connection is available
    const sessionToken = localStorage.getItem("session_token");



    if (sessionToken) {
      // Emit the 'get_user_details' event with the session token
      socket.emit('get_user_details', { session_token: sessionToken });
    }

    const handleUserDetails = (userDetails) => {
      if (userDetails) {
        setUser(userDetails);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    // Listen for the 'user_details' event
    socket.on('user_details', handleUserDetails);



    // Cleanup the event listener when the component unmounts or sessionToken changes
    return () => {
      socket.off('user_details', handleUserDetails);
    };
  }, []);

  const handleLogout = () => {
    // Clear session token and logout user
    localStorage.removeItem("session_token");
    localStorage.removeItem("selected");
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleLogin = () => {
    handleAction(`https://auth.codemate.ai/?run=connect&host=cli`)
  };


  const handleAction = (url: string) => {
    // Use the openExternalLink method exposed by Electron
    window.electron
      .openExternalLink(url)
      .then((response) => {
      })
      .catch((error) => {
        console.error("Error opening URL:", error);
      });
  };


  useEffect(() => {
    if (socket) {
      socket.on('user_authenticate_token', async (data) => {
        const token = data.session_token;
        if (token) {
          localStorage.setItem("session_token", token);
          setSessionToken(token);

          localStorage.setItem("selected", JSON.stringify(true));

          // Emit event to fetch user details from the backend
          socket.emit('get_user_details', { session_token: token });
        }
      });

      // Listen for the user details from the backend
      socket.on('user_details', (userDetails) => {
        if (userDetails) {
          setUser(userDetails);
          setIsAuthenticated(true);
          // localStorage.setItem("plan_type", userDetails?.display_name)
        } else {
          setIsAuthenticated(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('user_authenticate_token');
        socket.off('user_details');
      }
    };
  }, [socket]);




  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar">
      <h1 className="text-2xl font-semibold mb-6">Account</h1>
      <div className="space-y-8">
        {/* Profile Section */}
        <div className="flex items-start space-x-4">
          <Avatar
            fallback={user?.name?.[0] || "AI"}
            size="lg"
            src={user?.image}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">{user?.name ? user.name : user ? "Your Account" : "Guest Account"}</h2>
                <p className="text-[--grayColor] text-sm">{user?.email || "Sign in for more features"}</p>
              </div>
              {
                isAuthenticated && (
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 bg-[--scrollbarTrackColor] text-[--grayColor] text-xs rounded">
                      {user?.plan || "Free Plan"}
                    </span>
                    <button className="text-[--darkBlueColorGradientStart] text-sm hover:underline" onClick={() => window.electron.openExternalLink("https://codemate.ai/#pricing")}>
                      Compare plans
                    </button>
                  </div>
                )
              }
            </div>
          </div>
        </div>
        {/* Referral Section */}
        {/* <div className="space-y-2">
        <p className="text-[--grayColor] text-sm">
          Earn rewards by sharing with friends & colleagues
        </p>
        <button className="text-[--darkBlueColorGradientStart] text-sm hover:underline">
          Refer a friend
        </button>
      </div> */}
        {/* Version Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[--grayColor] text-sm">Version</span>
            <button className="text-[--darkBlueColorGradientStart] text-sm hover:underline">
              Check for updates
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <code className="text-sm text-[--grayColor]">
              v0.0.1
            </code>
            <span className="text-[--grayColor] text-xs">Up to date</span>
          </div>
        </div>
        {/* Logout Button */}
        {
          isAuthenticated ? (<button
            onClick={handleLogout}
            className="px-4 py-2 bg-[--scrollbarTrackColor] text-[--primaryTextColor] rounded hover:bg-[--darkGrayColor] transition-colors"
          >
            Log out
          </button>) : (<button
            onClick={handleLogin}
            className="px-4 py-2 bg-[--scrollbarTrackColor] text-[--primaryTextColor] rounded hover:bg-[--darkGrayColor] transition-colors"
          >
            Log In
          </button>)
        }
      </div>
    </div>
  );
}
