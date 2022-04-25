const express = require('express')
const router = express.Router()
const {
	addWarehouseProduct,
	getWarehouseProduct,
	getAllWarehouseProducts,
	updateWarehouseProduct,
	deleteWarehouseProduct,
	searchWarehouseProduct,
	getWarehouseProductByRestaurant,
	getWarehouseProductBySupplier,
} = require('../controllers/warehouseProduct.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addWarehouseProductRules,
	updateWarehouseProductRules,
	searchWarehouseProductRules,
} = require('../validations/warehouseProduct.validation')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

router.param('storeProductId', validateObjectId('warehouseProductId'))

router.post(
	'/',
	isAuthenticated(),
	permit,
	addWarehouseProductRules,
	validate,
	addWarehouseProduct,
)
router.post(
	'/search',
	isAuthenticated(),
	permit,
	searchWarehouseProductRules,
	validate,
	searchWarehouseProduct,
)

router.get(
	'/restaurant/:restaurantId',
	isAuthenticated(),
	permit,
	validateObjectId('restaurantId'),
	getWarehouseProductByRestaurant,
)

router.get(
	'/supplier/:supplierId',
	isAuthenticated(),
	permit,
	validateObjectId('supplierId'),
	getWarehouseProductBySupplier,
)

router.get(
	'/:warehouseProductId',
	isAuthenticated(),
	permit,
	getWarehouseProduct,
)
router.get('/', isAuthenticated(), permit, getAllWarehouseProducts)
router.put(
	'/:warehouseProductId',
	isAuthenticated(),
	permit,
	updateWarehouseProductRules,
	validate,
	updateWarehouseProduct,
)
router.delete(
	'/:warehouseProductId',
	isAuthenticated(),
	permit,
	deleteWarehouseProduct,
)

module.exports = router
