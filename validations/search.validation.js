const { check } = require('express-validator')

const searchRestaurantAndItemsRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
]

module.exports = { searchRestaurantAndItemsRules }
