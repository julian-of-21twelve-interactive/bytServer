const express = require('express')
const router = express.Router()
const {
	addCustomer,
	getCustomer,
	getAllCustomers,
	updateCustomer,
} = require('../controllers/customer.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const upload = require('../utils/fileUpload')
const validate = require('../validations/validator')
const {
	addCustomerRules,
	updateCustomerRules,
} = require('../validations/customer.validation')
const { permit } = require('../middlewares/permission.middleware')

router.get(
	'/',
	isAuthenticated(),
	permit,
	getAllCustomers,
)
router.post(
	'/',
	addCustomerRules,
	validate,
	// upload.single('image'),
	addCustomer,
)
router.get(
	'/:customerId',
	isAuthenticated(),
	permit,
	getCustomer,
)
router.put(
	'/edit/:customerId',
	isAuthenticated(),
	permit,
	updateCustomerRules,
	validate,
	updateCustomer,
)

module.exports = router
