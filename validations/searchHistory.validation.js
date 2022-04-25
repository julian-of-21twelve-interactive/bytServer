const { check } = require('express-validator')

const searchHistoryRules = [
	check('text').trim().notEmpty().withMessage('Search text is required'),
	check('user')
		.trim()
		.notEmpty()
		.withMessage('User is required')
		.isMongoId()
		.withMessage('Invalid user id'),
	check('type').trim().notEmpty().withMessage('Search type is required'),
	check('searchId')
		.optional({ checkFalsy: false })
		.isMongoId()
		.withMessage('Invalid search id'),
]

module.exports = { searchHistoryRules }
