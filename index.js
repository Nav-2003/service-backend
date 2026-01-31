import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import getServiceData from './Service/getServiceData.js'
import cors from 'cors';
import authCustomer from './Auth/authCustomer.js'
import authWorker from './Auth/authWorker.js'
import http from "http"
import { Server } from 'socket.io';
import emailSocket from './Socket/emailSocket.js';
import cookieParser from 'cookie-parser';
import assignWorker from './Service/assignWorker.js'
import cancelBooking from './Service/cancelBooking.js'
import paymentRoutes from './Service/payment.js'

dotenv.config();
const db_url=process.env.DB_URL;
await mongoose.connect(db_url).then(()=>{
    console.log("DB connected succussfully......")
}).catch(()=>{
    console.log("Failed to connect.....")
})

const app=express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

app.use('/api/serviceAvailable',getServiceData);
app.use('/api/userAuth',authCustomer);
app.use('/api/workerAuth',authWorker);
app.use('/api/worker',assignWorker);
app.use('/api/email',assignWorker);
app.use('/api/service',cancelBooking);
app.use('/api/payment',paymentRoutes)

app.get('/api',async (req,res)=>{
    res.send("welcome to my server baby......")
});

const server= http.createServer(app);
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});
emailSocket(io);

export {io}

server.listen(3000,()=>{
    console.log("backend is started successfully")
});
