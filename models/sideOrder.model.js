const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SideOrderSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	restaurant: {
		type: Schema.Types.ObjectId,
		ref: 'Restaurant',
		required: true,
	},
	status: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('SideOrder', SideOrderSchema)
