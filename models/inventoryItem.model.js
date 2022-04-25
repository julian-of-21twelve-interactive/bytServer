const mongoose = require('mongoose')
const genShortCode = require('../utils/genShortCode')

const Schema = mongoose.Schema

const InventoryItemSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		itemGroup: {
			type: Schema.Types.ObjectId,
			ref: 'ItemGroup',
		},
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
		price: {
			type: Number,
			required: true,
		},
		lastPurchase: {
			type: Date,
		},
		onHand: {
			type: String,
		},
		type: String,
		status: {
			type: Boolean,
			default: true,
		},
		quantity: {
			type: String,
		},
		image: String,
		expiry: {
			type: Date,
			required: true,
		},
		serialNumber: {
			type: String,
		},
	},
	{ timestamps: true },
)

InventoryItemSchema.pre('validate', function (next) {
	this.serialNumber = genShortCode(this.name, this.type, this.expiry)
	next()
})


module.exports = mongoose.model('InventoryItem', InventoryItemSchema)
