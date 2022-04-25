const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BundleItemSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: String,
		category: {
			type: String,
			lowercase: true,
		},
		image: [String],
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
		items: [
			{
				item: {
					type: Schema.Types.ObjectId,
					ref: 'MenuItem',
					required: true,
				},
				quantity: Number,
				_id: false,
			},
		],
		price: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			uppercase: true,
		},
		status: Boolean,
		discount: {
			type: Number,
			default: 0,
		},
		menuTag: {
			type: [Schema.Types.ObjectId],
			ref: 'MenuTag',
		},
		addon: {
			type: [Schema.Types.ObjectId],
			ref: 'Addon',
			default: [],
		},
		estimatedTime: {
			type: Number,
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('BundleItem', BundleItemSchema)
