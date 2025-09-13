"use client";
import { useEffect } from "react";
// import { useTrades } from "@/store/tradeStore";
import axios from "axios";
import { toast } from "sonner";
import { useOpenOrders } from "../../../app/zustand/fetchOpenOrder";
import { useUserStore } from "../../../app/zustand/useUserStore";
import { backendUrl } from "../../../lib/url";
export const OpenOrdersTable = () => {
  const { openOrders, fetchOpenOrders } = useOpenOrders();
//   const prices = useTrades((state) => state.prices);
 const{token}=useUserStore()
  useEffect(() => {
    fetchOpenOrders();
  }, []);

  const handleCloseOrder = async (orderId: string, closingPrice: number) => {
    try {
     const res= await axios.post(`${backendUrl}/buy/close-order/${orderId}`, {
        closingPrice,
      },{
        headers:{
          Authorization:`Bearer ${token}`
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
            // const livePrice = prices[order.asset]?.price ?? order.openingPrice;
            // const pnl =
            //   order.type === "BUY"
            //     ? (livePrice - order.openingPrice) * order.quantity * order.leverage
            //     : (order.openingPrice - livePrice) * order.quantity * order.leverage;

            return (
              <tr key={order.orderId} className="border-b border-trading-border/40">
                <td>{order.asset}</td>
                <td className={order.type === "BUY" ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                  {order.type}
                </td>
                <td>{order.quantity}</td>
                <td>{order.openingPrice.toFixed(2)}</td>
                {/* <td>{livePrice.toFixed(2)}</td>
                <td>{order.leverage}x</td>
                <td className={pnl >= 0 ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                  {pnl.toFixed(2)}
                </td> */}
                <td className="p-2 text-center">
                  <button
                    className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-400 text-gray-300 hover:bg-gray-600 hover:text-white transition cursor-pointer"
                  //  onClick={() => handleCloseOrder(order.orderId, Number(livePrice.toFixed(2)))}
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
  );
};
