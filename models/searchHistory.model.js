const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SearchHistorySchema = new Schema({
	text: {
		type: String,
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	type: { type: String },
	searchId: { type: Schema.Types.ObjectId },
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('SearchHistory', SearchHistorySchema)
