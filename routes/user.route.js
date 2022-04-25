const express = require('express')
const router = express.Router()
const {
	getAllUser,
	getUser,
	updateUser,
	deleteUser,
	register,
	login,
	logout,
	updateBytPoints,
	superRegister,
	restaurantLogin,
	adminLogin,
	searchUser,
	getUsersByRestaurant,
	setFirebaseToken,
	setCurrency,
} = require('../controllers/user.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const { permit, userAuth } = require('../middlewares/permission.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const User = require('../models/user.model')
const upload = require('../utils/fileUpload')
const { searchByFieldRules } = require('../validations/common.validation')
const {
	registrationRules,
	loginRules,
	updateUserRules,
	updateBytPointsRules,
	adminRegistrationRules,
	setFirebaseTokenRules,
	setCurrencyRules,
} = require('../validations/user.validation')
const validateLogin = require('../validations/validator.login')
const validate = require('../validations/validator')

// Auth route
router.post(
	'/register/admin',
	adminRegistrationRules,
	validateLogin,
	superRegister,
)
router.post('/register', registrationRules, validateLogin, register)
router.post('/login/restaurant', loginRules, validateLogin, restaurantLogin)
router.post('/login/admin', loginRules, validateLogin, adminLogin)
router.post('/login', loginRules, validateLogin, login)
router.get('/logout', isAuthenticated(), logout)

router.param('userId', validateObjectId('userId'))

// User route
router.get('/', isAuthenticated(), permit, getAllUser)
router.post(
	'/search',
	isAuthenticated(),
	searchByFieldRules(User),
	validate,
	searchUser,
)

router.get(
	'/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getUsersByRestaurant,
)

router.put(
	'/firebase_token/:userId',
	setFirebaseTokenRules,
	validate,
	setFirebaseToken,
)

router.put('/currency/:userId', setCurrencyRules, validate, setCurrency)

router.get('/:userId', isAuthenticated(), permit, userAuth('userId'), getUser)
router.put(
	'/:userId',
	isAuthenticated(),
	permit,
	userAuth('userId'),
	upload.fields([
		{
			name: 'profile',
			maxCount: 1,
		},
		{
			name: 'coverPhoto',
			maxCount: 1,
		},
	]),
	updateUserRules,
	validate,
	updateUser,
)
router.delete('/:userId', isAuthenticated(), permit, deleteUser)

router.put(
	'/update_points/:userId',
	isAuthenticated(),
	permit,
	updateBytPointsRules,
	validate,
	updateBytPoints,
)

module.exports = router
