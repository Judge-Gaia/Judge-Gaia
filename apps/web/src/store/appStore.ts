import type { GameMode, PlayerSession, RankingEntry } from "@judge-gaia/shared";
import { create } from "zustand";

type ApiStatus = "checking" | "online" | "offline";
type RealtimeStatus = "connecting" | "connected" | "disconnected";

type AppState = {
  apiStatus: ApiStatus;
  realtimeStatus: RealtimeStatus;
  rankings: RankingEntry[];
  session: PlayerSession | null;
  selectedMode: GameMode;
  setApiStatus: (status: ApiStatus) => void;
  setRealtimeStatus: (status: RealtimeStatus) => void;
  setRankings: (rankings: RankingEntry[]) => void;
  setSelectedMode: (mode: GameMode) => void;
  setSession: (session: PlayerSession) => void;
};

// Zustand는 React 컴포넌트 바깥에서도 접근 가능한 전역 상태를 만들 수 있다.
// 화면 단계, 실시간 연결 상태, 세션 정보처럼 여러 컴포넌트가 공유하는 값을 여기에 둔다.
export const useAppStore = create<AppState>((set) => ({
  apiStatus: "checking",
  realtimeStatus: "connecting",
  rankings: [],
  session: null,
  selectedMode: "basic",
  setApiStatus: (apiStatus) => set({ apiStatus }),
  setRealtimeStatus: (realtimeStatus) => set({ realtimeStatus }),
  setRankings: (rankings) => set({ rankings }),
  setSelectedMode: (selectedMode) => set({ selectedMode }),
  setSession: (session) => set({ session })
}));
