const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewSchema = new Schema(
	{
		reviewerId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		item: {
			type: Schema.Types.ObjectId,
			ref: 'MenuItem',
		},
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
		image: {
			type: [String],
		},
		description: String,
		rating: {
			type: Number,
			default: 5,
		},
		upVote: {
			type: Number,
			default: 0,
		},
		downVote: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('Review', ReviewSchema)
