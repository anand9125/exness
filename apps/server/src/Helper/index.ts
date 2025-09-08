import { createClient } from "redis";
import { Balance, GetAssetDetails, Position, User } from "../type";
import Decimal from "decimal.js";
import { users } from "../store/store";
import { UUID } from "crypto";

const client = createClient();
 client.connect().then(() => {
  console.log("Redis client connected");
})


const liveData:{symbol:string,bid_price:string,ask_price:string}[] = [];


export const checkBalance = async (totalPrice: Decimal, userId: UUID) => {
  const user = users.get(userId) as User;
  console.log("user",user)
  const balance = user.balance.get("USDT") as Balance;
  console.log("balance",balance)
  if (!balance) return false;

  const balanceQuantity = new Decimal(balance.quantity);
  if (balanceQuantity.greaterThanOrEqualTo(totalPrice)) {
    console.log("Enough balance");
    return true;
  }

  return false;
};

  
export const lockBalance = async (totalPrice: Decimal,userId:UUID) => {
  const user = users.get(userId) as User;
  const balance = user.balance.get("USDT") as Balance;
  balance.quantity = balance?.quantity.sub(totalPrice);
  balance.locked =balance?.locked.add(totalPrice);

}
    
export const openPosition = async (orderId:UUID,userId:UUID,side:"Buy"|"Sell",volume:Decimal,entryPrice:Decimal,stopLoss:Decimal,takeProfit:Decimal,status:"open"|"closed"|"liquidated",laverage:Decimal,baseInstrumentId:string,openPrice:Decimal)=>{
   const user = users.get(userId) as User;
   const exposure = laverage.mul(entryPrice);
       const position: Position = {
        orderId,
        userId: userId,
        asset:baseInstrumentId,
        side:side,
        leverage:laverage,
        volume,
        openPrice: openPrice as Decimal,
        margin:entryPrice,
        stopLoss: stopLoss,
        exposure,
        takeProfit: takeProfit,
        status: "open",
        createdAt: new Date(),
    };
    user.positions.push(position);
    return position;
}

export const deLockBalance = async (userId:UUID,totalPrice:Decimal)=>{
    const user = users.get(userId) as User;
    const balance = user.balance.get("USDT") as Balance;
    balance.locked = balance?.locked.sub(totalPrice);
}

export const creditAssets = async (userId:UUID,asset:string,qnt:Decimal)=>{
     const user = users.get(userId) as User;
     user.balance.set(asset,{
        asset,
        quantity:qnt,
        locked:Decimal(0),
     })
}
export const getPosition = async (userId:UUID,baseInstrumentId:string,status:"open"|"closed"|"liquidated")=>{
    const user = users.get(userId) as User;
    const position = user.positions.find(position=>position.asset===baseInstrumentId&&position.status===status)
    return position;
}

export const getUserPosition = async (orderId:UUID,userId:UUID)=>{
  const user = users.get(userId) as User;
  const position = user.positions.find(position=>position.orderId===orderId)
  return position;  
}

export const getBalance = async (userId:UUID)=>{
  const user = users.get(userId) as User;
  const balance = user.balance.get("USDT") as Balance;
  return balance;
}

export const getAllBalances = async (userId:UUID)=>{
  const user = users.get(userId) as User;
  const balance =   Array.from(user.balance.entries()).map(([asset, balance]) => ({  //newUser.balances is a Map (.entries() return a itratior of key,value pairs from the map  && Array.from() converts the iterator to an array)
    asset,
    balance: balance.quantity.toString(),
  }))
  return balance;
  }

export const closePosition =  (position: Position) => {
  const user = users.get(position.userId) as User;
  const currentAssetDetails = { bid_price: "1001", ask_price: "1000" };
//const currentAssetDetails = await getLatestAssetDetails(position.asset) as GetAssetDetails;
  const askPrice = new Decimal(currentAssetDetails.ask_price);
  const bidPrice = new Decimal(currentAssetDetails.bid_price);
  let pnl: Decimal;

  try {
      if (!position.exposure) throw new Error("Exposure is missing");

      if (position.side === "Buy") {
          pnl = position.exposure.mul(askPrice.sub(position.openPrice)).div(position.openPrice);
      } else {
          pnl = position.exposure.mul(position.openPrice.sub(bidPrice)).div(position.openPrice);
      }

      const qntUseBet = position.volume;
      const oldQnt = user.balance.get(position.asset)?.quantity ?? new Decimal(0);
      const remQnt = oldQnt.sub(qntUseBet);

      if (remQnt.lte(0)) {
          user.balance.delete(position.asset);
      } else {
          user.balance.set(position.asset, {
              asset: position.asset,
              quantity: remQnt,
              locked: new Decimal(0),
          });
      }

      const usdtBalance = user.balance.get("USDT");
      if (!usdtBalance) throw new Error("USDT balance not found");

      usdtBalance.quantity = usdtBalance.quantity.add(position.margin.add(pnl));

      const closedPosition: Position = {
          ...position,
          pnl,
          closedAt: new Date(),
          currentPrice: position.side === "Buy" ? askPrice : bidPrice,
          status: "closed",
      };

      return closedPosition;

  } catch (e) {
      console.log("Error closing position:", e);
      return null;
  }
};


export const checkliquidation = async(trade:any)=>{
    const askPric = new Decimal(trade.askPrice);
    const bidPric = new Decimal(trade.bidPrice);
    const closePositions:Position[]=[]
    const allPositions:Position[] = Array.from(users.values()).flatMap(user => user.positions).filter(position => position.status === "open");
    //flatMap =>its combination of two steps in one
    //map(): Transforms each element of an array. (if we do only map it will be ;[ ['order1', 'order2'], ['order3'], ['order4', 'order5'] ])
    // flat(): Flattens the result by 1 level. (if we use flat after the map it will be ['order1', 'order2', 'order3', 'order4', 'order5']) from that we can get all the positions in one array
    allPositions.forEach(position=>{
      if(position.asset===trade.symbol){
        let pnl:Decimal;
        if (position.side === "Buy") {
            pnl = position?.exposure?.mul(trade.askPrice.sub(position.openPrice)).div(position.openPrice) as Decimal
            if(position.stopLoss && askPric.lte(position.stopLoss)){
               const closedPosition= closePosition(position) as Position
                 closePositions.push(closedPosition)
            }else{
              if(position.takeProfit && askPric.gte(position.takeProfit)){
                const closedPosition= closePosition(position) as Position
                 closePositions.push(closedPosition)
               }
            }
        } else {
            pnl = position?.exposure?.mul(position.openPrice.sub(trade.bidPrice)).div(position.openPrice) as Decimal
            if(position.stopLoss && bidPric.gte(position.stopLoss)){
                 console.log("stop loss triggered")
                 const closedPosition= closePosition(position) as Position
                 closePositions.push(closedPosition)
            }else{
              if(position.takeProfit && bidPric.lte(position.takeProfit)){
                console.log("take profit triggered")
                const closedPosition= closePosition(position) as Position
                closePositions.push(closedPosition)
              }
            }
        }
        const limit = Decimal(0.9)
        if(pnl.gt(limit.mul(position.margin))){
           const closedPosition= closePosition(position) as Position
           closePositions.push(closedPosition)
        }        
      }
    })
    return closePositions;
}
