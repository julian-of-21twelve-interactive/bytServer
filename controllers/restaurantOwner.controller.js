const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const RestaurantOwner = require('../models/restaurantOwner.model')
const Role = require('../models/role.model')
const jwtConfig = require('../config/jwt.config')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const addRestaurantOwner = async (req, res, next) => {
	const { name, mobile, email, password, address } = req.body

	try {
		const checkRestaurantOwner = await RestaurantOwner.findOne({ email })

		if (checkRestaurantOwner) {
			return res.status(400).json({
				status: 0,
				message:
					checkRestaurantOwner.name !== name
						? 'Owner is already registered with different name'
						: 'Owner is already registered',
				type: 'error',
			})
		}

		const roleId = await Role.findOne({ isRestaurantOwner: true }, { _id: 1 })

		if (!roleId) {
			return res.status(500).json({
				status: 0,
				message:
					'Default restaurant owner role not found. Contact support to solve this issue',
				type: 'error',
			})
		}

		const profile = req.file?.path
		const restaurantOwner = new RestaurantOwner({
			name,
			mobile,
			email,
			address,
			profile,
			role: roleId._id,
		})

		RestaurantOwner.register(restaurantOwner, password, (error, user) => {
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

				res.status(201).send({
					status: 1,
					message: 'Restaurant admin added successfully',
					registeredUser: user,
					token,
				})
			})
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllRestaurantOwners = async (req, res) => {
	try {
		const restaurantOwners = await paginate(req, RestaurantOwner, [
			{ $sort: { createdAt: -1 } },
			{ $unset: ['salt', 'hash'] },
		])

		if (!restaurantOwners.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant admin found',
				restaurantOwners_count: restaurantOwners.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of restaurant owners.',
			restaurantOwners_count: restaurantOwners.totalDocs,
			restaurantOwners,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRestaurantOwner = async (req, res) => {
	try {
		const restaurantOwner = await RestaurantOwner.findOne({
			_id: req.params.restaurantOwnerId,
		})

		if (!restaurantOwner) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant admin found with this id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Restaurant owner data.', restaurantOwner })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateRestaurantOwner = async (req, res) => {
	const { name, mobile, email, address } = req.body

	let profile = req.file?.path

	if (!profile) {
		const restaurantOwnerData = await RestaurantOwner.findOne(
			{ _id: req.params.restaurantOwnerId },
			'-_id profile',
		)

		if (!restaurantOwnerData) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory item with this id',
			})
		}

		profile = restaurantOwnerData.profile
	}

	try {
		const restaurantOwner = await RestaurantOwner.findByIdAndUpdate(
			req.params.restaurantOwnerId,
			{
				name,
				mobile,
				email,
				address,
				profile,
			},
		)

		if (!restaurantOwner) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant admin found with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant admin updated successfully',
			restaurantOwner,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteRestaurantOwner = async (req, res) => {
	try {
		const restaurantOwner = await RestaurantOwner.findByIdAndDelete(
			req.params.restaurantOwnerId,
		)

		if (!restaurantOwner) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant admin found with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant admin removed successfully',
			restaurantOwner,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchRestaurantOwner = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const restaurantOwners = await paginate(req, RestaurantOwner, [
			await searchMatchPipeline(RestaurantOwner, field, search, where),
			{ $unset: ['hash', 'salt'] },
		])

		if (!restaurantOwners.totalDocs) {
			return res.status(404).json({
				status: 0,
				restaurantOwner_count: restaurantOwners.totalDocs,
				message: 'No restaurant owner found',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Search restaurant owners.',
			restaurantOwner_count: restaurantOwners.totalDocs,
			restaurantOwners,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const setFirebaseToken = async (req, res) => {
	const { restaurantOwnerId } = req.params
	const { firebaseToken } = req.body

	try {
		const restaurantOwner = await RestaurantOwner.findByIdAndUpdate(
			restaurantOwnerId,
			{ firebaseToken },
			{ new: true },
		)

		if (!restaurantOwner) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant owner found!',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Restaurant owner data', restaurantOwner })
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const setCurrency = async (req, res) => {
	const { restaurantOwnerId } = req.params
	const { currency } = req.body

	try {
		const restaurantOwner = await RestaurantOwner.findByIdAndUpdate(
			restaurantOwnerId,
			{ currency },
			{ new: true },
		)

		if (!restaurantOwner) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant owner found!',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Restaurant owner data', restaurantOwner })
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

module.exports = {
	addRestaurantOwner,
	getAllRestaurantOwners,
	getRestaurantOwner,
	updateRestaurantOwner,
	deleteRestaurantOwner,
	searchRestaurantOwner,
	setFirebaseToken,
	setCurrency,
}
