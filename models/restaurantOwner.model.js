const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')
const config = require('../config/config')

const RestaurantOwnerSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		mobile: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
		},
		address: String,
		profile: {
			type: String,
			default: config.images.imagePath + config.images.defaultAvatar,
		},
		restaurantCount: {
			type: Number,
			default: 1,
		},
		restaurantType: {
			type: Boolean,
			default: true,
		},
		role: {
			type: Schema.Types.ObjectId,
			ref: 'Roles',
			required: true,
		},
		firebaseToken: {
			type: String,
		},
		currency: {
			type: String,
			lowercase: true,
			default: 'usd',
		},
	},
	{ timestamps: true },
)

RestaurantOwnerSchema.plugin(passportLocalMongoose, {
	usernameField: 'email',
	passwordField: 'password',
})

module.exports = mongoose.model('RestaurantOwner', RestaurantOwnerSchema)
