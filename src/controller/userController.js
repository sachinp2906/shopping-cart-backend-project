const userModel= require('../model/userModel')
const { isIdValid } = require('../validation/validator')

const getUserData= async function (req,res){

    try{
        let userId= req.params.userId
        if(!isIdValid(userId)) return res.status(400).send({status:false,message:"Invalid userId"})
        let fetchData= await userModel.findOne({userId:_id})
        if(!fetchData) return res.status(404).send({status:false,message:"No data found with this userId"})
        return res.status(200).send({status:true,message:"User profile details",data:fetchData})

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={getUserData}