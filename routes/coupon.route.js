const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addCoupon,
	getAllCoupon,
	getCoupon,
	updateCoupon,
	deleteCoupon,
} = require('../controllers/coupon.controller')
const { couponRules } = require('../validations/coupon.validation')
const validate = require('../validations/validator')

// Authenticate all requests

// Validate Object id for every request
router.param('couponId', validateObjectId('couponId'))

router.post('/', couponRules, isAuthenticated(), validate, addCoupon)
router.get('/', isAuthenticated(), getAllCoupon)

router.get('/:couponId', getCoupon)
router.put('/:couponId', isAuthenticated(), couponRules, validate, updateCoupon)
router.delete('/:couponId', isAuthenticated(), deleteCoupon)

module.exports = router
