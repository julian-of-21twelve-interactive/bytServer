const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const ReservationType = require('../models/reservationType.model')
const {
	addReservationType,
	getAllReservationType,
	getReservationType,
	updateReservationType,
	deleteReservationType,
	searchReservationType,
} = require('../controllers/reservationType.controller')
const {
	reservationTypeRules,
} = require('../validations/reservationType.validation')
const validate = require('../validations/validator')
const { searchByFieldRules } = require('../validations/common.validation')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('reservationTypeId', validateObjectId('reservationTypeId'))

router.post(
	'/',
	permit,
	reservationTypeRules,
	validate,
	addReservationType,
)
router.get('/', getAllReservationType)

router.post(
	'/search',
	searchByFieldRules(ReservationType),
	validate,
	searchReservationType,
)

router.get('/:reservationTypeId', getReservationType)
router.put(
	'/:reservationTypeId',
	permit,
	reservationTypeRules,
	validate,
	updateReservationType,
)
router.delete('/:reservationTypeId', permit, deleteReservationType)

module.exports = router
