const cartModel = require('../model/cartModel')


const createCart = async function (req,res){
    try{
       
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={createCart}


exports.updateCart = async (req, res) => {
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