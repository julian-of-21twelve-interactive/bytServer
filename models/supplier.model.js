const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')
const config = require('../config/config')

const SupplierSchema = new Schema(
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
		role: {
			type: Schema.Types.ObjectId,
			ref: 'Roles',
			required: true,
		},
		address: {
			type: String,
		},
	},
	{ timestamps: true },
)

SupplierSchema.plugin(passportLocalMongoose, {
	usernameField: 'email',
	passwordField: 'password',
})

module.exports = mongoose.model('Supplier', SupplierSchema)
