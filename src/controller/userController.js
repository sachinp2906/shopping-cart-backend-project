const userModel= require('../model/userModel')
const { isValidString,isValidPincode, isValidName, isValidMobile, isValidPassword, isValidEmail , isIdValid} = require('../validation/validator')
const aws = require('aws-sdk')
const bcrypt = require('bcrypt')
const jwt=require('jsonwebtoken')

//////////////////////////////////////////////********AWS**********////////////////////////////////////////////////////
aws.config.update({
  accessKeyId: "AKIAY3L35MCRZNIRGT6N",
  secretAccessKey: "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",
  region: "ap-south-1"
})

let uploadFile= async ( file) =>{
 return new Promise( function(resolve, reject) {
  // this function will upload file to aws and return the link
  let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

  var uploadParams= {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",  //HERE
      Key: "abc/" + file.originalname, //HERE 
      Body: file.buffer
  }

  s3.upload( uploadParams, function (err, data ){
      if(err) {
          return reject({"error": err})
      }
      return resolve(data.Location)
  })

 })
}


///////////////////////////////////////////////////////////////////////////////////////////////////

const createUser = async function (req , res) {
  try{
    let files = req.files
    let data=req.body
   
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, message: "request body can't be empty" })
    }
    if(files && files.length>0) {
      let uploadFileUrl = await uploadFile(files[0])
      data.profileImage = uploadFileUrl
    }
 
    if(data.address){
      data.address=JSON.parse(data.address)
      
    }

  let { fname, lname, email, profileImage, phone, password, address } = data
  
  if (!fname) {
    return res.status(400).send({ status: false, message: "fname is required" })
  }
  if (!isValidString(fname) || !isValidName(fname)) {
    return res.status(400).send({ status: false, message: "fname is not valid" })
  }
  if (!lname) {
    return res.status(400).send({ status: false, message: "lname is required" })
  }
  if (!isValidString(lname) || !isValidName(lname)) {
    return res.status(400).send({ status: false, message: "lname is not valid" })
  }
  if (!email) {
    return res.status(400).send({ status: false, message: "email is required" })
  }
  if (!isValidEmail(email)) {
    return res.status(400).send({ status: false, message: "email is not valid" })
  }
  const findEmail = await userModel.findOne({email : email})
  if(findEmail) {
    return res.status(400).send({status : false, message : "email is already exist"})
  }
  if (!profileImage) {
    return res.status(400).send({ status: false, message: "profileImage is required" })
  }
  if (!phone) {
    return res.status(400).send({ status: false, message: "phone number is required" })
  }
  if (!isValidMobile(phone)) {
    return res.status(400).send({ status: false, message: "phone number is not valid" })
  }
  const findPhone = await userModel.findOne({phone : phone})
  if(findPhone) {
    return res.status(400).send({status : false, message : "phone number is already exist"})
  }
  if (!password) {
    return res.status(400).send({ status: false, message: "password is required" })
  }
  if (!isValidPassword(password)) {
    return res.status(400).send({ status: false, message: "password is not valid" })
  }
  let hashedPassword = bcrypt.hashSync(password , 10)
  data.password=hashedPassword
  if (!address) {
    return res.status(400).send({ status: false, message: "address is required" })
  }
  if (address) {
    const { shipping, billing } = address
    if (shipping) {
      const { street, city, pincode } = shipping
      if (street) {
        if (!isValidName(street) || !isValidString(street)) {
          return res.status(400).send({ status: false, message: "please enter valid street name" })
        }
      }
      if (city) {
        if (!isValidName(city) || !isValidString(city)) {
          return res.status(400).send({ status: false, message: "please enter valid city name" })
        }
      }
      if (pincode) {
        if (!isValidPincode(pincode)) {
          return res.status(400).send({ status: false, message: "please enter valid pincode" })
        }
      }
    }
    if (billing) {
      const { street, city, pincode } = billing
      if (street) {
        if (!isValidName(street) || !isValidString(street)) {
          return res.status(400).send({ status: false, message: "please enter valid street name" })
        }
      }
      if (city) {
        if (!isValidName(city) || !isValidString(city)) {
          return res.status(400).send({ status: false, message: "please enter valid city name" })
        }
      }
      if (pincode) {
        if (!isValidPincode(pincode)) {
          return res.status(400).send({ status: false, message: "please enter valid pincode" })
        }
      }
    }
  }
  
  const userCreate = await userModel.create(data)
  return res.status(200).send({status : true , message : "data created succesfully" , data : userCreate})
}
catch(err) {
  return res.status(500).send({status : false, message : err.message})
}
}

//-------------------------------------------------- Login API -------------------------------------------------------//

const userLogin = async function(req,res){
    try{
        if(!req.body){ res.status(400).send({status:false, message:"Body can not be empty"}) }

        const {email,password}=req.body

        if(!email){ res.status(400).send({status:false, message:"email is mandatory"}) }
        if(!isValidEmail(email)){ res.status(400).send({status:false, message:"Enter valid email."}) }

        if(!password){ res.status(400).send({status:false, message:"password is mandatory"}) }
       
       
        //finding users details from email,password..
        let userData = await userModel.findOne({email:email})
        if(!userData){res.status(404).send({status:false, message:"email/password not found."})}

        let newPassword=await bcrypt.compare(password, userData.password)
        if(!newPassword) res.status(404).send({status:false, message:"incorrect password"})
    
         //Token generation..
        const userId = userData._id.toString()
        const token = jwt.sign({userId: userId },"SecretKey Project 5",{expiresIn:'1h'})

        let responseData = {userId: userId,token: token }

        res.status(200).send({status:true ,message:"User login successful", data: responseData})

    }
    catch(err){
        res.status(500).send( {status:false, message:err.message} );
    }
}





//------------------------------------------------- Get USER API -----------------------------------------------------//

const getUserData= async function (req,res){

    try{
        let userId= req.params.userId
        if(!isIdValid(userId)) return res.status(400).send({status:false,message:"Invalid userId"})
        let fetchData= await userModel.findOne({_id:userId})
        if(!fetchData) return res.status(404).send({status:false,message:"No data found with this userId"})
        return res.status(200).send({status:true,message:"User profile details",data:fetchData})

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={getUserData,userLogin,createUser}