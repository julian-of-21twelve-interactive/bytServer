const { ObjectId } = require('mongodb')
const Supplier = require('../models/supplier.model')
const Roles = require('../models/role.model')
const paginate = require('../utils/aggregatePaginate.util')
const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt.config')
const passport = require('passport')

const registerSupplier = async (req, res, next) => {
	try {
		const { name, email, phone, password, address } = req.body

		const roleId = await Roles.findOne({ isSupplier: true }, { _id: 1 })

		if (!roleId) {
			return res.status(500).json({
				status: 0,
				message: 'Default supplier role not found. Contact support to solve this issue',
				type: 'error'
			})
		}

		var supplier = new Supplier({
			name,
			email,
			phone,
			address,
			role: roleId._id,
		})

		Supplier.register(supplier, password, (error, supplier) => {
			if (error) {
				next(error)
			}

			req.login(supplier, (err) => {
				if (err) return next(err)

				delete supplier._doc.salt
				delete supplier._doc.hash
				delete supplier._doc.password

				const body = { id: supplier._id, role: supplier.role }
				const token = jwt.sign({ supplier: body }, jwtConfig.secret, {
					expiresIn: jwtConfig.expiry,
				})

				res
					.status(201)
					.send({ status: 1, message: 'Registered', registeredSupplier: supplier, token })
			})
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

//login
const login = async (req, res, next) => {
	passport.authenticate('supplier', async (err, supplier, info) => {
		// console.log("supplier",supplier)
		try {
			if (err || !supplier) {
				const error = new Error(info.message)

				return next(error)
			}

			req.login(supplier, { session: false }, async (error) => {
				if (error) return next(error)

				const body = { id: supplier._id, role: supplier.role }
				const token = jwt.sign({ supplier: body }, jwtConfig.secret, {
					expiresIn: jwtConfig.expiry,
				})

				return res.json({
					status: 1,
					message: 'Logged in successfully!',
					id: supplier._id,
					token
				})
			})
		} catch (error) {
			console.log(error)
			throw new Error(error.message)
		}
	})(req, res, next)
}

const updateSupplier = async (req, res) => {
	const { email, name, phone, address } = req.body
	console.log(req.body)
	const supplier = await Supplier.findByIdAndUpdate(req.params.supplierId, {
		email,
		name,
		phone,
		address,
		image: req.file?.path,
	})

	return res.status(200).json({ status: 1, message: 'Supplier updated.', supplier })
}

const deleteSupplier = async (req, res) => {
	try {
		const supplier = await Supplier.findByIdAndDelete(req.params.supplierId)

		if (!supplier) {
			return res.status(404).json({
				status: 0,
				message: 'No supplier with this id'
			})
		}

		return res
			.status(200)
			.json({ status: 1, message: 'supplier deleted successfully', supplier })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getSupplierById = async (req, res) => {
	try {
		const supplier = await Supplier.findOne({ _id: req.params.supplierId })

		if (!supplier) {
			return res.status(404).json({ status: 0, message: 'supplier not found' })
		}

		return res.json({ status: 1, message: 'Supplier data', supplier })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllSupplier = async (req, res) => {
	try {
		const suppliers = await paginate(req, Supplier, [
			{ $sort: { createdAt: -1 } },
			{ $unset: ['salt', 'hash'] },
		])

		if (!suppliers.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'Supplier not found',
				suppliers_count: suppliers.totalDocs
			})
		}

		return res
			.status(200)
			.json({ status: 1, message: 'List of all suppliers.', suppliers_count: suppliers.totalDocs, suppliers })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getItemsBySupplierId = async (req, res) => {
	try {
		const item = await Supplier.aggregate([
			{ $match: { _id: ObjectId(req.params.supplierId) } },
			{ $project: { hash: 0, salt: 0 } },
			{
				$lookup: {
					from: 'supplieritems',
					localField: '_id',
					foreignField: 'supplier',
					as: 'supplieritems',
				},
			},
		])

		if (!item) {
			return res.status(404).json({ status: 0, message: 'item not found' })
		}

		return res.json({ status: 1, message: 'Supplier items.', item })
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
	registerSupplier,
	updateSupplier,
	deleteSupplier,
	getSupplierById,
	getAllSupplier,
	login,
	getItemsBySupplierId,
	logout,
}
