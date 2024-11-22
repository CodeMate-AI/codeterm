import { useState, useEffect, useCallback } from "react";
import io, { Socket } from "socket.io-client";

// Custom hook to manage a socket connection
export const useSocket = (url: string) => {
  // State to store the socket instance
  const [socket, setSocket] = useState<Socket | null>(null);
  // State to track the connection status
  const [isConnected, setIsConnected] = useState(false);

  // Establish the socket connection and set up event listeners
  useEffect(() => {
    // Create a new socket instance
    const socketIo = io(url);

    // Set isConnected to true when the socket connects
    socketIo.on("connect", () => {
      setIsConnected(true);
    });

    // Set isConnected to false when the socket disconnects
    socketIo.on("disconnect", () => {
      setIsConnected(false);
    });

    // Save the socket instance in state
    setSocket(socketIo);

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      socketIo.disconnect();
    };
  }, [url]); // Re-run the effect if the URL changes

  // Function to send a message through the socket
  const sendMessage = useCallback(
    (event: string, data: any) => {
      if (socket) {
        // Emit the event with the provided data
        socket.emit(event, data);
      }
    },
    [socket] // Re-create the function if the socket changes
  );

  // Return the socket instance, connection status, and sendMessage function
  return { socket, isConnected, sendMessage };
};
