import { WS_URL } from "@/app/config";
import { useEffect, useState } from "react";

const useSocket = (market?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>();

  useEffect(() => {
    const ws = new WebSocket(market ? `${WS_URL}?market=${market}` : WS_URL);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onerror = (error) => {
      console.error(error);
    };

    return () => {
      setSocket(null);
      setIsConnected(false);
    };
  }, [market]);

  return {
    socket,
    isConnected
  };
};

export default useSocket;
