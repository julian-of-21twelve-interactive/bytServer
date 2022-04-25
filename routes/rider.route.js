const express = require('express')
const router = express.Router()
const {
	registerRider,
	login,
	deleteRider,
	getRiderById,
	getAllRider,
	updateRider,
	logout
} = require('../controllers/rider.controller')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const {
	registrationRules,
	loginRules,
	
} = require('../validations/rider.validation')
const upload = require('../utils/fileUpload')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

router.param('riderId', validateObjectId('riderId'))

router.post('/register', registrationRules, validate, registerRider)
router.post('/login', loginRules, validate, login)
router.delete('/:riderId', isAuthenticated, deleteRider)
router.get('/:riderId', getRiderById)
router.get('/', getAllRider)
router.put('/:riderId',upload.single('image'), updateRider)
router.get('/logout', isAuthenticated(), logout)

module.exports = router
