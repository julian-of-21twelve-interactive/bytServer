const { check } = require('express-validator')

const addressRules = [
  check('address').trim().notEmpty().withMessage('Address is required'),
  check('customer')
    .trim()
    .notEmpty()
    .withMessage('Customer is required')
    .isMongoId()
    .withMessage('Invalid customer id'),
  check('addressType')
    .trim()
    .notEmpty()
    .withMessage('Address type is required'),
]

module.exports = { addressRules }
