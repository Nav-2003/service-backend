import express from 'express';
import { bookingDataModel, userServiceModel } from '../DB_Wroker/dbservice.js';
import getDistanceKm from '../getDistance.js';

const router=express.Router();



router.post('/getServiceData',async(req,res)=>{
     let {service,lat,lng}=req.body;
     service=service.charAt(0).toUpperCase()+service.slice(1).toLowerCase();
     const services=await userServiceModel.find({service,active:true}).lean();
     const data=[];
     for(let ele of services){
          const distance=getDistanceKm(lat,lng,ele.lat,ele.lng);
          if(distance<=1000){
             console.log(distance);
             ele["distance"]=distance.toFixed(2);
             data.push(ele);
          }
     }
     res.json({data})
});

router.post('/bookingInfrom',async(req,res)=>{
     const {email,type}=req.body;
     console.log(type)
    const results = await bookingDataModel.find({
  [type]: true,
  $or: [
    { workerEmail: email },
    { customerEmail: email }
  ]
});

if (results.length === 0) {
  return res.status(404).json({ message: "No bookings found" });
}
console.log(results)
return res.json(
  results.map(b => ({
    bookingId:b._id,
    title: b.service,
    time: b.time,
    amount: b.amount,
    status: type === "accept" ? "live" : type
  }))
);
});

export default router;