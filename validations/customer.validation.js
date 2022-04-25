const { check } = require('express-validator')
const User = require('../models/user.model')

const addCustomerRules = [
  check('name').trim().notEmpty().withMessage('Name is required'),
  check('mobile')
    .optional({ checkFalsy: true })
    .isLength({ min: 10 })
    .withMessage('Invalid contact number'),
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((email) => {
      return User.findOne({ email }).then((user) => {
        if (user) return Promise.reject('Email already in use')
      })
    }),
  check('dob')
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage('The date must be valid'),
  check('spend').optional({ checkFalsy: true }).isLength({ min: 1 }),
  check('diet').optional(),
  check('location').trim().notEmpty(),
  check('blacklist').isBoolean(),
]

const updateCustomerRules = [
  check('name').trim().notEmpty().withMessage('Name is required'),
  check('mobile')
    .optional({ checkFalsy: true })
    .isLength({ min: 10 })
    .withMessage('Invalid contact number'),
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  check('dob')
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage('The date must be valid'),
  check('spend').optional({ checkFalsy: true }).isLength({ min: 1 }),
  check('diet').optional(),
  check('location').trim().notEmpty(),
  check('blacklist').isBoolean(),
]

module.exports = { addCustomerRules, updateCustomerRules }
