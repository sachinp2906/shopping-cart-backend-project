const router= require('express').Router()
const {getUserData,userLogin,createUser,updateUser}= require('../controller/userController')
const {createProduct,getAllProducts,getProductById,updateProduct,deleteProduct} = require('../controller/productController')
const {authentication,authorisation}=require('../auth/auth')
const {createCart,updateCart,getCartById,deleteCart}=require('../controller/cartController')
const { createOrder,updateOrder } = require('../controller/orderContorller')

//-------------------- User Apis -----------------------//
router.post('/register',createUser)
router.post('/login',userLogin)
router.get('/user/:userId/profile',authentication,authorisation,getUserData)  
router.put('/user/:userId/profile',authentication,authorisation,updateUser)


//--------------------Product Apis -------------------//
router.post('/products',createProduct)
router.get('/products',getAllProducts)   
router.get('/products/:productId',getProductById)
router.put('/products/:productId',updateProduct)    
router.delete('/products/:productId',deleteProduct)


//---------------------Cart Apis-----------------------//
router.post('/users/:userId/cart',authentication,authorisation,createCart)   
router.put('/users/:userId/cart',authentication,authorisation,updateCart)
router.get('/users/:userId/cart',authentication,authorisation,getCartById)
router.delete('/users/:userId/cart',authentication,authorisation,deleteCart)


//---------------------Order Apis-----------------------//
router.post('/users/:userId/orders',authentication,authorisation,createOrder)
router.put('/users/:userId/orders',authentication,authorisation,updateOrder)

router.all('/*',function (req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})

module.exports=router