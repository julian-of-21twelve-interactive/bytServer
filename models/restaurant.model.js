const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RestaurantSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		city: {
			type: String,
		},
		isOwner: Boolean,
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'RestaurantOwner',
		},

		std: String,
		contact: {
			type: [String],
		},
		location: {
			type: String,
		},
		coords: {
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point',
			},
			coordinates: {
				type: [Number],
				//- FIXME:
				default: [18.695694013288558, 73.88876233944206],
			},
		},
		status: {
			type: Boolean,
		},
		alcoholServe: { type: Boolean },
		services: String,
		seating: { type: String },
		seatingPreference: [
			{
				type: String,
				lowercase: true,
			},
		],
		paymentMethod: { type: String },
		cuisines: { type: String },
		tags: [{ type: String, lowercase: true }],
		openDays: { type: [String] },
		openTiming: { type: [String] },
		email: { type: String, lowercase: true },
		website: { type: String },
		image: {
			type: String,
			default: '',
		},
		package: {
			type: Schema.Types.ObjectId,
			ref: 'Package',
		},
		ratings: {
			type: Number,
			default: 0,
		},
		facebook: String,
		instagram: String,
		twitter: String,
		description: {
			type: String,
		},
		discount: {
			type: Number,
			default: 0,
		},
		lightChargePUnit: Number,
	},
	{ timestamps: true },
)

RestaurantSchema.index({ coords: '2dsphere' }, { background: true })

module.exports = mongoose.model('Restaurant', RestaurantSchema)
