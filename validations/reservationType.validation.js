const { check } = require('express-validator')

const reservationTypeRules = [
	check('label').trim().notEmpty().withMessage('Label is required'),
	check('from')
		.trim()
		.notEmpty()
		.withMessage('Start time is required')
		.custom((val) => {
			if (!new Date('1970-01-01 ' + val).getTime()) {
				throw new Error('Invalid Start time format')
			}

			return true
		}),
	check('to')
		.trim()
		.notEmpty()
		.withMessage('End time is required')
		.custom((val) => {
			if (!new Date('1970-01-01 ' + val).getTime()) {
				throw new Error('Invalid End time format')
			}

			return true
		}),
]

module.exports = { reservationTypeRules }
