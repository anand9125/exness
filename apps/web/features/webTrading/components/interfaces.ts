export interface GlobalTick {
    symbol:string;
    bidPrice:number;
    askPrice:number;
}

export interface CandleTick{
    type:"tick",
    symbol:string,
    bidPrice:number,
    askPrice:number,
    candles:{
        [interval:string]:{
            open:number,
            high:number,
            low:number,
            close:number,
            startTime:number,
        }
    }
}

export type WSMessage = CandleTick | GlobalTick;