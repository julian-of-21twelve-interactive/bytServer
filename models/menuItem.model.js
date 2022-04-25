const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MenuItemSchema = new Schema({
	name: {
		type: String,
		required: true,
		lowercase: true,
	},
	description: String,
	productId: {
		type: String,
		required: true,
		unique: true,
	},
	image: [String],
	ingredient: {
		type: [
			{
				item: String,
				quantity: String,
				wastage: Number,
				_id: false,
			},
		],
		default: [],
	},
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
	category: {
		type: String,
		lowercase: false,
	},
	menuTag: {
		type: [Schema.Types.ObjectId],
		ref: 'MenuTag',
	},
	rating: Number,
	restaurant: {
		type: Schema.Types.ObjectId,
		ref: 'Restaurant',
	},
	addon: {
		type: [Schema.Types.ObjectId],
		default: [],
	},
	estimatedTime: {
		type: Number,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

//- TODO:
MenuItemSchema.pre('validate', function (next) {
	const random = Math.floor(Math.random() * 99999) + 10000
	this.productId = random.toString()
	next()
})

module.exports = mongoose.model('MenuItem', MenuItemSchema)
