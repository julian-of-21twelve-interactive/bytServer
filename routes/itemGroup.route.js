const express = require('express')
const router = express.Router()

const {
	addItemGroup,
	getItemGroup,
	getAllItemGroup,
	updateItemGroup,
	deleteItemGroup,
	searchItemGroup,
	getItemGroupsByRestaurant,
} = require('../controllers/itemGroup.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const ItemGroup = require('../models/itemGroup.model')
const { searchByFieldRules } = require('../validations/common.validation')
const {
	addItemGroupRules,
	updateItemGroupRules,
} = require('../validations/itemGroup.validation')
const validate = require('../validations/validator')

router.param('itemGroupId', validateObjectId('itemGroupId'))

router.get('/', isAuthenticated(), getAllItemGroup)
router.post('/', isAuthenticated(), addItemGroupRules, validate, addItemGroup)

router.post(
	'/search',
	isAuthenticated(),
	searchByFieldRules(ItemGroup),
	validate,
	searchItemGroup,
)

router.get(
	'/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getItemGroupsByRestaurant,
)

router.get('/:itemGroupId', isAuthenticated(), getItemGroup)
router.put(
	'/:itemGroupId',
	isAuthenticated(),
	updateItemGroupRules,
	validate,
	updateItemGroup,
)
router.delete('/:itemGroupId', isAuthenticated(), deleteItemGroup)

module.exports = router
