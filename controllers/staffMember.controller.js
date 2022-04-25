const fs = require('fs')
const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const passport = require('passport')

const StaffMember = require('../models/staffMember.model')
const Role = require('../models/role.model')
const paginate = require('../utils/aggregatePaginate.util')
const Restaurant = require('../models/restaurant.model')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')
const jwtConfig = require('../config/jwt.config')

const getStaffMembers = async (req, res) => {
	try {
		const staffMembers = await paginate(req, StaffMember, [
			{ $sort: { createdAt: -1 } },
		])

		if (!staffMembers) {
			return res.status(404).json({
				status: 0,
				message: 'No staff Members found',
				staffMember_count: staffMembers.length,
			})
		}
		return res.status(200).json({
			status: 1,
			message: 'List of Staff members.',
			staffMember_count: staffMembers.length,
			staffMembers: staffMembers,
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const getStaffMember = async (req, res) => {
	try {
		const staffMember = await StaffMember.findById(req.params.staffMemberId)

		if (!staffMember) {
			return res.status(404).json({
				status: 0,
				message: 'No Staff Members found',
				staffMember_count: staffMember.length,
			})
		}

		return res
			.status(200)
			.json({ status: 1, message: 'Staff members.', staffMember })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const addStaffMember = async (req, res, next) => {
	const {
		name,
		email,
		password,
		mobile,
		category,
		salary,
		status,
		restaurant,
		language,
	} = req.body
	let { role } = req.body

	const image = req.file?.path

	if (!role) {
		const roleId = await Role.findOne({ isStaff: true }, { _id: 1 })

		if (!roleId) {
			return res.status(500).json({
				status: 0,
				type: 'error',
				message: 'Staff role not found. Contact support to solve this issue',
			})
		}

		role = roleId._id
	}

	const staffMember = new StaffMember({
		name,
		email,
		mobile,
		image,
		category,
		salary,
		status,
		restaurant,
		isRestaurant: restaurant ? true : false,
		role,
		language,
	})

	try {
		StaffMember.register(staffMember, password, (error, user) => {
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
					message: 'Registered',
					staffMember: user,
					token,
				})
			})
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const loginStaffMember = async (req, res, next) => {
	passport.authenticate('staff', async (err, staff, info) => {
		try {
			if (err || !staff) {
				const error = new Error(info.message)

				return next(error)
			}

			req.login(staff, { session: false }, async (error) => {
				if (error) return next(error)

				const body = { id: staff._id, role: staff.role }
				const token = jwt.sign({ user: body }, jwtConfig.secret, {
					expiresIn: jwtConfig.expiry,
				})

				delete staff._doc.hash
				delete staff._doc.salt

				return res.json({
					status: 1,
					message: 'Logged in successfully!',
					id: staff._id,
					user: staff,
					token,
				})
			})
		} catch (error) {
			return next(error)
		}
	})(req, res, next)
}

const updateStaffMember = async (req, res) => {
	const { name, email, mobile, category, status, role, language } = req.body
	const image = req.file?.path

	try {
		const staffMember = await StaffMember.findByIdAndUpdate(
			req.params.staffMemberId,
			{
				name,
				email,
				mobile,
				image,
				category,
				status,
				role,
				language,
			},
			{ new: true },
		)

		if (!staffMember) {
			return res
				.status(404)
				.json({ status: 0, message: 'No staffMembers found' })
		}

		return res
			.status(200)
			.json({ status: 1, message: 'Update staff members.', staffMember })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const deleteStaffMember = async (req, res) => {
	try {
		const staffMember = await StaffMember.findByIdAndDelete(
			req.params.staffMemberId,
		)

		if (!staffMember) {
			res.status(404).json({ status: 0, message: 'No staff members found' })
		}

		return res
			.status(200)
			.json({ status: 1, message: 'Staff Member removed Successfully' })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const searchStaffMember = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const staffMember = await paginate(req, StaffMember, [
			await searchMatchPipeline(StaffMember, field, search, where),
		])

		if (!staffMember.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No staff member found',
				staffMember_count: staffMember.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Staff members.',
			staffMember_count: staffMember.totalDocs,
			staffMember,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRestaurantStaffMembers = async (req, res) => {
	try {
		const staffMember = await paginate(req, StaffMember, [
			{ $match: { isRestaurant: true } },

			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
		])

		if (!staffMember.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No staff member found',
				staffMember_count: staffMember.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of restaurant staff members.',
			staffMember_count: staffMember.totalDocs,
			staffMember,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getBYTStaffMembers = async (req, res) => {
	try {
		const staffMember = await paginate(req, StaffMember, [
			{ $match: { isRestaurant: false } },
		])

		if (!staffMember.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No staff member found',
				staffMember_count: staffMember.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'BYT Staff members.',
			staffMember_count: staffMember.totalDocs,
			staffMember,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getStaffMembersByRestaurant = async (req, res) => {
	try {
		const staffMember = await paginate(req, StaffMember, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
			{
				$lookup: {
					from: 'attendances',
					let: { staffMemberId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$staffMember', '$$staffMemberId'] } } },
						{
							$group: {
								_id: null,
								totalWorkingTime: { $sum: '$workingTime' },
								attendanceCount: { $sum: 1 },
							},
						},
						{
							$set: {
								avgWorkingTime: {
									$floor: {
										$divide: ['$totalWorkingTime', '$attendanceCount'],
									},
								},
							},
						},
						{ $unset: '_id' },
					],
					as: 'attendance',
				},
			},
			{
				$set: {
					avgWorkingTime: { $arrayElemAt: ['$attendance.avgWorkingTime', 0] },
				},
			},
			{ $unset: ['restaurant.__v', 'attendance'] },
		])

		if (!staffMember.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No staff member found',
				staffMember_count: staffMember.totalDocs,
			})
		}

		return res.status(200).json({
			status: 1,
			message: 'Staff members by restaurant',
			staffMember_count: staffMember.totalDocs,
			staffMember,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const importStaffMembers = async (req, res) => {
	const { restaurant } = req.body

	if (!req.file?.path)
		return res.status(422).json({
			status: 0,
			type: 'error',
			message: 'Csv file required to import staff members',
		})

	try {
		const data = fs.readFileSync(req.file.path).toString()

		const roleId = await Role.findOne({ isStaff: true }, { _id: 1 })

		if (!roleId) {
			return res.status(500).json({
				status: 0,
				type: 'error',
				message: 'Staff role not found. Contact support to solve this issue',
			})
		}

		const jsonData = csvToJson(data, { restaurant, role: roleId._id })

		fs.unlinkSync(req.file.path)
		if (jsonData.length < 1) {
			return res.status(422).json({
				status: 0,
				message: 'No data found in import file, please add some data',
			})
		}

		//- FIXME:
		// validate import data
		/* req.body = jsonData
		const errors = validationResult(req) */

		const staffMembers = await StaffMember.insertMany(jsonData)

		if (!staffMembers.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No staff members inserted' })
		}

		res.status(201).json({
			status: 1,
			message: 'Staff member inserted successfully',
			staffMembers,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const logout = async (req, res) => {
	req.logout()
	res.status(200).json({ status: 1, message: 'Logged out successfully!' })
}

const setCurrency = async (req, res) => {
	const { staffMemberId } = req.params
	const { currency } = req.body

	try {
		const user = await StaffMember.findByIdAndUpdate(
			staffMemberId,
			{ currency },
			{ new: true },
		)

		if (!user) {
			return res.status(404).json({
				status: 0,
				message: 'No staff member found!',
			})
		}

		res.status(200).json({ status: 1, message: 'Staff member data', user })
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

module.exports = {
	getStaffMembers,
	getStaffMember,
	addStaffMember,
	loginStaffMember,
	updateStaffMember,
	deleteStaffMember,
	searchStaffMember,
	getRestaurantStaffMembers,
	getBYTStaffMembers,
	getStaffMembersByRestaurant,
	importStaffMembers,
	logout,
	setCurrency,
}

const csvToJson = (csv, params = {}) => {
	const cols = csv.split('\r\n')
	const header = cols.shift().split(',')

	const body = []
	for (let col of cols) {
		if (col === '') continue
		const row = col.split(',')
		const obj = Object.fromEntries(
			Array.from(header, (k, i) => [k, row[i]]).concat(Object.entries(params)),
		)

		body.push(obj)
	}

	return body
}
