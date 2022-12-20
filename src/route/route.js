const express= require('express')
const router= express.Router()
const {getUserData,userLogin,createUser}= require('../controller/userController')
const {authentication}=require('../auth/auth')

router.post('/register',createUser)

router.post('/login',userLogin)

router.get('/user/:userId/profile',authentication,getUserData)

router.put('',authentication,)

router.all('/*',function (req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})

module.exports=router