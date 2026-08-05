import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTaskSocket } from "../context/WebSocketContext";
import logo from "../assets/img/logo.jpg";
import { useState } from "react";
import { enablePushNotifications } from "../utils/push";
import api from "../api/axios";

const STATUS_STYLES = {
  connected: { dot: "bg-emerald-500", label: "Live" },
  connecting: { dot: "bg-ember-400 animate-pulse", label: "Connecting" },
  disconnected: { dot: "bg-ink-300", label: "Offline" },
};

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const { connectionStatus, audioEnabled, enableAudio, disableAudio } = useTaskSocket();
  const navigate = useNavigate();

  const status = STATUS_STYLES[connectionStatus] ?? STATUS_STYLES.disconnected;
  const [pushEnabled, setPushEnabled] = useState(
  typeof Notification !== "undefined" && Notification.permission === "granted"
);
  const [pushLoading, setPushLoading] = useState(false);

async function handleEnablePush() {
  setPushLoading(true);
  try {
    await enablePushNotifications(api);
    setPushEnabled(true);
  } catch (err) {
    alert(err.message || "Couldn't enable notifications.");
  } finally {
    setPushLoading(false);
  }
}

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-ink-100 bg-paper/95 shadow-md backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 overflow-x-auto px-3 py-3 sm:gap-3 sm:px-6 sm:py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex shrink-0 items-center gap-2">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-white shadow-lg ring-2 ring-white transition-all duration-300 hover:shadow-xl sm:h-14 sm:w-14">
            <img src={logo} alt="Logo" className="h-full w-full object-cover" />
          </div>

          <span
            className="hidden font-display text-base font-semibold tracking-tight text-ink-900 xs:inline sm:text-lg"
            style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.25)" }}
          >
            TASK MANAGER
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-1.5 text-xs text-ink-500 sm:flex">
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.label}
          </div>

          <button
            type="button"
            onClick={audioEnabled ? disableAudio : enableAudio}
            className={`transition-base shrink-0 rounded-full px-2.5 py-1.5 text-xs font-medium sm:px-3 ${
              audioEnabled ? "bg-ink-900 text-paper" : "bg-ink-100 text-ink-700 hover:bg-ink-200"
            }`}
            title="Notification sound plays when an admin assigns you a task"
          >
            <span className="sm:hidden">{audioEnabled ? "🔔" : "🔕"}</span>
            <span className="hidden sm:inline">
              {audioEnabled ? "🔔 Audio on" : "🔕 Enable audio"}
            </span>
          </button>

          {!pushEnabled && (
            <button
              type="button"
              onClick={handleEnablePush}
              disabled={pushLoading}
              className="transition-base shrink-0 rounded-full bg-secondary-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-secondary-600 disabled:opacity-60 sm:px-3"
              title="Get notified even when your phone is locked or the app is closed"
            >
              <span className="sm:hidden">📲</span>
              <span className="hidden sm:inline">{pushLoading ? "Enabling…" : "📲 Enable alerts"}</span>
            </button>
          )}

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">{user?.employeeId}</p>
            <p className="text-xs leading-tight text-ink-500">{isAdmin ? "Admin" : "Employee"}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="transition-base shrink-0 rounded-md border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-900 hover:text-ink-900 sm:px-3"
          >
            <span className="sm:hidden">⏻</span>
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}