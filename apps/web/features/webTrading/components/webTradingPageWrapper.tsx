"use client"
import { useState } from 'react';
import TradingHeader from './TradingHeader';
import InstrumentSidebar from './InstrumentSidebar';
import TradeChart from './tradeView';
import TradingPanel from './TradingPanel';
import Footer from './footer';

const WebTradingPageWrapper = () => {
  const [selectedTick, setSelectedTick] = useState<string>('BTCUSDT');

  return (
    <div className="trading-layout flex flex-col h-full min-h-screen">
      <TradingHeader />
      <div className="flex-1 flex overflow-hidden min-h-0">
        <InstrumentSidebar setSelectedTick={setSelectedTick} />
        <div className="flex-1 flex flex-col min-w-0">
          <TradeChart selectedTick={selectedTick} />
          <Footer />
        </div>
        <TradingPanel selectedTick={selectedTick} />
      </div>
    </div>
  );
};

export default WebTradingPageWrapper;