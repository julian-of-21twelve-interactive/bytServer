const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addSearchHistory,
	getAllSearchHistory,
	getSearchHistory,
	updateSearchHistory,
	deleteSearchHistory,
	getSearchHistoryByUser,
} = require('../controllers/searchHistory.controller')
const {
	searchHistoryRules,
} = require('../validations/searchHistory.validation')
const validate = require('../validations/validator')

// Validate Object id for every request
router.param('searchHistoryId', validateObjectId('searchHistoryId'))

router.post('/', searchHistoryRules, validate, addSearchHistory)
router.get('/', isAuthenticated(), getAllSearchHistory)

router.get('/user/:userId', validateObjectId('userId'), getSearchHistoryByUser)
router.get('/:searchHistoryId', isAuthenticated(), getSearchHistory)
router.put(
	'/:searchHistoryId',
	isAuthenticated(),
	searchHistoryRules,
	validate,
	updateSearchHistory,
)
router.delete('/:searchHistoryId', isAuthenticated(), deleteSearchHistory)

module.exports = router
