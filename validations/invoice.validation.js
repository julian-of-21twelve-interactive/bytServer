const { check } = require('express-validator')

const invoiceRules = [
	check('customer')
		.notEmpty()
		.withMessage('Customer is required')
		.isMongoId()
		.withMessage('Invalid customer ID'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('order').notEmpty().isMongoId().withMessage('Invalid order Id'),
]

module.exports = { invoiceRules }
