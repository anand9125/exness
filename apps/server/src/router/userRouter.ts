import { Router } from "express";
import { Request, Response } from "express";
import { users } from "../store/store";
import bcrypt from "bcrypt";
import { Balance, JWTPASSWORD, User } from "../type";
import { Decimal } from "decimal.js";
import jwt from "jsonwebtoken";
import { randomUUID, UUID } from "crypto";
import { userMiddleware } from "../middleware/userMiddleware";
import { CustomRequest } from "../middleware/userMiddleware";
import { getBalance } from "../Helper";

const router = Router();


router.post("/signup", async(req: Request, res: Response) => {
    const { username, password } = req.body;

    if (username && password) {
        const existingUser = Array.from(users.values()).find(u => u.username === username);

        if (existingUser) {
            res.status(400).json({
                message: "User already exists"
            });
            return;
        }

        const initialUSDT = new Decimal("100000"); // Demo balance
        const userId = randomUUID();
        const userPassword = await bcrypt.hash(password, 10);
        const newUser: User = {
            username,
            password: userPassword,
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
        const token = jwt.sign({ userId }, JWTPASSWORD);

        res.status(200).json({
            message: "User created successfully",
            userId,
            user: {
                username: newUser.username,
                balance: Array.from(newUser.balance.entries()).map(([asset, bal]) => ({
                    asset,
                    quantity: bal.quantity.toString(),
                    locked: bal.locked.toString(),
                })),
                positions: newUser.positions,
                orders: newUser.orders,
                transactions: newUser.transactions
            },
            token
        });
    } else {
        res.status(400).json({
            message: "Invalid request"
        });
    }
});

function getUserIdByUser(map: Map<UUID, User>, searchUser: User): UUID | undefined {
    for (const [key, value] of map.entries()) {
        if (value === searchUser) return key;
    }
    return undefined;
}

router.post("/signin", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: "Invalid request" });
        return;
    }

    const user = Array.from(users.values()).find(u => u.username === username);
    if (!user) {
        res.status(400).json({ message: "Invalid username or password" });
        return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        res.status(400).json({ message: "Invalid password" });
        return;
    }

    const userId = getUserIdByUser(users, user);
    if (!userId) {
        res.status(500).json({ message: "User state error" });
        return;
    }

    const token = jwt.sign({ userId }, JWTPASSWORD);
    res.status(200).json({
        message: "Success",
        userId,
        token,
        user: {
            username: user.username,
            balance: Array.from(user.balance.entries()).map(([asset, bal]) => ({
                asset,
                quantity: bal.quantity.toString(),
                locked: bal.locked.toString(),
            })),
            positions: user.positions,
            orders: user.orders,
            transactions: user.transactions
        }
    });
});

router.get("/balance", userMiddleware, async (req: CustomRequest, res: Response) => {
    const userId = req.id as UUID;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const balance = await getBalance(userId);
        const usdBalance = balance?.quantity?.toString() ?? "0";
        res.status(200).json({ usd_balance: usdBalance });
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
});

export const userRouter = router;
