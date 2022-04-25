const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const Currency = require('../models/currency.model')
const {
	addCurrency,
	getAllCurrency,
	getCurrency,
	searchCurrency,
} = require('../controllers/currency.controller')
const { currencyRules } = require('../validations/currency.validation')
const validate = require('../validations/validator')
const { searchByFieldRules } = require('../validations/common.validation')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('currencyId', validateObjectId('currencyId'))

router.post('/', currencyRules, validate, addCurrency)
router.get('/', getAllCurrency)

router.post('/search', searchByFieldRules(Currency), validate, searchCurrency)

router.get('/:currencyId', getCurrency)

module.exports = router
