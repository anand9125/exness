import {Router} from "express";
import { userSignup } from "../controller/userController";



const router = Router();

router.post("/signup", userSignup)

router.post("/signin", userSignup)

export const userRouter = router;