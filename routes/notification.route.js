const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addNotification,
	getAllNotification,
	getNotification,
	getNotificationByUser,
	updateNotification,
	deleteNotification,
	setNotificationAction,
} = require('../controllers/notification.controller')
const {
	notificationRules,
	setNotificationActionRules,
} = require('../validations/notification.validation')
const validate = require('../validations/validator')
const upload = require('../utils/fileUpload')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('notificationId', validateObjectId('notificationId'))

router.post(
	'/',
	upload.single('image'),
	notificationRules,
	validate,
	addNotification,
)
router.get('/', getAllNotification)

router.get('/user/:userId', validateObjectId('userId'), getNotificationByUser)
router.get('/:notificationId', getNotification)

router.put(
	'/set_action/:notificationId',
	setNotificationActionRules,
	validate,
	setNotificationAction,
)

router.put(
	'/:notificationId',
	upload.single('image'),
	notificationRules,
	validate,
	updateNotification,
)
router.delete('/:notificationId', deleteNotification)
// Add routes

module.exports = router
