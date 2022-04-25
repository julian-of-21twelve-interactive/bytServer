const { check } = require('express-validator')

const searchByFieldRules = (Model) => [
	check('field')
		.trim()
		.notEmpty()
		.withMessage('Field is required')
		.custom(async (val) => {
			if (['hash', 'salt'].includes(val)) throw new Error('Invalid field name')

			const checkField = await Model.aggregate([
				{ $match: { [val]: { $exists: true } } },
				{ $limit: 5 },
			])
			if (!checkField.length) throw new Error('Invalid field name')

			return true
		}),
	check('search').trim().notEmpty().withMessage('Search text is required'),
	check('where').optional({ checkFalsy: true }).isJSON(),
]

const forgetPasswordRules = [
	check('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Invalid email'),
	check('role')
		.toLowerCase()
		.default('user')
		.isIn(['user', 'admin', 'restaurant_owner', 'staff_member']),
]

const resetPasswordRules = [
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
		.custom((value, { req }) => {
			if (value !== req.body.newPassword)
				throw new Error('Passwords do not match')

			return true
		}),
	check('resetToken')
		.trim()
		.notEmpty()
		.withMessage('Reset token is required')
		.isHexadecimal()
		.withMessage('Invalid reset token')
		.isLength({ min: 64, max: 64 })
		.withMessage('Invalid reset token'),
]

module.exports = { searchByFieldRules, forgetPasswordRules, resetPasswordRules }
