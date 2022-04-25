const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	body: {
		type: String,
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	data: {
		type: Object,
		required: true,
	},
	action: String,
	image: String,
	isArchived: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Notification', NotificationSchema)
