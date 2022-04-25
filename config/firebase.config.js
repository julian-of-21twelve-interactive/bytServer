var admin = require('firebase-admin')

var adminKeys = require('../project-byt-firebase-adminsdk-7kf5d-8797b50bce.json')

admin.initializeApp({
	credential: admin.credential.cert(adminKeys),
})

module.exports.admin = admin
