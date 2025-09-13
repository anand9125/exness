"use client";

import { create } from "zustand";
import axios from "axios";
import { useUserStore } from "./useUserStore";
import { backendUrl } from "../../lib/url";
import { UUID } from "crypto";

export interface Position {
  orderId: UUID;
  userId: UUID;
  asset: string;
  side: "Buy" | "Sell";
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

export const useOpenOrders = create<OrderStore>((set, get) => {

  const token = localStorage.getItem("token");
  return {
    openOrders: [],

    setOpenOrders: (orders: Position[]) => set({ openOrders: orders }),

    fetchOpenOrders: async () => {
      try {
        console.log("Fetching Open Orders")
        const res = await axios.get<GetOpenOrdersResponse>(`${backendUrl}/order/getOpenOrder`, {
          headers: { Authorization: `${token}` },
        });

        const ordersArray = res.data.position;
        console.log("Fetched Open Orders:", ordersArray);

        set({ openOrders: ordersArray });
      } catch (err) {
        console.error("Failed to fetch open orders", err);
      }
    },
  };
});
