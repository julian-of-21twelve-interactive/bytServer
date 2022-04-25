const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const WarehouseOrder = require('../models/warehouseOrder.model')
const {
	addWarehouseOrder,
	getAllWarehouseOrder,
	getWarehouseOrder,
	updateWarehouseOrder,
	getOrderProduct,
	deleteWarehouseOrder,
	searchWarehouseOrder,
	getWarehouseOrderByRestaurant,
	getWarehouseOrdersBySupplier,
} = require('../controllers/warehouseOrder.controller')
const {
	addWarehouseOrderRules,
	updateWarehouseOrderRules,
} = require('../validations/warehouseOrder.validation')
const validate = require('../validations/validator')
const { searchByFieldRules } = require('../validations/common.validation')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('warehouseOrderId', validateObjectId('warehouseOrderId'))

router.post('/', permit, addWarehouseOrderRules, validate, addWarehouseOrder)
router.get('/', getAllWarehouseOrder)

router.post(
	'/search',
	searchByFieldRules(WarehouseOrder),
	validate,
	searchWarehouseOrder,
)

router.get(
	'/restaurant/:restaurantId',
	permit,
	validateObjectId('restaurantId'),
	getWarehouseOrderByRestaurant,
)

router.get(
	'/supplier/:supplierId',
	permit,
	validateObjectId('supplierId'),
	getWarehouseOrdersBySupplier,
)

router.get('/:warehouseOrderId', permit, getWarehouseOrder)
router.get(
	'/product/:orderProductId',
	permit,
	validateObjectId('orderProductId'),
	getOrderProduct,
)
router.put(
	'/:warehouseOrderId',
	permit,
	updateWarehouseOrderRules,
	validate,
	updateWarehouseOrder,
)
router.delete('/:warehouseOrderId', permit, deleteWarehouseOrder)

module.exports = router
