const jwt=require('jsonwebtoken')

const authentication = function (req,res,next){
  
    try{
       let id=req.params.userId
       let token= req.headers.authorization
       token=token.slice(7)

       if(!token) res.status(400).send({status:false,message:"Token is required"})
       jwt.verify(token,"SecretKey Project 5",function (err,decoded){
         if(err){
            return res.status(400).send({status:false,message:err})
         }
         if(id!=decoded.userId)  return  res.status(401).send({status:false,message:"authentication failed"})
         req.id=id
         next()
       })
      
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}


const authorisation = function (req,res,next){
  try{
    
  }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={authentication,authorisation}
