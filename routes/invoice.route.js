const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addInvoice,
	getAllInvoice,
	getInvoice,
	updateInvoice,
	deleteInvoice,
	getInvoicesByRestaurant,
	getInvoicesByUser,
} = require('../controllers/invoice.controller')
const { invoiceRules } = require('../validations/invoice.validation')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('invoiceId', validateObjectId('invoiceId'))

router.post('/', permit, invoiceRules, validate, addInvoice)
router.get('/', permit, getAllInvoice)

router.get(
	'/restaurant/:restaurantId',
	permit,
	validateObjectId('restaurantId'),
	getInvoicesByRestaurant,
)

router.get(
	'/user/:userId',
	permit,
	validateObjectId('userId'),
	getInvoicesByUser,
)

router.get('/:invoiceId', permit, getInvoice)
router.put('/:invoiceId', permit, invoiceRules, validate, updateInvoice)
router.delete('/:invoiceId', permit, deleteInvoice)

module.exports = router
