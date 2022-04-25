const { check } = require('express-validator')

const subscriptionRules = [
  check('restaurantOwner')
    .trim()
    .notEmpty()
    .withMessage('Restaurant owner is required')
    .isMongoId()
    .withMessage('Invalid restaurant owner id'),
  check('package')
    .trim()
    .notEmpty()
    .withMessage('Package is required')
    .isMongoId()
    .withMessage('Invalid package id'),
  check('status').isBoolean(true),
]

module.exports = { subscriptionRules }
