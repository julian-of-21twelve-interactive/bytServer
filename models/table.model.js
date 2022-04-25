const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TableSchema = new Schema(
	{
		tableNo: {
			type: Number,
			required: true,
		},
		capacity: {
			type: Number,
			required: true,
		},
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
		bookingStatus: {
			type: Boolean,
		},
		costPerson: {
			type: Number,
			required: true,
		},
		floorType: String,
		position: {
			x: Number,
			y: Number,
			align: {
				type: String,
				lowercase: true,
				default: 'horizontal',
			},
		},
	},
	{ timestamps: true },
)

TableSchema.index(
	{ tableNo: 1, restaurant: 1 },
	{ unique: true, background: true },
)

module.exports = mongoose.model('Table', TableSchema)
