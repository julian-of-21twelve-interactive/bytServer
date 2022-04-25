const { ObjectId } = require('mongodb')
const crypto = require('crypto')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const User = require('../models/user.model')
const RestaurantOwner = require('../models/restaurantOwner.model')
const StaffMember = require('../models/staffMember.model')
const ResetToken = require('../models/resetToken.model')
const Role = require('../models/role.model')
const ShareLink = require('../models/shareLink.model')
const sendEmail = require('../utils/mail.util')
const config = require('../config/config')
const jwtConfig = require('../config/jwt.config')
const { getOrder } = require('./order.controller')

const getAllCollections = async (req, res) => {
	try {
		const collections = await mongoose.connection.db.collections()

		if (!collections) {
			return res.status(404).json({
				status: 0,
				message: 'No collections found',
			})
		}

		const collectionNames = collections
			.map((collection) => ({
				name: collection.collectionName,
			}))
			.sort((a, b) => (a.name > b.name ? 1 : -1))

		res.status(200).json({
			status: 1,
			message: 'List of all collections.',
			collections_count: collections.length,
			collections: collectionNames,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const forgetPassword = async (req, res) => {
	const { email, role } = req.body

	try {
		let Model = User
		if (role === 'restaurant_owner') Model = RestaurantOwner
		if (role === 'staff_member') Model = StaffMember
		const user = await Model.findOne({ email })

		if (!user) {
			res.status(401).json({ status: 0, message: 'User not registered!' })
			return
		}

		const token = crypto.randomBytes(32).toString('hex')

		await ResetToken.create({
			user: user._id,
			role: user.role,
			token,
		})

		sendEmail(
			user.email,
			'Password reset link',
			`
			<p>Dear user,</p>
			<h4>
			<strong>Here's your link to reset your byt password:</strong>
			</h4>
			<a href="${config.client.baseUrl}/resetpassword/${token}">Reset link</a>
			<br />
			<p>This link will expire in 20 minutes.</p>
		`,
		)

		res.status(200).json({ status: 1, message: 'Reset link sent successfully' })
	} catch (error) {
		console.error(error)
		throw new Error(error.message)
	}
}

const resetPassword = async (req, res, next) => {
	const { newPassword, resetToken } = req.body

	try {
		const checkResetToken = await ResetToken.findOne({ token: resetToken })

		if (!checkResetToken) {
			res
				.status(401)
				.json({ status: 0, message: 'Invalid reset token or expired' })
		}

		const role = await Role.findOne({ _id: checkResetToken.role })

		let Model = User
		if (role.isRestaurantOwner) Model = RestaurantOwner
		if (role.isStaff) Model = StaffMember

		const user = await Model.findOne({ _id: ObjectId(checkResetToken.user) })

		user.setPassword(newPassword, async (err, user) => {
			if (err) {
				console.log(err)
				return next(new Error(err))
			}

			await user.save()
			await ResetToken.findByIdAndDelete(checkResetToken._id)
			res.status(200).json({ status: 1, message: 'Password reset successful' })
		})
	} catch (error) {
		console.error(error)
		throw new Error(error.message)
	}
}

const getOrderLinkData = async (req, res) => {
	const { token } = req.params

	try {
		const verifyToken = jwt.verify(token, jwtConfig.linkSecret)

		await ShareLink.findOneAndUpdate(
			{ linkId: verifyToken.jti },
			{ $inc: { clickCount: 1 } },
		)

		req.params.orderId = verifyToken.orderId

		getOrder(req, res)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: { message: error.message } })
	}
}

module.exports = {
	getAllCollections,
	forgetPassword,
	resetPassword,
	getOrderLinkData,
}
