import express from 'express';
import { userServiceModel } from '../DB_Wroker/dbservice.js';
import getDistanceKm from '../getDistance.js';

const router=express.Router();



router.post('/getServiceData',async(req,res)=>{
     let {service,lat,lng}=req.body;
     service=service.charAt(0).toUpperCase()+service.slice(1).toLowerCase();
     const services=await userServiceModel.find({service}).lean();
     const data=[];
     console.log(service);
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

export default router;