const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const upload = require('../utils/fileUpload')
const {
	addRestaurant,
	getAllRestaurants,
	deleteRestaurant,
	getRestaurant,
	updateRestaurant,
	getRestaurantDetails,
	getTrendingRestaurants,
	getNearRestaurants,
	getHotshotRestaurants,
	getRestaurantByTag,
	getTopRatedRestaurants,
	getRestaurantsByOwner,
	searchRestaurant,
	getRestaurantByCost,
	getStaffMemberByRestaurantsId,
	getRestaurantByFilter,
	getTopIncomeRestaurant,
} = require('../controllers/restaurant.controller')
const {
	addRestaurantRules,
	updateRestaurantRules,
	searchRestaurantRules,
	getRestaurantByCostRules,
	getRestaurantByFilterRules,
} = require('../validations/restaurant.validation')
const Restaurant = require('../models/restaurant.model')
const validate = require('../validations/validator')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const { permit } = require('../middlewares/permission.middleware')
const { searchByFieldRules } = require('../validations/common.validation')

router.param('restaurantId', validateObjectId('restaurantId'))

router.get('/:sortBy(asc|desc)?', getAllRestaurants)
router.post(
	'/',
	upload.single('image'),
	addRestaurantRules,
	validate,
	addRestaurant,
)

router.post(
	'/search',
	searchByFieldRules(Restaurant),
	validate,
	searchRestaurant,
)

router.get(
	'/filter/:filterId/:queryParams?',
	getRestaurantByFilterRules,
	validate,
	getRestaurantByFilter,
)

router.get(
	'/owner/:ownerId',
	isAuthenticated(),
	validateObjectId('ownerId'),
	getRestaurantsByOwner,
)
router.get('/getstaff/:restaurantId', getStaffMemberByRestaurantsId)
router.get('/details', isAuthenticated(true), getRestaurantDetails)
router.get('/trending', isAuthenticated(true), getTrendingRestaurants)
router.get('/nearby', isAuthenticated(true), getNearRestaurants)
router.get('/hotspot', isAuthenticated(true), getHotshotRestaurants)
router.get('/top', isAuthenticated(true), getTopRatedRestaurants)
router.get('/tag/:tagName', isAuthenticated(true), getRestaurantByTag)
router.get(
	'/cost',
	isAuthenticated(true),
	getRestaurantByCostRules,
	validate,
	getRestaurantByCost,
)
router.get('/top_income', isAuthenticated(), getTopIncomeRestaurant)
router.get('/:restaurantId', isAuthenticated(true), getRestaurant)

router.put(
	'/:restaurantId',
	isAuthenticated(),
	permit,
	upload.single('image'),
	updateRestaurantRules,
	validate,
	updateRestaurant,
)
router.delete('/:restaurantId', isAuthenticated(), permit, deleteRestaurant)

module.exports = router
