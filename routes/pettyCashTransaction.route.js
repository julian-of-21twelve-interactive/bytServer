const express = require('express')
const router = express.Router()

const {
	addTransaction,
    getAllPettyCashTransaction,
    getPettyCashTransactionById,
    getTransactionByPettyCashId
	
} = require('../controllers/pettyCashTransaction.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const { permit } = require('../middlewares/permission.middleware')

const {pettyCashTransactionRules} = require('../validations/pettyCashTransaction.validation')
const validate = require('../validations/validator')
router.param('transactionId', validateObjectId('transactionId'))
router.param('pettyCashId', validateObjectId('pettyCashId'))

router.post('/',pettyCashTransactionRules,validate,  addTransaction)

router.get('/',isAuthenticated(),permit,  getAllPettyCashTransaction)

router.get('/:transactionId', isAuthenticated(),permit, getPettyCashTransactionById)

router.get('/petty_cash/:pettyCashId',isAuthenticated(),permit,  getTransactionByPettyCashId)



module.exports = router