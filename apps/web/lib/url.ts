export const backendUrl =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL) ||
  "http://localhost:4000/api/v1";
export const wsUrl =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_URL) ||
  "ws://localhost:8080";
export const KLINES_BASE = "https://fapi.binance.com/fapi/v1/klines";