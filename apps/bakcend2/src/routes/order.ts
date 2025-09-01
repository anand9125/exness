import {Router} from "express";
import { placeMarketOrder } from "../controller/orderController";

const router = Router();

router.post("/",placeMarketOrder);

export const orderRouter = router;