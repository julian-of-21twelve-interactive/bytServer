const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ItemGroupSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	restaurant: {
		type: Schema.Types.ObjectId,
		ref: 'Restaurant',
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('ItemGroup', ItemGroupSchema)
