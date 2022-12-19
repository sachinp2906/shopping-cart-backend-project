

const authentication =async function (req,res){
  
    try{
       let id=req.params.userId
       let token= req.authentication.token
       if(!token) res.status(400).send({status:false,message:"Token is required"})
       await jwt.verify(token,function (err,decoded){
         if(err){
            return res.status(400).send({status:false,message:err})
         }
         if(id!=decoded.userId)  return  res.status(401).send({status:false,message:"authentication failed"})
         req.id=id
       })
       
       console.log(token)
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }

}

module.exports={authentication}
