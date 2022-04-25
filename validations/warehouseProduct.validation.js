const { check } = require('express-validator')
const WarehouseProduct = require('../models/warehouseProduct.model')

const addWarehouseProductRules = [
	check('name').trim().notEmpty().withMessage('Product name is required'),
	check('itemGroup')
		.trim()
		.notEmpty()
		.withMessage('Item group is required')
		.isMongoId()
		.withMessage('Invalid item group id'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('supplier')
		.trim()
		.notEmpty()
		.withMessage('Supplier is required')
		.isMongoId()
		.withMessage('Invalid supplier id'),
	check('type')
		.trim()
		.notEmpty()
		.withMessage('Type is required')
		.toLowerCase()
		.isIn(['vegetarian', 'non-vegetarian'])
		.withMessage('Invalid type'),
	check('stock').trim().notEmpty().withMessage('Stock is required'),
	check('status').isBoolean(),
	check('wastage').optional(),
	check('expiry')
		.trim()
		.notEmpty()
		.withMessage('Expiry date is required')
		.isDate()
		.withMessage('Invalid date format'),
]

const updateWarehouseProductRules = [
	check('name').trim().notEmpty().withMessage('Product name is required'),
	check('itemGroup')
		.trim()
		.notEmpty()
		.withMessage('Item group is required')
		.isMongoId()
		.withMessage('Invalid item group id'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('supplier')
		.trim()
		.notEmpty()
		.withMessage('Supplier is required')
		.isMongoId()
		.withMessage('Invalid supplier id'),
	check('type')
		.trim()
		.notEmpty()
		.withMessage('Type is required')
		.toLowerCase()
		.isIn(['vegetarian', 'non-vegetarian'])
		.withMessage('Invalid type'),
	check('stock').trim().notEmpty().withMessage('Stock is required'),
	check('status').isBoolean(),
	check('wastage').trim().notEmpty().withMessage('Wastage is required'),
	check('expiry')
		.trim()
		.notEmpty()
		.withMessage('Expiry date is required')
		.isDate()
		.withMessage('Invalid date format'),
]

const searchWarehouseProductRules = [
	check('field')
		.trim()
		.notEmpty()
		.withMessage('Field is required')
		.custom(async (val) => {
			const checkField = await WarehouseProduct.aggregate([
				{ $match: { [val]: { $exists: true } } },
				{ $limit: 5 },
			])
			if (!checkField.length) throw new Error('Invalid field name')

			return true
		}),
	check('search').trim().notEmpty().withMessage('Search text is required'),
]

module.exports = {
	addWarehouseProductRules,
	updateWarehouseProductRules,
	searchWarehouseProductRules,
}
