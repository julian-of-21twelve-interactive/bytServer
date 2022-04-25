const express = require('express')
const router = express.Router()
const { searchRestaurantAndItems } = require('../controllers/search.controller')
const {
	searchRestaurantAndItemsRules,
} = require('../validations/search.validation')
const validate = require('../validations/validator')

router.post(
	'/restaurant_items',
	searchRestaurantAndItemsRules,
	validate,
	searchRestaurantAndItems,
)

module.exports = router
