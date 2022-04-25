const { check } = require('express-validator')
const { isValidObjectId } = require('mongoose')
const config = require('../config/config')

const bundleItemRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('description').optional(),
	check('category')
		.trim()
		.notEmpty()
		.withMessage('Category is required')
		.toLowerCase()
		.isIn(['vegetarian', 'non-vegetarian'])
		.withMessage('Invalid category'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('items')
		.toArray()
		.isArray()
		.isLength({ min: 2 })
		.withMessage('Menu item is required')
		.custom((val) => {
			const itemsArr = JSON.parse(val)
			if (itemsArr.length < 2)
				throw new Error('At least 2 items required to create a combo item')
			itemsArr.forEach((i) => {
				if (!isValidObjectId(i.item)) throw new Error('Invalid menu item id')
				if (i.quantity < 1) throw new Error('At least 1 menu item is required')
			})
			return true
		}),
	check('price')
		.trim()
		.notEmpty()
		.withMessage('Price is required')
		.isInt({ min: 1 })
		.withMessage('Invalid price'),
	check('currency')
		.trim()
		.notEmpty()
		.withMessage('Currency is required')
		.toUpperCase()
		.isIn(config.currency)
		.withMessage('Unsupported currency value'),
	check('status').isBoolean(),
	check('discount').optional({ checkFalsy: false }).isInt({ min: 1, max: 100 }),
	check('menuTag')
		.optional({ checkFalsy: false })
		.customSanitizer((tag) => JSON.parse(tag))
		.isArray()
		.isLength({ min: 0 })
		.withMessage('At least 1 menu tag is required')
		.custom((val) => {
			val.map((v) => {
				if (!isValidObjectId(v)) throw new Error('Invalid menu tag id')
			})

			return true
		}),
	check('addon')
		.optional({ checkFalsy: true })
		.customSanitizer((addon) => JSON.parse(addon))
		.isArray()
		.custom((val) => {
			val.map((v) => {
				if (!isValidObjectId(v)) throw new Error('Invalid addon id')
			})

			return true
		}),
	check('estimatedTime')
		.trim()
		.notEmpty()
		.withMessage('Estimated time is required')
		.isInt({ min: 1 })
		.withMessage('Invalid estimated time'),
]

module.exports = { bundleItemRules }
