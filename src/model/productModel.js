const mongoose = require("mongoose")
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        requred: true,
        unique: true
    },
    description: {
        type: String,
        requred: true
    },
    price: {
        type: Number,
        requred: true
    },
    currencyId: {
        type: String,
        requred: true,
        default: "INR"
    },
    currencyFormat: {
        type: String,
        required: true,
        default: "₹"
    },
    isFreeShipping: {
        type: Boolean,
        default: false
    },
    productImage: {
        type: String,
        required: true
    },
    style: {
        type: String
    },
    availableSizes: {
        type: String,
        enum: ["S", "XS", "M", "X", "L", "XXL", "XL"]
    },
    installments: {
        type: Number
    },
    deletedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("Product", productSchema)