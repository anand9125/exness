export interface Tick {
  symbol: string;
  bidPrice: number;
  askPrice: number;
  ts: number;
}

export interface Candle {  //a structure that stores candle data (open, high, low, close, startTime).
  startTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type IntervalKey = `${string}_${number}m`;  //just a type that looks like "BTCUSD_1m"

export interface TickMessage {
  type: "tick";
  symbol: string;
  bidPrice: number;
  askPrice: number;
  ts: number;
  candles: Record<string, Candle>;
}

export interface CandleUpdateMessage {
  type: "candle_update";
  symbol: string;
  ts: number;
  candles: Record<string, Candle>;
}

export interface HelloMessage {
  type: "hello";
  msg: string;
  timestamp: number;
}

export interface ErrorMessage {
  type: "error";
  message: string;
  timestamp: number;
}

export type WSMessage = TickMessage | CandleUpdateMessage | HelloMessage | ErrorMessage;