const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addFavoriteRestaurant,
	getAllFavoriteRestaurant,
	getFavoriteRestaurant,
	updateFavoriteRestaurant,
	deleteFavoriteRestaurant,
	getFavoriteRestaurantByUser,
} = require('../controllers/favoriteRestaurant.controller')
const {
	addFavoriteRestaurantRules,
	updateFavoriteRestaurantRules,
} = require('../validations/favoriteRestaurant.validation')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('favoriteRestaurantId', validateObjectId('favoriteRestaurantId'))

router.post(
	'/',
	permit,
	addFavoriteRestaurantRules,
	validate,
	addFavoriteRestaurant,
)
router.get('/', permit, getAllFavoriteRestaurant)

router.get(
	'/user/:userId',
	permit,
	validateObjectId('userId'),
	getFavoriteRestaurantByUser,
)
router.get(
	'/:favoriteRestaurantId',
	permit,
	getFavoriteRestaurant,
)
router.put(
	'/:favoriteRestaurantId',
	permit,
	updateFavoriteRestaurantRules,
	validate,
	updateFavoriteRestaurant,
)
router.delete(
	'/:favoriteRestaurantId',
	permit,
	deleteFavoriteRestaurant,
)

module.exports = router
