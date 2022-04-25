const { check } = require('express-validator')

const addWarehouseOrderRules = [
	check('orders').isArray().isLength({ min: 1 }),
	check('orders.*.productName')
		.trim()
		.notEmpty()
		.withMessage('Product name is required'),
	check('orders.*.itemGroup')
		.notEmpty()
		.withMessage('Item group id is required')
		.isMongoId()
		.withMessage('Enter valid group id'),
	check('orders.*.restaurant')
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Enter valid restaurant id'),
	check('orders.*.supplier')
		.notEmpty()
		.withMessage('Supplier is required')
		.isMongoId()
		.withMessage('Enter valid supplier id'),
	check('orders.*.amount')
		.notEmpty()
		.withMessage('Amount is required')
		.isLength({ min: 1 })
		.isInt({ min: 1 })
		.withMessage('Amount should be 1 or more'),
	check('orders.*.email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
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
		.withMessage('Expiry date is required')
		.isDate()
		.withMessage('Invalid date format'),
]

const updateWarehouseOrderRules = [
	check('productName')
		.trim()
		.notEmpty()
		.withMessage('Product name is required'),
	check('itemGroup')
		.notEmpty()
		.withMessage('Item group id is required')
		.isMongoId()
		.withMessage('Enter valid group id'),
	check('supplier')
		.trim()
		.notEmpty()
		.withMessage('Supplier is required')
		.isMongoId()
		.withMessage('Invalid supplier id'),
	check('amount')
		.notEmpty()
		.withMessage('Amount is required')
		.isLength({ min: 1 })
		.isInt({ min: 1 })
		.withMessage('Amount should be 1 or more'),
	check('type').trim().notEmpty().withMessage('Type is required'),
	check('orders.*.status').trim().notEmpty().withMessage('Status is required'),
	check('quantity').trim().notEmpty().withMessage('Quantity is required'),
	check('expiry')
		.notEmpty()
		.withMessage('Expiry date is required')
		.isDate()
		.withMessage('Invalid date format'),
	check('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Invalid email address'),
]

module.exports = { addWarehouseOrderRules, updateWarehouseOrderRules }
