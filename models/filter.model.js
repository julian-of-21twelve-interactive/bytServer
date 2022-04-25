const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FilterSchema = new Schema({
	filterTitle: {
		type: String,
		required: true,
	},
	filters: [
		{
			name: {
				type: String,
				required: true,
				lowercase: true,
			},
			query: {
				type: String,
				required: true,
			},
		},
	],
	multipleSelection: {
		type: Boolean,
		default: false,
	},
	slider: {
		type: Boolean,
		default: false,
	},
	min: Number,
	max: Number,
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Filter', FilterSchema)
