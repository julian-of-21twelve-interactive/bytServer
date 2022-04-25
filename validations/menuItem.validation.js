const { check, oneOf } = require('express-validator')
const { isValidObjectId } = require('mongoose')
const config = require('../config/config')

const addMenuItemRules = [
	check('name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required')
		.isLength({ max: 70 }),
	check('description').optional(),
	check('price').trim().notEmpty().withMessage('Price is required'),
	check('currency')
		.trim()
		.notEmpty()
		.withMessage('Currency is required')
		.toUpperCase()
		.isIn(config.currency)
		.withMessage('Unsupported currency value'),
	check('status').isBoolean(),
	check('discount').optional({ checkFalsy: false }).isInt({ min: 1, max: 100 }),
	check('category')
		.toLowerCase()
		.isIn(['vegetarian', 'non-vegetarian'])
		.withMessage('Invalid category'),
	check('ingredient')
		.optional({ checkFalsy: true })
		.toArray()
		.isArray()
		.custom((val) => {
			const ingredientJson = JSON.parse(val)

			ingredientJson.forEach((ingredient) => {
				if (!ingredient.item)
					throw new Error('Ingredient item name is required')
				if (!ingredient.quantity)
					throw new Error('Ingredient quantity is required')
				if (!ingredient.wastage)
					throw new Error('Ingredient wastage is required')
			})

			return true
		}),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('addon')
		.optional({ checkFalsy: true })
		.toArray()
		.isArray()
		.custom((val) => {
			val.map((v) => {
				if (!isValidObjectId(v)) throw new Error('Invalid addon id')
			})

			return true
		}),
	check('estimatedTime')
		.optional({ checkFalsy: false })
		.isInt({ min: 1 })
		.withMessage('Invalid estimated time'),
	check('menuTag')
		.optional({ checkFalsy: false })
		.toArray()
		.isArray()
		.isLength({ min: 0 })
		.withMessage('At least 1 menu tag is required')
		.custom((val) => {
			val.map((v) => {
				if (!isValidObjectId(v)) throw new Error('Invalid menu tag id')
			})

			return true
		}),
]

const updateMenuItemRules = [
	check('name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required')
		.isLength({ max: 70 }),
	check('description').trim().notEmpty().withMessage('Description is required'),
	check('price').trim().notEmpty().withMessage('Price is required'),
	check('currency')
		.trim()
		.notEmpty()
		.withMessage('Currency is required')
		.toUpperCase()
		.isIn(config.currency)
		.withMessage('Unsupported currency value'),
	check('status').isBoolean(),
	check('discount').optional({ checkFalsy: false }).isInt({ min: 1, max: 100 }),
	check('category')
		.toLowerCase()
		.isIn(['vegetarian', 'non-vegetarian'])
		.withMessage('Invalid category'),
	check('ingredient')
		.trim()
		.notEmpty()
		.withMessage('Ingredient items are required')
		.custom((val) => {
			const ingredientJson = JSON.parse(val)

			ingredientJson.forEach((ingredient) => {
				if (!ingredient.item)
					throw new Error('Ingredient item name is required')
				if (!ingredient.quantity)
					throw new Error('Ingredient quantity is required')
				if (!ingredient.wastage)
					throw new Error('Ingredient wastage is required')
			})

			return true
		}),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('addon')
		.optional({ checkFalsy: false })
		.customSanitizer((addon) => JSON.parse(addon))
		.isArray()
		.isLength({ min: 1 })
		.custom((val) => {
			val.map((v) => {
				if (!isValidObjectId(v)) throw new Error('Invalid addon id')
			})

			return true
		}),
	check('estimatedTime')
		.optional({ checkFalsy: false })
		.isInt({ min: 1 })
		.withMessage('Invalid estimated time'),
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
]

const filerMenuItemRules = [
	oneOf(
		[
			check('filterId')
				.trim()
				.notEmpty()
				.withMessage('Filter is required')
				.isMongoId()
				.withMessage('Invalid filter id'),
			check('field').trim().notEmpty().withMessage('Field name is required'),
		],
		'Filter id or search text is required',
	),
	oneOf(
		[
			check('filterId')
				.trim()
				.notEmpty()
				.withMessage('Filter is required')
				.isMongoId()
				.withMessage('Invalid filter id'),
			check('search').trim().notEmpty().withMessage('Search text is required'),
		],
		'Filter id or search text is required',
	),
]

module.exports = { addMenuItemRules, updateMenuItemRules, filerMenuItemRules }
