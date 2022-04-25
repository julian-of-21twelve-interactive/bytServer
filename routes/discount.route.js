const express = require('express')
const router = express.Router()
const {
	addDiscount,
	getAllDiscount,
	updateDiscount,
	deleteDiscount,
	getDiscountById,
	getDiscountByRestaurant,
} = require('../controllers/discount.controller')

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const validate = require('../validations/validator')
const { addDiscountRules } = require('../validations/discount.validation')
const permit = require('../middlewares/permission.middleware')

router.param('discountId', validateObjectId('discountId'))
router.param('restaurantId', validateObjectId('restaurantId'))

//create a Discount
router.post('/', addDiscountRules, addDiscount)

//Get all Discounts
router.get('/', getAllDiscount)

//Update a Discount
router.put('/:discountId', isAuthenticated(), updateDiscount)

//Delete a Discount
router.delete('/:discountId', isAuthenticated(), deleteDiscount)

//Get Discount by Id
router.get('/:discountId', getDiscountById)

//Get Discount by Restaurant
router.get('/restaurant/:restaurantId', getDiscountByRestaurant)

module.exports = router
