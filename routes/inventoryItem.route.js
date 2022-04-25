const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addInventoryItem,
	getAllInventoryItem,
	getInventoryItem,
	updateInventoryItem,
	deleteInventoryItem,
	searchInventoryItem,
	getInventoryItemsByRestaurant,
} = require('../controllers/inventoryItem.controller')
const {
	addInventoryItemRules,
	updateInventoryItemRules,
	searchInventoryItemRules,
} = require('../validations/inventoryItem.validation')
const validate = require('../validations/validator')
const upload = require('../utils/fileUpload')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('inventoryItemId', validateObjectId('inventoryItemId'))

router.post(
	'/',
	permit,
	upload.single('image'),
	addInventoryItemRules,
	validate,
	addInventoryItem,
)
router.get('/', permit, getAllInventoryItem)
router.post(
	'/search',
	permit,
	searchInventoryItemRules,
	validate,
	searchInventoryItem,
)

router.get(
	'/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getInventoryItemsByRestaurant,
)

router.get(
	'/:inventoryItemId',
	permit,
	getInventoryItem,
)
router.put(
	'/:inventoryItemId',
	permit,
	upload.single('image'),
	updateInventoryItemRules,
	validate,
	updateInventoryItem,
)
router.delete(
	'/:inventoryItemId',
	permit,
	deleteInventoryItem,
)

module.exports = router
