import { UTCTimestamp } from "lightweight-charts";

export type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  trades?: number;
};

export type IPosition = {
  id: string;
  margin: number;
  type: "BUY" | "SELL";
  userId: string;
  openPrice: number;
  closePrice: number | null;
  profitLoss: number | null;
  status: "OPEN" | "CLOSE";
  quantity: number;
  symbol: string;
  opendAt: Date;
  closedAt: Date;
  leverage: number;
};

export type OrdersTab = "OPEN" | "CLOSE";
export type OrderSide = "BUY" | "SELL";

export const INTERVALS = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"] as const;
export type Interval = (typeof INTERVALS)[number];