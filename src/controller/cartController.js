const cartModel = require('../model/cartModel')
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const { isIdValid } = require('../validation/validator')

const createCart = async function (req,res){
    try{
        let data= req.body
        let userId= req.params.userId
        if(!isIdValid(userId))  res.status(400).send({status:false, message:"Invalid userId in path params"})
        if(Object.keys(data).length==0) res.status(400).send({status:false, message:"Request body can not be empty"})

        let {productId}=data

        if(!productId ) res.status(400).send({status:false, message:"productId is mandatory in body"})
    
        if(data.quantity && typeof data.quantity!="number") res.status(400).send({status:false, message:"quantity is is only be a number"})
        if(!(data.quantity)){ 
            data.quantity=1
         }
         let {quantity}=data
                 
        let useId = await userModel.findById(userId)
        if(!useId) res.status(400).send({status:false, message:"userId doesn't exists"})

        let prodData= await productModel.findById(productId)
        if(!prodData) res.status(400).send({status:false, message:"productId doesn't exists"})

        let cartData= await cartModel.findOne({userId})

        if(cartData){
            let totalCartItems=cartData.items
            for(let a=0;a<totalCartItems.length;a++){
                
                if(productId==totalCartItems[a].productId){

                totalCartItems[a].quantity=(totalCartItems[a].quantity)+quantity
                           
                delete data.quantity
                delete data.productId
        
                data.items=totalCartItems
                data.totalPrice= (cartData.totalPrice) + (quantity*(prodData.price))
       
                let addCartData= await cartModel.findOneAndUpdate({userId},data,{new:true})
       
                return res.status(201).send({status:true,message:"Success",data:addCartData})
                } 
            }
            
         let obj={}
         obj.productId=productId
         obj.quantity=quantity
         let existingData= cartData.items
         existingData.push(obj)

         delete data.quantity
         delete data.productId

         data.items=existingData
         data.totalPrice= (cartData.totalPrice) + (quantity*(prodData.price))
         data.totalItems=existingData.length

         let addCartData= await cartModel.findOneAndUpdate({userId},data,{new:true})

         return res.status(201).send({status:true,message:"Success",data:addCartData})

        }
        
        let items=[]
        let obj={}
        obj.productId=productId
        obj.quantity=quantity
        items.push(obj)

        delete data.quantity
        delete data.productId
 
        data.userId=userId
        data.items=items
        data.totalPrice=(quantity) * (prodData.price)
        data.totalItems=items.length
        let cartDatas= await cartModel.create(data)
        
        return res.status(201).send({status:true,message:"Success",data:cartDatas})
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}



const updateCart = async function (req, res){
    try {
        const { userId } = req.params
        const { cartId, productId, removeProduct } = req.body

        if (!cartId) return res.status(400).send({ status: false, message: "cartId is mandatory in request body" })
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "please provide the valid cartId" })
        let cart = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!cart) return res.status(404).send({ status: false, message: "this cart is not exists in a database" })
        if (cart.items.length == 0) return res.status(400).send({ status: false, message: "their are no any product for update" })


        if (!productId) return res.status(400).send({ status: false, message: "productId is mandatory in request body" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "please provide the valid productId" })
        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(404).send({ status: false, message: "this product is not exists in a database" })

        if (removeProduct != 0 || removeProduct != 1) {
            return res.status(400).send({ status: false, message: "the value of removeProduct is should be 0 or 1" })
        }
        //remove_product:1 =removeQuentity by 1
        //remove_product:0 =delete this product
        let updateData = {};

        for (let i = 0; i < cart.items.length; i++) {
            const element = cart.items[i];
            if (removeProduct == 0) {
                if (element.productId.toString() == productId) {
                    updateData.totalPrice = cart.totalPrice - (product.price * cart.items[i].quantity)
                    cart.items.splice(i, 1)
                    updateData.items = cart.items
                    updateData.totalItems = --cart.totalItems;//pre-dcrement operartor
                }
            } else {
                if (element.productId.toString() == productId) {
                    cart.items[i].quantity--;
                    updateData.items = cart.items
                    if (cart.items[i].quantity === 0) {  //if product quantity is 0 , that time we can delete this product using splice method
                        cart.items.splice(i, 1);
                        updateData.items = cart.items
                        updateData.totalItems = --cart.totalItems;
                    }
                }
            }
        }
        if (Object.keys(updateData).length == 0) return res.status(400).send({ status: false, message: "this product is not exist in this cart " })
        let updateCartDocument = await cartModel.findbyIdAndUpdate({ cartId }, { $set: updateData }, { new: true }).select({_id:0,createdAt:0,updatedAt:0})
        return res.status(200).send({ status: true, message: 'cart updated successfully', data: updateCartDocument })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

const getCartById = async function(req ,res) {
    try{
    const userId = req.params.userId
    if(!userId) {
        return res.status(400).send({status : false , message : 'provide userid in path params'})
    }
    if(!isIdValid(id)) {
         return res.status(400).send({status : false, message : "Please provide valid product id in path params"})
    }
    const findUserData = await cartModel.findById({_id : userId})
    if(!findUserData) {
        return res.status(404).send({status : false , message : "no such user found"})
    }
    const findCartData = await cartModel.findById({userId : userId})
    if(!findCartData) {
        return res.status(404).send({status : false, message : "no cart data with this id"})
    }
    return res.status(200).send({status : true , message : "data fetched successfully" , data : findCartData})
} catch(err) {
    return res.status(500).send({status : false , message : err.message})
}
}

module.exports={createCart,updateCart,getCartById}