const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')
const config = require('../config/config')

const UserSchema = new Schema(
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
		mobile: {
			type: String,
		},
		dob: Date,
		spend: Number,
		diet: {
			type: [String],
			lowercase: true,
		},
		location: String,
		profile: {
			type: String,
			default: config.images.imagePath + config.images.defaultAvatar,
		},
		coverPhoto: {
			type: String,
			default: config.images.imagePath + config.images.defaultAvatar,
		},
		role: {
			type: Schema.Types.ObjectId,
			ref: 'Roles',
			required: true,
		},
		blacklist: {
			type: Boolean,
			default: false,
		},
		language: {
			type: String,
			default: 'english',
			lowercase: true,
		},
		bytPoints: {
			type: Number,
			default: 0,
		},
		avgSpend: {
			type: Number,
			default: 0,
		},
		firebaseToken: {
			type: String,
			default: '',
		},
		currency: {
			type: String,
			lowercase: true,
			default: 'usd',
		},
	},
	{ timestamps: true },
)

UserSchema.plugin(passportLocalMongoose, {
	usernameField: 'email',
	passwordField: 'password',
})

module.exports = mongoose.model('User', UserSchema)
