const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const SideOrder = require('../models/sideOrder.model')
const {
	addSideOrder,
	getAllSideOrder,
	getSideOrder,
	updateSideOrder,
	deleteSideOrder,
	searchSideOrder,
	getSideOrdersByRestaurant,
} = require('../controllers/sideOrder.controller')
const { sideOrderRules } = require('../validations/sideOrder.validation')
const validate = require('../validations/validator')
const { searchByFieldRules } = require('../validations/common.validation')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('sideOrderId', validateObjectId('sideOrderId'))

router.post(
	'/',
	// permit,
	sideOrderRules,
	validate,
	addSideOrder,
)
router.get('/', getAllSideOrder)

router.post('/search', searchByFieldRules(SideOrder), validate, searchSideOrder)

router.get(
	'/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getSideOrdersByRestaurant,
)

router.get('/:sideOrderId', getSideOrder)
router.put(
	'/:sideOrderId',
	// permit,
	sideOrderRules,
	validate,
	updateSideOrder,
)
router.delete(
	'/:sideOrderId',
	// permit,
	deleteSideOrder,
)

module.exports = router
