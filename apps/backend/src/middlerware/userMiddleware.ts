import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../types";


interface AuthenticatedRequest extends Request {
  id?: string; 
}

export function userAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization;
 
  if (!token) {
    res.status(401).json({ message: "Token required" });
    return; 
  }

  try { 
    const payload = jwt.verify(token, JWT_PASSWORD) as { userId: string }; 
    req.id = payload.userId 
    next(); 
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}