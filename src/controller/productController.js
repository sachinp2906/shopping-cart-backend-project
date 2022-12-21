const productModel= require('../model/productModel')
const{isValidString,isValidName,isIdValid} = require('../validation/validator')
const {uploadFile}=require('./aws')

let createProduct = async function(req,res){
    try{
        let data1 = req.body
        let file = req.files
        if(file.length==0) return res.status(400).send({status:false, message:"productImage is required."})
        if(file && file.length>0){ 
            //uploading and getting url from aws s3..
            let uploadFileUrl = await uploadFile(file[0])
            //setting productImage to aws s3 url..
            data1.productImage = uploadFileUrl   
        }

        if(Object.keys(data1).length==0){ return res.status(400).send({status:false, message:"Request body doesn't be empty"})}

        let {title,description, price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments} = data1

        //validation for Empty input..
        if(!title) return res.status(400).send({status:false, message:"title is mandatory."})
        if(!description) return res.status(400).send({status:false, message:"description is mandatory."})
        if(!price) return res.status(400).send({status:false, message:"price is mandatory."})
        if(!currencyId) return res.status(400).send({status:false, message:"currencyId is required."})
        if(!currencyFormat) return res.status(400).send({status:false, message:"currencyFormat is mandatory."})
        // if(!productImage) return res.status(400).send({status:false, message:"productImage is required."})

        price=Number(price)
        if(installments){
        installments=Number(installments)
        }

        //validation for corret data format..
        if(!isValidString(title) && !isValidName(title)){return res.status(400).send({status:false, message:"Enter valid title."})}
        if(!isValidString(description)){return res.status(400).send({status:false,message:"Enter some description.."})}
        if(typeof price!= "number"){return res.status(400).send({status:false,message:"Invalid price entry, price should be a number."})}
        if(currencyId!=="INR"){return res.status(400).send({status:false,message:"Invalid currencyId, currencyId should be INR only"})}
        if(currencyFormat!="₹"){return res.status(400).send({status:false,message:"Invalid currencyFormat, currencyFormat should be ₹ only."})}
        if(isFreeShipping){
        if(isFreeShipping!= Boolean) return res.status(400).send({status:false,message:"isFreeShipping should be Boolean value."})
        }
        if(!isValidString(style)){return res.status(400).send({status:false,message:"Invalid style input,style must be string."})}
        let arr=["S", "XS","M","X", "L","XXL", "XL"]
        if(availableSizes.length>0){
            if((!arr.includes(...availableSizes))) return res.status(400).send({status:false,message:"availableSizes can only be S, XS, M, X, L, XXL, XL "})
        }
        
        //checking if title already exists..
        const titleCheck = await productModel.findOne({title})
        if(titleCheck){ return res.status(400).send({status : false, message : "title already exists. Please enter unique title."}) }

        //creting data in DB..
        let createdData = await productModel.create(data1)

        //ERROR CODE 400 or what???for db error????
        if(!createdData){ return res.status(400).send({status:false,message:"Data could not be created."})}        
        return res.status(201).send({status:true, message:"Success", data:createdData})
    }
    catch(err){
        res.status(500).send({status:false, message:err.message})
    }
}

const getAllProducts= async function(req,res){
    try{
        if(Object.keys(req.query).length==0){
            let productData= await productModel.find({isDeleted:false}).sort({price:1})
            return res.status(200).send({status:true,message:"Success",data:productData})
        }
        let {size,name,priceGreaterThan,priceLessThan,priceSortBy}=req.query

        let obj={}
        obj.isDeleted=false
        
        if (size)  obj.availableSizes = size
        if (name)  obj.title = name 
        if (priceGreaterThan)  obj.price = { $gt: priceGreaterThan }
        if (priceLessThan)   obj.price = { $lt: priceLessThan }
        if (priceGreaterThan && priceLessThan)   obj.price = { $gt: priceGreaterThan, $lt: priceLessThan }
        if (priceSortBy) {
            if (!(priceSortBy == -1 || priceSortBy == 1)) return res.status(400).send({ status: false, message: "Please Enter '1' for Sort in Ascending Order or '-1' for Sort in Descending Order" });
        }

        let productData= await productModel.find(obj).sort({price:priceSortBy})
        if(!productData)  return res.status(404).send({status : false, message : "product is not present"})
        return res.status(200).send({status:true,message:"Success",data:productData})

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

const getProductById = async function(req , res) {
    
    try{
        const productId = req.params.productId
        if(!isIdValid(productId))   return res.status(400).send({status : false, message : "please provide valid product id in path params"})
        
        const findProduct = await productModel.findById({isDeleted:false,_id:productId})
        if(!findProduct)  return res.status(404).send({status : false, message : "Product is already deleted or doesn't exist"})
         return res.status(200).send({status : true , message : "data fetched succesfully" , data : findProduct})
         
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

const updateProduct = async function (req,res){
    try{
        if(Object.keys(req.body).length==0) return res.status(400).send({status:false, message:"Request body doesn't be empty"})
       let {title,description,price,size,isFreeShipping,productImage}=req.body
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}


const deleteProduct = async function (req,res){
    try{
       let id=req.params.productId
       if(!isIdValid(id))  return res.status(400).send({status : false, message : "Please provide valid product id in path params"})
       let deletedProd= await productModel.findOneAndUpdate({_id:id,isDeleted:false},{isDeleted:true,deletedAt:new Date()})
       if(!deletedProd) return res.status(404).send({status : false, message : "Product is already deleted or doesn't exist"})

       return res.status(200).send({status:true,messsage:"Product deleted successfully"})

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={createProduct,getAllProducts,getProductById,updateProduct,deleteProduct}
