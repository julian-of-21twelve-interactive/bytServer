const express = require('express')
const router = express.Router()
const validate = require('../validations/validator')
const {
	addTableRules,
	updateTableRules,
	getAvailableTablesByRestaurantRules,
	getTablesByRestaurantRules,
} = require('../validations/table.validation')

const {
	getAllTables,
	getTable,
	addTable,
	updateTable,
	deleteTable,
	getTablesByRestaurant,
	getAvailableTablesByRestaurant,
} = require('../controllers/table.controller')

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const { permit } = require('../middlewares/permission.middleware')

router.param('tableId', validateObjectId('tableId'))

router.get('/', isAuthenticated(), getAllTables)
router.post('/', isAuthenticated(), permit, addTableRules, validate, addTable)
router.post(
	'/restaurant/:restaurantId/available',
	validateObjectId('restaurantId'),
	getAvailableTablesByRestaurantRules,
	validate,
	getAvailableTablesByRestaurant,
)
router.get(
	'/restaurant/:restaurantId/floor_type/:floorType/:timestamp?',
	validateObjectId('restaurantId'),
	getTablesByRestaurantRules,
	validate,
	getTablesByRestaurant,
)
router.get('/:tableId', getTable)
router.put(
	'/:tableId',
	isAuthenticated(),
	permit,
	updateTableRules,
	validate,
	updateTable,
)
router.delete('/:tableId', isAuthenticated(), permit, deleteTable)

module.exports = router
