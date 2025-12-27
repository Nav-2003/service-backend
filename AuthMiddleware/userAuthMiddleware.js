const verifyUser=(req,res,next)=>{
   const token1=req.cookies?.userToken;
   const token2=req.cookies?.workerToken;
   if(token1){
      return res.json({sign:true,user:true,worker:false});
   }if(token2){
      return res.json({sign:true,user:false,worker:true});
   }
   next();
}

export default verifyUser;