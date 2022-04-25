const express = require('express')
const router = express.Router()

//Get Controllers
const {
	getStaffMembers,
	getStaffMember,
	addStaffMember,
	loginStaffMember,
	updateStaffMember,
	deleteStaffMember,
	searchStaffMember,
	getRestaurantStaffMembers,
	getBYTStaffMembers,
	getStaffMembersByRestaurant,
	importStaffMembers,
	logout,
	setCurrency,
} = require('../controllers/staffMember.controller')

//Validations
const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const validate = require('../validations/validator')
const {
	addStaffMemberRules,
	updateStaffMemberRules,
	importStaffMemberRules,
	loginStaffMemberRules,
	setCurrencyRules,
} = require('../validations/staffMember.validation')

//FileUpload
const upload = require('../utils/fileUpload')
const StaffMember = require('../models/staffMember.model')
const { searchByFieldRules } = require('../validations/common.validation')
//get only staff member of all restaurants
router.get('/restaurants', isAuthenticated(), getRestaurantStaffMembers)
//get only staff member of all byt
router.get('/byt', isAuthenticated(), getBYTStaffMembers)

router.param('restaurantId', validateObjectId('restaurantId'))

//get staff member of a restaurants
router.get(
	'/restaurant/:restaurantId',
	isAuthenticated(),
	getStaffMembersByRestaurant,
)

//validate param
router.param('staffMemberId', validateObjectId('staffMemberId'))

//get All Staff Members
router.get('/', isAuthenticated(), getStaffMembers)

router.post(
	'/search',
	isAuthenticated(),
	searchByFieldRules(StaffMember),
	validate,
	searchStaffMember,
)

router.get('/logout', logout)

//get StaffMember by id
router.get('/:staffMemberId', isAuthenticated(), getStaffMember)

router.post(
	'/import',
	isAuthenticated(),
	upload.single('file'),
	importStaffMemberRules,
	validate,
	importStaffMembers,
)

//Add a Staff Member
router.post(
	'/',
	isAuthenticated(),
	upload.single('image'),
	addStaffMemberRules,
	validate,
	addStaffMember,
)

router.post('/login', loginStaffMemberRules, validate, loginStaffMember)
router.put('/currency/:staffMemberId', setCurrencyRules, validate, setCurrency)

//Update a Staff Member
router.put(
	'/:staffMemberId',
	isAuthenticated(),
	upload.single('image'),
	updateStaffMemberRules,
	validate,
	updateStaffMember,
)

//Delete a Staff Member
router.delete('/:staffMemberId', isAuthenticated(), deleteStaffMember)

module.exports = router
