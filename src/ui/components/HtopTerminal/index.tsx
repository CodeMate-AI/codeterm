
import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

interface HtopTerminalProps {
  socket: Socket;
  isConnected: boolean;
  setHtopSession: (value: boolean) => void; // Function to update htopSession in the parent component
}

const HtopTerminal: React.FC<HtopTerminalProps> = React.memo(({ socket, isConnected, setHtopSession }) => {
  const terminalRef = useRef<HTMLDivElement | null>(null); // Reference to the terminal container
  const [isMounted, setIsMounted] = useState(false);  // Track if the terminal has been mounted
  const [term, setTerm] = useState<Terminal | null>(null); // Store the Terminal instance

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isMounted || !terminalRef.current) {
      return;  // Exit early if the terminal is not yet mounted
    }


    const newTerm = new Terminal();
    const fitAddon = new FitAddon();
    newTerm.loadAddon(fitAddon);

    newTerm.open(terminalRef.current);
    fitAddon.fit(); // Ensure terminal fits into the container when it's ready
    setTerm(newTerm);


    // Listen for window resizing to update terminal size dynamically
    const updateTerminalSize = () => {
      const { width, height } = terminalRef.current?.getBoundingClientRect() || { width: 0, height: 0 };
      const newRows = Math.floor(height / 20); // Approximate row height
      const newCols = Math.floor(width / 10);  // Approximate column width
      socket.emit("resize_terminal", { rows: newRows, cols: newCols });
    };

    // Initial size calculation
    updateTerminalSize();

    // Update terminal size on window resize
    window.addEventListener('resize', updateTerminalSize);

    // Socket listener for htop output
    socket.on("htop_output", (data: { data: string }) => {
      newTerm.write(data.data);
    });

    newTerm.onData((data: string) => {
      socket.emit("htop_input", data);
    });

    // Listen for resize events from the backend and resize the terminal
    socket.on('resize_terminal', (data: { rows: number, cols: number }) => {
      if (newTerm) {
        newTerm.resize(data.cols, data.rows);
      }
    });

    // Add listener for F10 key press to terminate the session
    newTerm.onKey((event) => {
    
    //   // Check if the key is F10 (escape sequence: \u001b[21~)
      if (event.key === '\x1b[21~') {
        
    //     // Notify the parent component to stop rendering the terminal
        setHtopSession(false);  
        
    //     // Emit the terminate signal to the backend
    //     socket.emit("terminate_htop_session");  
      }
    });
    
    
    

    // Cleanup function to remove event listeners and dispose of the terminal
    return () => {
      socket.off("htop_output");
      socket.off("resize_terminal");
      newTerm.dispose();
      window.removeEventListener('resize', updateTerminalSize);
    };
  }, [socket, isMounted, setHtopSession]);

  return (
    <div
      ref={terminalRef}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    ></div>
  );
})

export default HtopTerminal;
