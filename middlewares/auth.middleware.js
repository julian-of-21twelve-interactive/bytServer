const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt.config')

const isAuthenticated =
	(isOptional = false) =>
		(req, res, next) => {
			try {
				if (!req.headers.authorization) {
					if (isOptional) return next()
					return res.status(401).json({ status: 0, unauthorized: 'No Tokens Found' })
				}
				const token = req.headers.authorization.split(' ')[1]
				const verify = jwt.verify(token, jwtConfig.secret)
				req.user = verify.user

				next()
			} catch (error) {
				console.log(error)
				res.status(401).json({
					message: 'Not Authorized', status: 0
				})
			}
		}

module.exports = { isAuthenticated }
