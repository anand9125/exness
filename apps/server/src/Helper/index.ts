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

export const closePosition =  (position: Position) => {1
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
      const Position = user.positions.find(psn => psn.orderId ===position.orderId) as Position
      Position.pnl = pnl;
      Position.closedAt = new Date();
      Position.currentPrice = position.side === "Buy" ? askPrice : bidPrice;  
      Position.status = "closed";
      const closedPosition=user.positions.find(psn => psn.orderId ===Position.orderId) as Position

      return closedPosition;

  } catch (e) {
      console.log("Error closing position:", e);
      return null;
  }
};


export const checkLiquidation = async (trade: any): Promise<Position[]> => {
  const askPrice = new Decimal(trade.askPrice);
  const bidPrice = new Decimal(trade.bidPrice);
  const closePositions: Position[] = [];

  const allPositions: Position[] = Array.from(users.values())
    .flatMap(user => user.positions)
    .filter(position => position.status === "open");

  const liquidationThreshold = new Decimal(0.9); // Example threshold

  allPositions.forEach(position => {
    if (position.asset === trade.symbol) {
      const exposure = new Decimal(position.exposure ??0);
      const openPrice = new Decimal(position.openPrice);
      const stopLoss = position.stopLoss ? new Decimal(position.stopLoss) : null;
      const takeProfit = position.takeProfit ? new Decimal(position.takeProfit) : null;

      let pnl: Decimal;

      if (position.side === "Buy") {
        pnl = exposure.mul(askPrice.sub(openPrice)).div(openPrice);
           console.log(stopLoss,position.status,askPrice)
        if (stopLoss && position.status==="open" && askPrice.lte(stopLoss)) {
          console.log("Stop loss triggered (Buy)");
          const closedPosition = closePosition(position) as Position;
          console.log("closedPosition",closedPosition)
          closePositions.push(closedPosition);
          // return;
        }
 
        if (takeProfit && position.status=="open" && askPrice.gte(takeProfit)) {
          console.log("Take profit triggered (Buy)");
          const closedPosition = closePosition(position) as Position;
          console.log("closedPosition",closedPosition)
          closePositions.push(closedPosition);
        //  return;
        }

      } else { // "Sell"
        pnl = exposure.mul(openPrice.sub(bidPrice)).div(openPrice);

        if (stopLoss && position.status=="open" && bidPrice.gte(stopLoss)) {
          console.log("Stop loss triggered (Sell)");
          const closedPosition = closePosition(position) as Position;
          console.log("closedPosition",closedPosition)
          closePositions.push(closedPosition);
         // return;
        }

        if (takeProfit &&position.status=="open" && bidPrice.lte(takeProfit)) {
          console.log("Take profit triggered (Sell)");
          const closedPosition = closePosition(position) as Position;
          console.log("closedPosition",closedPosition)
          closePositions.push(closedPosition);
          //return;
        }
      }

      // Liquidation condition (adjust as needed)
      if (pnl.lte(position.margin.mul(-0.9))) {
        console.log("Liquidation triggered");
        const closedPosition = closePosition(position) as Position;
        closePositions.push(closedPosition);
      }
    }
  });

  return closePositions;
};

export const getUserOpenOrder = async (userId: UUID, orderId: UUID) => {
  const user = users.get(userId) as User;
  const openOrders = user.orders.filter(order => order.id === orderId);
  return openOrders;
};