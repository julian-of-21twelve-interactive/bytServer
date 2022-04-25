const { check } = require('express-validator')

const couponRules = [
  check('name').trim().notEmpty().withMessage('Name is required'),
  check('description').optional(),
  check('code').trim().notEmpty().withMessage('Code is required'),
  check('expiry')
    .trim()
    .notEmpty()
    .withMessage('Expiry is required')
    .isDate()
    .withMessage('Invalid expiry date'),
]

module.exports = { couponRules }
