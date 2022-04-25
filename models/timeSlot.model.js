const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TimeSlotSchema = new Schema({
	label: {
		type: String,
		required: true,
	},
	restaurant: {
		type: Schema.Types.ObjectId,
		ref: 'Restaurant',
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

module.exports = mongoose.model('TimeSlot', TimeSlotSchema)
