const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const {
	addRestaurantOwner,
	getAllRestaurantOwners,
	getRestaurantOwner,
	updateRestaurantOwner,
	deleteRestaurantOwner,
	searchRestaurantOwner,
	setFirebaseToken,
	setCurrency,
} = require('../controllers/restaurantOwner.controller')
const {
	addRestaurantOwnerRules,
	updateRestaurantOwnerRules,
	setFirebaseTokenRules,
	setCurrencyRules,
} = require('../validations/restaurantOwner.validation')
const validate = require('../validations/validator')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const upload = require('../utils/fileUpload')
const RestaurantOwner = require('../models/restaurantOwner.model')
const { searchByFieldRules } = require('../validations/common.validation')
const { permit, userAuth } = require('../middlewares/permission.middleware')

router.param('restaurantOwnerId', validateObjectId('restaurantOwnerId'))

//- TODO: add auth middleware
router.post(
	'/',
	upload.single('profile'),
	addRestaurantOwnerRules,
	validate,
	addRestaurantOwner,
)
router.get('/', isAuthenticated(), permit, getAllRestaurantOwners)

router.post(
	'/search',
	isAuthenticated(),
	permit,
	searchByFieldRules(RestaurantOwner),
	validate,
	searchRestaurantOwner,
)

router.put(
	'/firebase_token/:restaurantOwnerId',
	isAuthenticated(),
	setFirebaseTokenRules,
	validate,
	setFirebaseToken,
)

router.put(
	'/currency/:restaurantOwnerId',
	isAuthenticated(),
	setCurrencyRules,
	validate,
	setCurrency,
)

router.get(
	'/:restaurantOwnerId',
	isAuthenticated(),
	permit,
	userAuth('restaurantOwnerId'),
	getRestaurantOwner,
)
router.put(
	'/:restaurantOwnerId',
	isAuthenticated(),
	permit,
	userAuth('restaurantOwnerId'),
	upload.single('profile'),
	updateRestaurantOwnerRules,
	validate,
	updateRestaurantOwner,
)
router.delete(
	'/:restaurantOwnerId',
	isAuthenticated(),
	permit,
	deleteRestaurantOwner,
)

module.exports = router
