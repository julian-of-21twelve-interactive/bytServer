const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ResetTokenSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	role: {
		type: Schema.Types.ObjectId,
		ref: 'Role',
	},
	token: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
		expires: 1200,
	},
})

module.exports = mongoose.model('ResetToken', ResetTokenSchema)
