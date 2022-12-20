const productModel= require('../model/productModel')
const{isValidString,isValidName} = require('../validation/validator')






let createProduct = async function(req,res){
    try{
        let data1 = req.body
        let files = req.files

        if(Object.keys(data1)==0){ return res.status(400).send({status:false, message:"Body is empty.."})}

        const {title,description, price,currencyId,currencyFormat,isFreeShipping,productImage,style,availableSizes,installments} = data1

        //validation for Empty input..
        if(!title) return res.status(400).send({status:false, message:"title is mandatory."})
        if(!description) return res.status(400).send({status:false, message:"description is mandatory."})
        if(!price) return res.status(400).send({status:false, message:"price is mandatory."})
        if(!currencyId) return res.status(400).send({status:false, message:"currencyId is required."})
        if(!currencyFormat) return res.status(400).send({status:false, message:"currencyFormat is mandatory."})
        if(!productImage) return res.status(400).send({status:false, message:"productImage is required."})

        //validation for corret data format..
        if(!isValidString(title) && !isValidName(title)){return res.status(400).send({status:false, message:"Enter valid title."})}
        if(description.trim().length==0){return res.status(400).send({status:false,message:"Enter some description.."})}
        if(typeof price!= "number"){return res.status(400).send({status:false,message:"Invalid price entry, price should be a number."})}
        if(currencyId!=="INR"){return res.status(400).send({status:false,message:"Invalid currencyId, currencyId should be INR only"})}
        if(currencyFormat!="₹"){return res.status(400).send({status:false,message:"Invalid currencyFormat, currencyFormat should be ₹ only."})}
        if(isFreeShipping!= Boolean){return res.status(400).send({status:false,message:"isFreeShipping should be Boolean value."})}
        if(!isValid(style)){return res.status(400).send({status:false,message:"Invalid style input,style must be string."})}
        if(availableSizes!= ("S"||"XS"||"M"||"X"||"L"||"XXL"||"XL")){
            return res.status(400).send({status:false,message:"availableSizes can only be S, XS, M, X, L, XXL, XL "})
        }


        //checking if title already exists..
        const titleCheck = await userModel.findOne({title : title})
        if(titleCheck){ return res.status(400).send({status : false, message : "title already exists. Please enter unique title."}) }


        if(files && files.length>0){ 
            //uploading and getting url from aws s3..
            let uploadFileUrl = await uploadFile(files[0])

            //setting productImage to aws s3 url..
            data1.profileImage = uploadFileUrl   
        }

        //creting data in DB..
        let createdData = await productModel.create(data1)

        //ERROR CODE 400 or what???for db error????
        if(!createdData){ return res.status(400).send({status:false,message:"Data could not be created."})}        

        res.status(200).send({status:true, message:"Success", data:createdData})
    }
    catch(err){
        res.status(500).send({status:false, message:err.message})
    }
}





module.exports = {createProduct}