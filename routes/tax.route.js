const express = require('express')
const router = express.Router()
const {
	addTax,
	updateTax,
	deleteTax,
	getTaxById,
	getAllTax,
	getTaxByAddedBy,
	getTaxByRestaurant,
} = require('../controllers/tax.controller')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const { addTaxRules } = require('../validations/tax.validation')

const validate = require('../validations/validator')

router.param('taxId', validateObjectId('taxId'))

router.get('/', isAuthenticated(), getAllTax)
router.post('/', isAuthenticated(), addTaxRules, validate, addTax)

router.get('/added_by/:added_by', isAuthenticated(), getTaxByAddedBy)
router.get(
	'/restaurant/:restaurantId',
	isAuthenticated(),
	validateObjectId('restaurantId'),
	getTaxByRestaurant,
)

router.get('/:taxId', isAuthenticated(), getTaxById)
router.put('/:taxId', isAuthenticated(), validate, updateTax)
router.delete('/:taxId', isAuthenticated(), deleteTax)

module.exports = router
