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

        //for undefined keys..
        let reqbodydata = Object.keys(data1)
        let arr1 =["title","description", "price","currencyId","currencyFormat","isFreeShipping","style","availableSizes","installments","productImage"];
        for (let i = 0; i < reqbodydata.length; i++) {
            const element = reqbodydata[i];
            
            if(!arr1.includes(element)) return res.status(400).send({status:false, message:`${element} is not a valid/defined property.`})
        }


        let {title,description, price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments} = data1

        //validation for Empty input..
        if(!title) return res.status(400).send({status:false, message:"title is mandatory."})
        if(!description) return res.status(400).send({status:false, message:"description is mandatory."})
        if(!price) return res.status(400).send({status:false, message:"price is mandatory."})
        if(!currencyId) return res.status(400).send({status:false, message:"currencyId is required."})
        if(!currencyFormat) return res.status(400).send({status:false, message:"currencyFormat is mandatory."})
        // if(!productImage) return res.status(400).send({status:false, message:"productImage is required."})

        price=JSON.parse(price)
        if(installments){
        installments=JSON.parse(installments)
        }

        //validation for corret data format..
        if(!isValidString(title) && !isValidName(title)){return res.status(400).send({status:false, message:"Enter valid title."})}
        if(!isValidString(description)){return res.status(400).send({status:false,message:"Enter some description.."})}
        if(typeof price!= "number"){return res.status(400).send({status:false,message:"Invalid price entry, price should be a number."})}
        if(currencyId!=="INR"){return res.status(400).send({status:false,message:"Invalid currencyId, currencyId should be INR only"})}
        if(currencyFormat!="₹"){return res.status(400).send({status:false,message:"Invalid currencyFormat, currencyFormat should be ₹ only."})}
        if(isFreeShipping){
            isFreeShipping=JSON.parse(isFreeShipping)
            if(isFreeShipping!= true && isFreeShipping!= false) return res.status(400).send({status:false,message:"isFreeShipping should be Boolean value."})
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


//--------------------------------------------------------------------------//

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

//-----------------------------------------------------------------------------------------//
const getProductById = async function(req , res) {
    
    try{
        const productId = req.params.productId
        if(!isIdValid(productId))   return res.status(400).send({status : false, message : "please provide valid product id in path params"})
        
        const findProduct = await productModel.findOne({isDeleted:false,_id:productId})
        if(!findProduct)  return res.status(404).send({status : false, message : "Product is already deleted or doesn't exist"})
         return res.status(200).send({status : true , message : "Success" , data : findProduct})
         
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

const updateProduct = async function (req,res){
    try{

        const productId = req.params.productId
        if(!isIdValid(productId))   return res.status(400).send({status : false, message : "please provide valid product id in path params"})
        if(Object.keys(req.body).length==0) return res.status(400).send({status:false, message:"Request body doesn't be empty"})
        let data=req.body
        let file = req.files
        if(file && file.length>0){ 
            //uploading and getting url from aws s3..
            let uploadFileUrl = await uploadFile(file[0])
            //setting productImage to aws s3 url..
            data.productImage = uploadFileUrl   
        }

        //for undefined keys..
        let reqbodydata = Object.keys(data)
        let arr1 =["title","description", "price","size","isFreeShipping","style","availableSizes","installments","productImage"];
        for (let i = 0; i < reqbodydata.length; i++) {
            const element = reqbodydata[i];
            
            if(!arr1.includes(element)) return res.status(400).send({status:false, message:`${element} is not a valid/defined property.`})
        }

        let {title,description,price,size,isFreeShipping,productImage,style,availableSizes,installments}=data
        

        if(title){
            if(!isValidString(title) && !isValidName(title)){return res.status(400).send({status:false, message:"Enter valid title."})}
            const titleCheck = await productModel.findOne({title})
            if(titleCheck){ return res.status(400).send({status : false, message : "title already exists. Please enter unique title."}) }
        }
        if(description){
            if(!isValidString(description)){return res.status(400).send({status:false,message:"Enter some description.."})}
        }
        if(price){
            price=JSON.parse(price)
            if(typeof price != "number"){return res.status(400).send({status:false,message:"Invalid price entry, price should be a number."})}
        }
        if(isFreeShipping){
            isFreeShipping=JSON.parse(isFreeShipping)
            if(isFreeShipping!= true && isFreeShipping!= false) return res.status(400).send({status:false,message:"isFreeShipping should be Boolean value."})
        }
        if(style){
            if(!isValidString(style)){return res.status(400).send({status:false,message:"Invalid style input,style must be string."})}
        }   
        if(availableSizes){
            let arr=["S", "XS","M","X", "L","XXL", "XL"]
            if(availableSizes.length>0){
                if((!arr.includes(...availableSizes))) return res.status(400).send({status:false,message:"availableSizes can only be S, XS, M, X, L, XXL, XL "})
            }
        }
        if(installments){
            installments=JSON.parse(installments)
            if(typeof installments!= "number"){return res.status(400).send({status:false,message:"Invalid installments entry, installments should be a number."})}
        }
        let updateProd= await productModel.findOneAndUpdate({isDeleted:false,_id:productId},{title,description,price,size,isFreeShipping,productImage,style,availableSizes,installments},{new:true})
        if(!updateProd)  return res.status(404).send({status : false, message : "Product is already deleted or doesn't exist"})
        
        return res.status(200).send({status : true , message : "data updated succesfully" , data : updateProd})
        
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

       return res.status(200).send({status:true,message:"Success"})

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={createProduct,getAllProducts,getProductById,updateProduct,deleteProduct}
