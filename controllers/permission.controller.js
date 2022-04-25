const Permission = require('../models/permission.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const addPermission = async (req, res) => {
	const { name, permissions } = req.body

	try {
		const permission = new Permission({ name, permissions })

		await permission.save()

		res
			.status(201)
			.json({ status: 1, message: 'Permission added successfully', permission })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllPermission = async (req, res) => {
	try {
		const permissions = await paginate(req, Permission, [
			{ $sort: { createdAt: -1 } },
		])

		if (!permissions.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No permissions found',
				permissions_count: permissions.totalDocs
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'List of all permissions.', permissions_count: permissions.totalDocs, permissions })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getPermission = async (req, res) => {
	try {
		const permission = await Permission.findOne({
			_id: req.params.permissionId,
		})

		if (!permission) {
			return res
				.status(404)
				.json({ status: 0, message: 'No permission found with this id' })
		}

		res.status(200).json({ status: 1, message: 'Permission data.', permission })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updatePermission = async (req, res) => {
	const { name, permissions } = req.body

	try {
		const permission = await Permission.findByIdAndUpdate(
			req.params.permissionId,
			{ name, permissions },
			{ new: true },
		)

		if (!permission) {
			return res.status(404).json({
				status: 0,
				message: 'No permission with this id'
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Permission updated successfully', permission })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deletePermission = async (req, res) => {
	try {
		const permission = await Permission.findByIdAndDelete(
			req.params.permissionId,
		)

		if (!permission) {
			return res.status(404).json({
				status: 0,
				message: 'No permission with this id'
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Permission removed successfully', permission })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchPermission = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const permissions = await paginate(req, Permission, [
			await searchMatchPipeline(Permission, field, search, where),
		])

		if (!permissions.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No permission found',
				permissions_count: permissions.totalDocs
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Search permission data.', permissions_count: permissions.totalDocs, permissions })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addPermission,
	getAllPermission,
	getPermission,
	updatePermission,
	deletePermission,
	searchPermission,
}
