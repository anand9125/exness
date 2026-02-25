import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useOpenOrders } from '../../../app/zustand/fetchOpenOrder';
import { OpenOrdersTable } from './opeOrderTable';

function Footer({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<'open' | 'pending' | 'closed'>('open');
  const { openOrders, fetchOpenOrders } = useOpenOrders();

  useEffect(() => {
    fetchOpenOrders();
  }, [fetchOpenOrders]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className={`p-4 ${className ?? ''}`}>
        <div className="flex items-center justify-between pb-3 border-b border-[#2a3441] mb-4">
          <div className="flex gap-6">
            {(['open', 'pending', 'closed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium capitalize transition-colors pb-2 -mb-px border-b-2 ${
                  activeTab === tab
                    ? 'text-[#ff6b00] border-[#ff6b00]'
                    : 'text-[#6b7280] border-transparent hover:text-[#b0b8c1]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="p-1.5 text-[#6b7280] rounded hover:text-white hover:bg-[#1a1f26] transition-colors" aria-label="Settings">
            <Settings size={16} />
          </button>
        </div>

        {openOrders.length > 0 && activeTab === 'open' ? (
          <OpenOrdersTable />
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1a1f26] border border-[#2a3441] rounded-lg flex items-center justify-center mb-3 mx-auto text-[#6b7280]">
                <span className="text-xl">📊</span>
              </div>
              <p className="text-[#b0b8c1] text-sm">No {activeTab} positions</p>
              <p className="text-[#6b7280] text-xs mt-0.5">Your {activeTab} trades will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Footer;
