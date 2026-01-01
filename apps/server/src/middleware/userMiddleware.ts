import jwt from "jsonwebtoken";
import { JWTPASSWORD } from "../type";
import { Request, Response, NextFunction } from "express";
import { UUID } from "crypto";
export interface CustomRequest extends Request {
  id?: UUID;
}


export const userMiddleware = (req: CustomRequest, res: Response, next: any) => {
    const token = req.headers.authorization;
    console.log("token",token)
    console.log(token)
     if(token){
      const payload = jwt.verify(token, JWTPASSWORD) as {userId: UUID};
      req.id = payload.userId;
      console.log("payload",payload)
      next();
    }else{
      res.status(401).json({
        message: "Unauthorized",
      });
    }
};  