import jwt from "jsonwebtoken";
import { JWTPASSWORD } from "../type";
import { Request, Response, NextFunction } from "express";
import { UUID } from "crypto";
export interface CustomRequest extends Request {
  id?: UUID;
}


export const userMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    if (token) {
        try {
            const payload = jwt.verify(token, JWTPASSWORD) as { userId: UUID };
            req.id = payload.userId;
            next();
        } catch {
            res.status(401).json({ message: "Invalid or expired token" });
        }
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
};  