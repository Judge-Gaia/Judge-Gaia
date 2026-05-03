import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// React 18+에서는 `createRoot`로 앱의 최상위 렌더링 루트를 만든다.
// 이 루트에 App을 붙이면 이후 상태 변화가 React 렌더링 흐름으로 관리된다.
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
