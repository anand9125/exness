import { Request, Response } from "express";
import { placeMarketOrderSchema } from "../types";
import Decimal from "decimal.js"; //allows arbitrary-precision decimal arithmetic.
import { PrismaClient } from "@prisma/client";
import { parse } from "zod";

const prisma = new PrismaClient()

export const placeMarketOrder = async(req:Request,res:Response)=>{
    const parseData = placeMarketOrderSchema.safeParse(req.body)
    if (!parseData.success) {
        res.status(401).json({
            message: parseData.error
        });
        return
    }
   try{
    const executionPrice = new Decimal(parseData.data.side =="Buy" ? parseData.data.ask : parseData.data.bid)
    const volume = new Decimal(parseData.data.volumeLot) //Converts the order volume (volumeLot) into a Decimal
    const total = executionPrice.mul(volume) //fayda of deciaml.js it calucualte very clear (amount in quote currencey)

    return prisma.$transaction(async(tx)=>{
        if(parseData.data.side == "Buy"){
            //buyer must have enough quote
            const quoteBalance = await prisma.balance.findFirst({
                where:{
                    userId:parseData.data.userId,
                    assetId:parseData.data.quoteInstrumentId
                }
            })
            if(!quoteBalance){
                res.status(400).json({
                    message:"Quote asset not found"
                })
                return
            }
            if(new Decimal(quoteBalance.quantity).lt(total)){
                res.status(400).json({
                    message:"Insufficient funds"
                })
                return
            }
            await prisma.balance.update({
                where:{
                    id:quoteBalance.id
                },
                data:{
                   quantity:{decrement:total.toFixed()}, 
                   locked:{increment:total.toFixed()}  
                }
            })    
        }
        else {
            //seller must have enough base
            const assetBalance = await prisma.balance.findFirst({
                where:{
                   userId:parseData.data.userId,
                   assetId:parseData.data.instrumentId
                }
            })
            if(!assetBalance){
                res.status(400).json({
                    message:"Asset not found"
                })
                return
            }
            if(new Decimal(assetBalance.quantity).lt(volume)){
                res.status(400).json({
                    message:"Insufficient funds"
                })
                return
            }
            await prisma.balance.update({
                where:{
                    id:assetBalance.id
                },
                data:{
                   quantity:{decrement:volume.toFixed()}, 
                   locked:{increment:volume.toFixed()}
                }
            })
            
        }
        //create order pending
        const order = await prisma.order.create({
            data:{
                userId:parseData.data.userId,
                instrumentId:parseData.data.instrumentId,
                type:parseData.data.side=="Buy"?"Buy":"Sell",
                volumeLot:volume.toFixed(),
                openDecimal:executionPrice.toFixed(),
                stopLoss:parseData.data.side=="Buy"?executionPrice.toFixed():null,
                takeProfit:parseData.data.side=="Sell"?executionPrice.toFixed():null,
                status:"pending"
            
            }
        })
        await prisma.order.update({where:{id:order.id},data:{status:"executed"}}) 
        if(parseData.data.side == "Buy"){
            //resle lcoked quote and creadit base assets
              //dec locked quote
            const quoteBalance = await prisma.balance.findFirst({
                where:{
                    userId:parseData.data.userId,
                    assetId:parseData.data.quoteInstrumentId
                }
            })
            if(quoteBalance){
                await prisma.balance.update({
                    where:{
                        id:quoteBalance.id
                    },
                    data:{
                       locked:{decrement:total.toFixed()}
                    }
                })
               
            }

            // upsert base asset balance
           await prisma.balance.upsert({
                where: {
                    userId_assetId: {
                    userId: parseData.data.userId,
                    assetId: parseData.data.instrumentId
                    }
                },
                update: {
                    quantity: { increment: volume.toFixed() },
                },
                create: {
                    userId: parseData.data.userId,
                    assetId: parseData.data.instrumentId,
                    quantity: volume.toFixed(),
                    locked: 0
                }
            });  
        }
        else {
            //Sell: release locked base asset and credit quote currency
             //releas locked base asset
            const assetBal = await prisma.balance.findFirst({
                where:{
                    userId:parseData.data.userId,
                    assetId:parseData.data.instrumentId
                }
            })
            if (assetBal) {
                await tx.balance.update({
                   where: { id: assetBal.id },
                   data: { locked: { decrement: volume.toFixed() } }
                });
            }
            //credit quote asset
            await prisma.balance.upsert({
                where:{
                    userId_assetId:{
                           userId:parseData.data.userId,
                           assetId:parseData.data.quoteInstrumentId
                    }
                },
                update:{
                    quantity:{increment:total.toFixed()}
                },
                create:{
                    userId:parseData.data.userId,
                    assetId:parseData.data.quoteInstrumentId,
                    quantity:total.toFixed(),
                    locked:0
                }
            })
        }
    
    })
   }catch(err){
       res.status(500).json({
           message:"Internal server error"
       })
   }
} 

export const placeLimitOrder = async(req:Request,res:Response)=>{
  const parseData = placeLimitOrderSchema.safeParse(req.body);
  if(!parseData.success){
        res.status(400).json({
        message:"Invalid data"
    })
  }
}
