const express = require('express')
const router = express.Router()

const { isAuthenticated } = require('../middlewares/auth.middleware')
const {
  changePassword,
  changeLanguage,
} = require('../controllers/setting.controller')
const {
  changePasswordRules,
  changeLanguageRules,
} = require('../validations/setting.validation')
const validate = require('../validations/validator')

// Authenticate all requests
router.use(isAuthenticated())

router.post('/change_password', changePasswordRules, validate, changePassword)
router.post('/change_language', changeLanguageRules, validate, changeLanguage)

module.exports = router
