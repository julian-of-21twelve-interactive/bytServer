const { check } = require('express-validator')

const packageRules = [
  check('name').trim().notEmpty().withMessage('Package name is required'),
  check('price').trim().notEmpty().withMessage('Package Price is required'),
  check('expiry')
    .trim()
    .notEmpty()
    .withMessage('Package Expiry is required')
    .isDate()
    .withMessage('Enter a valid date'),
  check('status')
    .trim()
    .notEmpty()
    .withMessage('Package Status is required')
    .isBoolean()
    .default(false),
  check('restaurantCount')
    .trim()
    .notEmpty()
    .withMessage('Restaurant Count is required'),
]

module.exports = packageRules
