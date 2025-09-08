import Decimal from "decimal.js";

export const placeMarketOrder = async(req:any,res:any)=>{
   try{
       
        const{username,baseInstrumentId,quoteInstrumentId,side,volumeLot,leverage,stopLoss,takeProfit} = req.body;
        const leverageDecimal = new Decimal(leverage);
        const volume = new Decimal(volumeLot);
        const sL = new Decimal(stopLoss);
        const tP = new Decimal(takeProfit);
   }catch(err:any){

   }}