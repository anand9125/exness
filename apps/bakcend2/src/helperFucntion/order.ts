import Decimal from "decimal.js";
import { users } from "../store/store";
import { Balance, Order, Position, User } from "../types/type";
import { v4 as uuidv4 } from "uuid";
const id = uuidv4();

export const checkBalance = (username:string,ins:string,qnt:Decimal)=>{
    const user = users.get(username) as User;
    const balance = user.balance.get(ins);
    const balnceQuantity = balance?.quantity;
    if(balance && balnceQuantity?.greaterThanOrEqualTo(qnt)){
        return true;
    }     
}
export const lockBalance = (username:string,ins:string,qnt:Decimal)=>{
    const user = users.get(username) as User;
    const balance = user.balance.get(ins) as Balance;
    balance.quantity = balance?.quantity.sub(qnt);
    balance.locked =balance?.locked.add(qnt);
}
export const boughtUsingUsdt = (username:string,ins:string,qnt:Decimal)=>{
    const checkUsdt = checkBalance(username,"USDT",qnt);
    if(!checkUsdt){
        return;
    }

    //will do in some time
    
}
export const createOrder=(username:string,ins:string,side:"Buy"|"Sell",volume:Decimal,price:Decimal,stopLoss:Decimal,takeProfit:Decimal,status:"pending"|"executed"|"cancelled")=>{
    const user = users.get(username) as User;
    const order:Order = {
        id:id,
        instrument:ins,
        type:side,
        volumeLot:volume,
        price,
        stopLoss,
        takeProfit,
        status,
        createdAt:new Date(),
    }
    user.orders.push(order)
    return order;
}

export const updateOrder = (username:string,orderId:string,status: "pending" | "executed" | "cancelled")=>{
    const user = users.get(username) as User;
    const order = user.orders.find(order=>order.id===orderId)
    if(!order){
        return;
    }
    order.status=status;
    
}
export const decLockBalance = async(username:string,ins:string,qnt:Decimal)=>{
    const user = users.get(username) as User;
    const balance = user.balance.get(ins) as Balance;
    balance.locked = balance?.locked.sub(qnt);
}
export const creditAssets = async(username:string,ins:string,qnt:Decimal)=>{
     const user = users.get(username) as User;
     user.balance.set(ins,{
        asset:ins,
        quantity:qnt,
        locked:Decimal(0),
     })
}

export const checkMargin = async(username:string,ins:string,margin:Decimal)=>{
    const user = users.get(username) as User;
    const balance = user.balance.get(ins);
    const balnceQuantity = balance?.quantity;
    if(balance && balnceQuantity?.greaterThanOrEqualTo(margin)){
        return true;
    }     
}
export const lockMargin = async(username:string,ins:string,margin:Decimal)=>{
    const user = users.get(username) as User;
    const balance = user.balance.get(ins) as Balance;
    balance.quantity = balance?.quantity.sub(margin);
}
export const openPosition = async(username:string,ins:string,side:"Buy"|"Sell",leverage:Decimal,volume:Decimal,price:Decimal|null,margin:Decimal,borrowed:Decimal,stopLoss:Decimal,takeProfit:Decimal,status:"open"|"closed"|"liquidated")=>{
   const user = users.get(username) as User;
    const position: Position = {
        userId: username,
        instrument: ins,
        side:side,
        leverage,
        volume,
        entryPrice: price as Decimal,
        margin,
        borrowed,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
        status: "open",
        createdAt: new Date(),
    };
    user.positions.push(position);
    return position;
}