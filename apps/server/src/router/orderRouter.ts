import { Router } from "express";
import { Request,Response } from "express";
const router = Router();
import Decimal from "decimal.js";
import { checkBalance,  closePosition,getUserOpenOrder, creditAssets, deLockBalance, getAllBalances, getBalance, getPosition, getUserPosition, lockBalance, openPosition } from "../Helper";
import { randomUUID } from "crypto";


router.post("/open", async (req: Request, res: Response) => {
    console.log(req.body)
    let { side, volume, asset, stopLoss, takeProfit, userId, leverage } = req.body;
    volume = new Decimal(volume);
    stopLoss = new Decimal(stopLoss);
    takeProfit = new Decimal(takeProfit);
    leverage = new Decimal(leverage);

    console.log("Request body:", req.body);

    try {
        // const assetDetails = await getLatestAssetDetails(asset) as GetAssetDetails;
        const assetDetails = {bid_price:"100",ask_price:"100"}
        const price = side === "Buy" ? new Decimal(assetDetails.ask_price) : new Decimal(assetDetails.bid_price);

        let entryPrice: Decimal;
        if (leverage.eq(1)) {
            entryPrice = volume.mul(price);
        } else {
            entryPrice = volume.mul(price).div(leverage);
        }
         console.log("reached here")
        const isEnough = await checkBalance(entryPrice, userId);
        if (!isEnough) {
              res.status(400).json({
                message: leverage.eq(1) ? "Insufficient balance" : "Insufficient margin"
            });
             return;
        }
        console.log("user have enough balance")

        await lockBalance(entryPrice, userId);

        const orderId = randomUUID();
        const position = await openPosition(orderId, userId, side, volume, entryPrice, stopLoss, takeProfit, "open", leverage, asset, price);

        await deLockBalance(userId, entryPrice);
        await creditAssets(userId,asset, volume);

        res.status(200).json({
            message: "Position opened",
            position
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


router.post("/getUSDTBalance",async(req:Request,res:Response)=>{
    try{
        const {userId} = req.body;
        const balance = await getBalance(userId);
        res.status(200).json({
            balance
        })
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
})

router.post("/getAllBalances",async(req:Request,res:Response)=>{
    try{
        const {userId} = req.body;
        const balance = await getAllBalances(userId);
        res.status(200).json({
            balance
        })
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
 })

router.post("/closePosition",async(req:Request,res:Response)=>{
    const {orderId,userId} = req.body;
    if(!orderId){
        res.status(400).json({
            message:"Invalid request"
        })
        return
    }
    try{
        const position = await getUserPosition(orderId,userId) ;
        if(position){
           const closedPosition = await closePosition(position);
            res.status(200).json({
                message:"Success",
                data:closedPosition
            })
        }
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
})

router.post("/getOpenOrder",async(req:Request,res:Response)=>{
    try{
        const {userId,orderId} = req.body;
        const openOrders = await getUserOpenOrder(userId,orderId);
        res.status(200).json({
            openOrders
        })
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
})

export const orderRouter = router; 