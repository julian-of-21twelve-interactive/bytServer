const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WarehouseOrderSchema = new Schema(
	{
		productName: {
			type: String,
			required: true,
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
		type: String,
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
		supplier: {
			type: Schema.Types.ObjectId,
			ref: 'Supplier',
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('WarehouseOrder', WarehouseOrderSchema)
