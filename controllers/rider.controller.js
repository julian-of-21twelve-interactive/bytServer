const { ObjectId } = require('mongodb')
const Rider = require('../models/rider.model')
const Roles = require('../models/role.model')
const paginate = require('../utils/aggregatePaginate.util')
const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt.config')
const passport = require('passport')

const registerRider = async (req, res, next) => {
	try {
		const { name, email, phone, password, address } = req.body
		const roleId = await Roles.findOne({ isRider: true }, { _id: 1 })

		if (!roleId) {
			return res.status(500).json({
				status: 0,
				message: 'Default rider role not found. Contact support to solve this issue',
				type: 'error'
			})
		}

		let rider = new Rider({
			name,
			email,
			phone,
			address,
			role: roleId._id,
		})

		Rider.register(rider, password, (error, rider) => {
			if (error) {
				next(error)
			}

			req.login(rider, (err) => {
				if (err) return next(err)

				delete rider._doc.salt
				delete rider._doc.hash
				delete rider._doc.password

				const body = { id: rider._id }
				const token = jwt.sign({ rider: body }, jwtConfig.secret, {
					expiresIn: jwtConfig.expiry,
				})

				res
					.status(201)
					.send({ status: 1, message: 'Registered', registeredRider: rider, token })
			})
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

//login
const login = async (req, res, next) => {
	passport.authenticate('rider', async (err, rider, info) => {
		try {
			if (err || !rider) {
				const error = new Error(info.message)

				return next(error)
			}

			req.login(rider, { session: false }, async (error) => {
				if (error) return next(error)

				const body = { id: rider._id }
				const token = jwt.sign({ rider: body }, jwtConfig.secret, {
					expiresIn: jwtConfig.expiry,
				})
				delete rider._doc.salt
				delete rider._doc.hash
				return res.json({
					status: 1,
					message: 'Logged in successfully!',
					id: rider._id,
					rider: rider,
					token
				})
			})
		} catch (error) {
			console.log(error)
			throw new Error(err.message)
			// return next(error)
		}
	})(req, res, next)
}

//update rider
const updateRider = async (req, res) => {
	try {
		let image = req.file?.path

		if (!image) {
			const riderData = await Rider.findOne(
				{ _id: req.params.riderId },
				'-_id image',
			)

			image = riderData.image
		}
		const { email, name, phone, address } = req.body

		const rider = await Rider.findByIdAndUpdate(req.params.riderId, {
			email,
			name,
			phone,
			address,
			image,
		})

		return res.status(200).json({ rider, message: 'Rider updated.', status: 1 })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteRider = async (req, res) => {
	try {
		const rider = await Rider.findByIdAndDelete(req.params.riderId)

		if (!rider) {
			return res.status(404).json({
				status: 0,
				message: 'No rider with this id'
			})
		}
		delete rider._doc.salt
		delete rider._doc.hash
		return res
			.status(200)
			.json({ status: 1, message: 'rider deleted successfully', rider })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRiderById = async (req, res) => {
	try {
		const rider = await Rider.findOne({ _id: req.params.riderId })

		if (!rider) {
			return res.status(404).json({ status: 0, message: 'rider not found' })
		}

		return res.json({ status: 1, message: 'Rider details', rider })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllRider = async (req, res) => {
	try {
		const riders = await paginate(req, Rider, [
			{ $sort: { createdAt: -1 } },
			{ $unset: ['salt', 'hash'] },
		])

		if (!riders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'Riders not found',
				riders_count: riders.totalDocs
			})
		}

		return res.status(200).json({ status: 1, message: 'List of all rider.', riders_count: riders.totalDocs, riders })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const logout = async (req, res) => {
	req.logout()
	res.status(200).json({ status: 1, message: 'Logged out successfully!' })
}

module.exports = {
	registerRider,
	login,
	deleteRider,
	getRiderById,
	getAllRider,
	updateRider,
	logout,
}
