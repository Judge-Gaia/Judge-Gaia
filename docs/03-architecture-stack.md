# Architecture and Stack

## 선택 스택

- 클라이언트: React + TypeScript + Vite.
- 3D: Three.js.
- 실시간 통신: Socket.IO.
- 상태관리: Zustand.
- 백엔드: Node.js + Fastify.
- DB: PostgreSQL.
- 배포: Vercel 프론트, Cloud Run 또는 Fly.io 서버.

## 모노레포 구조

```text
.
├── apps
│   ├── web      # React/Vite 클라이언트
│   └── server   # Fastify/Socket.IO API 서버
├── packages
│   └── shared   # 클라이언트-서버 공유 타입
└── docs         # 요구사항/계획/보고서 문서
```

## 패키지 책임

### `apps/web`

- 닉네임 입력과 즉시 입장 홈 화면.
- Three.js 지구 렌더링과 월드 상호작용.
- Zustand 기반 클라이언트 상태.
- Socket.IO client 연결과 세션/랭킹 이벤트 수신.

### `apps/server`

- Fastify HTTP API.
- Socket.IO 서버.
- PostgreSQL 연결.
- 유저, 랭킹, 업적 저장.
- 세션 ID 발급과 서버 권위 판정의 출발점.

### `packages/shared`

- HTTP 응답 타입.
- Socket.IO client/server 이벤트 타입.
- 랭킹, 세션, 매치 상태 등 공유 계약.

## 현재 구현된 기반

- Vite React 앱.
- Three.js 초기 장면.
- Zustand 스토어.
- Socket.IO 클라이언트/서버 연결 기반.
- Fastify `/health` API.
- PostgreSQL 유저/랭킹/업적 초기 마이그레이션.
- Vercel 설정과 서버 Dockerfile.

## 다음 구현 시 주의점

- 프론트엔드/백엔드 주요 흐름에는 짧은 코드 주석을 남긴다. 특히 Three.js 초기화, Socket.IO 세션 발급, DB 저장 흐름은 보고서 요구사항 때문에 주석이 필요하다.
- 새 의존성은 MVP 요구를 직접 만족할 때만 추가한다.
- 서버가 발급한 세션 ID를 기준으로 플레이를 시작한다.
- 점수와 업적은 최종적으로 서버 기준으로만 확정한다.
