import express from "express";
import { customerDataModel, userServiceModel } from "../DB_Wroker/dbservice.js";

const router=express.Router();

router.put('/cancelCustomer',async(req,res)=>{
  const {email}=req.body;
  const data=await customerDataModel.findOne({email:email});
  const workerEmail=data.workerEmail;
  await customerDataModel.findOneAndUpdate(
    {email:email},
    {$set:{workerEmail:null}}
  );
  await userServiceModel.findOneAndUpdate(
    {email:workerEmail},
    {$set:{customerEmail:null,cancel:true}}
  )
  res.json({cancel:true})
});

router.put('/cancelWorker',async(req,res)=>{
    const {email}=req.body;
    const data=await userServiceModel.findOne({email:email});
    const custmorEmail=data.customerEmail;
     await customerDataModel.findOneAndUpdate(
    {email:custmorEmail},
    {$set:{workerEmail:null,cancel:true}}
  );
  await userServiceModel.findOneAndUpdate(
    {email:email},
    {$set:{customerEmail:null}}
  )
   res.json({cancel:true})
});

export default router;