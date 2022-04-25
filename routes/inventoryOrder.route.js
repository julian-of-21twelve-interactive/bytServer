const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addInventoryOrder,
	getAllInventoryOrder,
	getInventoryOrder,
	updateInventoryOrder,
	getOrderProduct,
	deleteInventoryOrder,
	searchInventoryOrder,
	getInventoryOrdersByRestaurant,
	setTransferToInventory,
} = require('../controllers/inventoryOrder.controller')
const {
	addInventoryOrderRules,
	updateInventoryOrderRules,
} = require('../validations/inventoryOrder.validation')
const validate = require('../validations/validator')
const InventoryOrder = require('../models/inventoryOrder.model')
const { searchByFieldRules } = require('../validations/common.validation')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('inventoryOrderId', validateObjectId('inventoryOrderId'))

router.post('/', permit, addInventoryOrderRules, validate, addInventoryOrder)
router.get('/', getAllInventoryOrder)

router.post(
	'/search',
	permit,
	searchByFieldRules(InventoryOrder),
	validate,
	searchInventoryOrder,
)

router.post('/transfer', setTransferToInventory)

router.get(
	'/restaurant/:restaurantId',
	permit,
	validateObjectId('restaurantId'),
	getInventoryOrdersByRestaurant,
)

router.get('/:inventoryOrderId', permit, getInventoryOrder)
router.get(
	'/product/:orderProductId',
	permit,
	validateObjectId('orderProductId'),
	getOrderProduct,
)
router.put(
	'/:inventoryOrderId',
	permit,
	updateInventoryOrderRules,
	validate,
	updateInventoryOrder,
)
router.delete('/:inventoryOrderId', permit, deleteInventoryOrder)

module.exports = router
