import { customerDataModel, userServiceModel } from "../DB_Wroker/dbservice.js";
import getDistanceKm from "../getDistance.js";

const emailSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("checkEmail", async (msg) => {
      const email = msg.email;
      console.log(email, socket.id);
      const result = await userServiceModel.findOne({ email });
      console.log(result);
      socket.emit("emailResult", { exits: !!result });
    });

    socket.on("checkAssignCustomer", async (msg) => {
      const email = msg.email;
      if (!email) return;
      const result = await userServiceModel.findOne({ email });
      if (result.customerEmail) {
        const email = result.customerEmail;
        const data = await customerDataModel.findOne({ email });
        const distance=getDistanceKm(result.lat,result.lng,data.lat,data.lng);
        socket.emit("assignCustmorResult", {
           distance:distance,
           name: data.name,
        });
      }
    });

    socket.on("checkWorkerAssign", async (msg) => {
      const email = msg.email;
      if (!email) return;
      const result = await customerDataModel.findOne({ email });
      if (result.workerMood != null) {
        const response = result.workerMood;
        await customerDataModel.findOneAndUpdate(
          { email: email },
          { $set: { workerMood: null } }
        );
        socket.emit("checkWorkerAssignResult", { result: response });
      }
    });

    socket.on("putLiveLocation", async ({ email, lat, lng }) => {
      if (!email) return;
      let worker = await userServiceModel.findOne({ email });
      if (worker) {
        await userServiceModel.updateOne({ email }, { $set: { lat, lng } });
        return;
      }
      let customer = await customerDataModel.findOne({ email });
      if (customer) {
        await customerDataModel.updateOne({ email }, { $set: { lat, lng } });
      }
    });

    socket.on("getLiveLocation", async ({ email }) => {
      if (!email) return;
      let worker = await userServiceModel.findOne({ email });
      if (worker) {
        socket.emit("liveLocationResult", {
          lat: worker.lat,
          lng: worker.lng,
        });
        return;
      }
      let customer = await customerDataModel.findOne({ email });
      if (customer) {
        socket.emit("liveLocationResult", {
          lat: customer.lat,
          lng: customer.lng,
        });
      }
    });

    socket.on("liveDistance", async ({ workerEmail, customerEmail }) => {
      if (!workerEmail || !customerEmail) return;
      const data1 = await userServiceModel.findOne({ email: workerEmail });
      const lat1 = data1.lat;
      const lng1 = data1.lng;
      const data2 = await customerDataModel.findOne({ email: customerEmail });
      const lat2 = data2.lat;
      const lng2 = data2.lng;
      const distance = getDistanceKm(lat1, lng1, lat2, lng2);
      socket.emit("liveDistance", {distance});
    });
      
    socket.on("cancelBooking",async({email})=>{
       if(!email) return;
       const response1=await userServiceModel.findOne({email:email});
       const response2=await customerDataModel.findOne({email:email});
       if(response1){
            if(response1.cancel===true){
                await userServiceModel.findOneAndUpdate(
                  {email:email},
                  {$set:{cancel:null}}
                )
               socket.emit("cancelBooking",{cancel:true});
            }
            socket.emit("cancelBooking",{cancel:false});
       }else{
            if(response2.cancel===true){
                await customerDataModel.findOneAndUpdate(
                  {email:email},
                  {$set:{cancel:null}}
                )
                socket.emit("cancelBooking",{cancel:true})
            }
           socket.emit("cancelBooking",{cancel:false});   
         }
    });

  });
};

export default emailSocket;
