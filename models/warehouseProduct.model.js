const mongoose = require('mongoose')
const genShortCode = require('../utils/genShortCode')

const Schema = mongoose.Schema

const WarehouseProductSchema = new Schema(
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
			required: true,
		},
		supplier: {
			type: Schema.Types.ObjectId,
			ref: 'Supplier',
		},
		type: {
			type: String,
			lowercase: true,
		},
		stock: String,
		status: Boolean,
		wastage: Number,
		expiry: Date,
		serialNumber: {
			type: String,
		},
	},
	{ timestamps: true },
)

WarehouseProductSchema.pre('validate', function (next) {
	this.serialNumber = genShortCode(this.name, this.type, this.expiry)
	next()
})

module.exports = mongoose.model('WarehouseProduct', WarehouseProductSchema)
