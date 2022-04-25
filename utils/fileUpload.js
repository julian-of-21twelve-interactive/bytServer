const fs = require('fs')
const multer = require('multer')
const config = require('../config/config')

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const pathName =
			config.images.imagePath + '/' + req.originalUrl.split('/')[3]
		if (!fs.existsSync(pathName)) fs.mkdirSync(pathName)

		cb(null, pathName)
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname)
	},
})

const upload = multer({
	storage,
	fileFilter: function (req, file, cb) {
		const path = require('path')
		const ext = path.extname(file.originalname)
		if (['.jpg', '.jpeg', '.png', '.csv'].includes(ext)) {
			cb(null, true)
		} else {
			return cb(new Error('Only jpg, jpeg, png image types are allowed'))
		}
	},
})

module.exports = upload
