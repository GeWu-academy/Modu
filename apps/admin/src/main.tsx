import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";

function App() {
  return (
    <main className="app-shell">
      <h1>Your ERP</h1>
      <p>管理后台已初始化，业务模块正在接入。</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
