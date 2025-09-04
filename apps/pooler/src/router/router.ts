import type { Data } from "../type";
import { connectRedis } from  "../connectionredis/connectredis";
import {pub} from "../connectionredis/connectredis";

const bidPriceIncrementRate = 0.0005;
const askPriceDecrementRate = 0.0005;

export async function scalewebsocket(data:Data){
    
    const fetchedPrice = Number(data.p);
    const bidPrice = fetchedPrice + fetchedPrice * bidPriceIncrementRate;
    const askPrice = fetchedPrice - fetchedPrice * askPriceDecrementRate;
   

    const symbol = data.s;
    const channel = symbol.replace("USDT","")
     console.log("New price : ", bidPrice, askPrice,symbol);
    await pub.publish(channel , JSON.stringify({symbol, askPrice , bidPrice})); //BTC is redis channel
    console.log("Published to Redis", bidPrice, askPrice);
    await pub.hSet(`asset:${symbol}`,{ //using the redis hash we can store the data in redis hash HSET automatically overwrites the field with the new value
        symbol,
        askPrice,   
        bidPrice
    })
}