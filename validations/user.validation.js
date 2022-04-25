const { check } = require('express-validator')
const { currencyConverter } = require('../utils/currencyConverter.util')

const registrationRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Invalid email address'),
	check('password')
		.trim()
		.notEmpty()
		.withMessage('Password is required')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long'),
	check('dob')
		.trim()
		.notEmpty()
		.withMessage('Date of birth is required')
		.isDate()
		.withMessage('The date must be valid'),
	check('diet').optional({ checkFalsy: true }).toLowerCase(),
]

const adminRegistrationRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Invalid email address'),
	check('password')
		.trim()
		.notEmpty()
		.withMessage('Password is required')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long'),
	check('dob')
		.optional({ checkFalsy: false })
		.isDate()
		.withMessage('The date must be valid'),
]

const loginRules = [
	check('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Invalid email address'),
	check('password')
		.trim()
		.notEmpty()
		.withMessage('Password is required')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long'),
]

const updateUserRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Invalid email address'),
	check('dob')
		.trim()
		.notEmpty()
		.withMessage('Date of birth is required')
		.isDate()
		.withMessage('The date must be valid'),
	check('diet').optional(),
]

const updateBytPointsRules = [
	check('bytPoints')
		.trim()
		.notEmpty()
		.withMessage('Byt point is required')
		.isInt({ min: 1 })
		.withMessage('Byt point must be a number')
		.isLength({ min: 1 }),
]

const setFirebaseTokenRules = [
	check('firebaseToken')
		.trim()
		.notEmpty()
		.withMessage('Firebase token is required'),
]

const setCurrencyRules = [
	check('currency')
		.trim()
		.notEmpty()
		.withMessage('Currency unit is required')
		.toUpperCase()
		.isIn(currencyConverter.currencyCode)
		.withMessage('Invalid currency format')
		.toLowerCase(),
]

module.exports = {
	registrationRules,
	loginRules,
	updateUserRules,
	updateBytPointsRules,
	adminRegistrationRules,
	setFirebaseTokenRules,
	setCurrencyRules,
}
