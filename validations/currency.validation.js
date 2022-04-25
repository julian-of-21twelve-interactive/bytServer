const { check } = require('express-validator')
const { currencyConverter } = require('../utils/currencyConverter.util')
const Currency = require('../models/currency.model')

const currencyRules = [
	check('name').optional(),
	check('code')
		.trim()
		.notEmpty()
		.withMessage('Currency code is required')
		.toUpperCase()
		.isIn(currencyConverter.currencyCode)
		.withMessage('Invalid currency format')
		.toLowerCase()
		.custom(async (val) => {
			const isAddedCurrency = await Currency.findOne({ code: val })

			if (isAddedCurrency) throw new Error('Duplicate entry for ' + val)

			return true
		}),
	check('symbol').optional(),
]

module.exports = { currencyRules }
