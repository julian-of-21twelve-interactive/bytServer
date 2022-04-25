const express = require('express')
const router = express.Router()

const {
	addPettyCash,
    getPettyCashByDate,
    getAllPettyCash,
    getPettyCashById,
    
	
} = require('../controllers/pettyCash.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')


const {pettyCashRules} = require('../validations/pettyCash.validation')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

router.param('pettyCashId', validateObjectId('pettyCashId'))

router.post('/', pettyCashRules,isAuthenticated(),permit, validate, addPettyCash)
router.post('/by_date',   getPettyCashByDate)
router.get('/',isAuthenticated(),permit,   getAllPettyCash)
router.get('/:pettyCashId',isAuthenticated(),permit,   getPettyCashById)





module.exports = router