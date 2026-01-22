import mongoose from "mongoose";

const userService=new mongoose.Schema({
   name:{type:String},
   phone:{type:String},
   email:{type:String},
   adhar:{type:String},
   pass:{type:String},
   service:{type:String},
   rating:{type:Number,default:3},
   totalWork:{type:Number,default:0},
   lat:{type:Number},
   lng:{type:Number},
   active:{type:Boolean,default:false},
   customerEmail:{type:String,default:null},
   cancel:{type:Boolean,default:null},
   type:{type:String,default:"worker"},
   workerSocket:{type:String}
});

const customerData=new mongoose.Schema({
   email:{type:String},
   name:{type:String},
   pass:{type:String},
   phone:{type:String},
   lat:{type:Number},
   lng:{type:Number},
   workerEmail:{type:String,default:null},
   cancel:{type:Boolean,default:null},
   type:{type:String,default:"customer"},
   customerSocket:{type:String}
});

const bookingDetail=new mongoose.Schema({
   customerEmail:{type:String,default:null},
   workerEmail:{type:String,default:null},
   accept:{type:Boolean,default:null},
   cancel:{type:Boolean,default:null}           
});

const userServiceModel=mongoose.model("userService",userService);
const customerDataModel=mongoose.model("customerData",customerData);
const bookingDataModel=mongoose.model("bookingDetail",bookingDetail);

export {userServiceModel,customerDataModel,bookingDataModel};