"use client";

import React, { useEffect, useRef } from 'react'
import { ChartManager, UpdatedCandleData } from '../../../lib/chartManager';
import { CandleTick, GlobalTick, WSMessage } from './interfaces';
import { backendUrl, KLINES_BASE } from '../../../lib/url';
import { useGlobalTickStore, useTickStore } from '../../../app/zustand/store';
import { useOpenOrders } from '../../../app/zustand/fetchOpenOrder';
interface KLine{
    close: string;
    end: string;
    high: string;
    low: string;
    open: string;
    quoteVolume: string;
    start: string;
    trades: string;
    time: string;
    volume: string;
    bucket:string
}
interface TradeChartProps {
  selectedTick:string
  className?: string;
}

const TradeChart = ({ selectedTick, className }: TradeChartProps) => {
    const setTick=  useTickStore((state)=>state.setCandleTick)
      const { openOrders, fetchOpenOrders } = useOpenOrders();
    
    const chartRef = useRef<HTMLDivElement>(null);
    const chartManagerRef = useRef<ChartManager>(null);
    const[interval, setInterval] = React.useState("1m")
    let symbol = selectedTick.toString()
    const setGlobalTick = useGlobalTickStore((state)=>state.setGlobalTick)

    useEffect(() => {
      fetchOpenOrders();
    let chartManager: ChartManager | null = null;

    const init = async () => {
      try {
        const params = new URLSearchParams();
        params.set('symbol', symbol);
        params.set('interval', interval);
        params.set('limit', '500');

        // const res = await fetch(
        //   `${backendUrl}/candles?symbol=${symbol}&interval=${interval}&limit=100`
        // );

        const res = await fetch(`${KLINES_BASE}?${params.toString()}`,{
          method:"GET",
           headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json'
          }
        });
        if(!res.ok){
          throw new Error("Failed to fetch k-lines data");
        }
        console.log(res,"this is res you defintely need it")
        const data = await res.json();
        const candles: KLine[] = data.map((d: any[]) => ({
          time: Math.floor(d[0] / 1000) ,
          open: Number(d[1]),
          high: Number(d[2]),
          low: Number(d[3]),
          close: Number(d[4]),
        }));
        
        // const kLinesData: KLine[] = await res.json();
        // console.log(kLinesData,"this is klines data")
        console.log(candles,"this is candles")

        if (!chartRef.current) return;
        chartManagerRef.current?.destroy();
        const processedCandles = candles
          .map(kline => {
            const ts = new Date(kline.time).getTime();
            return {
              open: parseFloat(kline.open),
              high: parseFloat(kline.high),
              low: parseFloat(kline.low),
              close: parseFloat(kline.close),
              timestamp: ts,
            };
          })
          .filter(candle => !isNaN(candle.timestamp))
          .sort((a, b) => a.timestamp - b.timestamp)
          .filter((candle, idx, arr) => idx === 0 || candle.timestamp > arr[idx - 1]!.timestamp);

        // create new chart
        chartManager = new ChartManager(chartRef.current, processedCandles, {
          background: "#0a0e13",
          color: "#ffffff",
        });

        chartManagerRef.current = chartManager;
      } catch (err) {
        console.error("Error fetching k-lines data:", err);
      }
    };

    init();

    return () => {
      chartManager?.destroy();
      if (chartManagerRef.current === chartManager) {
        chartManagerRef.current = null;
      }
    };
  }, [selectedTick,interval]);

   useEffect(()=>{
      
      const ws = new WebSocket(`ws://localhost:8080/${symbol}`);
      ws.onmessage = (event)=>{
        try {
        const msg:CandleTick = JSON.parse(event.data)
        console.log("this is paraseData",msg)
        console.log(symbol,"this is symbol")
          if(msg.type =="tick" && msg.symbol == symbol){
              setTick(msg)
              console.log(msg,"this is message")
              const candle= msg.candles[interval];
              if(!candle)return;
              const updatedCandle:UpdatedCandleData = {
                open:candle.open.toString(),
                high:candle.high.toString(),
                low:candle.low.toString(),
                close:candle.close.toString(),
                timestamp:new Date(candle.startTime),
              }
              chartManagerRef.current?.updateData(updatedCandle)
            }
            else {
                setGlobalTick(msg as GlobalTick)
            }
          }catch(err){
            console.error("Error parsing message:", err);
          }
      }
      ws.onclose =()=>{
        console.log("Connection closed");
      }
      return ()=>{
        ws.close();
      }
    
   },[symbol,interval])



  return (
    <div className="flex-1 bg-[#0a0e13] border-r border-[#2a3441] relative max-h-[28rem] ">
     
      
      {/* Chart Container */}
      <div ref={chartRef} className="w-full h-full" />
      
      {/* Chart Controls */}
      <div className="absolute top-4 left-4 z-10 bg-[#141920]/90 backdrop-blur-sm rounded-lg p-2 border border-[#2a3441]">
        <div className="flex items-center space-x-2">
          {['1m', '5m', '15m', '30m'].map((timeframe) => (
            <button
              key={timeframe}
              className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-[#2a3441] rounded transition-colors"
              onClick={()=>setInterval(timeframe)}
            >  
              {timeframe}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TradeChart;