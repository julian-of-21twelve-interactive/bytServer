const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')
const config = require('../config/config')

const RiderSchema = new Schema(
	{
		name: String,
		image: {
			type: String,
			default: config.images.imagePath + config.images.defaultAvatar,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		phone: {
			type: Number,
		},
		address: {
			type: String,
		},
		role: {
			type: Schema.Types.ObjectId,
			ref: 'Roles',
			required: true,
		},
	},
	{ timestamps: true },
)

RiderSchema.plugin(passportLocalMongoose, {
	usernameField: 'email',
	passwordField: 'password',
})

module.exports = mongoose.model('Rider', RiderSchema)
