const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DiscountSchema = new Schema(
	{
		addedBy: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		discountType: {
			type: String,
		},
		minDiscountPrice: {
			type: Number,
			default: 0,
		},
		maxDiscountPrice: { type: Number, default: 0 },
		discount: { type: Number, default: 0 },
		startDate: { type: Date, required: true },
		endDate: {
			type: Date,
		},
		status: {
			type: Boolean,
			default: false,
		},
		duration: {
			type: Number,
			default: 0,
		},
		menuItem: 
			{
				type: [Schema.Types.ObjectId],
				ref: 'MenuItem',
			}
		,
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('Discount', DiscountSchema)
