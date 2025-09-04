import { Router } from "express";
import { Request,Response } from "express";
const router = Router();
import Decimal from "decimal.js";
import { checkBalance, creditAssets, deLockBalance, getLatestAssetDetails, getPosition, lockBalance, openPosition } from "../Helper";
import {GetAssetDetails} from "../type";

router.post("/open",async(req:Request,res:Response)=>{
    let{side,volume,asset,stopLoss,takeProfit,username,laverage,baseInstrumentId} = req.body;
    volume = new Decimal(volume);
    stopLoss = new Decimal(stopLoss);
    takeProfit = new Decimal(takeProfit);
    laverage = new Decimal(laverage);
    console.log("i got the request",req.body)
     try{

        if(side == "Buy"){
         if(laverage==1){
            
               const assetDetails = await getLatestAssetDetails(asset) as GetAssetDetails
               // const assetDetails = {ask_price:"100",bid_price:"100"}
               console.log("assetDetails",assetDetails)
                const totalPrice = volume.mul(assetDetails.ask_price)
                const isEnoughBalance = await checkBalance(totalPrice,username)
                if(!isEnoughBalance){
                    res.status(400).json({
                        message:"Insufficient balance"
                    })
                    return
                }   
                await lockBalance(totalPrice,username)
                const openPrice =new Decimal(assetDetails.ask_price);
                const position = await openPosition(username,side,volume,totalPrice,stopLoss,takeProfit,"open",laverage,baseInstrumentId,openPrice)
                //  const order = await createOrder(username,side,volume,totalPrice,stopLoss,takeProfit,"pending")
                await deLockBalance(username,totalPrice)
                await creditAssets(username,baseInstrumentId,volume)
                res.status(200).json({
                    message:"Position opened",
                    position
                })

         }
         else {
                const assetDetails = await getLatestAssetDetails(asset) as GetAssetDetails
                const margin = volume.mul(assetDetails.ask_price).div(laverage)
                const isEnoughMargin = await checkBalance(margin,username)
                if(!isEnoughMargin){
                    res.status(400).json({
                        message:"Insufficient margin"
                    })
                    return
                }
                await lockBalance(margin,username)
                const openPrice =new Decimal(assetDetails.ask_price);
                const position = await openPosition(username,side,volume,margin,stopLoss,takeProfit,"open",laverage,baseInstrumentId,openPrice)
                //  const order = await createOrder(username,side,volume,margin,stopLoss,takeProfit,"pending")
                await deLockBalance(username,margin)
                await creditAssets(username,baseInstrumentId,volume)
                res.status(200).json({
                    message:"Position opened",
                    position
                })
         } 
        }
        else{
            if(laverage.eq(1)){
                const assetDetails = await getLatestAssetDetails(asset) as GetAssetDetails
                const totalPrice = volume.mul(assetDetails.bid_price)
                const isEnoughBalance = await checkBalance(totalPrice,username)
                if(!isEnoughBalance){
                    res.status(400).json({
                        message:"Insufficient balance"
                    })
                    return
                }
                await lockBalance(totalPrice,username)
                const openPrice = new Decimal(assetDetails.bid_price);
                const position = await openPosition(username,side,volume,totalPrice,stopLoss,takeProfit,"open",laverage,baseInstrumentId,openPrice)
                //  const order = await createOrder(username,side,volume,totalPrice,stopLoss,takeProfit,"pending")
                await deLockBalance(username,totalPrice)
                await creditAssets(username,baseInstrumentId,volume)
                res.status(200).json({
                    message:"Position opened",
                    position
                })
            }else{
                // const assetDetails = await getLatestAssetDetails(asset) as GetAssetDetails
                const assetDetails = {bid_price:"100",ask_price:"100"}
                const margin = volume.mul(assetDetails.bid_price).div(laverage)
                const isEnoughMargin = await checkBalance(margin,username)
                if(!isEnoughMargin){
                    res.status(400).json({
                        message:"Insufficient margin"
                    })
                    return
                }
                await lockBalance(margin,username)
                const openPrice =new Decimal(assetDetails.bid_price);
                const position = await openPosition(username,side,volume,margin,stopLoss,takeProfit,"open",laverage,baseInstrumentId,openPrice)
                //  const order = await createOrder(username,side,volume,margin,stopLoss,takeProfit,"pending")
                await deLockBalance(username,margin)
                await creditAssets(username,baseInstrumentId,volume)
                res.status(200).json({
                    message:"Position opened",
                    position
                })

            }
        }
    
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
})

router.post("/getPosition",async(req:Request,res:Response)=>{
    const {username,baseInstrumentId,status} = req.body;
    try{
        const position = await getPosition(username,baseInstrumentId,status)
        res.status(200).json({
            message:"Position fetched",
            position
        })
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
})
export const orderRouter = router; 