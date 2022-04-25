const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const Role = require('../models/role.model')
const {
	addRole,
	getAllRole,
	getRole,
	updateRole,
	deleteRole,
	searchRole,
	getRolesByCreator,
	getRoleMembers,
} = require('../controllers/role.controller')
const {
	addRoleRules,
	updateRoleRules,
} = require('../validations/role.validation')
const validate = require('../validations/validator')
const { searchByFieldRules } = require('../validations/common.validation')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())
router.use(permit)

// Validate Object id for every request
router.param('roleId', validateObjectId('roleId'))

router.post('/', addRoleRules, validate, addRole)
router.get('/', getAllRole)

router.get(
	'/creator/:creatorId',
	validateObjectId('creatorId'),
	getRolesByCreator,
)

router.get('/member/:roleId', getRoleMembers)

router.post('/search', searchByFieldRules(Role), validate, searchRole)

router.get('/:roleId', getRole)
router.put('/:roleId', updateRoleRules, validate, updateRole)
router.delete('/:roleId', deleteRole)

module.exports = router
