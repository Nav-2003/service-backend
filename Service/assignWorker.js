import express from "express";
import { bookingDataModel, customerDataModel, userServiceModel } from "../DB_Wroker/dbservice.js";
import getDistanceKm from "../getDistance.js";
import { io } from "../index.js";
import socketEmail from "../socketStore.js";
const router=express.Router();

router.put('/assignWorker',async(req,res)=>{
  const {custmorEmail,workerEmail}=req.body;
  if(!custmorEmail||!workerEmail) return res.json({assign:false});
   const booking=await bookingDataModel.create({
     customerEmail:custmorEmail,
     workerEmail
  });
  const worker=await userServiceModel.findOne({email:workerEmail});
  const custmor=await customerDataModel.findOne({email:custmorEmail});
  const distance=getDistanceKm(worker.lat,worker.lng,custmor.lat,custmor.lng);
  const name=custmor.name;
  const socketId=socketEmail.get(workerEmail);
  console.log(socketId);
  io.to(socketId).emit("assignCustmorResult",{name,distance,bookingId:booking._id})
  res.json({assign:true,bookingId:booking._id});
});

router.put('/reject',async(req,res)=>{
     const {email,bookingId}=req.body;
     if(!email) return res.json({reject:false})
    const data=await bookingDataModel.findById(bookingId);
    const custmorEmail=data.customerEmail;
     const socketId=socketEmail.get(custmorEmail);
      io.to(socketId).emit("checkWorkerAssignResult",{result:false});
      await bookingDataModel.findByIdAndDelete(bookingId);
     res.json({reject:true});
});

router.put('/accept',async(req,res)=>{
    const {email,bookingId}=req.body;
     if(!email) return res.json({reject:false})
    const data=await bookingDataModel.findById(bookingId);
    const custmorEmail=data.customerEmail;
     const socketId=socketEmail.get(custmorEmail);
     io.to(socketId).emit("checkWorkerAssignResult",{result:true});
     res.json({Accept:true});
});

router.put('/cancel',async(req,res)=>{
     const {bookingId}=req.body;
     if(!bookingId) return res.json({"cancel":false})
     const data=await bookingDataModel.findById(bookingId);
     const workerEmail=data.workerEmail;
     const socketId=socketEmail.get(workerEmail);
     io.to(socketId).emit("customerCancel",{});
     await bookingDataModel.findByIdAndDelete(bookingId);
     return res.json({"cancel":true})
})

router.put("/getEmail", async (req, res) => {
     const {email,bookingId}=req.body;
     const data=await bookingDataModel.findById(bookingId);
     if(!data) return res.json({data:"booking is not found"});
     console.log(data,email);
     if(data.workerEmail===email){
         const customerData=await customerDataModel.findOne({email:data.customerEmail});
         return res.send({name:customerData.name,type:customerData.type,email:customerData.email,
          phone:customerData.phone
         });
     }
     const workerData=await userServiceModel.findOne({email:data.workerEmail});
      return res.send({name:workerData.name,type:workerData.type,email:workerData.email,
                  phone:workerData.phone
         });
});

export default router;