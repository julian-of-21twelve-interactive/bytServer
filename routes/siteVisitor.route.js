const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const {
	addSiteVisitor,
	getAllSiteVisitor,
	getSiteVisitor,
	deleteSiteVisitor,
} = require('../controllers/siteVisitor.controller')
const { addSiteVisitorRules } = require('../validations/siteVisitor.validation')
const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

// Validate Object id for every request
router.param('siteVisitorId', validateObjectId('siteVisitorId'))

router.post('/', addSiteVisitorRules, validate, addSiteVisitor)
router.get('/', isAuthenticated(), permit, getAllSiteVisitor)

router.get('/:siteVisitorId', isAuthenticated(), getSiteVisitor)
router.delete(
	'/:siteVisitorId',
	isAuthenticated(),
	permit,
	deleteSiteVisitor,
)

module.exports = router
