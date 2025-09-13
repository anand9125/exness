export type Data ={
    e: string,
    E: number,
    s:string,
    t:number,
    p:string,
    q:string,
    T:number,
    m:boolean,
    M:boolean
  }

  export const JWTPASSWORD = "secret"
export type Interval = "1m" | "5m" | "15m" | "30m";

export interface GetAssetDetails {
  symbol: string;
  bid_price: string;
  ask_price: string;
}

import { UUID } from "crypto";
// inMemoryDB.ts
import Decimal from "decimal.js";
import z from "zod";
export type User = {
  username:string;
  password: string;
  balance: Map<string, Balance>; // key = asset symbol value = balance
  positions: Position[];
  orders: Order[];
  transactions: Transaction[];
};

export type Instrument = {
  id: number;
  name: string;
  symbol: string;
  orderBook: OrderBook; // in-memory order book
};

export type Balance = {
  asset: string;
  quantity: Decimal;
  locked: Decimal;
};

export type Order = {
  id: string;
  instrument: string;
  type: "Buy" | "Sell";
  volumeLot: Decimal;
  price: Decimal;
  stopLoss?: Decimal;
  takeProfit?: Decimal;
  status: "pending" | "executed" | "cancelled";
  createdAt: Date;
};

export type Position = {
  orderId: UUID;
  userId: UUID;
  asset: string;
  side: "Buy" | "Sell";
  leverage: Decimal;
  volume: Decimal;         // position size (base asset qty)
  openPrice: Decimal;     // open price
  currentPrice?: Decimal;  // last tick price (updated in memory)
  margin: Decimal;         // locked funds
  stopLoss?: Decimal;
  exposure?: Decimal;
  takeProfit?: Decimal;
  pnl?: Decimal;           // real-time profit/loss (computed & cached)
  status: "open" | "closed" | "liquidated";
  createdAt: Date;
  closedAt?: Date;
};


export type Transaction = {
  id: number;
  userId: number;
  type: "deposit" | "withdrawal";
  amount: Decimal;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
};

// Simple OrderBook structure
export type OrderBook = {
  bids: Order[]; // Buy orders sorted by price DESC
  asks: Order[]; // Sell orders sorted by price ASC
};

export const SignupSchema = z.object({
    username:z.string(),
 
    password:z.string()
})

export const SigninSchema = z.object({
    email:z.string(),
    password:z.string()
})


export const placeMarketOrderSchema = z.object({
  username: z.string(),
  baseInstrumentId: z.string(), //the base instrument
  quoteInstrumentId: z.string(), //the quote instrument
  side: z.enum(["Buy", "Sell"]), // assuming Side is either "buy" or "sell"
  volumeLot: z.union([z.string(), z.number()]),
  bid: z.union([z.string(), z.number()]),
  ask: z.union([z.string(), z.number()]),
  stopLoss: z.union([z.string(), z.number()]),
  takeProfit: z.union([z.string(), z.number()]),
  leverage: z.union([z.string(), z.number()]),
});
