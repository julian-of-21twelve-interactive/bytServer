const express = require('express')
const router = express.Router()

// Get all controllers
const {
  getAllReservations,
  getReservation,
  addReservation,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservation.controller')

//Get all middleware
const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')

//Get all validations
const reservationRules = require('../validations/reservation.validation')
const validate = require('../validations/validator')

router.param('reservationId', validateObjectId('reservationId'))

//Get all reservations
router.get('/', isAuthenticated(), getAllReservations)

//Get a reservation by id
router.get('/:reservationId', isAuthenticated(), getReservation)

//Add a reservation
router.post('/', isAuthenticated(), reservationRules, validate, addReservation)

//Update a reservation
router.put(
  '/:reservationId',
  isAuthenticated(),
  reservationRules,
  validate,
  updateReservation,
)

//Delete a reservation
router.delete('/:reservationId', isAuthenticated(), deleteReservation)

module.exports = router
