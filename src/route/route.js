const express= require('express')
const router= express.Router()
const {getUserData,userLogin,createUser,updateUser}= require('../controller/userController')
const {authentication,authorisation}=require('../auth/auth')

router.post('/register',createUser)

router.post('/login',userLogin)

router.get('/user/:userId/profile',authentication,getUserData)

router.put('/user/:userId/profile',authentication,authorisation,updateUser)

router.all('/*',function (req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})

module.exports=router