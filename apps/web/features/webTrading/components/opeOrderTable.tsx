"use client";
import { useEffect } from "react";
// import { useTrades } from "@/store/tradeStore";
import axios from "axios";
import { toast } from "sonner";
import { useOpenOrders } from "../../../app/zustand/fetchOpenOrder";
import { useUserStore } from "../../../app/zustand/useUserStore";
import { backendUrl } from "../../../lib/url";
import { useGlobalTickStore } from "../../../app/zustand/store";
import { glob } from "fs";

export const OpenOrdersTable = () => {
  const { openOrders, fetchOpenOrders } = useOpenOrders();
  const globalTick = useGlobalTickStore((state)=>state.gloabalTick)

  const token = localStorage.getItem("token");
  console.log(token,"this is token this is wahtfasadga")
  useEffect(() => {
      fetchOpenOrders();
  }, []);


  const handleCloseOrder = async (orderId: string, closingPrice: number) => {
    try {
     const res= await axios.post(`${backendUrl}/buy/close-order/${orderId}`, {
        closingPrice,
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

            // Decide which price to show based on order side
            const currentPrice =
              order.side === "Buy" ? tick?.bidPrice : tick?.askPrice;
            

            return (
              <tr key={order.orderId} className="border-b border-trading-border/40">
                <td>{order.asset}</td>
                <td className={order.side === "Buy" ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                  {order.side}
                </td>
                <td>{order.volume}</td>
                <td>{order.openPrice}</td>
                <td>{currentPrice ?? <span className="text-gray-500">Loading...</span>}</td>
                <td>{order.leverage}x</td>

                <td className="p-2 text-center">
                  <button className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-400 text-gray-300 hover:bg-gray-600 hover:text-white transition cursor-pointer">
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
