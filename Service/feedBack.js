import express from "express";
import {
  bookingDataModel,
  customerDataModel,
  feedbackDataModel,
} from "../DB_Wroker/dbservice.js";

const router = express.Router();

router.put("/storeFeedback", async (req, res) => {
  const { bookingId, rating, text } = req.body;
  try {
    const data = await bookingDataModel.findById(bookingId);
    const result = await customerDataModel.findOne({
      email: data.customerEmail,
    });
    await feedbackDataModel.create({
      email: data.workerEmail,
      name: result.name,
      rating: rating,
      text: text,
      time: Date.now(),
    });
    return res.send({ feedback: true });
  } catch (err) {
    res.send({ feedback: false });
  }
});

router.put('/getFeedback',async(req,res)=>{
    const {email}=req.body
    const feedbackResult=await feedbackDataModel({email:email})
    console.log(feedbackResult)
    res.send({
        name:feedbackResult.name,
        rating:feedbackResult.rating,
        text:feedbackResult.text,
        time:feedbackResult.time
    })
});

export default router;
