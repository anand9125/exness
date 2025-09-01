import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../store/store";

export const userMiddleware = (req:any,res:any,next:any)=>{
    const token = req.headers.authorization;
    if(!token){
        res.status(401).json({message:"Token required"})
        return;
    }
    try{
        const payload = jwt.verify(token,JWT_PASSWORD)
        req.user = payload
        next();
    }catch(err){
        res.status(401).json({message:"Invalid token"})
    }
}