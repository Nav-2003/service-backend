import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import { customerDataModel } from "../DB_Wroker/dbservice.js";
import { userServiceModel } from "../DB_Wroker/dbservice.js";
const router=express.Router();
dotenv.config();

const SECRET_CODE=process.env.SECRET_CODE;
router.put('/signUp',async(req,res)=>{
   const {email,name,phone,password,lat,lng}=req.body;
   const pass=password;
   console.log(req.body);
   const hashPass=await bcrypt.hash(pass,10);
   await customerDataModel.create({
      email:email,
      name:name,
      phone:phone,
      pass:hashPass,
      lat:lat,
      lng:lng,
      type:"customer"
   }).then(()=>{
       res.json({"signup":true})
   }).catch(()=>{
       res.json({"signup":false})
   })
});

router.put('/signIn',async(req,res)=>{
   const {email,password,lat,lng}=req.body;
   const pass=password;
   const userEmail=await customerDataModel.findOne({email});
   const workerEmail=await userServiceModel.findOne({email});
   if(userEmail){
       const hashPass=userEmail.pass;
         await customerDataModel.findOneAndUpdate(
            {email:email},
            {$set:{workerEmail:null,workerMood:null,cancel:null,lat:lat,lng:lng}}
          )
          if(bcrypt.compare(pass,hashPass)){
               const token=await jwt.sign(email,SECRET_CODE);
               res.cookie("userToken",token,{
                  httpOnly:true,
                  secure:false,
                  sameSite:"lax",
                  maxAge:24*60*60*1000
               });
                 return res.json({sign:true,user:true,worker:false});
          }
   }
   if(workerEmail){
       await userServiceModel.findOneAndUpdate(
         {email:email},
         {$set:{customerEmail:null,cancel:null,lat:lat,lng:lng,active:true}}
       )
        const hashPass=workerEmail.pass;
           if(bcrypt.compare(pass,hashPass)){
                const token=await jwt.sign(email,SECRET_CODE);
                res.cookie("workerToken",token,{
                   httpOnly:true,
                   secure:false,
                   sameSite:"lax",
                   maxAge:24*60*60*1000
                });
                 return res.json({sign:true,user:false,worker:true});
           }
   }
   res.json({sign:false});
});
export default router;