const { check } = require('express-validator')

const creditCardRules = [
  check('name').trim().notEmpty().withMessage('Name is required'),
  check('cardNumber')
    .trim()
    .notEmpty()
    .withMessage('Card number is required')
    .isCreditCard()
    .withMessage('Invalid credit card number'),
  check('expiry')
    .trim()
    .notEmpty()
    .withMessage('Expiry date is required')
    .isDate()
    .withMessage('Invalid expiry date'),
  check('customer')
    .trim()
    .notEmpty()
    .withMessage('Customer is required')
    .isMongoId()
    .withMessage('Invalid customer id'),
]

module.exports = { creditCardRules }
