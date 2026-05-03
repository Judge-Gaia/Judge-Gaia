import type { GameMode } from "@judge-gaia/shared";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { GaiaScene } from "./components/GaiaScene";
import { requestPlayerSession, useRealtime } from "./realtime/socket";
import { useAppStore } from "./store/appStore";

const suggestions = ["NorthernSeer", "Verdigris", "Mistral_07", "Tideborne", "Heliotrope"];

const missionEvents = [
  {
    id: "industrial-outflow",
    title: "Industrial outflow",
    place: "Mokpo Delta · VN",
    sdg: "14",
    severity: "critical",
    reward: "+0:12s"
  },
  {
    id: "slash-and-burn",
    title: "Slash-and-burn",
    place: "Sumatra · ID",
    sdg: "15",
    severity: "warning",
    reward: "+0:38s"
  },
  {
    id: "methane-plume",
    title: "Methane plume",
    place: "Permian Basin · US",
    sdg: "13",
    severity: "warning",
    reward: "+1:05s"
  }
];

const globePins = [
  { x: 43, y: 40, tone: "critical" },
  { x: 56, y: 47, tone: "warning" },
  { x: 52, y: 35, tone: "warning" },
  { x: 39, y: 53, tone: "critical" },
  { x: 49, y: 60, tone: "stable" }
];

const achievements = [
  { sdg: "13", title: "First Cleanse", reward: "+1,200 PTS", tone: "green" },
  { sdg: "14", title: "Plastic Free", reward: "+1,200 PTS", tone: "blue" },
  { sdg: "15", title: "Forest Vow", reward: "+1,200 PTS", tone: "lime" }
];

const skillSlots = [
  { key: "Q", icon: "☂", label: "Rain", tone: "violet" },
  { key: "W", icon: "≋", label: "Wind", tone: "green" },
  { key: "E", icon: "⌁", label: "Tide", tone: "blue" },
  { key: "R", icon: "◌", label: "Seal", cooldown: "6" },
  { key: "F", icon: "↯", label: "Shock", cooldown: "12" },
  { key: "G", icon: "✦", label: "Exile", cooldown: "28" }
];

export function App() {
  const [screen, setScreen] = useState<"landing" | "identity" | "mission">("landing");
  const [nickname, setNickname] = useState("Aether_K");
  const {
    apiStatus,
    rankings,
    realtimeStatus,
    selectedMode,
    session,
    setApiStatus,
    setSelectedMode
  } = useAppStore();

  // 앱 시작 시 실시간 연결과 API 상태를 먼저 확인해,
  // 화면 상단의 상태 메트릭이 실제 서버 상태를 반영하도록 만든다.
  useRealtime();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

    fetch(`${apiUrl}/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        return response.json();
      })
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, [setApiStatus]);

  useEffect(() => {
    // 전역 키보드 이벤트는 화면 전환 같은 가벼운 내비게이션에 자주 사용된다.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && screen === "landing") {
        setScreen("identity");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screen]);

  useEffect(() => {
    if (session && screen === "identity") {
      setScreen("mission");
    }
  }, [screen, session]);

  useEffect(() => {
    if (screen === "mission") {
      window.scrollTo(0, 0);
    }
  }, [screen]);

  const startSession = (event: FormEvent) => {
    event.preventDefault();
    // 폼 제출 시 nickname과 mode를 소켓으로 보내 세션 생성 흐름을 시작한다.
    requestPlayerSession({ nickname, mode: selectedMode });
  };

  const randomizeNickname = () => {
    const next = suggestions[Math.floor(Math.random() * suggestions.length)];
    setNickname(next ?? "Aether_K");
  };

  return (
    <main className="gaiaApp">
      <div className="spaceField" aria-hidden="true" />
      {/* 배경 3D 지구는 화면 단계와 독립적으로 계속 렌더링된다. */}
      <GaiaScene
        className={
          screen === "landing" ? "heroGlobe" : screen === "mission" ? "missionGlobe" : "identityGlobe"
        }
      />

      {screen === "landing" ? (
        <LandingScreen
          apiStatus={apiStatus}
          rankingCount={rankings.length}
          realtimeStatus={realtimeStatus}
          onEnter={() => setScreen("identity")}
        />
      ) : screen === "mission" && session ? (
        <MissionScreen sessionId={session.sessionId} nickname={session.nickname} mode={session.mode} />
      ) : (
        <IdentityScreen
          mode={selectedMode}
          nickname={nickname}
          sessionId={session?.sessionId ?? null}
          onBack={() => setScreen("landing")}
          onModeChange={setSelectedMode}
          onNicknameChange={setNickname}
          onRandomize={randomizeNickname}
          onSubmit={startSession}
        />
      )}
    </main>
  );
}

function LandingScreen({
  apiStatus,
  rankingCount,
  realtimeStatus,
  onEnter
}: {
  apiStatus: string;
  rankingCount: number;
  realtimeStatus: string;
  onEnter: () => void;
}) {
  return (
    <section className="landingScreen" aria-label="GAIA landing screen">
      <Header />

      <div className="systemCoordinates" aria-label="Current observation coordinates">
        <span>37.5665° N · 126.9780° E</span>
        <span>UTC +09:00 · LIVE</span>
        <span>ATMOSPHERIC INTEGRITY 71.4%</span>
      </div>

      <div className="heroCopy">
        <div className="sdgPill">
          <span />
          SDG 13 · 14 · 15 — Now in session
        </div>
        <h1>
          You are the
          <br />
          <em>witness</em> <span>·</span> arbiter <span>·</span> <em>healer</em>
        </h1>
        <p>
          A real-time browser ritual. Detect harm, cleanse the wound, and pass
          symbolic judgment on those who broke the world.
        </p>
        <div className="heroActions">
          <button className="primaryButton" type="button" onClick={onEnter}>
            Enter the loop <ArrowRight aria-hidden="true" />
          </button>
          <button className="ghostButton" type="button">
            <Play aria-hidden="true" /> Watch trailer
          </button>
        </div>
        <div className="microCopy">NO ACCOUNT · INSTANT SESSION · ~30 SEC TO PLAY</div>
      </div>

      <footer className="planetStatus">
        <StatusMetric label="Live planet status" value="1,294" detail="active threats" />
        <StatusMetric label="Climate · 13" value="412" tone="green" />
        <StatusMetric label="Oceans · 14" value="318" tone="blue" />
        <StatusMetric label="Land · 15" value="564" tone="lime" />
        <StatusMetric label="Runtime" value={apiStatus} detail={realtimeStatus} tone="azure" />
        <StatusMetric label="Ranking rows" value={`${rankingCount}`} tone="azure" />
      </footer>
    </section>
  );
}

function IdentityScreen({
  mode,
  nickname,
  sessionId,
  onBack,
  onModeChange,
  onNicknameChange,
  onRandomize,
  onSubmit
}: {
  mode: GameMode;
  nickname: string;
  sessionId: string | null;
  onBack: () => void;
  onModeChange: (mode: GameMode) => void;
  onNicknameChange: (nickname: string) => void;
  onRandomize: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <section className="identityScreen" aria-label="GAIA identity screen">
      <header className="identityHeader">
        <Logo />
        <button className="backButton" type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" /> Back
        </button>
      </header>

      <div className="stepper" aria-label="Entry steps">
        <span>STEP</span>
        <strong>01</strong>
        <i />
        <b>02</b>
        <i />
        <b>03</b>
      </div>

      <div className="identityGrid">
        {/* 왼쪽은 입력 폼, 오른쪽은 모드/안내 패널로 나눠 정보 밀도를 조절한다. */}
        <form className="glassPanel identityPanel" onSubmit={onSubmit}>
          <span className="panelKicker">01 · Identity</span>
          <h2>
            Name yourself,
            <br />
            <em>arbiter</em>
          </h2>
          <p>No account. No email. The name you choose is how you appear on the global ledger of judgments.</p>

          <label className="fieldLabel" htmlFor="nickname">
            Nickname
          </label>
          <input
            id="nickname"
            maxLength={16}
            minLength={2}
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            placeholder="Aether_K"
            required
          />
          <div className="inputMeta">
            Available · letters, numbers, _ <span>{nickname.length} / 16</span>
          </div>

          <span className="suggestedLabel">Suggested</span>
          <div className="suggestions">
            {suggestions.map((item) => (
              <button key={item} type="button" onClick={() => onNicknameChange(item)}>
                {item}
              </button>
            ))}
          </div>

          {sessionId ? (
            <div className="sessionReceipt" role="status">
              Session issued <strong>{sessionId.slice(0, 8)}</strong>
            </div>
          ) : null}

          <div className="formActions">
            <button className="primaryButton" type="submit">
              Continue <ArrowRight aria-hidden="true" />
            </button>
            <button className="ghostButton" type="button" onClick={onRandomize}>
              Randomize
            </button>
          </div>
        </form>

        <aside className="sideStack">
          <div className="glassPanel modePanel">
            <span className="panelKicker">02 · Choose mode</span>
            <div className="modeGrid">
              <ModeButton
                active={mode === "basic"}
                label="Basic"
                badge="Curated"
                detail="Balanced · learning-focused"
                footer="6 · core SDG events"
                onClick={() => onModeChange("basic")}
              />
              <ModeButton
                active={mode === "ultra"}
                label="Ultra"
                badge="Brutal"
                detail="High-density · scoring-max"
                footer="Continuous · cascading"
                onClick={() => onModeChange("ultra")}
              />
            </div>
          </div>

          <div className="glassPanel noticePanel">
            <span className="noticeDot" />
            <div>
              <span className="panelKicker">Content notice</span>
              <p>
                All NPCs are fictional. Sanctions are symbolic — sealing,
                electric stun, and exile are non-lethal and represented through abstract VFX.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="enterHint">
        PRESS <kbd>ENTER</kbd> TO BEGIN INSTANTLY
      </div>
    </section>
  );
}

function MissionScreen({
  mode,
  nickname,
  sessionId
}: {
  mode: GameMode;
  nickname: string;
  sessionId: string;
}) {
  // 미션 화면의 리더보드는 서버 데이터가 아니라 현재 UI 시안을 보여주는 정적 예시다.
  const board = [
    { rank: "01", name: "Verdigris", score: "28,401" },
    { rank: "02", name: "Tideborn_07", score: "21,990" },
    { rank: "03", name: `${nickname} · you`, score: "14,820" },
    { rank: "04", name: "Heliotrope", score: "12,360" }
  ];

  return (
    <section className="missionScreen" aria-label="GAIA active mission screen">
      <div className="missionCenter">
        {globePins.map((pin, index) => (
          <button
            key={`${pin.tone}-${pin.x}-${pin.y}`}
            className={`eventPin ${pin.tone}`}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            type="button"
            aria-label={`Environmental event ${index + 1}`}
          />
        ))}
      </div>

      <div className="missionTopBar">
        <span className="liveDot" />
        <span>Session live</span>
        <strong>04:21</strong>
        <span>Score</span>
        <b>14,820</b>
      </div>

      <div className="glassPanel activeObjective">
        <div className="missionPanelHeader">
          <span>Active objective</span>
          <b>03 / 06</b>
        </div>
        <strong>Cleanse three SDG 13 events</strong>
        <small>Phase II · Climate cascade</small>
        <div className="progressTrack" aria-label="Mission progress">
          <i style={{ width: "50%" }} />
        </div>
        <div className="progressMeta">
          <span>Progress</span>
          <b>50%</b>
        </div>
      </div>

      <aside className="liveAlerts">
        <span className="missionKicker">Live alerts</span>
        {missionEvents.map((event) => (
          <article className={`alertCard ${event.severity}`} key={event.id}>
            <div>
              <strong>{event.title}</strong>
              <small>{event.place}</small>
            </div>
            <span>{event.reward}</span>
            <em>SDG {event.sdg}</em>
          </article>
        ))}
      </aside>

      <aside className="leaderboardMini">
        <div className="missionPanelHeader">
          <span>Live leaderboard</span>
          <b>{mode === "basic" ? "Basic" : "Ultra"} · Asia</b>
        </div>
        {board.map((row) => (
          <div className={row.name.includes("you") ? "leaderRow current" : "leaderRow"} key={row.rank}>
            <span>{row.rank}</span>
            <strong>{row.name}</strong>
            <b>{row.score}</b>
          </div>
        ))}
      </aside>

      <div className="skillDock" aria-label="Divine power and skill shortcuts">
        <div className="energyBar">
          <span>Divine energy</span>
          <i>
            <b style={{ width: "78%" }} />
          </i>
          <strong>78 / 100</strong>
        </div>
        <div className="skillSlots">
          {skillSlots.map((slot) => (
            <button className={`skillSlot ${slot.tone ?? ""}`} key={slot.key} type="button">
              <small>{slot.key}</small>
              <strong>{slot.icon}</strong>
              <span>{slot.label}</span>
              {slot.cooldown ? <em>{slot.cooldown}</em> : null}
            </button>
          ))}
        </div>
        <p>Q W E — Cleanse · R F G — Judgment</p>
      </div>

      <aside className="achievementFeed">
        <span className="missionKicker">Achievements collected</span>
        {achievements.map((achievement) => (
          <article className="achievementCard" key={achievement.title}>
            <span className={achievement.tone}>{achievement.sdg}</span>
            <div>
              <strong>{achievement.title}</strong>
              <small>{achievement.reward}</small>
            </div>
          </article>
        ))}
      </aside>

      <div className="sessionChip">
        <span>{nickname}</span>
        <b>{sessionId.slice(0, 8)}</b>
      </div>
    </section>
  );
}

function Header() {
  return (
    <header className="mainHeader">
      <Logo />
      <nav aria-label="Primary navigation">
        <a href="#about">About</a>
        <a href="#leaderboard">Leaderboard</a>
        <a href="#codex">Codex</a>
        <span>v0.1.0 · MVP</span>
      </nav>
    </header>
  );
}

function Logo() {
  return (
    <div className="logoMark" aria-label="GAIA Judgment Loop">
      <span aria-hidden="true" />
      <strong>GAIA</strong>
      <small>Judgment Loop</small>
    </div>
  );
}

function StatusMetric({
  label,
  value,
  detail,
  tone = "white"
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "white" | "green" | "blue" | "lime" | "azure";
}) {
  return (
    <div className="statusMetric">
      <span className={`metricDot ${tone}`} />
      <small>{label}</small>
      <strong>{value}</strong>
      {detail ? <em>{detail}</em> : null}
    </div>
  );
}

function ModeButton({
  active,
  badge,
  detail,
  footer,
  label,
  onClick
}: {
  active: boolean;
  badge: string;
  detail: string;
  footer: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={`modeButton ${active ? "active" : ""}`} type="button" onClick={onClick}>
      <span>
        <strong>{label}</strong>
        <em>{badge}</em>
      </span>
      <small>{detail}</small>
      <b>{footer}</b>
    </button>
  );
}
