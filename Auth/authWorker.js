import express from "express";
import { userServiceModel } from "../DB_Wroker/dbservice.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const router=express.Router();
dotenv.config();

const SECRET_CODE=process.env.SECRET_CODE;


router.put('/signUp',async(req,res)=>{
  const {name,phone,email,adhar,pass,service,lat,lng}=req.body;
   const hashPass=await bcrypt.hash(pass,10);
  await userServiceModel.create({
    name:name,phone:phone,email:email,adhar:adhar,pass:hashPass,
    service:service,lat:lat,lng:lng,type:"worker"
  }).then(()=>{
    res.json({signUp:true})
  }).catch(()=>{
    res.json({signUp:false})
  })
}); 

export default router;