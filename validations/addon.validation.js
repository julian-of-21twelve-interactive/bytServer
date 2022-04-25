const { check } = require('express-validator')

const addonRules = [
  check('name').trim().notEmpty().withMessage('Name is required'),
  check('restaurant')
    .trim()
    .notEmpty()
    .withMessage('Restaurant is required')
    .isMongoId()
    .withMessage('Invalid restaurant id'),
  check('price')
    .trim()
    .notEmpty()
    .withMessage('Price is required')
    .isInt({ min: 1 })
    .withMessage('Invalid price'),
  check('quantity')
    .optional({ checkFalsy: false })
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
]

module.exports = { addonRules }
