const { ObjectId } = require('mongodb')
const Role = require('../models/role.model')
const User = require('../models/user.model')
const RestaurantOwner = require('../models/restaurantOwner.model')
const StaffMember = require('../models/staffMember.model')
const Supplier = require('../models/supplier.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const addRole = async (req, res) => {
	const {
		name,
		permissions,
		color,
		creator,
		refModel,
		permissionList,
		roleAccessTags,
		hasAccessTags,
		isRestaurantOwner,
		isUser,
		isSupplier,
		isStaff,
	} = req.body

	try {
		const role = new Role({
			name,
			permissions,
			color,
			creator,
			refModel,
			permissionList,
			roleAccessTags,
			hasAccessTags,
			isRestaurantOwner,
			isUser,
			isSupplier,
			isStaff,
		})

		await role.save()

		res.status(201).json({ status: 1, message: 'Role added successfully', role })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllRole = async (req, res) => {
	try {
		const roles = await paginate(req, Role, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'permissions',
					localField: 'permissionList',
					foreignField: '_id',
					as: 'permissionList',
				},
			},
			{ $unset: ['permissionList.__v'] },
		])

		if (!roles.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No roles found',
				roles_count: roles.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'List of all roles.', roles_count: roles.totalDocs, roles })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRole = async (req, res) => {
	try {
		const role = await Role.aggregate([
			{ $match: { _id: ObjectId(req.params.roleId) } },
			{
				$lookup: {
					from: 'permissions',
					localField: 'permissionList',
					foreignField: '_id',
					as: 'permissionList',
				},
			},
			{ $unset: ['permissionList.__v'] },
		])

		if (!role.length) {
			return res.status(404).json({ status: 0, message: 'No role found with this id' })
		}

		res.status(200).json({ status: 1, message: 'Get role details.', role })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateRole = async (req, res) => {
	const {
		name,
		permissions,
		color,
		refModel,
		creator,
		permissionList,
		roleAccessTags,
		hasAccessTags,
	} = req.body

	try {
		const role = await Role.findByIdAndUpdate(
			req.params.roleId,
			{
				name,
				permissions,
				color,
				refModel,
				creator,
				permissionList,
				roleAccessTags,
				hasAccessTags,
			},
			{ new: true },
		)

		if (!role) {
			return res.status(404).json({
				status: 0,
				message: 'No role with this id'
			})
		}

		res.status(200).json({ status: 1, message: 'Role updated successfully', role })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteRole = async (req, res) => {
	try {
		const role = await Role.findByIdAndDelete(req.params.roleId)

		if (!role) {
			return res.status(404).json({
				status: 0,
				message: 'No role with this group id'
			})
		}

		res.status(200).json({ status: 1, message: 'Role removed successfully', role })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchRole = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const roles = await paginate(req, Role, [
			await searchMatchPipeline(Role, field, search, where),
			{ $sort: { createdAt: -1 } },
		])

		if (!roles.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No role found',
				roles_count: roles.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'search role details', roles_count: roles.totalDocs, roles })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRolesByCreator = async (req, res) => {
	const { creatorId } = req.params

	try {
		const roleTags = await Role.findOne({ _id: req.user.role })

		const roles = await paginate(req, Role, [
			{
				$match: {
					$or: [
						{ $expr: { $eq: ['$creator', ObjectId(creatorId)] } },
						{
							$expr: {
								$gte: [
									{
										$size: {
											$ifNull: [
												{
													$setIntersection: [
														'$roleAccessTags',
														roleTags.hasAccessTags,
													],
												},
												[],
											],
										},
									},
									1,
								],
							},
						},
					],
				},
			},
		])

		if (!roles.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No role found',
				roles_count: roles.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'Lits of creator roles', roles_count: roles.totalDocs, roles })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRoleMembers = async (req, res) => {
	const { roleId } = req.params

	try {
		const role = await Role.findOne({ _id: roleId })

		if (!role) {
			return res.status(404).json({
				status: 0,
				message: 'Role not found!'
			})
		}

		let Model = User
		if (role.isRestaurantOwner) Model = RestaurantOwner
		else if (role.isStaff) Model = StaffMember
		else if (role.isSupplier) Model = Supplier

		const members = await paginate(req, Model, [
			{ $match: { role: ObjectId(roleId) } },
			{ $sort: { createdAt: -1 } },
			{ $unset: ['hash', 'salt'] },
		])

		if (!members.totalDocs) {
			return res.status(404).json({
				status: 0,
				members_count: members.totalDocs,
				message: 'No members found!'
			})
		}

		res.status(200).json({ status: 1, message: 'Role member data.', members_count: members.totalDocs, members })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addRole,
	getAllRole,
	getRole,
	updateRole,
	deleteRole,
	searchRole,
	getRolesByCreator,
	getRoleMembers,
}
