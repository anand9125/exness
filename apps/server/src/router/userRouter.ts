import { Router } from "express";
import { Request,Response } from "express";
import { users } from "../store/store";
import bcrypt from "bcrypt";
import { Balance, User } from "../type";
import {Decimal} from "decimal.js";
const router = Router();

router.post("/signup",(req:Request,res:Response)=>{
    const {username,password} = req.body;
    if(username && password){
        const user = users.get(username);
        if(user){
            res.status(400).json({
                message:"User already exists"
            })
            return;
        }
        const initialUSDT = new Decimal(100000000000000000);
        const newUser: User = {
            password,
            balance: new Map<string, Balance>([
            [
                "USDT",
                {
                asset: "USDT",
                quantity: initialUSDT,
                locked: new Decimal(0),
                },
            ],
            ]),
            positions: [],
            orders: [],
            transactions: [],
        };
        users.set(username, newUser);
        const User = users.get(username) as User;
        res.status(200).json({
            message:"User created",
            User
        })
    }
    else{
        res.status(400).json({
            message:"Invalid request"
        })
    } 

})

router.post("/signin",(req:Request,res:Response)=>{
     
})

export const userRouter = router




