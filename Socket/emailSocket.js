import {
  bookingDataModel,
  customerDataModel,
  userServiceModel,
} from "../DB_Wroker/dbservice.js";
import getDistanceKm from "../getDistance.js";
import socketEmail from "../socketStore.js";

const emailSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("register-Socket", ({ email }) => {
      socketEmail.set(email, socket.id);
      console.log(email, socket.id);
    });

    socket.on("checkEmail", async (msg) => {
      const email = msg.email;
      const result = await userServiceModel.findOne({ email });
      socket.emit("emailResult", { exits: !!result });
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
      socket.emit("liveDistance", { distance });
    });

    socket.on("chatMessage", async ({ email, sender, text }) => {
      const socketId = socketEmail.get(email);
      io.to(socketId).emit("chatMessage", {
        sender: sender,
        text: text,
        time: new Date().toISOString(),
      });
    });

    socket.on("paymentStatus", async ({ bookingId }) => {
      const data = await bookingDataModel.findById(bookingId);
      await bookingDataModel.findByIdAndUpdate(bookingId, {
        $set: {
          accept: false,
          cancel: false,
          completed: true,
          time: Date.now(),
        },
      });
      const customerEmail = data.customerEmail;
      const workerEmail=data.workerEmail;
      await userServiceModel.findOneAndUpdate(
        {email:workerEmail},
        {$set:{active:true}}
      )
      const socketId = socketEmail.get(customerEmail);
      io.to(socketId).emit("paymentResponse", {
        payment: "done",
      });
    });
  });
};

export default emailSocket;
