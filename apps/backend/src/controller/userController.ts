import { JWT_PASSWORD, SigninSchema, SignupSchema } from "../types"
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient()

export const userSignup = async(req:Request,res:Response)=>{
    const parseData = SignupSchema.safeParse(req.body)
    if (!parseData.success) {
        res.status(401).json({
            message: parseData.error
        });
        return
    }
    try{
        const existingUser = await prisma.user.findUnique({
            where:{
                email:parseData.data.email
            }
        })
        if(existingUser){
            res.status(400).json({
                message:"User already exists"
            })
            return
        }
        const user = await prisma.user.create({
            data:{
                username:parseData.data.username,
                email:parseData.data.email,
                password:parseData.data.password
            }
      })
      res.status(200).json({
          message:"User created successfully"
      })
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
}

export const userLogin = async(req:Request,res:Response)=>{
    const parseData = SigninSchema.safeParse(req.body)
    if (!parseData.success) {
        res.status(401).json({
            message: parseData.error
        });
        return
    }
    try{
        const existingUser = await prisma.user.findUnique({
            where:{
                email:parseData.data.email
            }
        })
        
        const user = await prisma.user.findUnique({
            where:{
                email:parseData.data.email
            }
        })
        if(!user){
            return;
        }
        if(user.password !== parseData.data.password){
            res.status(400).json({
                message:"Invalid password"
            })
            return
        }
        const token = jwt.sign({id:user.id},JWT_PASSWORD)
        res.status(200).json({
            message:"User logged in successfully",
            user,
            token
        });
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
}
