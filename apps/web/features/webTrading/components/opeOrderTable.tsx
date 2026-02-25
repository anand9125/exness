"use client";
import { useEffect, useMemo } from "react";
// import { useTrades } from "@/store/tradeStore";
import axios from "axios";
import { toast } from "sonner";
import { useOpenOrders } from "../../../app/zustand/fetchOpenOrder";
import { backendUrl } from "../../../lib/url";
import { useGlobalTickStore } from "../../../app/zustand/store";

export const OpenOrdersTable = () => {
  const { openOrders, fetchOpenOrders } = useOpenOrders();
  const globalTick = useGlobalTickStore((state)=>state.gloabalTick)

  useEffect(() => {
      fetchOpenOrders();
  }, []);


  const handleCloseOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/order/closePosition`,
        { orderId },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.status === 200) {
        toast.success("Order closed successfully");
        fetchOpenOrders();
      } else {
        toast.error(res.data?.message || "Failed to close order");
      }
    } catch (error) {
      console.error("Error closing order:", error);
      toast.error("Failed to close order");
    }
  };
  const calulateUnrealizedPnL = (order: any, currentPrice?: number) => {
    const openPrice = Number(order.openPrice || 0);
    const volume = Number(order.volume || 0);

    if (currentPrice == null || isNaN(currentPrice) || isNaN(openPrice) || isNaN(volume)) return "0.00";

    
    const sideLower = (order.side || "").toString().toLowerCase();
    let pnl = 0;
    if (sideLower === "buy") {
      pnl = volume * (currentPrice - openPrice);
    } else {
      pnl = volume * (openPrice - currentPrice);
    }

    return pnl.toFixed(2);
  }

  const pnlMap = useMemo(() => {
    const map: Record<string, { currentPrice?: number; pnl: string }> = {};
    for (const order of openOrders) {
      const tick = globalTick[order.asset];
      const sideLower = (order.side || "").toString().toLowerCase();
      const currentPriceRaw = sideLower === "buy" ? tick?.bidPrice : tick?.askPrice;
      const currentPrice = currentPriceRaw != null ? parseFloat(currentPriceRaw as unknown as string) : undefined;
      const pnl = calulateUnrealizedPnL(order, currentPrice as number | undefined);
      map[order.orderId] = { currentPrice, pnl };
    }
    return map;
  }, [openOrders, JSON.stringify(globalTick)]);

  return (
    <div className="rounded-lg border border-[#2a3441] bg-[#141920] overflow-hidden">
      <h2 className="text-sm font-semibold text-white px-4 py-3 border-b border-[#2a3441]">Open Orders</h2>
      <div className="overflow-x-auto trading-scrollbar">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-[#2a3441] bg-[#1a1f26]">
              <th className="px-4 py-2.5 text-xs font-medium text-[#6b7280]">Asset</th>
              <th className="px-4 py-2.5 text-xs font-medium text-[#6b7280]">Type</th>
              <th className="px-4 py-2.5 text-xs font-medium text-[#6b7280]">Qty</th>
              <th className="px-4 py-2.5 text-xs font-medium text-[#6b7280]">Entry</th>
              <th className="px-4 py-2.5 text-xs font-medium text-[#6b7280]">Current</th>
              <th className="px-4 py-2.5 text-xs font-medium text-[#6b7280]">Leverage</th>
              <th className="px-4 py-2.5 text-xs font-medium text-[#6b7280]">Unrealized PnL</th>
              <th className="px-4 py-2.5 text-xs font-medium text-[#6b7280] w-12 text-center">Close</th>
            </tr>
          </thead>
          <tbody>
            {openOrders.map((order) => {
              const tick = globalTick[order.asset];
              const sideLower = (order.side || '').toString().toLowerCase();
              const currentPriceRaw = sideLower === 'buy' ? tick?.bidPrice : tick?.askPrice;
              const currentPrice = currentPriceRaw != null ? parseFloat(currentPriceRaw as unknown as string) : undefined;

              return (
                <tr key={order.orderId} className="border-b border-[#2a3441]/60 hover:bg-[#1a1f26]/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-white">{order.asset}</td>
                  <td className={`px-4 py-2.5 font-medium ${sideLower === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {order.side}
                  </td>
                  <td className="px-4 py-2.5 text-[#b0b8c1]">{order.volume}</td>
                  <td className="px-4 py-2.5 text-[#b0b8c1] font-mono tabular-nums">{order.openPrice}</td>
                  <td className="px-4 py-2.5 text-[#b0b8c1] font-mono tabular-nums">
                    {currentPrice != null ? currentPrice : <span className="text-[#6b7280]">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-[#b0b8c1]">{order.leverage}x</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-[#b0b8c1]">
                    {calulateUnrealizedPnL(order, currentPrice)} USDT
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleCloseOrder(order.orderId)}
                      disabled={currentPrice == null}
                      className="w-8 h-8 flex items-center justify-center rounded border border-[#2a3441] text-[#6b7280] hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
