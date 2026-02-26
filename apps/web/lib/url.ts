const isBrowser = typeof window !== "undefined";
const currentHost = isBrowser ? window.location.hostname : undefined;

const DEFAULT_BACKEND_URL =
  currentHost && currentHost.endsWith("anandchaudhary.com")
    ? "https://exness-server.anandchaudhary.com/api/v1"
    : "http://localhost:4000/api/v1";

const DEFAULT_WS_URL =
  currentHost && currentHost.endsWith("anandchaudhary.com")
    ? "wss://exness-ws.anandchaudhary.com"
    : "ws://localhost:8080";

export const backendUrl =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL) ||
  DEFAULT_BACKEND_URL;

export const wsUrl =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_URL) ||
  DEFAULT_WS_URL;

export const KLINES_BASE = "https://fapi.binance.com/fapi/v1/klines";