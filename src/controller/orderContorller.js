const {isValidObjectId}=require("mongoose")
const cartModel = require("../model/cartModel")

exports.createOrder=async (req,res)=>{
    try{
    const {userId}=req.params
    if(Object.keys(req.body).length==0){
        return res.status(400).send({status:false,message:"please provide some data for create order"})
    }
    const {cartId,cancellable}=req.body
    if(!cartId){
        return res.status(400).send({status:false,message:"cartId is required"})
    }
    if(!isValidObjectId(cartId)){
        return res.status(400).send({status:false,message:"invalid cartId"})
    }
    let cart=await cartModel.findOne({_id:cartId,userId:userId})
    if(!cart){
        return res.status(404).send({status:false,message:"no any cart found for this perticular user"})
    }

    if( cancellable!="true"||cancellable!="false"){
        return res.status(400).send({status:false,message:"cancellable should be boolean value"})
    }


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