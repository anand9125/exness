import { Router } from "express";
import { Request,Response } from "express";
const router = Router();
import Decimal from "decimal.js";
import { checkBalance,  closePosition, creditAssets, deLockBalance, getAllBalances, getBalance, getUserPosition, lockBalance, openPosition, getUserOpenPosition } from "../Helper";
import { randomUUID, UUID } from "crypto";
import { CustomRequest } from "../middleware/userMiddleware";
import { getAssetDetails } from "../services/getAssetDetails";

router.post("/open", async (req: CustomRequest, res: Response) => {
    let { side, volume, asset, stopLoss, takeProfit, leverage } = req.body;
    const userId = req?.id as UUID;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    volume = new Decimal(volume);
    stopLoss = stopLoss != null && stopLoss !== "" ? new Decimal(stopLoss) : new Decimal(0);
    takeProfit = takeProfit != null && takeProfit !== "" ? new Decimal(takeProfit) : new Decimal(0);
    leverage = new Decimal(leverage);

    const sideNormalized = (side === "sell" || side === "Sell" ? "Sell" : "Buy") as "Buy" | "Sell";

    try {
        const assetDetails = await getAssetDetails(asset) as { askPrice?: string; bidPrice?: string; ask_price?: string; bid_price?: string } | null;
        if (!assetDetails) {
            res.status(400).json({ message: "Invalid asset or no price data" });
            return;
        }

        const price = sideNormalized === "Buy"
            ? new Decimal(assetDetails.askPrice ?? assetDetails.ask_price ?? 0)
            : new Decimal(assetDetails.bidPrice ?? assetDetails.bid_price ?? 0);

        const exposure = volume.mul(price);
        const margin = exposure.div(leverage);

        const isEnough = await checkBalance(margin, userId);
        if (!isEnough) {
            res.status(400).json({
                message: leverage.eq(1) ? "Insufficient balance" : "Insufficient margin"
            });
            return;
        }

        await lockBalance(margin, userId);

        const orderId = randomUUID();
        const position = await openPosition(
            orderId,
            userId,
            sideNormalized,
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


router.post("/getUSDTBalance", async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.id as UUID;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const balance = await getBalance(userId);
        res.status(200).json({ balance });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/getAllBalances", async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.id as UUID;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const balance = await getAllBalances(userId);
        res.status(200).json({ balance });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/closePosition", async (req: CustomRequest, res: Response) => {
    const { orderId } = req.body;
    const userId = req.id as UUID;
    if (!orderId || !userId) {
        res.status(400).json({ message: "Invalid request" });
        return;
    }
    try {
        const position = await getUserPosition(orderId, userId);
        if (position) {
            const closedPosition = await closePosition(position);
            if (closedPosition) {
                res.status(200).json({ message: "Success", data: closedPosition });
            } else {
                res.status(500).json({ message: "Failed to close position" });
            }
        } else {
            res.status(404).json({ message: "Position not found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

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