const { check } = require('express-validator')

const reservationRules = [
  check('host')
    .trim()
    .notEmpty()
    .withMessage('Host name is required')
    .toLowerCase(),
  check('guests.*.guest').isMongoId().withMessage('Enter valid user'),
  check('reservationDetails.*.date')
    .trim()
    .notEmpty()
    .withMessage('Date is required')
    .isDate()
    .withMessage('Enter a valid date'),
  check('reservationDetails.*.time')
    .trim()
    .notEmpty()
    .withMessage('Time is required'),
  check('reservationDetails.*.totalGuests')
    .trim()
    .notEmpty()
    .withMessage('TotalGuests is required'),
  check('reservationDetails.*.shift')
    .trim()
    .notEmpty()
    .withMessage('Shift is required')
    .isIn(['breakfast', 'lunch', 'dinner'])
    .withMessage('enter a valid shift'),
  check('reservationDetails.*.cancellationTime').trim(),
  check('reservationDetails.*.origin')
    .trim()
    .notEmpty()
    .withMessage('Origin is required')
    .isIn(['phone', 'walk-in'])
    .withMessage('enter a valid origin'),
  check('reservationDetails.*.guestType')
    .trim()
    .notEmpty()
    .withMessage('Guest Type is required')
    .isIn(['vip', 'normal'])
    .withMessage('enter a valid Guest Type'),
  check('reservationDetails.*.notes')
    .trim()
    .notEmpty()
    .withMessage('Notes is required'),
  check('tableDetails')
    .trim()
    .notEmpty()
    .withMessage('Table is required')
    .isMongoId()
    .withMessage('Enter valid Table'),
]

module.exports = reservationRules
