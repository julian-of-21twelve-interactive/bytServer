const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema
const config = require('../config/config')

const StaffMemberSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		mobile: String,
		image: {
			type: String,
			default: config.images.imagePath + config.images.defaultAvatar,
		},
		category: {
			type: String,
			required: true,
		},
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
		isRestaurant: {
			type: Boolean,
			default: false,
		},
		role: {
			type: Schema.Types.ObjectId,
			ref: 'Roles',
		},
		salary: {
			type: Number,
			default: 0,
		},
		status: Boolean,
		language: {
			type: String,
			default: 'english',
			lowercase: true,
		},
		currency: {
			type: String,
			lowercase: true,
			default: 'usd',
		},
	},
	{ timestamps: true },
)

StaffMemberSchema.plugin(passportLocalMongoose, {
	usernameField: 'email',
	passwordField: 'password',
})

module.exports = mongoose.model('StaffMember', StaffMemberSchema)
