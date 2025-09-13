import jwt from "jsonwebtoken";
import { JWTPASSWORD } from "../type";


export const userMiddleware = (req: any, res: any, next: any) => {
    const token = req.headers.authorization;
     if(token){
      const payload = jwt.verify(token, JWTPASSWORD) as {userId: string};
      req.id = payload.userId;
      next();
    }else{
      res.status(401).json({
        message: "Unauthorized",
      });
    }
};  