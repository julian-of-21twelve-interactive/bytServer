const { check } = require('express-validator')

const addItemGroupRules = [
	check('name')
		.trim()
		.notEmpty()
		.withMessage('Item group name is required')
		.isLength({ max: 30 }),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid mongo id'),
]

const updateItemGroupRules = [
	check('name')
		.trim()
		.notEmpty()
		.withMessage('Item group name is required')
		.isLength({ max: 30 }),
]

module.exports = { addItemGroupRules, updateItemGroupRules }
