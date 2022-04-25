const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AttendanceSchema = new Schema(
	{
		staffMember: {
			type: Schema.Types.ObjectId,
			ref: 'StaffMember',
		},
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
		date: {
			type: Date,
		},
		inTime: {
			type: String,
		},
		outTime: {
			type: String,
		},
		breakTime: {
			type: String,
		},
		workingTime: Number,
	},
	{ timestamps: true },
)

module.exports = mongoose.model('Attendance', AttendanceSchema)
