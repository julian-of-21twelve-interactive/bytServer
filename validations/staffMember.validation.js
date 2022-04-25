const { check } = require('express-validator')
const { currencyConverter } = require('../utils/currencyConverter.util')

const addStaffMemberRules = [
	check('name').trim().notEmpty().withMessage('Name is required').toLowerCase(),
	check('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Provide a valid email address')
		.toLowerCase(),
	check('password')
		.trim()
		.notEmpty()
		.withMessage('Password is required')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long'),
	check('mobile').trim().notEmpty().withMessage('Mobile is required'),
	check('category').toLowerCase().isIn(['waiter', 'chef', 'manager']),
	check('role')
		.optional({ checkFalsy: false })
		.isMongoId()
		.withMessage('Invalid role id'),
	check('salary')
		.trim()
		.notEmpty()
		.withMessage('Salary is required')
		.isInt({ min: 1 })
		.withMessage('Invalid salary amount'),
	check('status').isBoolean(),
]

const updateStaffMemberRules = [
	check('name').trim().notEmpty().withMessage('Name is required').toLowerCase(),
	check('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Provide a valid email address')
		.toLowerCase(),
	check('mobile').trim().notEmpty().withMessage('Mobile is required'),
	check('category').toLowerCase().isIn(['waiter', 'chef', 'manager']),
	check('role')
		.trim()
		.notEmpty()
		.withMessage('Role is required')
		.isMongoId()
		.withMessage('Invalid role id'),
	check('salary')
		.trim()
		.notEmpty()
		.withMessage('Salary is required')
		.isInt({ min: 1 })
		.withMessage('Invalid salary amount'),
	check('status').isBoolean(),
]

const importStaffMemberRules = [
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
]

const loginStaffMemberRules = [
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
	addStaffMemberRules,
	updateStaffMemberRules,
	importStaffMemberRules,
	loginStaffMemberRules,
	setCurrencyRules,
}
