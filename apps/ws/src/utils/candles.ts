import { Candle,IntervalKey } from "../types/type";
export const INTERVALS_MIN = [1,5,15,30];
const MAX_CANDLE_PER_SERIES = 500;
export function intervalKey(symbol:string,minutes:number):IntervalKey{  //This just creates a unique name for each candle series.
    return `${symbol}_${minutes}m`;  //This way, we can store candles for multiple symbols and intervals separately in a Map
}

export function bucketStartMs(tsMs: number, minutes: number): number {  //This function takes a timestamp(ms) and interval size(minutes 1,5,15,30) and returns the start time of the bucket.
// Every candle starts at a fixed rounded time (like 10:00, 10:01, 10:05).

// Example:
// Suppose timestamp = 10:03:42 (in ms).
// For 1m candle: start = 10:03:00.
// For 5m candle: start = 10:00:00.
  return Math.floor(tsMs / (minutes * 60_000)) * (minutes * 60_000);
}

export function midPrice(bid: number, ask: number): number {
  return (bid + ask) / 2;
}


export function pushToHistory(historyByKey:Map<IntervalKey,Candle[]>,key:IntervalKey,candle:Candle){
    const history = historyByKey.get(key);
    if(history){
        history?.push(candle);
        if(history?.length> MAX_CANDLE_PER_SERIES){
            history?.shift(); //Remove the oldest candle
        }
        historyByKey.set(key,history);
    }
}
// export function upsertCandle(symbol,ts,b)
export function upsertCandle(symbol:string,ts:number,bid:number,ask:number,minutes:number,liveCandleByKey:Map<IntervalKey,Candle>,historyByKey:Map<IntervalKey,Candle[]>):Candle{
//     upsertCandle = Update or Insert Candle
// Takes a tick (ts, bid, ask) for a given symbol and interval (minutes).
// Decides whether this tick belongs to the current live candle or should start a new candle.
// Updates Open, High, Low, Close (OHLC) values.
// Keeps track of both live candle and history of past candles.
     const price = midPrice(bid,ask);
     console.log(ts,minutes,price,"these are my things");
     //find which bucket this tick belongs to
     const start = bucketStartMs(ts,minutes);
     const key  = intervalKey(symbol,minutes);
     const current= liveCandleByKey.get(key);  //Looks in the map for a candle that’s currently being built.
     if(!current || current.startTime !== start){ //(!current -> there is no candle stored yet for this symbol + interval.)
      //current.startTime !== start → we already have a candle, but it belongs to an old bucket (old time interval)
      //If there is no candle yet OR the tick has moved into a new interval bucket

      const freshCandle:Candle = {
        startTime: start,
        open: price,
        high: price,
        low: price,
        close: price,
      };
      if(current && current.startTime < start){
        //If there was an old candle, push it into history:
        pushToHistory(historyByKey,key,current);
      }
      liveCandleByKey.set(key,freshCandle); //Create a new candle for this interval
      return freshCandle;
    
     }
     else{
      //Still inside the same candle (same bucket)
          // Update existing candle
        current.high = Math.max(current.high, price);
        current.low = Math.min(current.low, price);
        current.close = price;
        return current;
     }
}

//  Every time a tick comes:
// Check which candle bucket it belongs to.
// If bucket changed → close old candle (push to history), start new candle.
// If still in same bucket → update high, low, close.
// Store live candle separately, keep history in another map.










//Function purpose =>finalizeExpiredBuckets = Close out any old candle whose time bucket has passed, and start the next one.

export function finalizeExpiredBuckets( liveCandleByKey: Map<IntervalKey, Candle>,historyByKey: Map<IntervalKey, Candle[]>
): void {
  const now = Date.now();
  
  for (const [key, candle] of liveCandleByKey.entries()) {
    const minutes = parseInt(key.split('_')[1].replace('m', ''), 10);
    const currentBucketStart = bucketStartMs(now, minutes);

    if (candle.startTime < currentBucketStart) {
      // This bucket has expired, finalize it
      pushToHistory(historyByKey, key, candle);
      
      // Start new candle for current bucket
      const fresh: Candle = {
        startTime: currentBucketStart,
        open: candle.close,
        high: candle.close,
        low: candle.close,
        close: candle.close,
      };
      liveCandleByKey.set(key, fresh);
    }
  }

}
