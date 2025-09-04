import { Request, Response } from "express";
import { JWT_PASSWORD } from "../store/store";
import { users, } from "../store/store";
import jwt from "jsonwebtoken";
import { SigninSchema, SignupSchema, User } from "../types/type";

export const userSignup = async(req:Request,res:Response)=>{ 
   try{
       const parseData = SignupSchema.safeParse(req.body)
       if (!parseData.success) {
           res.status(401).json({
               message: parseData.error
           });
           return
       }
       const username = req.body.username;
       const password = req.body.password;

       const user = users.get(username);
       if(users.has(username)){
           res.status(400).json({ error: "User already exists" });
           return;
        }
       const newUser: User = {
           password,
           balance: new Map(),   
           positions: [],
           orders: [],
           transactions: [],
        };
        users.set(username, newUser);
        res.status(200).json({message:"User created successfully"})
    }catch(err){
      res.status(500).json({message:"Internal server error"})
    }
}

export const userLogin = async(req:Request,res:Response)=>{
    try{
        const parseData = SigninSchema.safeParse(req.body)
        if (!parseData.success) {
            res.status(401).json({
                message: parseData.error
            });
            return
        }
        const {username,password} = req.body;
        const user = users.get(username);
        if(!user){
            return;
        }
        if(user.password!==password){ //check password
            res.status(400).json({message:"Invalid password"})
            return;
        }
        const token = jwt.sign({username,password},JWT_PASSWORD)
        res.json({
            message:"User logged in successfully",
            token:token
        })
    }
    catch(err){
        res.status(500).json({message:"Internal server error"})
    }
}

