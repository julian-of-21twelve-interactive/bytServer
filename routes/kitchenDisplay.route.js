const express = require('express')
const router = express.Router()

//Get Schema
const KitchenDisplay = require('../models/kitchenDisplay.model')

//Get all Controllers
const {
  getAllKitchenDisplays,
  getKitchenDisplay,
  addKitchenDisplay,
  updateKitchenDisplay,
  deleteKitchenDisplay,
} = require('../controllers/kitchendisplay.controller')

//Get all middleware
const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const paginatedResult = require('../middlewares/pagination.middleware')

//Get all validations
const kitchenDisplayRules = require('../validations/kitchenDisplay.validation')
const validate = require('../validations/validator')

router.param('kitchenDisplayId', validateObjectId('kitchenDisplayId'))

//Get all kitchin Display
router.get(
  '/',
  isAuthenticated(),
  paginatedResult(KitchenDisplay),
  getAllKitchenDisplays,
)

//Get a kitchin display by id
router.get('/:kitchenDisplayId', isAuthenticated(), getKitchenDisplay)

//Add a kitchin Display
router.post(
  '/',
  isAuthenticated(),
  // kitchenDisplayRules,
  // validate,
  addKitchenDisplay,
)

//Update Kitchin Display
router.put(
  '/:kitchenDisplayId',
  isAuthenticated(),
  kitchenDisplayRules,
  validate,
  updateKitchenDisplay,
)

//Delete Kitchen Display
router.delete('/:kitchenDisplayId', isAuthenticated(), deleteKitchenDisplay)

module.exports = router
