const { check } = require('express-validator')
const config = require('../config/config')

const addTaxRules = [
	check('addedBy').trim().notEmpty().withMessage('AddedBy is required'),
	check('rate')
		.trim()
		.notEmpty()
		.withMessage('Rate is required')
		.isInt({ min: 0, max: 100 })
		.withMessage('Invalid tax rate'),
	check('taxType')
		.trim()
		.notEmpty()
		.isIn(config.taxType)
		.withMessage('Taxtype is required'),
]

module.exports = { addTaxRules }
