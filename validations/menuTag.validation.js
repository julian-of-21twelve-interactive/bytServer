const { check } = require('express-validator')

const addMenuTagRules = [
  check('name').trim().notEmpty().withMessage('Name is required'),
  // add rules
]

const updateMenuTagRules = [
  check('name').trim().notEmpty().withMessage('Name is required'),
  // add rules
]

module.exports = { addMenuTagRules, updateMenuTagRules }
