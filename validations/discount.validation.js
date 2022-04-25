const { check } = require('express-validator')

const addDiscountRules = [
	check('addedBy')
		.trim()
		.notEmpty()
		.withMessage('Person required who is adding this discount')
		.isMongoId()
		.withMessage('Invalid Id'),
	check('discountType')
		.trim()
		.notEmpty()
		.withMessage('Type of discount is required'),
	check('minDiscountPrice')
		.trim()
		.notEmpty()
		.withMessage('MinDiscountPrice is required'),
	check('maxDiscountPrice')
		.trim()
		.notEmpty()
		.withMessage('MaxDiscountPrice is required'),
	check('discount').trim().notEmpty().withMessage('Discount is required'),
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
]

module.exports = { addDiscountRules }
