const mongoose = require('mongoose')
const Schema = mongoose.Schema
const config = require('../config/config')

const SupplierItemSchema = new Schema({
	
	name: String,
	image: {
		type: String,
		default: config.images.imagePath + config.images.defaultAvatar,
	},
    quantity: {
		type: Number
	},
    price:{
        type:Number
    },
    sku:{
        type:String
    },
    supplier:{
        type: Schema.Types.ObjectId,
		ref: 'Supplier'
    }
	
})


module.exports = mongoose.model('SupplierItem', SupplierItemSchema)
