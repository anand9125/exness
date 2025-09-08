"use client";
import { useState } from 'react';
import TradingHeader from './TradingHeader';
import InstrumentSidebar from './InstrumentSidebar';
import TradeChart from './tradeView';
import TradingPanel from './TradingPanel';
import Footer from './footer';

const WebTradingPageWrapper = () => {
  // const [selectedInstrument, setSelectedInstrument] = useState<TradingInstrument | null>(
  //   mockInstruments.find((instrument: TradingInstrument) => instrument.symbol === 'XAU/USD') || null
  // );
  const[selectedTick,setSelectedTick] = useState<string>("BSTUSDT")

  return (
    <div className="trading-layout flex flex-col h-screen">
      <TradingHeader />
      
      <div className="flex-1 flex overflow-hidden">
        <InstrumentSidebar setSelectedTick = {setSelectedTick}
          
          
        />
        <div className="flex-1 flex flex-col">
          <TradeChart selectedTick={selectedTick} />
          <Footer></Footer>
        </div>
        
        <TradingPanel selectedTick ={selectedTick}/>
      </div>
    </div>
  );
};

export default WebTradingPageWrapper;