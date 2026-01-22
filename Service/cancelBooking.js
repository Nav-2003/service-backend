import express from "express";
import { bookingDataModel, customerDataModel, userServiceModel } from "../DB_Wroker/dbservice.js";
import socketEmail from "../socketStore.js";
import { io } from "../index.js";

const router=express.Router();

router.put('/cancelBooking', async (req, res) => {
  const {bookingId}=req.body;
  const bookingDetail=await bookingDataModel.findById(bookingId);
  const workerEmail=bookingDetail.workerEmail;
  const custmorEmail=bookingDetail.customerEmail;
  const socket1=socketEmail.get(workerEmail);
  const socket2=socketEmail.get(custmorEmail);
  await bookingDataModel.findByIdAndDelete(bookingId);
  io.to(socket1).to(socket2).emit("cancelBooking",{cancel:true});
  console.log(socket1,socket2);
  return res.json({cancel:true});
});


export default router;