import type { Data } from "../type";
import {pub} from "../connectionredis/connectredis";

const bidPriceDecrementRate = 0.0005; // spread: bid below mid
const askPriceIncrementRate = 0.0005; // ask above mid

export async function scalewebsocket(data: Data) {
    const fetchedPrice = Number(data.p);
    const bidPrice = fetchedPrice - fetchedPrice * bidPriceDecrementRate;
    const askPrice = fetchedPrice + fetchedPrice * askPriceIncrementRate;

    const symbol = data.s;
    const channel = symbol.replace("USDT", "");

    await pub.publish(channel, JSON.stringify({ symbol, askPrice, bidPrice }));
    await pub.hSet(`asset:${symbol}`, {
        symbol,
        askPrice: String(askPrice),
        bidPrice: String(bidPrice),
    });
}