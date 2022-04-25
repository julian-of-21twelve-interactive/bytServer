const { check } = require('express-validator')

const addPromotionRules = [
	check('addedBy')
		.trim()
		.notEmpty()
		.withMessage('Person required who is adding this promotion')
		.isMongoId()
		.withMessage('Invalid Id'),
	check('name').trim().notEmpty().withMessage('Name of promotion is required'),
	check('startDate')
		.trim()
		.notEmpty()
		.withMessage('StartDate is required')
		.isDate()
		.withMessage('Must be a valid date'),
	check('endDate')
		.trim()
		.notEmpty()
		.withMessage('EndDate is required')
		.isDate()
		.withMessage('Must be a valid date'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant Id is required')
		.isMongoId()
		.withMessage('invalid Id'),
	check('discount')
		.trim()
		.notEmpty()
		.withMessage('Discount is required')
		.isMongoId()
		.withMessage('invalid Id'),
]

module.exports = { addPromotionRules }
