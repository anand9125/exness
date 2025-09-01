import { Tick, Candle, IntervalKey ,TickMessage,CandleUpdateMessage } from "../types/type";
import { upsertCandle,INTERVALS_MIN, finalizeExpiredBuckets } from "../utils/candles";

export class DataStore{
      private liveCandleByKey = new Map<IntervalKey,Candle>();
      private latestTickBySymbol = new Map<string,Tick>();
      private historyByKey = new Map<IntervalKey,Candle[]>();
      private lastBroadCastAt = new Map<string,number>();  //emembers when we last sent updates to avoid spamming clients.
      
      //Handling New Tick → processTick
      processTick(tick:Tick):{tickMessage:TickMessage,hasUpdated:boolean}{
        this.latestTickBySymbol.set(tick.symbol,tick);
        const time = Date.now();
        //build/update live candle for each internval
        const updateCandles:Record<string,Candle> = {};  //Makes an empty object that will store the candle for each timeframe.
         //{ "1m": {…candle…}, "5m": {…}, "15m": {…} }.
        let hasUpdated = false;  //A flag to indicate whether any candle got updated during this tick processing.
     
        for(const minutes of INTERVALS_MIN){
            try{
                const candle = upsertCandle(
                    tick.symbol,
                    time,
                    tick.bidPrice,
                    tick.askPrice,
                    minutes,
                    this.liveCandleByKey,
                    this.historyByKey
                );
                updateCandles[minutes+"m"] = candle;
                hasUpdated = true;
            }catch(e){
                console.error(e);
            }
        }
        return {
            tickMessage:{
                type:"tick",
                symbol:tick.symbol,
                bidPrice:tick.bidPrice,
                askPrice:tick.askPrice,
                ts:tick.ts,
                candles:updateCandles
            },
            hasUpdated
        }
      }
     
      //It’s a rate limiter (throttling check) for broadcasting data (like ticks or candles) to clients.
      //you might send updates too often (hundreds per second). This function ensures you only broadcast once every throttleMs milliseconds per topic.
      shouldBroadCast(topic:string,throttleMs:number):boolean{
        const now = Date.now();
        const last = this.lastBroadCastAt.get(topic)||0;

        if(now-last >= throttleMs){   //Check if enough time has passed since the last broadcast.
            this.lastBroadCastAt.set(topic,now);  //Example: If throttleMs = 1000 (1 second), and last was at 10,000 ms, we can only broadcast again if now >= 11,000.
            return true;
        }
        return false;
      }
      finalizeExpiredBuckets(){
        try{
            finalizeExpiredBuckets(this.liveCandleByKey,this.historyByKey);
        } catch(e){
            console.error(e);
        }
    }        
 }
       
 
