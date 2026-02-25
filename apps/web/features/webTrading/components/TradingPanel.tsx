"use client";
import { useState } from 'react';
import axios from 'axios';
import { Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { useTickStore } from '../../../app/zustand/store';
import { backendUrl } from '../../../lib/url';
import { toast } from 'sonner';
import { OpenOrdersTable } from './opeOrderTable';
import { useUserStore } from '../../../app/zustand/useUserStore';
import { useOpenOrders } from '../../../app/zustand/fetchOpenOrder';

const leverageOptions = [1, 2, 3, 5, 10, 20];
interface TradingPanelProps {
  selectedTick: string;
  className?: string;
}

const TradingPanel = ({ selectedTick , className }: TradingPanelProps) => {
  const candleTick  = useTickStore((state)=>state.candleTick)
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [volume, setVolume] = useState('0.01');
  const [takeProfit, setTakeProfit] = useState("0");
  const [stopLoss, setStopLoss] = useState("0");
  const [leverage, setLeverage] = useState(1);
  const { fetchOpenOrders } = useOpenOrders()

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setLeverage(value);
  };


  const incrementVolume = () => {
    setVolume((prev) => (parseFloat(prev) + 0.01).toFixed(2));
  };

  const decrementVolume = () => {
    setVolume((prev) => Math.max(0.01, parseFloat(prev) - 0.01).toFixed(2));
  };

  const handleOrder = async (orderType:string,volume:string,leverage:number,takeProfit:string,stopLoss:string)=>{
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/order/open`,{
        side: orderType,
        volume,
        leverage,
        takeProfit: takeProfit || "0",
        stopLoss: stopLoss || "0",
        asset: selectedTick,
      },{
        headers:{
          Authorization: token ? `Bearer ${token}` : "",
        }
       })
      if(res.status === 200){
        toast.success("Order placed successfully");
        fetchOpenOrders();
      } else {
        toast.error(res.data?.message || "Order failed");
      }
 }



  return (
    <div className="w-[22rem] bg-[#141920] border-l border-[#2a3441] flex flex-col h-full overflow-y-auto">
      {/* Price */}
      <div className="p-5 border-b border-[#2a3441]">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1f26] border border-[#2a3441] rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingDown size={14} className="text-red-400" />
              <span className="text-red-400 text-xs font-medium uppercase">Sell</span>
            </div>
            <div className="text-red-400 text-lg font-mono font-semibold tabular-nums">
              {candleTick[selectedTick]?.askPrice != null ? Number(candleTick[selectedTick].askPrice).toFixed(2) : '—'}
            </div>
          </div>
          <div className="bg-[#1a1f26] border border-[#2a3441] rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-green-400 text-xs font-medium uppercase">Buy</span>
            </div>
            <div className="text-green-400 text-lg font-mono font-semibold tabular-nums">
              {candleTick[selectedTick]?.bidPrice != null ? Number(candleTick[selectedTick].bidPrice).toFixed(2) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="p-5 border-b border-[#2a3441] flex-1 flex flex-col">
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setOrderType('buy')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              orderType === 'buy'
                ? 'bg-green-600 text-white border border-green-600'
                : 'bg-[#1a1f26] border border-[#2a3441] text-[#b0b8c1] hover:border-[#374151] hover:text-white'
            }`}
          >
            Market Buy
          </button>
          <button
            onClick={() => setOrderType('sell')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              orderType === 'sell'
                ? 'bg-red-600 text-white border border-red-600'
                : 'bg-[#1a1f26] border border-[#2a3441] text-[#b0b8c1] hover:border-[#374151] hover:text-white'
            }`}
          >
            Market Sell
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#6b7280] mb-1.5 block font-medium">Volume (Lots)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={decrementVolume}
                className="w-9 h-9 bg-[#1a1f26] border border-[#2a3441] rounded-lg text-[#b0b8c1] hover:text-white hover:border-[#ff6b00] transition-colors flex items-center justify-center flex-shrink-0"
              >
                <Minus size={14} />
              </button>
              <input
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="flex-1 bg-[#1a1f26] border border-[#2a3441] rounded-lg px-3 py-2.5 text-white text-center font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#ff6b00] focus:border-[#ff6b00] transition-colors"
              />
              <button
                onClick={incrementVolume}
                className="w-9 h-9 bg-[#1a1f26] border border-[#2a3441] rounded-lg text-[#b0b8c1] hover:text-white hover:border-[#ff6b00] transition-colors flex items-center justify-center flex-shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#6b7280] mb-1.5 block font-medium">Take Profit</label>
            <input
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="0"
              className="w-full bg-[#1a1f26] border border-[#2a3441] rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#ff6b00] focus:border-[#ff6b00] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-[#6b7280] mb-1.5 block font-medium">Stop Loss</label>
            <input
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="0"
              className="w-full bg-[#1a1f26] border border-[#2a3441] rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#ff6b00] focus:border-[#ff6b00] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-[#6b7280] mb-1.5 block font-medium">Leverage</label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={leverage}
              onChange={handleSliderChange}
              className="w-full h-2 bg-[#1a1f26] rounded-lg appearance-none cursor-pointer accent-[#ff6b00]"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {leverageOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setLeverage(option)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    leverage === option
                      ? 'bg-[#ff6b00] text-white border border-[#ff6b00]'
                      : 'bg-[#1a1f26] border border-[#2a3441] text-[#b0b8c1] hover:border-[#374151] hover:text-white'
                  }`}
                >
                  {option}x
                </button>
              ))}
            </div>
          </div>

          <button
            className={`w-full py-3 rounded-lg text-sm font-bold text-white transition-colors mt-2 ${
              orderType === 'buy'
                ? 'bg-green-600 hover:bg-green-700 border border-green-600'
                : 'bg-red-600 hover:bg-red-700 border border-red-600'
            }`}
            onClick={() => handleOrder(orderType, volume, leverage, takeProfit, stopLoss)}
          >
            {orderType === 'buy' ? 'Buy' : 'Sell'} {volume} lots
          </button>
        </div>
      </div>
    </div>
  );
}

export default TradingPanel;