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

export const getAssetDetails = async (asset:string) => {
  try{
     const assetDetails = liveData.find(entry => entry.symbol === asset);
     return assetDetails ?? null;
  }
  catch(e){
    console.log("error",e)
    return null;
  }  
}

