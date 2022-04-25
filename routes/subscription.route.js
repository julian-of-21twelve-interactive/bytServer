const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addSubscription,
	getAllSubscription,
	getSubscription,
	updateSubscription,
	deleteSubscription,
	getSubscriptionsByOwner,
	getSubscriptionByRestaurant
} = require('../controllers/subscription.controller')
const { subscriptionRules } = require('../validations/subscription.validation')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('subscriptionId', validateObjectId('subscriptionId'))

router.post('/', permit, subscriptionRules, validate, addSubscription)
router.get('/', getAllSubscription)

router.get(
	'/owner/:ownerId',
	validateObjectId('ownerId'),
	getSubscriptionsByOwner,
)

router.get(
	'/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getSubscriptionByRestaurant,
)

router.get('/:subscriptionId', getSubscription)
router.put(
	'/:subscriptionId',
	permit,
	subscriptionRules,
	validate,
	updateSubscription,
)
router.delete('/:subscriptionId', permit, deleteSubscription)

module.exports = router
