const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addBundleItem,
	getAllBundleItem,
	getBundleItem,
	updateBundleItem,
	deleteBundleItem,
	searchBundleItem,
	getBundleItemByRestaurant,
	getBundleItemsByTag,
	getBundleItemsByTagAndCategory,
} = require('../controllers/bundleItem.controller')
const { bundleItemRules } = require('../validations/bundleItem.validation')
const validate = require('../validations/validator')
const BundleItem = require('../models/bundleItem.model')
const { searchByFieldRules } = require('../validations/common.validation')
const upload = require('../utils/fileUpload')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('bundleItemId', validateObjectId('bundleItemId'))

router.post(
	'/',
	permit,
	upload.array('image', 3),
	bundleItemRules,
	validate,
	addBundleItem,
)
router.get('/', getAllBundleItem)

router.post(
	'/search',
	searchByFieldRules(BundleItem),
	validate,
	searchBundleItem,
)

router.get(
	'/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getBundleItemByRestaurant,
)

router.get(
	'/menu_tag/:menuTagId',
	isAuthenticated(),
	validateObjectId('menuTagId'),
	getBundleItemsByTag,
)
router.get(
	'/menu_tag/:menuTagId/:category',
	permit,
	validateObjectId('menuTagId'),
	getBundleItemsByTagAndCategory,
)

router.get('/:bundleItemId', getBundleItem)
router.put(
	'/:bundleItemId',
	permit,
	upload.array('image', 3),
	bundleItemRules,
	validate,
	updateBundleItem,
)
router.delete('/:bundleItemId', permit, deleteBundleItem)

module.exports = router
