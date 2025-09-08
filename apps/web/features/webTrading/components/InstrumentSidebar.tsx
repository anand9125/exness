"use client";
import { useEffect, useState } from 'react';
import { Search, Star } from 'lucide-react';

import { CandleTick, GlobalTick, WSMessage } from './interfaces';
import { useGlobalTickStore, useTickStore } from '../../../app/zustand/store';
//import {WebSocket} from 'ws';
interface InstrumentSidebarProps {
  setSelectedTick: (symbol: string) => void;
}

const InstrumentSidebar = ({ setSelectedTick }: InstrumentSidebarProps) => {
   
    const globalTick = useGlobalTickStore((state)=>state.gloabalTick)
    const candleTick  = useTickStore((state)=>state.candleTick)
  
 
  return (
    <div className="w-80 bg-[#141920] border-r border-[#2a3441] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#2a3441]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Market Watch</h2>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Star size={18} />
          </button>
        </div>
      </div>
       <div className="w-full rounded-2xl overflow-hidden border border-[#2a3441]">
    {/* Header */}
      <div className="px-4 py-3 border-b border-[#2a3441] bg-[#1a1f26]">
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 font-medium">
          <span>Symbol</span>
          <span className="text-right">Bid</span>
          <span className="text-right">Ask</span>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#2a3441] bg-[#0f1318]">
        {Object.values(globalTick).map((row) => (
          <div
            key={row.symbol}
            onClick={() => setSelectedTick(row.symbol)}
            className="grid grid-cols-3 gap-2 px-4 py-3 text-sm items-center cursor-pointer hover:bg-[#1c222b] "
          >
            <span className="font-medium text-white">{row.symbol}</span>

            <button className="text-right text-blue-400 hover:text-blue-300 cursor-pointer ">
              {row.bidPrice?.toFixed(2)}
            </button>
            <button className="text-right text-yellow-400 hover:text-yellow-300 cursor-pointer">
              {row.askPrice?.toFixed(2)}
            </button>
          </div>
        ))}
      </div>


    </div>

       
    </div>
  );
};

export default InstrumentSidebar;