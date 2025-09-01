import Decimal from "decimal.js";
import { placeMarketOrderSchema } from "../types/type";


import { createClient } from "redis";
import {  checkBalance,  checkMargin,  createOrder,  creditAssets,   decLockBalance,  lockBalance, lockMargin, openPosition, updateOrder } from "../helperFucntion/order";
import { users } from "../store/store";

let latestPrice: Decimal | null = null ;

async function startListener() {
  const subscriber = createClient();
  await subscriber.connect();

  await subscriber.subscribe("*", (message) => {
    // message is the price update from Pooler
    latestPrice = JSON.parse(message).price;
  });
}
startListener();
export const placeMarketOrder = async(req:any,res:any)=>{
   try{
       
        const{username,baseInstrumentId,quoteInstrumentId,side,volumeLot,leverage,stopLoss,takeProfit} = req.body
        const Leverage = Decimal(leverage)
        const volume = new Decimal(volumeLot) 
        const sL = new Decimal(stopLoss)
        const tP = new Decimal(takeProfit)
        const margin = volume.mul(latestPrice as Decimal).div(Leverage)
       
        if(side == "Buy"){
          if(leverage ==1){
            const totalPricTopaid = latestPrice?.mul(volume) as Decimal;
            const isBalanceEnough = await checkBalance(username,quoteInstrumentId,totalPricTopaid)
            if(!isBalanceEnough){
                res.status(400).json({
                    message:"Insufficient funds"
                })
                return
            }
            await lockBalance(username,quoteInstrumentId,totalPricTopaid) 
            const order= await createOrder(username,baseInstrumentId,side,volume,totalPricTopaid,stopLoss,takeProfit,"pending")
            await decLockBalance(username,quoteInstrumentId,totalPricTopaid)
            await creditAssets(username,baseInstrumentId,volume) 
            await updateOrder(username,order.id,"executed")
          }
          else {
            const isEnoughMargin = await checkMargin(username,quoteInstrumentId,margin);
            if(!isEnoughMargin){
                res.status(400).json({
                    message:"Insufficient margin"
                })
                return
            }
            await lockMargin(username,quoteInstrumentId,margin)
            const totalPriceBet = Leverage.mul(margin);
            const borrowed = totalPriceBet.sub(margin);
            const position = await openPosition(username,baseInstrumentId,side,leverage,volume,latestPrice,margin,borrowed,sL,tP,"open")
            
          }
        } else{
            if(leverage ==1 ){
                const isBalanceEnough = await checkBalance(username,baseInstrumentId,volume)
                if(!isBalanceEnough){
                    return res.status(400).json({
                        message:"Insufficient balance"
                    })
                }
                await lockBalance(username,baseInstrumentId,volume)

                const order =  await createOrder(username,quoteInstrumentId,side,volume,latestPrice?.mul(volume) as Decimal,stopLoss,takeProfit,"pending")
                await decLockBalance(username,baseInstrumentId,volume)
                await creditAssets(username,quoteInstrumentId,latestPrice?.mul(volume) as Decimal)
                await updateOrder(username,order.id,"executed")
            }
            else{
                 
           }
       }
            //seller must have enough base
            //if user not have same base then buy using usdt

       
        // if(parseData.data.side == "Buy"){
        //     //resle lcoked quote and creadit base assets
        //       //dec locked quote
        //     const  totalPricTopaid = latestPrice?.mul(volume) as Decimal;
   
        // }
        // else{
        //     await decLockBalance(parseData.data.username,parseData.data.baseInstrumentId,volume)
        //     await creditAssets(parseData.data.username,parseData.data.quoteInstrumentId,latestPrice?.mul(volume) as Decimal)
        // }  
    }
    catch(err){
       res.status(500).json({
           message:"Internal server error"
       })
    }

}

