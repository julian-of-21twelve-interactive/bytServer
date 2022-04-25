const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addAttendance,
	getAllAttendance,
	getAttendance,
	updateAttendance,
	deleteAttendance,
	getAttendanceByStaffMember,
	getAttendanceByRestaurant,
} = require('../controllers/attendance.controller')
const {
	addAttendanceRules,
	updateAttendanceRules,
} = require('../validations/attendance.validation')
const validate = require('../validations/validator')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('attendanceId', validateObjectId('attendanceId'))

router.post('/', addAttendanceRules, validate, addAttendance)
router.get('/', getAllAttendance)

router.get(
	'/staff_member/:staffMemberId',
	validateObjectId('staffMemberId'),
	getAttendanceByStaffMember,
)

router.get(
	'/restaurant/:restaurantId',
	validateObjectId('restaurantId'),
	getAttendanceByRestaurant,
)

router.get('/:attendanceId', getAttendance)
router.put('/:attendanceId', updateAttendanceRules, validate, updateAttendance)
router.delete('/:attendanceId', deleteAttendance)
// Add routes

module.exports = router
