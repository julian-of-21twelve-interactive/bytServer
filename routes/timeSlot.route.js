const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const TimeSlot = require('../models/timeSlot.model')
const {
	addTimeSlot,
	getAllTimeSlot,
	getTimeSlot,
	updateTimeSlot,
	deleteTimeSlot,
	searchTimeSlot,
	getTimeSlotsByRestaurant,
	searchTimeSlotByRestaurant,
} = require('../controllers/timeSlot.controller')
const { timeSlotRules } = require('../validations/timeSlot.validation')
const validate = require('../validations/validator')
const { searchByFieldRules } = require('../validations/common.validation')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('timeSlotId', validateObjectId('timeSlotId'))

router.post(
	'/',
	permit,
	timeSlotRules,
	validate,
	addTimeSlot,
)
router.get('/', permit, getAllTimeSlot)

router.post('/search', searchByFieldRules(TimeSlot), validate, searchTimeSlot)

router.get(
	'/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getTimeSlotsByRestaurant,
)

router.get(
	'/search_by_restaurant/:restaurantId/:label',
	validateObjectId('restaurantId'),
	searchTimeSlotByRestaurant,
)

router.get('/:timeSlotId', getTimeSlot)
router.put(
	'/:timeSlotId',
	permit,
	timeSlotRules,
	validate,
	updateTimeSlot,
)
router.delete(
	'/:timeSlotId',
	permit,
	deleteTimeSlot,
)

module.exports = router
