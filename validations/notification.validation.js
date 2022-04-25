const { check } = require('express-validator')

const notificationRules = [
	check('title').trim().notEmpty().withMessage('Title is required'),
	check('body').trim().notEmpty().withMessage('Notification body is required'),
	check('user')
		.trim()
		.notEmpty()
		.withMessage('User is required')
		.isMongoId()
		.withMessage('Invalid user id'),
	check('data')
		.customSanitizer((val) => JSON.parse(val))
		.isObject()
		.withMessage('Invalid data'),
	check('data.type')
		.trim()
		.notEmpty()
		.withMessage('Notification type is required'),
	check('isArchived').optional().default(false),
]

const setNotificationActionRules = [
	check('action')
		.trim()
		.notEmpty()
		.withMessage('Notification action is required'),
	check('type').trim().notEmpty().withMessage('Notification type is required'),
	check('userId')
		.optional({ checkFalsy: false })
		.isMongoId()
		.withMessage('Invalid userId'),
]

module.exports = { notificationRules, setNotificationActionRules }
