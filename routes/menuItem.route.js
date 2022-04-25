const express = require('express')
const router = express.Router()
const {
	getAllMenuItems,
	addMenuItem,
	updateMenuItem,
	getMenuItem,
	deleteMenuItem,
	getMenuItemByFilter,
	getMenuItemsByRestaurant,
	getMenuItemsByTag,
	getMenuItemsByTagAndCategory,
	getRecommendedMenuItems,
	getRecommendedMenuItemsByRestaurant,
	getMenuItemsByOwner,
	getMenuComboItemsByRestaurant,
	getPopularMenuItems,
	getPopularMenuItemsByRestaurant,
} = require('../controllers/menuItem.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const { permit } = require('../middlewares/permission.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const upload = require('../utils/fileUpload')
const {
	addMenuItemRules,
	updateMenuItemRules,
	filerMenuItemRules,
} = require('../validations/menuItem.validation')
const validate = require('../validations/validator')

router.param('menuItemId', validateObjectId('menuItemId'))

router.get('/', getAllMenuItems)
router.post(
	'/',
	isAuthenticated(),
	permit,
	upload.array('image', 3),
	addMenuItemRules,
	validate,
	addMenuItem,
)
router.get(
	'/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getMenuItemsByRestaurant,
)

router.get('/owner/:ownerId', validateObjectId('ownerId'), getMenuItemsByOwner)

router.get(
	'/menu_combo/restaurant/:restaurantId/:menuTagId?',
	validateObjectId('restaurantId'),
	getMenuComboItemsByRestaurant,
)

router.get('/recommended', getRecommendedMenuItems)

router.get(
	'/recommended/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getRecommendedMenuItemsByRestaurant,
)

router.get('/popular', getPopularMenuItems)
router.get(
	'/popular/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getPopularMenuItemsByRestaurant,
)

router.get(
	'/menu_tag/:menuTagId',
	validateObjectId('menuTagId'),
	getMenuItemsByTag,
)
router.get(
	'/menu_tag/:menuTagId/:category',
	validateObjectId('menuTagId'),
	getMenuItemsByTagAndCategory,
)
router.get('/:menuItemId', getMenuItem)
router.post('/filter', filerMenuItemRules, validate, getMenuItemByFilter)
router.put(
	'/:menuItemId',
	isAuthenticated(),
	permit,
	upload.array('image', 3),
	updateMenuItemRules,
	validate,
	updateMenuItem,
)
router.delete('/:menuItemId', isAuthenticated(), permit, deleteMenuItem)

module.exports = router
