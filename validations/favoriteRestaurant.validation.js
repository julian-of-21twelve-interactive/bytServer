const { check } = require('express-validator')

const addFavoriteRestaurantRules = [
  check('customer')
    .trim()
    .notEmpty()
    .withMessage('Customer is required')
    .isMongoId()
    .withMessage('Invalid customer id'),
  check('restaurant')
    .trim()
    .notEmpty()
    .withMessage('Restaurant is required')
    .isMongoId()
    .withMessage('Invalid restaurant id'),
]

const updateFavoriteRestaurantRules = [
  check('customer')
    .trim()
    .notEmpty()
    .withMessage('Customer is required')
    .isMongoId()
    .withMessage('Invalid customer id'),
  check('restaurant')
    .trim()
    .notEmpty()
    .withMessage('Restaurant is required')
    .isMongoId()
    .withMessage('Invalid restaurant id'),
]

module.exports = { addFavoriteRestaurantRules, updateFavoriteRestaurantRules }
