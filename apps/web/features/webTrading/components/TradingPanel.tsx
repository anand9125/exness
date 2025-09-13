"use client";
import { useState } from 'react';
import axios from 'axios';
import { Settings, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { useTickStore } from '../../../app/zustand/store';
import { backendUrl } from '../../../lib/url';
import { toast } from 'sonner';
import { OpenOrdersTable } from './opeOrderTable';

const leverageOptions = [1, 2, 3, 5, 10, 20];
interface TradingPanelProps {
  selectedTick: string;
}

const TradingPanel = ({ selectedTick }: TradingPanelProps) => {
  const candleTick  = useTickStore((state)=>state.candleTick)
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [volume, setVolume] = useState('0.01');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [activeTab, setActiveTab] = useState<'open' | 'pending' | 'closed'>('open');
  const [leverage, setLeverage] = useState(1);

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
      const res = await axios.post(`${backendUrl}/order/open`,{
        symbol:selectedTick,
        side:orderType,
        volume:volume,
        leverage:leverage,
        takeProfit:takeProfit,
        stopLoss:stopLoss,
        asset:"USDT",
        userId:"dcdffd7e-1fe7-4d1d-bcf2-461a828471b1"

      })
      console.log(res)
      if(res.status === 200){
        toast("order placed sucessfully");
        OpenOrdersTable();

   }
 }



  return (
    <div className="w-96 bg-[#141920] border-l border-[#2a3441] flex flex-col h-full">
      {/* Current Price Display */}
      <div className="p-6 border-b border-[#2a3441]">
        <div className="text-center mb-6">
        
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown size={16} className="text-red-400 mr-1" />
              <span className="text-red-400 text-xs font-medium">SELL</span>
            </div>
            <div className="text-red-400 text-lg font-mono font-bold">
             {candleTick[selectedTick]?.askPrice?.toFixed(2)}
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={16} className="text-green-400 mr-1" />
              <span className="text-green-400 text-xs font-medium">BUY</span>
            </div>
            <div className="text-green-400 text-lg font-mono font-bold">
             {candleTick[selectedTick]?.bidPrice?.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="p-6 border-b border-[#2a3441]">
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setOrderType('buy')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              orderType === 'buy' 
                ? 'bg-green-500 text-white' 
                : 'bg-[#1a1f26] border border-[#2a3441] text-gray-400 hover:text-white'
            }`}
          >
            Market Buy
          </button>
          <button
            onClick={() => setOrderType('sell')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              orderType === 'sell' 
                ? 'bg-red-500 text-white' 
                : 'bg-[#1a1f26] border border-[#2a3441] text-gray-400 hover:text-white'
            }`}
          >
            Market Sell
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block font-medium">Volume (Lots)</label>
            <div className="flex items-center space-x-2">
              <button 
                onClick={decrementVolume}
                className="w-8 h-8 bg-[#1a1f26] border border-[#2a3441] rounded text-gray-400 hover:text-white hover:border-[#ff6b00] transition-colors flex items-center justify-center"
              >
                <Minus size={14} />
              </button>
              <input
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="flex-1 bg-[#1a1f26] border border-[#2a3441] rounded-lg px-3 py-2 text-white text-center font-mono focus:outline-none focus:border-[#ff6b00] transition-colors"
              />
              <button 
                onClick={incrementVolume}
                className="w-8 h-8 bg-[#1a1f26] border border-[#2a3441] rounded text-gray-400 hover:text-white hover:border-[#ff6b00] transition-colors flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block font-medium">Take Profit</label>
            <input
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Not set"
              className="w-full bg-[#1a1f26] border border-[#2a3441] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#ff6b00] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block font-medium">Stop Loss</label>
            <input
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Not set"
              className="w-full bg-[#1a1f26] border border-[#2a3441] rounded-lg px-3 py-1 text-white font-mono focus:outline-none focus:border-[#ff6b00] transition-colors"
            />
          </div>
          <div className="w-96 bg-[#141920] flex flex-col h-full  text-white">
      <h2 className="text- font-medium pb-4">Leverage Control</h2>

      {/* Slider */}
      <input
        type="range"
        min="1"
        max="20"
        step="1"
        value={leverage}
        onChange={handleSliderChange}
        className="w-full accent-blue-500 max-w-80"
      />

    

      {/* Predefined Buttons */}
      <div className="flex flex-wrap pl-4 gap-2 pt-4 ">
        {leverageOptions.map((option) => (
          <button
            key={option}
            onClick={() => setLeverage(option)}
            className={`px-3 py-1 rounded text-sm ${
              leverage === option
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {option}x
          </button>
        ))}
      </div>

      
    </div>

          <button
            className={`w-full py-3 rounded-lg font-bold text-white transition-colors pt-2 ${
              orderType === 'buy' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
            // onClick={() => console.log(`${orderType.toUpperCase()} order placed`)}
            onClick={()=>{handleOrder(orderType,volume,leverage,takeProfit,stopLoss)}}
          >
            {orderType === 'buy' ? 'BUY' : 'SELL'} {volume} lots
          </button>
        </div>
      </div>

      {/* Positions/Orders Section */}
    
    </div>
  );
}

export default TradingPanel;