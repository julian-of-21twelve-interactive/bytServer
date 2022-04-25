const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CurrencySchema = new Schema({
	name: {
		type: String,
	},
	code: {
		type: String,
		unique: true,
		lowercase: true,
		required: true,
	},
	symbol: {
		type: String,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Currency', CurrencySchema)
