const express = require('express')
const router = express.Router()
const {
	addItem,
	updateItemById,
	deleteItem,
	getItemById,
	getAllItems,
	getItemsBySupplier,
} = require('../controllers/supplierItem.controller')

const { additemRules } = require('../validations/supplierItem.validation')

const { isAuthenticated } = require('../middlewares/auth.middleware')
const upload = require('../utils/fileUpload')
const validate = require('../validations/validator')
const validateObjectId = require('../middlewares/validateObjectId.middleware')

//items Router
router.param('itemId', validateObjectId('itemId'))
router.post(
	'/',
	isAuthenticated(),
	additemRules,
	upload.single('image'),
	addItem,
)
router.put(
	'/:itemId',
	isAuthenticated(),
	validate,
	upload.single('image'),
	updateItemById,
)
router.delete('/:itemId', isAuthenticated(), validate, deleteItem)
router.get(
	'/supplier/:supplierId',
	isAuthenticated(),
	validateObjectId('supplierId'),
	getItemsBySupplier,
)
router.get('/:itemId', isAuthenticated(), getItemById)
router.get('/', isAuthenticated(), getAllItems)

module.exports = router
