
const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const Permission = require('../models/permission.model')
const {
	addPermission, getAllPermission, getPermission, updatePermission, deletePermission, searchPermission
} = require('../controllers/permission.controller')
const {
	addPermissionRules,
	updatePermissionRules,
} = require('../validations/permission.validation')
const validate = require('../validations/validator')
const { searchByFieldRules } = require('../validations/common.validation')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

// Validate Object id for every request
router.param('permissionId', validateObjectId('permissionId'))

router.post('/', addPermissionRules, validate, addPermission)
router.get('/', getAllPermission)

router.post('/search', searchByFieldRules(Permission), validate, searchPermission)

router.get('/:permissionId', getPermission)
router.put('/:permissionId', updatePermissionRules, validate, updatePermission)
router.delete('/:permissionId', deletePermission)

module.exports = router

