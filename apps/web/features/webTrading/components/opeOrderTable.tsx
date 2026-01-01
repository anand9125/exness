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

  const token = localStorage.getItem("token");
  useEffect(() => {
      fetchOpenOrders();
  }, []);


  const handleCloseOrder = async (orderId: string, userId: string) => {
    console.log("closing order", orderId, userId);
    try {
     const res= await axios.post(`${backendUrl}/order/closePosition`, {
        orderId,
        userId
      },{
        headers:{
          Authorization:`${token}`
        }
      });
      if(res.status===200){
        toast("order closed sucessfully")
      }
      fetchOpenOrders();
    } catch (error) {
      console.error("Error closing order:", error);
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
    <div className="p-4 border rounded-lg bg-card">
      <h2 className="text-lg font-semibold mb-3">Open Orders</h2>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-trading-border text-trading-text-muted">
            <th>Asset</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Entry</th>
            <th>Current</th>
            <th>Leverage</th>
            <th>Unrealized PnL</th>
            <th>close order</th>
          </tr>
        </thead>
       <tbody>
          {openOrders.map((order) => {
            const tick = globalTick[order.asset];

            // Decide which price to show based on order side (handle casing)
            const sideLower = (order.side || "").toString().toLowerCase();
            const currentPriceRaw = sideLower === "buy" ? tick?.bidPrice : tick?.askPrice;
            const currentPrice = currentPriceRaw != null ? parseFloat(currentPriceRaw as unknown as string) : undefined;
            

            return (
              <tr key={order.orderId} className="border-b border-trading-border/40">
                <td>{order.asset}</td>
                <td className={order.side === "buy" ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                  {order.side}
                </td>
                <td>{order.volume}</td>
                <td>{order.openPrice}</td>
                <td>{currentPrice != null ? currentPrice : <span className="text-gray-500">Loading...</span>}</td>
                <td>{order.leverage}x</td>
                 <td>{calulateUnrealizedPnL(order, currentPrice)} USDT</td>


                <td className="p-2 text-center">
                  <button onClick={() =>  handleCloseOrder(order.orderId, order.userId)} disabled={currentPrice == null} className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-400 text-gray-300 hover:bg-gray-600 hover:text-white transition cursor-pointer">
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>

      </table>
    </div>
  );
};
