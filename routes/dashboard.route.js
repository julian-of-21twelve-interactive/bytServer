const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const {
	getAllCount,
	getAllRestaurantCount,
	getFavouriteChartData,
} = require('../controllers/dashboard.controller')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

router.get('/', permit, getAllCount)
router.get('/restaurant/:restaurantId', permit, getAllRestaurantCount)
router.get('/favourite_chart/owner/:ownerId/:weekday?', getFavouriteChartData)

module.exports = router
