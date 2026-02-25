"use client";

import { create } from "zustand";
import axios from "axios";
import { backendUrl } from "../../lib/url";
import { UUID } from "crypto";

export interface Position {
  orderId: UUID;
  userId: UUID;
  asset: string;
  side: "buy" | "sell";
  leverage: string;
  volume: string;
  openPrice: string;
  margin: string;
  stopLoss: string;
  exposure: string;
  takeProfit: string;
  status: "open" | "closed" | "cancelled";
  createdAt: string;
}

interface GetOpenOrdersResponse {
  position: Position[];
}

interface OrderStore {
  openOrders: Position[];
  fetchOpenOrders: () => Promise<void>;
  setOpenOrders: (orders: Position[]) => void;
}

export const useOpenOrders = create<OrderStore>((set) => {
  return {
    openOrders: [],

    setOpenOrders: (orders: Position[]) => set({ openOrders: orders }),

    fetchOpenOrders: async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await axios.get<GetOpenOrdersResponse>(`${backendUrl}/order/getOpenOrder`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const ordersArray = res.data.position ?? [];
        set({ openOrders: ordersArray });
      } catch (err) {
        console.error("Failed to fetch open orders", err);
        set({ openOrders: [] });
      }
    },
  };
});
