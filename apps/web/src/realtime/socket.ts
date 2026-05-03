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
    // 소켓 연결은 컴포넌트 생명주기에 묶어서 관리한다.
    // 마운트 시 연결하고 언마운트 시 정리해야 중복 연결과 메모리 누수를 막을 수 있다.
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
  // UI에서 바로 세션을 만들지 않고, 서버에 요청해서 권한 있는 세션을 발급받는다.
  socket?.emit("session:start", payload);
}
