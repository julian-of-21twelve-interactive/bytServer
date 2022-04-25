const passport = require('passport')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const User = require('../models/user.model')
const jwtConfig = require('../config/jwt.config')
const paginate = require('../utils/aggregatePaginate.util')
const Roles = require('../models/role.model')
const Order = require('../models/order.model')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

/**
 * Auth methods
 */
const register = async (req, res, next) => {
	const { email, password, name, mobile, dob, diet, location } = req.body

	const roleId = await Roles.findOne({ isUser: true }, { _id: 1 })

	if (!roleId) {
		return res.status(500).json({
			type: 'error',
			status: 0,
			message:
				'Default user role not found. Contact support to solve this issue',
		})
	}

	const user = new User({
		email,
		name,
		mobile,
		role: roleId._id,
		dob,
		diet,
		location,
	})

	User.register(user, password, (error, user) => {
		if (error) {
			next(error)
		}

		req.login(user, (err) => {
			if (err) return next(err)

			delete user._doc.salt
			delete user._doc.hash

			const body = { id: user._id, role: user.role }
			const token = jwt.sign({ user: body }, jwtConfig.secret, {
				expiresIn: jwtConfig.expiry,
			})

			res
				.status(201)
				.send({ status: 1, message: 'Registered', user: user, token })
		})
	})
}

const superRegister = async (req, res, next) => {
	const { email, password, name, dob } = req.body

	let roleId = await Roles.findOne({ isSuper: true }, { _id: 1 })

	if (!roleId) {
		const collectionNames = (await mongoose.connection.db.collections())
			.map((collection) => ({
				module: collection.collectionName,
				create: true,
				read: true,
				update: true,
				delete: true,
			}))
			.sort((a, b) => (a.module > b.module ? 1 : -1))

		roleId = await Roles.create({
			name: 'ADMIN',
			permissions: collectionNames,
			isSuper: true,
		})
	}

	const user = new User({ email, name, dob, role: roleId._id })

	User.register(user, password, (error, user) => {
		if (error) {
			next(error)
		}

		req.login(user, (err) => {
			if (err) return next(err)

			delete user._doc.salt
			delete user._doc.hash

			const body = { id: user._id, role: user.role }
			const token = jwt.sign({ user: body }, jwtConfig.secret, {
				expiresIn: jwtConfig.expiry,
			})

			res
				.status(201)
				.send({ status: 1, message: 'Registered', user: user, token })
		})
	})
}

const login = async (req, res, next) => {
	passport.authenticate('local', async (err, user, info) => {
		try {
			if (err || !user) {
				const error = new Error(info.message)

				return next(error)
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error)

				const body = { id: user._id, role: user.role }
				const token = jwt.sign({ user: body }, jwtConfig.secret, {
					expiresIn: jwtConfig.expiry,
				})

				return res.json({
					status: 1,
					message: 'Logged in successfully!',
					id: user._id,
					user: user,
					token,
				})
			})
		} catch (error) {
			return next(error)
		}
	})(req, res, next)
}

const restaurantLogin = async (req, res, next) => {
	passport.authenticate('restaurant', async (err, user, info) => {
		try {
			if (err || !user) {
				const error = new Error(info.message)

				return next(error)
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error)

				const body = { id: user._id, role: user.role }
				const token = jwt.sign({ user: body }, jwtConfig.secret, {
					expiresIn: jwtConfig.expiry,
				})

				return res.json({
					status: 1,
					message: 'Logged in successfully!',
					id: user._id,
					user: user,
					token,
				})
			})
		} catch (error) {
			return next(error)
		}
	})(req, res, next)
}

const adminLogin = async (req, res, next) => {
	passport.authenticate('admin', async (err, user, info) => {
		try {
			if (err || !user) {
				const error = new Error(info.message)

				return next(error)
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error)

				const body = { id: user._id, role: user.role }
				const token = jwt.sign({ user: body }, jwtConfig.secret, {
					expiresIn: jwtConfig.expiry,
				})

				return res.json({
					status: 1,
					message: 'Logged in successfully!',
					id: user._id,
					user: user,
					token,
				})
			})
		} catch (error) {
			return next(error)
		}
	})(req, res, next)
}

const logout = async (req, res) => {
	req.logout()
	res.status(200).json({ status: 1, message: 'Logged out successfully!' })
}

/**
 * User methods
 */
const getAllUser = async (req, res) => {
	try {
		const users = await paginate(req, User, [
			{ $sort: { createdAt: -1 } },
			{ $unset: ['salt', 'hash'] },
		])

		if (!users.totalDocs) {
			res.status(404).json({ status: 0, message: 'User not found' })
		}

		res.status(200).json({
			status: 1,
			message: 'List of all users.',
			users_count: users.totalDocs,
			users,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getUser = async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.userId })

		if (!user) {
			res.status(404).json({ status: 0, message: 'User not found' })
		}

		res.json({ status: 1, message: 'User information.', data: user })
	} catch (error) {
		throw new Error(error.message)
	}
}

const updateUser = async (req, res) => {
	const { email, password, name, mobile, dob, diet, location } = req.body
	var profile = req.files['profile'] ? req.files['profile'][0].path : null
	var coverPhoto = req.files['coverPhoto']
		? req.files['coverPhoto'][0].path
		: null

	const userData = await User.findOne(
		{ _id: req.params.userId },
		'-_id profile coverPhoto',
	)
	if (profile === null) {
		profile = userData.profile
	}
	if (coverPhoto === null) {
		coverPhoto = userData.coverPhoto
	}

	try {
		const user = await User.findByIdAndUpdate(
			req.params.userId,
			{
				email,
				password,
				name,
				mobile,
				dob,
				diet,
				location,
				profile: profile,
				coverPhoto: coverPhoto,
			},
			{ new: true },
		)

		if (!user) {
			res.status(404).json({ status: 0, message: 'User not found' })
		}

		res
			.status(200)
			.json({ status: 1, message: 'user data successfully updated', user })
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.userId)

		if (!user) {
			return res.status(404).json({
				status: 0,
				message: 'No user with this id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'User deleted successfully', user })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateBytPoints = async (req, res) => {
	try {
		const { bytPoints } = req.body
		const user = await User.findByIdAndUpdate(req.params.userId, {
			$inc: { bytPoints },
		})

		res
			.status(200)
			.json({ status: 1, message: 'Byt points are updated.', data: user })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchUser = async (req, res) => {
	const { field, search } = req.body

	try {
		const roleId = await Roles.findOne({ name: 'USER' }, { _id: 1 })

		const user = await paginate(req, User, [
			await searchMatchPipeline(
				User,
				field,
				search,
				JSON.stringify({ role: roleId._id }),
			),
			{ $unset: ['hash', 'salt'] },
		])

		if (!user.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No user not found',
				user_count: user.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'User search information.',
			user_count: user.totalDocs,
			users: user,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const getUsersByRestaurant = async (req, res) => {
	const { restaurantId } = req.params

	try {
		const orders = await Order.find({ restaurant: restaurantId }, { guests: 1 })
		const userIds = orders.reduce((arr, order) => {
			arr.push(...order.guests)
			return arr
		}, [])

		const users = await paginate(req, User, [
			{ $match: { $expr: { $in: ['$_id', userIds] } } },
			{ $unset: ['hash', 'salt'] },
		])

		if (!users.totalDocs) {
			res.status(404).json({
				users_count: users.totalDocs,
				message: 'User not found',
			})
		}

		res.status(200).json({
			users_count: users.totalDocs,
			users,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const setFirebaseToken = async (req, res) => {
	const { userId } = req.params
	const { firebaseToken } = req.body

	try {
		const user = await User.findByIdAndUpdate(
			userId,
			{ firebaseToken },
			{ new: true },
		)

		if (!user) {
			return res.status(404).json({
				status: 0,
				message: 'No user found!',
			})
		}

		res.status(200).json({ status: 1, message: 'User data', user })
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const setCurrency = async (req, res) => {
	const { userId } = req.params
	const { currency } = req.body

	try {
		const user = await User.findByIdAndUpdate(
			userId,
			{ currency },
			{ new: true },
		)

		if (!user) {
			return res.status(404).json({
				status: 0,
				message: 'No user found!',
			})
		}

		res.status(200).json({ status: 1, message: 'User data', user })
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

module.exports = {
	register,
	login,
	logout,
	getAllUser,
	getUser,
	updateUser,
	deleteUser,
	updateBytPoints,
	superRegister,
	restaurantLogin,
	adminLogin,
	searchUser,
	getUsersByRestaurant,
	setFirebaseToken,
	setCurrency,
}
