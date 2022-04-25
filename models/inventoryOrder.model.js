const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InventoryOrderSchema = new Schema(
	{
		productName: {
			type: String,
			required: true,
		},
		product: {
			type: Schema.Types.ObjectId,
			ref: 'WarehouseProduct',
		},
		itemGroup: {
			type: Schema.Types.ObjectId,
			ref: 'ItemGroup',
		},
		email: {
			type: String,
			lowercase: true,
		},
		amount: {
			type: Number,
		},
		type: { type: String, lowercase: true },
		status: { type: String, default: 'pending' },
		quantity: {
			type: String,
		},
		expiry: {
			type: Date,
			required: true,
		},
		orderId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('InventoryOrder', InventoryOrderSchema)
