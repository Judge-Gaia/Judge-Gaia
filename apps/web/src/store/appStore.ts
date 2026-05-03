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
