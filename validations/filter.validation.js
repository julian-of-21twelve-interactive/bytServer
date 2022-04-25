const { check } = require('express-validator')

const filterRules = [
	check('filterTitle')
		.trim()
		.notEmpty()
		.withMessage('Filter title is required'),
	check('filters')
		.isArray()
		.isLength({ min: 1 })
		.withMessage('Filters are required'),
	check('filters.*.name')
		.trim()
		.notEmpty()
		.withMessage('Filter name is required')
		.toLowerCase(),
	check('filters.*.query')
		.trim()
		.notEmpty()
		.withMessage('Filter query is required')
		.custom((val) => {
			const jsonVal = JSON.parse(val)
			if (!Array.isArray(jsonVal)) throw new Error('Invalid query')

			return true
		}),
	check('multipleSelection').isBoolean(),
	check('slider').isBoolean(),
	check('min')
		.optional({ checkFalsy: false })
		.isInt()
		.withMessage('Invalid min value'),
	check('max')
		.optional({ checkFalsy: false })
		.isInt()
		.withMessage('Invalid max value'),
]

module.exports = { filterRules }
