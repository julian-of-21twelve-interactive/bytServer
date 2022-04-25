const express = require('express')
const router = express.Router()
const {
	registerSupplier,
	updateSupplier,
	deleteSupplier,
	getSupplierById,
	getAllSupplier,

	login,
	getItemsBySupplierId,
	logout,
} = require('../controllers/supplier.controller')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const {
	registrationRules,
	loginRules,
} = require('../validations/supplier.validation')
const upload = require('../utils/fileUpload')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

router.param('supplierId', validateObjectId('supplierId'))

router.post('/register', registrationRules, validate, registerSupplier)
router.post('/login', loginRules, validate, login)
router.put(
	'/:supplierId',
	isAuthenticated(),
	validate,
	upload.single('image'),
	updateSupplier,
)
router.delete('/:supplierId', isAuthenticated(), permit, deleteSupplier)
router.get('/:supplierId', isAuthenticated(), permit, getSupplierById)
router.get('/', isAuthenticated(), permit, getAllSupplier)
router.get('/items/:supplierId', isAuthenticated(), getItemsBySupplierId)
router.get('/logout', isAuthenticated(), logout)

module.exports = router
