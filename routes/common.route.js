const express = require('express')
const router = express.Router()

const {
	getAllCollections,
	forgetPassword,
	resetPassword,
	getOrderLinkData,
} = require('../controllers/common.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const {
	forgetPasswordRules,
	resetPasswordRules,
} = require('../validations/common.validation')
const validate = require('../validations/validator')

router.get('/collections', isAuthenticated(), getAllCollections)
router.post('/forget_password', forgetPasswordRules, validate, forgetPassword)
router.post('/reset_password', resetPasswordRules, validate, resetPassword)
router.get('/oi_51ce7e/:token', getOrderLinkData)

module.exports = router
