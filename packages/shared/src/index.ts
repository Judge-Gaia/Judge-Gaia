export type HealthResponse = {
  ok: true;
  service: "judge-gaia-server";
  timestamp: string;
};

export type RankingEntry = {
  userId: string;
  username: string;
  score: number;
  rank: number;
};

export type GameMode = "basic" | "ultra";

export type PlayerSession = {
  sessionId: string;
  nickname: string;
  mode: GameMode;
  createdAt: string;
};

export type ServerToClientEvents = {
  "rankings:update": (entries: RankingEntry[]) => void;
  "match:state": (state: MatchState) => void;
  "session:created": (session: PlayerSession) => void;
};

export type ClientToServerEvents = {
  "rankings:subscribe": () => void;
  "match:join": (payload: { matchId: string; userId: string }) => void;
  "session:start": (payload: { nickname: string; mode: GameMode }) => void;
};

export type MatchState = {
  matchId: string;
  status: "waiting" | "active" | "completed";
  updatedAt: string;
};
