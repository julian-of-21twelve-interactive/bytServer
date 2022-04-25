const { check } = require('express-validator')

const changePasswordRules = [
	check('oldPassword')
		.trim()
		.notEmpty()
		.withMessage('Old password is required'),
	check('newPassword')
		.trim()
		.notEmpty()
		.withMessage('New password is required')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long'),
	check('confirmPassword')
		.trim()
		.notEmpty()
		.withMessage('Confirm password is required')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long')
		.custom((value, { req }) => {
			if (value !== req.body.newPassword)
				throw new Error('Passwords do not match')

			return true
		}),
]

const changeLanguageRules = [
	check('language').trim().notEmpty().withMessage('Language is required'),
]

module.exports = { changePasswordRules, changeLanguageRules }
