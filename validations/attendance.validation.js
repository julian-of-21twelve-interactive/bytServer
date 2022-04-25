const { check } = require('express-validator')

const addAttendanceRules = [
	check('staffMember')
		.trim()
		.notEmpty()
		.withMessage('Staff member required')
		.isMongoId()
		.withMessage('Invalid staff member id'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('date')
		.notEmpty()
		.withMessage('Date is required')
		.isDate()
		.withMessage('Invalid date format'),
	check('inTime')
		.trim()
		.notEmpty()
		.withMessage('In time is required')
		.custom((val) => {
			return new Date('1970-01-01 ' + val).getTime()
		})
		.withMessage('Invalid time format'),
	check('outTime')
		.trim()
		.notEmpty()
		.withMessage('Out time is required')
		.custom((val) => {
			return new Date('1970-01-01 ' + val).getTime()
		})
		.withMessage('Invalid time format'),
	check('breakTime')
		.trim()
		.notEmpty()
		.withMessage('Break time is required')
		.custom((val) => {
			return new Date('1970-01-01 ' + val).getTime()
		})
		.withMessage('Invalid time format'),
]

const updateAttendanceRules = [
	check('staffMember')
		.trim()
		.notEmpty()
		.withMessage('Staff member is required')
		.isMongoId()
		.withMessage('Invalid staff member id'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('date')
		.notEmpty()
		.withMessage('Date is required')
		.isDate()
		.withMessage('Invalid date format'),
	check('inTime')
		.trim()
		.notEmpty()
		.withMessage('In time is required')
		.custom((val) => {
			return new Date('1970-01-01 ' + val).getTime()
		})
		.withMessage('Invalid time format'),
	check('outTime')
		.trim()
		.notEmpty()
		.withMessage('Out time is required')
		.custom((val) => {
			return new Date('1970-01-01 ' + val).getTime()
		})
		.withMessage('Invalid time format'),
	check('breakTime')
		.trim()
		.notEmpty()
		.withMessage('Break time is required')
		.custom((val) => {
			return new Date('1970-01-01 ' + val).getTime()
		})
		.withMessage('Invalid time format'),
]

module.exports = { addAttendanceRules, updateAttendanceRules }
