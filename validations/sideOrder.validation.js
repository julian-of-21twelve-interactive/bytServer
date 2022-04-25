const { check } = require('express-validator')

const sideOrderRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('status').optional({ checkFalsy: false }).isBoolean(true),
]

module.exports = { sideOrderRules }
