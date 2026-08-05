import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext(null);

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000";
const RECONNECT_DELAY_MS = 3000;

export function WebSocketProvider({ children }) {
  const { token, user, isAuthenticated } = useAuth();

  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // disconnected | connecting | connected
  const [audioEnabled, setAudioEnabled] = useState(
    () => localStorage.getItem("audio_enabled") === "true"
  );
  const [lastMessage, setLastMessage] = useState(null);

  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  // Lazily create the Audio element once.
  if (!audioRef.current) {
    audioRef.current = new Audio("/notification.mp3");
  }

  const playChime = useCallback(() => {
    if (!audioEnabled) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Autoplay was blocked (e.g. the user hasn't interacted with the page
      // since it loaded, or hasn't granted audio yet). Fail silently -
      // the in-app notification still shows.
    });
  }, [audioEnabled]);

  // "Enable Audio Notifications" button handler. Browsers require a real
  // user gesture before allowing audio playback, so this plays (and
  // immediately allows) a zero-length sound to unlock playback for later,
  // programmatic calls to playChime().
  const enableAudio = useCallback(() => {
    audioRef.current
      .play()
      .then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setAudioEnabled(true);
        localStorage.setItem("audio_enabled", "true");
      })
      .catch(() => {
        // Even if the unlock attempt fails, still flip the preference on;
        // the next real notification will retry playback.
        setAudioEnabled(true);
        localStorage.setItem("audio_enabled", "true");
      });
  }, []);

  const disableAudio = useCallback(() => {
    setAudioEnabled(false);
    localStorage.setItem("audio_enabled", "false");
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token || !user?.employeeId) {
      // Not logged in - make sure any existing socket is closed.
      socketRef.current?.close();
      socketRef.current = null;
      setConnectionStatus("disconnected");
      return;
    }

    let cancelled = false;

    function connect() {
      if (cancelled) return;
      setConnectionStatus("connecting");

      const url = `${WS_BASE_URL}/ws/${encodeURIComponent(
        user.employeeId
      )}?token=${encodeURIComponent(token)}`;
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        if (cancelled) return;
        setConnectionStatus("connected");
      };

      socket.onmessage = (event) => {
        if (cancelled) return;
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          if (data.type === "TASK_ASSIGNED") {
            playChime();
          }
        } catch {
          // Ignore malformed payloads.
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        setConnectionStatus("disconnected");
        // Auto-reconnect (e.g. after a brief network blip or server restart).
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, user?.employeeId, playChime]);

  const value = {
    connectionStatus,
    lastMessage,
    audioEnabled,
    enableAudio,
    disableAudio,
  };

  return (
    <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
  );
}

export function useTaskSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useTaskSocket must be used within a WebSocketProvider");
  return ctx;
}
