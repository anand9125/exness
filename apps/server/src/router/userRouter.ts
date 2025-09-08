import { Router } from "express";
import { Request,Response } from "express";
import { users } from "../store/store";
import bcrypt from "bcrypt";
import { Balance, User } from "../type";
import {Decimal} from "decimal.js";
import { randomUUID } from "crypto";
const router = Router();


router.post("/signup", (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (username && password) {
        const existingUser = Array.from(users.values()).find(u => u.username === username);

        if (existingUser) {
             res.status(400).json({
                message: "User already exists"
            });
            return;
        }

        const initialUSDT = new Decimal("100000000000000000");  // Ensure string input to avoid precision issues
        const userId = randomUUID();

        const newUser: User = {
            username,
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

        users.set(userId, newUser);

        res.status(200).json({
            message: "User created successfully",
            userId,
            user: {
                username: newUser.username,
                balance: Array.from(newUser.balance.entries()).map(([asset, balance]) => ({  //newUser.balances is a Map (.entries() return a itratior of key,value pairs from the map  && Array.from() converts the iterator to an array)
                    //itrator is an object that allows you to loop through a collection like set,map and array one item at a time, using methods like .next().
                    //.map() is a method available on arrays that lets you transform each element in the array and return a new array.
                    asset,
                    quantity: balance.quantity.toString(),
                    locked: balance.locked.toString()
                    
                })),
                positions: newUser.positions,
                orders: newUser.orders,
                transactions: newUser.transactions
            }
        });
    } else {
        res.status(400).json({
            message: "Invalid request"
        });
    }
});

router.post("/signin",(req:Request,res:Response)=>{
     
})

export const userRouter = router







///explaination of the code above
//newUser.balance.entries() → Gives an iterator over key-value pairs in the map.
//Example entry: ["USDT", { asset: "USDT", quantity: Decimal(...), locked: Decimal(...) }]
//Array.from(...) → Converts the iterator into an array:
//[
//     ["USDT", { asset: "USDT", quantity: Decimal(...), locked: Decimal(...) }]
// ]
// map(([asset, balance]) => ({ ... })) →
// For every entry in the array:
// Extract asset (key, e.g., "USDT").
// Extract balance (value object).
// Return a new object:
