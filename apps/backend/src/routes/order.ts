import Router from "express";
import { placeLimitOrder, placeMarketOrder } from "../controller/orderController";

const router = Router();

router.post("/",placeMarketOrder);

router.post("/limitOrder",placeLimitOrder);

export const orderRouter = router;