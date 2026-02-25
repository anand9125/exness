import { checkLiquidation } from "../Helper";

const liveData:{symbol:string,bidPrice:string,askPrice:string}[] = [];

export const sendTradeToServer = async (trade:any)=>{
  await checkLiquidation(trade);
  const existingEntry = liveData.find(entry => entry.symbol === trade.symbol);
  if(existingEntry) {
    existingEntry.bidPrice = trade.bidPrice;
    existingEntry.askPrice = trade.askPrice;
  }
  else{
    liveData.push({
      symbol: trade.symbol,
      bidPrice: trade.bidPrice,  
      askPrice: trade.askPrice,
    })
  }
}

export const getAssetDetails = async (asset: string) => {
  try {
    let entry = liveData.find((e) => e.symbol === asset);
    if (!entry && asset.endsWith("USDT")) {
      entry = liveData.find((e) => e.symbol === asset.replace("USDT", ""));
    }
    if (!entry && !asset.endsWith("USDT")) {
      entry = liveData.find((e) => e.symbol === asset + "USDT");
    }
    return entry ?? null;
  } catch (e) {
    console.error("getAssetDetails error", e);
    return null;
  }
};

