import {Router} from "express";
import { userSignup } from "../controller/userController";


const router = Router();

router.get("/signup", userSignup)

export const userRouter = router;