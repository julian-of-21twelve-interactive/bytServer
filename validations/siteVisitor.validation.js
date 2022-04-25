const { check } = require('express-validator')

const addSiteVisitorRules = [
  check('date')
    .trim()
    .notEmpty()
    .withMessage('Date is required')
    .isDate()
    .withMessage('Invalid date format'),
]

module.exports = { addSiteVisitorRules }
