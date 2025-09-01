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
    await pub.publish("BTC" , JSON.stringify({symbol: "BTC", askPrice , bidPrice})); //BTC is redis channel
    console.log("Published to Redis", bidPrice, askPrice);
}