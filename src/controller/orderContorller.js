const {isIdValid}=require("../validation/validator")
const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const orderModel=require('../model/orderModel')

const createOrder=async function (req,res){
    try{
    const {userId}=req.params
    if(Object.keys(req.body).length==0)  return res.status(400).send({status:false,message:"please provide some data for create order"})
    
    const {cartId,cancellable}=req.body
    if(!cartId) return res.status(400).send({status:false,message:"cartId is required"})
    
    if(!isIdValid(cartId)) return res.status(400).send({status:false,message:"invalid cartId"})
    
    let cart=await cartModel.findOne({_id:cartId,userId:userId})
    if(!cart) return res.status(404).send({status:false,message:"no any cart found for this perticular user"})
    
    if(cart.items.length==0) return res.status(404).send({status:false,message:"this card dont have any product"})
    
  let createOrder={}
  createOrder.userId=userId
  createOrder.items=cart.items
  createOrder.totalPrice=cart.totalPrice
  createOrder.totalItems=cart.totalItems
  let totalQuantity=0
  for (let i = 0; i < cart.items.length; i++) {
    const element = cart.items[i];
    totalQuantity+=element.quantity
  }
  createOrder.totalQuantity=totalQuantity
  createOrder.cancellable=cancellable

  //remove product from cart

  await cartModel.findByIdAndUpdate({_id:cartId},{$set:{items:[],totalPrice:0,totalItems:0}},{new:true})
  let createorder=await orderModel.create(createOrder)
  return res.status(201).send({status:true,message:"Success",data:createorder})
}catch(err){
    return res.status(500).send({status:false,message:err.message})
}
}

const updateOrder =async function (req,res){
    try{
      
        let data= req.body
        if(Object.keys(data).length==0) return res.status(404).send({status:false,message:"Request body doesn't be empty"})

        let userId = req.params.userId
        if(!isIdValid(userId)) return res.status(400).send({status:false,message:"userId is invalid in Path params"})
        let userData= await userModel.findById(userId) 
        if(!userData)  return res.status(404).send({status:false,message:"No userData found with this userId"})
   
        let {orderId,status}=data
        if(!status) return res.status(400).send({status:false,message:"status is required"})

        if(!orderId) return res.status(400).send({status:false,message:"orderId is required"})
        if(!isIdValid(orderId)) return res.status(400).send({status:false,message:"orderId is invalid in Req. body"})
        let orderData = await orderModel.findOne({_id:orderId,isDeleted:false})
        if(!orderData) return res.status(404).send({status:false,message:"Order is already deleted or doesn't exist"})

        if(orderData.userId!=userId) return res.status(404).send({status:false,message:"orderId is not belongs to the userId"})
        
        if(orderData.cancellable==false && status=="cancled") return res.status(400).send({status:false,message:"order cannot be cancled."})
        
        delete data.orderId
    
        let updateOrder = await orderModel.findOneAndUpdate({_id:orderId},data,{new:true})
        return res.status(200).send({status:true,message:"Success",data:updateOrder}) 

    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
}
}

module.exports={createOrder,updateOrder}