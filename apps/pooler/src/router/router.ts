import type { Data } from "../type";
import { connectRedis } from  "../connectionredis/connectredis";
import {pub} from "../connectionredis/connectredis";

const bidPriceIncrementRate = 0.0005;
const askPriceDecrementRate = 0.0005;

export async function scalewebsocket(data:Data){
    
    const fetchedPrice = Number(data.p);
    const bidPrice = fetchedPrice + fetchedPrice * bidPriceIncrementRate;
    const askPrice = fetchedPrice - fetchedPrice * askPriceDecrementRate;
    console.log("New price : ", bidPrice, askPrice);

    const symbol = data.s;
    const channel = symbol.replace("USDT","")
    await pub.publish(channel , JSON.stringify({symbol, askPrice , bidPrice})); //BTC is redis channel
    console.log("Published to Redis", bidPrice, askPrice);
}