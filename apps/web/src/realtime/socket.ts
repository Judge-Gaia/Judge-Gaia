import type { ClientToServerEvents, ServerToClientEvents } from "@judge-gaia/shared";
import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppStore } from "../store/appStore";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function useRealtime() {
  const setRealtimeStatus = useAppStore((state) => state.setRealtimeStatus);
  const setRankings = useAppStore((state) => state.setRankings);
  const setSession = useAppStore((state) => state.setSession);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

    socket = io(socketUrl, {
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      setRealtimeStatus("connected");
      socket?.emit("rankings:subscribe");
    });

    socket.on("disconnect", () => setRealtimeStatus("disconnected"));
    socket.on("rankings:update", setRankings);
    socket.on("session:created", setSession);

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [setRankings, setRealtimeStatus, setSession]);
}

export function requestPlayerSession(payload: Parameters<ClientToServerEvents["session:start"]>[0]) {
  // 홈 화면의 즉시 입장 버튼은 Socket.IO로 서버 권위 세션 생성을 요청한다.
  socket?.emit("session:start", payload);
}
