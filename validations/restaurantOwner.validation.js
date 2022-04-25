const { check } = require('express-validator')
const { currencyConverter } = require('../utils/currencyConverter.util')

const addRestaurantOwnerRules = [
	check('name')
		.trim()
		.notEmpty()
		.withMessage('Name is required')
		.isLength({ min: 3 })
		.withMessage('Name should be at least 3 characters long'),
	check('mobile')
		.notEmpty()
		.withMessage('Mobile number is required')
		.isLength({ min: 10 })
		.withMessage('Mobile number should be 10 characters long'),
	check('email')
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
	check('confirmPassword')
		.trim()
		.notEmpty()
		.withMessage('Confirm password is required')
		.custom((value, { req }) => {
			if (value !== req.body.password) throw new Error('Passwords do not match')

			return true
		}),
	check('address').notEmpty(),
]

const updateRestaurantOwnerRules = [
	check('name')
		.trim()
		.notEmpty()
		.withMessage('Name is required')
		.isLength({ min: 3 })
		.withMessage('Name should be at least 3 characters long'),
	check('mobile')
		.notEmpty()
		.withMessage('Mobile number is required')
		.isLength({ min: 10 })
		.withMessage('Mobile number should be 10 characters long'),
	check('email')
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Invalid email address'),
	check('address').trim().notEmpty().withMessage('Address is required'),
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
	addRestaurantOwnerRules,
	updateRestaurantOwnerRules,
	setFirebaseTokenRules,
	setCurrencyRules,
}
