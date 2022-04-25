const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	getMonthlyEarning,
	getCustomerReport,
	getBranchProfitability,
	getReports,
} = require('../controllers/reports.controller')
const { permit } = require('../middlewares/permission.middleware')

// Authenticate all requests
router.use(isAuthenticated())

router.get('/owner/:ownerId/restaurant/:restaurantId/:reportKey', getReports)
router.get('/earning', permit, getMonthlyEarning)
router.get(
	'/customer/:customerId',
	permit,
	validateObjectId('customerId'),
	getCustomerReport,
)
router.get('/branch_profits/restaurant/:restaurantId', getBranchProfitability)

module.exports = router
