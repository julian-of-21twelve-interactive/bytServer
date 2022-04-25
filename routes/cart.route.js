const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addCart,
	getAllCart,
	getCart,
	updateCart,
	deleteCart,
} = require('../controllers/cart.controller')
const paginatedResult = require('../middlewares/pagination.middleware')
const Cart = require('../models/cart.model')
const {
	addCartRules,
	updateCartRules,
} = require('../validations/cart.validation')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())
router.use(permit)

// Validate Object id for every request
router.param('cartId', validateObjectId('cartId'))

router.post('/', addCartRules, validate, addCart)
router.get('/', paginatedResult(Cart), getAllCart)

router.get('/:cartId', getCart)
router.put('/:cartId', updateCartRules, validate, updateCart)
router.delete('/:cartId', deleteCart)
// Add routes

module.exports = router
