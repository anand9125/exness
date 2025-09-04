import { createClient } from "redis";
import { Balance, GetAssetDetails, Position, User } from "../type";
import Decimal from "decimal.js";
import { users } from "../store/store";

const client = createClient();

export const getLatestAssetDetails = async (
  asset: string
): Promise<GetAssetDetails | null> => {
  console.log("i am in getLatestAssetDetails");
  await client.connect();
  console.log("i am connected");
  const assetData = await client.hGetAll(`asset:${asset}`);
  console.log("assetData", assetData);
  if (Object.keys(assetData).length === 0) {
    return null;
  }
  return {
    symbol: assetData.symbol,
    bid_price: assetData.bidPrice,  
    ask_price: assetData.askPrice,  
  };
};

export const checkBalance = async (totalPrice: Decimal, username: string) => {
  const user = users.get(username) as User;

  const balance = user.balance.get("USDT") as Balance;
  if (!balance) return false;

  const balanceQuantity = new Decimal(balance.quantity);
  if (balanceQuantity.greaterThanOrEqualTo(totalPrice)) {
    console.log("Enough balance");
    return true;
  }

  return false;
};

  
export const lockBalance = async (totalPrice: Decimal,username:string) => {
  const user = users.get(username) as User;
  const balance = user.balance.get("USDT") as Balance;
  balance.quantity = balance?.quantity.sub(totalPrice);
  balance.locked =balance?.locked.add(totalPrice);

}
    
export const openPosition = async (username:string,side:"Buy"|"Sell",volume:Decimal,price:Decimal,stopLoss:Decimal,takeProfit:Decimal,status:"open"|"closed"|"liquidated",laverage:Decimal,baseInstrumentId:string,openPrice:Decimal)=>{
   const user = users.get(username) as User;
       const position: Position = {
        userId: username,
        instrument: baseInstrumentId,
        side:side,
        leverage:laverage,
        volume,
        openPrice: openPrice as Decimal,
        margin:price,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
        status: "open",
        createdAt: new Date(),
    };
}

export const deLockBalance = async (username:string,totalPrice:Decimal)=>{
    const user = users.get(username) as User;
    const balance = user.balance.get("USDT") as Balance;
    balance.locked = balance?.locked.sub(totalPrice);
}

export const creditAssets = async (username:string,ins:string,qnt:Decimal)=>{
     const user = users.get(username) as User;
     user.balance.set(ins,{
        asset:ins,
        quantity:qnt,
        locked:Decimal(0),
     })
}
export const getPosition = async (username:string,baseInstrumentId:string,status:"open"|"closed"|"liquidated")=>{
    const user = users.get(username) as User;
    const position = user.positions.find(position=>position.instrument===baseInstrumentId&&position.status===status)
    return position;
}