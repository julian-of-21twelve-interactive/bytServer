const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addFavorite,
	getAllFavorite,
	getFavorite,
	getFavoriteByUser,
	updateFavorite,
	deleteFavorite,
	getFavoriteByBundleItem,
	getFavoriteByMenuItem
} = require('../controllers/favorite.controller')
const { favoriteRules } = require('../validations/favorite.validation')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated()) 

// Validate Object id for every request
// router.param('favoriteId', validateObjectId('favoriteId'))
router.param('favoriteId', validateObjectId('favoriteId'))
router.param('bundleItemId', validateObjectId('bundleItemId'))
router.param('menuItemId', validateObjectId('menuItemId'))
router.post('/',permit, favoriteRules, validate, addFavorite)
router.get('/', permit, getAllFavorite)

router.get('/user', permit, getFavoriteByUser)
router.get('/bundle_item/:bundleItemId',  getFavoriteByBundleItem)
router.get('/menu_item/:menuItemId',  getFavoriteByMenuItem)
router.get('/:favoriteId', permit, getFavorite)
router.put(
	'/:favoriteId',
	permit,
	favoriteRules,
	validate,
	updateFavorite,
)
router.delete('/:favoriteId', permit, deleteFavorite)

module.exports = router
