const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addFilter,
	getAllFilter,
	getFilter,
	updateFilter,
	deleteFilter,
} = require('../controllers/filter.controller')
const { filterRules } = require('../validations/filter.validation')
const validate = require('../validations/validator')

// Validate Object id for every request
router.param('filterId', validateObjectId('filterId'))

router.post('/', isAuthenticated(), filterRules, validate, addFilter)
router.get('/', getAllFilter)

router.get('/:filterId', getFilter)
router.put('/:filterId', isAuthenticated(), filterRules, validate, updateFilter)
router.delete('/:filterId', isAuthenticated(), deleteFilter)

module.exports = router
