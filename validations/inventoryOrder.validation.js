const { check } = require('express-validator')

const addInventoryOrderRules = [
	check('orders').isArray().isLength({ min: 1 }),
	check('orders.*.productName')
		.trim()
		.notEmpty()
		.withMessage('Product name is required'),
	check('orders.*.product')
		.trim()
		.notEmpty()
		.withMessage('Warehouse product is required')
		.isMongoId()
		.withMessage('Invalid product id'),
	check('orders.*.itemGroup')
		.notEmpty()
		.isMongoId()
		.withMessage('Enter valid group id'),
	check('orders.*.restaurant')
		.notEmpty()
		.isMongoId()
		.withMessage('Enter valid restaurant id'),
	check('orders.*.amount')
		.notEmpty()
		.isLength({ min: 1 })
		.isInt({ min: 1 })
		.withMessage('Amount should be 1 or more'),
	check('orders.*.email')
		.optional({ checkFalsy: true })
		.isEmail()
		.withMessage('Invalid email address'),
	check('orders.*.type').trim().notEmpty().withMessage('Type is required'),
	check('orders.*.status').optional(),
	check('orders.*.quantity')
		.trim()
		.notEmpty()
		.withMessage('Quantity is required'),
	check('orders.*.expiry')
		.notEmpty()
		.isDate()
		.withMessage('Invalid date format'),
]

const updateInventoryOrderRules = [
	check('productName')
		.trim()
		.notEmpty()
		.withMessage('Product name is required'),
	check('product')
		.trim()
		.notEmpty()
		.withMessage('Warehouse product is required')
		.isMongoId()
		.withMessage('Invalid product id'),
	check('itemGroup').notEmpty().isMongoId().withMessage('Enter valid group id'),
	check('amount')
		.notEmpty()
		.isLength({ min: 1 })
		.isInt({ min: 1 })
		.withMessage('Amount should be 1 or more'),
	check('type').trim().notEmpty().withMessage('Type is required'),
	check('status').trim().notEmpty().withMessage('Status is required'),
	check('quantity').trim().notEmpty().withMessage('Quantity is required'),
	check('expiry').notEmpty().isDate().withMessage('Invalid date format'),
]

module.exports = { addInventoryOrderRules, updateInventoryOrderRules }
