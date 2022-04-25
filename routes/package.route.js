const express = require('express')
const router = express.Router()

//Get Schema
const Package = require('../models/package.model')

//Get all Controllers
const {
	getAllPackages,
	getPackage,
	addPackage,
	updatePackage,
	deletePackage,
	searchPackage,
} = require('../controllers/package.controller')

//Get all middleware
const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')

//Get all validations
const packageRules = require('../validations/package.validation')
const validate = require('../validations/validator')
const { searchByFieldRules } = require('../validations/common.validation')

router.param('packageId', validateObjectId('packageId'))

router.get('/', isAuthenticated(), getAllPackages)

router.post(
	'/search',
	isAuthenticated(),
	searchByFieldRules(Package),
	validate,
	searchPackage,
)
router.get('/:packageId', isAuthenticated(), getPackage)

router.post('/', isAuthenticated(), packageRules, validate, addPackage)

router.put(
	'/:packageId',
	isAuthenticated(),
	packageRules,
	validate,
	updatePackage,
)

router.delete('/:packageId', isAuthenticated(), deletePackage)

module.exports = router
