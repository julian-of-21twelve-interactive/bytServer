const { check } = require('express-validator')

const addCartRules = [
  check('customer')
    .trim()
    .notEmpty()
    .withMessage('Customer is required')
    .isMongoId()
    .withMessage('Invalid customer id'),
  check('item')
    .trim()
    .notEmpty()
    .withMessage('Item is required')
    .isMongoId()
    .withMessage('Invalid item id'),
  check('quantity')
    .trim()
    .notEmpty()
    .withMessage('Quantity is required')
    .isLength({ min: 1 })
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
]

const updateCartRules = [
  check('customer')
    .trim()
    .notEmpty()
    .withMessage('Customer is required')
    .isMongoId()
    .withMessage('Invalid customer id'),
  check('item')
    .trim()
    .notEmpty()
    .withMessage('Item is required')
    .isMongoId()
    .withMessage('Invalid item id'),
  check('quantity')
    .trim()
    .notEmpty()
    .withMessage('Quantity is required')
    .isLength({ min: 1 })
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
]

module.exports = { addCartRules, updateCartRules }
