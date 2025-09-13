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
    <div className='max-h-full'>
         <div className={`p-4 ${className}`}>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#2a3441]">
            <div className="flex space-x-6 pl-4">
              {['open', 'pending', 'closed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-[#ff6b00] border-b-2 border-[#ff6b00] pb-1 font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="text-gray-400 hover:text-white transition-colors pr-4">
              <Settings size={16} />
            </button>
          </div>

          {openOrders.length > 0 && activeTab === 'open' ? (
            <OpenOrdersTable />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#1a1f26] rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="text-gray-400 text-sm mb-2">No {activeTab} positions</div>
                <div className="text-gray-500 text-xs">
                  Your {activeTab} trades will appear here
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Footer;
