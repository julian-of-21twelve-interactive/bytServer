const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addAddress,
	getAllAddress,
	getAddress,
	getAddressByUser,
	updateAddress,
	deleteAddress,
} = require('../controllers/address.controller')
const { addressRules } = require('../validations/address.validation')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('addressId', validateObjectId('addressId'))

router.post('/', permit, addressRules, validate, addAddress)
router.get('/', permit, getAllAddress)

router.get('/user', permit, getAddressByUser)
router.get('/:addressId', permit, getAddress)
router.put(
	'/:addressId',
	permit,
	addressRules,
	validate,
	updateAddress,
)
router.delete('/:addressId', permit, deleteAddress)
// Add routes

module.exports = router
