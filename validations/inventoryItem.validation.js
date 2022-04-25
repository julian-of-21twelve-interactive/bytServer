const { check } = require('express-validator')
const InventoryItem = require('../models/inventoryItem.model')

const addInventoryItemRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('itemGroup').notEmpty().isMongoId().withMessage('Enter valid group id'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Enter valid restaurant id'),
	check('price')
		.trim()
		.notEmpty()
		.withMessage('Price is required')
		.isInt({ min: 1 })
		.withMessage('Invalid price'),
	check('lastPurchase')
		.optional({ checkFalsy: true })
		.isDate()
		.withMessage('Invalid date format'),
	check('onHand').trim().notEmpty().withMessage('On hand value is required'),
	check('type').trim().notEmpty().withMessage('Type is required'),
	check('status').isBoolean(true),
	check('quantity').trim().notEmpty().withMessage('Quantity is required'),
	check('expiry').notEmpty().isDate().withMessage('Invalid date format'),
]

const updateInventoryItemRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('itemGroup').notEmpty().isMongoId().withMessage('Enter valid group id'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Enter valid restaurant id'),
	check('price')
		.trim()
		.notEmpty()
		.withMessage('Price is required')
		.isInt({ min: 1 })
		.withMessage('Invalid price'),
	check('lastPurchase')
		.optional({ checkFalsy: true })
		.isDate()
		.withMessage('Invalid date format'),
	check('onHand').trim().notEmpty().withMessage('On hand value is required'),
	check('type').trim().notEmpty().withMessage('Type is required'),
	check('status').isBoolean(true),
	check('quantity').trim().notEmpty().withMessage('Quantity is required'),
	check('expiry').notEmpty().isDate().withMessage('Invalid date format'),
]

const searchInventoryItemRules = [
	check('field')
		.trim()
		.notEmpty()
		.withMessage('Field is required')
		.custom(async (val) => {
			const checkField = await InventoryItem.aggregate([
				{ $match: { [val]: { $exists: true } } },
				{ $limit: 5 },
			])
			if (!checkField.length) throw new Error('Invalid field name')

			return true
		}),
	check('search').trim().notEmpty().withMessage('Search text is required'),
]

module.exports = {
	addInventoryItemRules,
	updateInventoryItemRules,
	searchInventoryItemRules,
}
