import { Router } from "express";
import { Request,Response } from "express";
const router = Router();
import Decimal from "decimal.js";
import { checkBalance,  closePosition, creditAssets, deLockBalance, getAllBalances, getBalance, getUserPosition, lockBalance, openPosition, getUserOpenPosition } from "../Helper";
import { randomUUID, UUID } from "crypto";
import { CustomRequest } from "../middleware/userMiddleware";
import { getAssetDetails } from "../services/getAssetDetails";

router.post("/open", async (req:CustomRequest, res: Response) => {
    console.log(req.body)
    let { side, volume, asset, stopLoss, takeProfit, leverage } = req.body;
    //@ts-ignore
    const userId = req?.id as UUID
    console.log(userId)
    volume = new Decimal(volume);
    stopLoss = new Decimal(stopLoss);
    takeProfit = new Decimal(takeProfit);
    leverage = new Decimal(leverage);

    console.log("Request body:", req.body);

    try {
         const assetDetails = await getAssetDetails(asset) as any;
            if (!assetDetails) {
                res.status(400).json({
                    message: "Invalid asset"
                });
                return;
            }
            console.log("asset details", assetDetails)
        const price = side === "buy" ? new Decimal(assetDetails.askPrice) : new Decimal(assetDetails.bidPrice);
         console.log("price",price)
        // exposure = volume * price (not dependent on leverage)
        const exposure = volume.mul(price);
        // margin required = exposure / leverage
        const margin = exposure.div(leverage);

        console.log("reached here")
        const isEnough = await checkBalance(margin, userId);
        if (!isEnough) {
              res.status(400).json({
                message: leverage.eq(1) ? "Insufficient balance" : "Insufficient margin"
            });
             return;
        }
        console.log("user have enough balance")

        // lock required margin from user's USDT balance
        await lockBalance(margin, userId);

        const orderId = randomUUID();
        const position = await openPosition(
            orderId,
            userId,
            side,
            volume,
            margin,
            stopLoss,
            takeProfit,
            "open",
            leverage,
            asset,
            price,
            exposure,
        );

        // DO NOT unlock margin here — margin remains locked until position is closed
        await creditAssets(userId, asset, volume);

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

router.get("/getOpenOrder",async(req:CustomRequest,res:Response)=>{
    try{
        const userId = req.id as UUID;
        console.log("userId",userId)
        const position = await getUserOpenPosition(userId);
        res.status(200).json({
            position
        })
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
})

export const orderRouter = router; 