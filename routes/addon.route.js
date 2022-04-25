const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
  addAddon,
  getAllAddon,
  getAddon,
  updateAddon,
  deleteAddon,
  getAddonsByRestaurant,
  getAddonsByMenuItem,
  searchAddons,
} = require('../controllers/addon.controller')
const { addonRules } = require('../validations/addon.validation')
const validate = require('../validations/validator')
const Addon = require('../models/addon.model')
const { searchByFieldRules } = require('../validations/common.validation')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('addonId', validateObjectId('addonId'))

router.post('/', addonRules, validate, addAddon)
router.get('/', getAllAddon)

router.get(
  '/restaurant/:restaurantId',
  validateObjectId('restaurantId'),
  getAddonsByRestaurant,
)
router.get(
  '/menu_item/:menuItemId',
  validateObjectId('menuItemId'),
  getAddonsByMenuItem,
)

router.post('/search', searchByFieldRules(Addon), validate, searchAddons)

router.get('/:addonId', getAddon)
router.put('/:addonId', addonRules, validate, updateAddon)
router.delete('/:addonId', deleteAddon)

module.exports = router
