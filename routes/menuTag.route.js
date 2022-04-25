const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addMenuTag,
	getAllMenuTag,
	getMenuTag,
	updateMenuTag,
	deleteMenuTag,
	getMenuTagsByRestaurant,
	searchMenuTags,
} = require('../controllers/menuTag.controller')
const {
	addMenuTagRules,
	updateMenuTagRules,
} = require('../validations/menuTag.validation')
const validate = require('../validations/validator')
const MenuTag = require('../models/menuTag.model')
const { searchByFieldRules } = require('../validations/common.validation')

// Validate Object id for every request
router.param('menuTagId', validateObjectId('menuTagId'))

router.post('/', isAuthenticated(), addMenuTagRules, validate, addMenuTag)
router.get('/', getAllMenuTag)

router.post('/search', searchByFieldRules(MenuTag), validate, searchMenuTags)
router.get(
	'/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getMenuTagsByRestaurant,
)
router.get('/:menuTagId', getMenuTag)
router.put(
	'/:menuTagId',
	isAuthenticated(),
	updateMenuTagRules,
	validate,
	updateMenuTag,
)
router.delete('/:menuTagId', isAuthenticated(), deleteMenuTag)

module.exports = router
