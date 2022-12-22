const cartModel = require('../model/cartModel')


const createCart = async function (req,res){
    try{
       
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={createCart}