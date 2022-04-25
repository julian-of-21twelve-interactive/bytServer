const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReservationTypeSchema = new Schema({
	label: {
		type: String,
		required: true,
	},
	timeSlots: {
		type: [String],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('ReservationType', ReservationTypeSchema)
