const express = require('express')
const router = express.Router()

const {
	sendNotification,
} = require('../controllers/pushNotification.controller')

router.post('/', sendNotification)

module.exports = router
