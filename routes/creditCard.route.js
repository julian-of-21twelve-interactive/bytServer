const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addCreditCard,
	getAllCreditCard,
	getCreditCard,
	getCreditCardByUser,
	updateCreditCard,
	deleteCreditCard,
} = require('../controllers/creditCard.controller')
const { creditCardRules } = require('../validations/creditCard.validation')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('creditCardId', validateObjectId('creditCardId'))

router.post(
	'/',
	permit,
	creditCardRules,
	validate,
	addCreditCard,
)
router.get('/', permit, getAllCreditCard)

router.get('/user', permit, getCreditCardByUser)
router.get('/:creditCardId', permit, getCreditCard)
router.put(
	'/:creditCardId',
	permit,
	creditCardRules,
	validate,
	updateCreditCard,
)
router.delete('/:creditCardId', permit, deleteCreditCard)

module.exports = router
