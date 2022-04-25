const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ShareLinkSchema = new Schema(
	{
		linkId: {
			type: String,
			required: true,
			unique: true,
		},
		type: {
			type: String,
			default: 'order',
		},
		clickCount: {
			type: Number,
			default: 0,
		},
		expire: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('ShareLink', ShareLinkSchema)
