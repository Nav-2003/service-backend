import express from "express";
import { customerDataModel, userServiceModel } from "../DB_Wroker/dbservice.js";
const router=express.Router();

router.put('/assignWorker',async(req,res)=>{
  const {custmorEmail,workerEmail}=req.body;
  if(!custmorEmail||!workerEmail) return res.json({assign:false});
  const worker=await userServiceModel.findOneAndUpdate(
    {email:workerEmail},
    {$set:{customerEmail:custmorEmail}},
    {new:true}
  )
  const custmor=await customerDataModel.findOneAndUpdate(
    {email:custmorEmail},
    {$set:{workerEmail:workerEmail}},
    {new:true}
  )
  res.json({assign:true});
});

router.put('/reject',async(req,res)=>{
     const {email}=req.body;
     if(!email) return res.json({reject:false})
     const result=await userServiceModel.findOne({email});
    const custmorEmail=result.customerEmail;
    const worker= await userServiceModel.findOneAndUpdate(
        {email:email},
        {$set:{customerEmail:null}},
        {new:true}
     );
    const custmor= await customerDataModel.findOneAndUpdate(
        {email:custmorEmail},
        {$set:{workerMood:false,workerEmail:null}},
        {new:true}
     );
     console.log(worker,custmor);
     res.json({reject:true});
});

router.put('/accept',async(req,res)=>{
    const {email}=req.body;
     const result=await userServiceModel.findOne({email});
    const custmorEmail=result.customerEmail;
    const data= await customerDataModel.findOneAndUpdate(
        {email:custmorEmail},
        {$set:{workerMood:true}},
        {new:true}
     );
     console.log(data)
     res.json({reject:true});
});

router.put("/getEmail", async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Check if email belongs to worker
    const worker = await userServiceModel.findOne({ email });
    if (worker) {
      // worker → return assigned customer
      const customer = await customerDataModel.findOne({
        email: worker.customerEmail,
      });

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      return res.json({
        email: customer.email,
        type: "customer",
        name: customer.name,
        phone:customer.phone
      });
    }

    // 2️⃣ Otherwise treat as customer
    const customer = await customerDataModel.findOne({ email });

    if (!customer) {
      return res.status(404).json({ message: "User not found" });
    }

    const assignedWorker = await userServiceModel.findOne({
      email: customer.workerEmail,
    });

    if (!assignedWorker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    return res.json({
      email: assignedWorker.email,
      type: "worker",
      name: assignedWorker.name,
      phone:assignedWorker.phone
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;