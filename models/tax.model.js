const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TaxSchema = new Schema(
	{
		addedBy: {
			type: String,
		},
		taxType: String,
		rate: Number,
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('Tax', TaxSchema)
