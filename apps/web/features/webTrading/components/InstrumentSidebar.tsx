"use client";

import { useGlobalTickStore } from '../../../app/zustand/store';

interface InstrumentSidebarProps {
  setSelectedTick: (symbol: string) => void;
  className?: string;
}

const InstrumentSidebar = ({ setSelectedTick }: InstrumentSidebarProps) => {
    const globalTick = useGlobalTickStore((state)=>state.gloabalTick)
  return (
    <div className="w-72 bg-[#141920] border-r border-[#2a3441] flex flex-col h-full">
      <div className="p-4 border-b border-[#2a3441]">
        <h2 className="text-white font-semibold text-sm">Market Watch</h2>
      </div>
      <div className="flex-1 overflow-auto trading-scrollbar">
        <div className="border-b border-[#2a3441] bg-[#1a1f26]">
          <div className="grid grid-cols-3 gap-2 px-4 py-2.5 text-xs font-medium text-[#6b7280]">
            <span>Symbol</span>
            <span className="text-right">Bid</span>
            <span className="text-right">Ask</span>
          </div>
        </div>
        <div className="divide-y divide-[#2a3441]">
          {Object.values(globalTick).length === 0 ? (
            <div className="px-4 py-8 text-center text-[#6b7280] text-sm">No symbols yet. Connect to start receiving prices.</div>
          ) : (
            Object.values(globalTick).map((row) => (
              <button
                key={row.symbol}
                type="button"
                onClick={() => setSelectedTick(row.symbol)}
                className="w-full grid grid-cols-3 gap-2 px-4 py-3 text-sm text-left items-center hover:bg-[#1a1f26] transition-colors border-b border-[#2a3441]/50 last:border-0"
              >
                <span className="font-medium text-white truncate">{row.symbol}</span>
                <span className="text-right font-mono text-[#22c55e] tabular-nums">
                  {row.bidPrice != null ? Number(row.bidPrice).toFixed(2) : '—'}
                </span>
                <span className="text-right font-mono text-[#ef4444] tabular-nums">
                  {row.askPrice != null ? Number(row.askPrice).toFixed(2) : '—'}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InstrumentSidebar;