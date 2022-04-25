const { ObjectId } = require('mongodb')
const Tax = require('../models/tax.model')
const paginate = require('../utils/aggregatePaginate.util')

const addTax = async (req, res) => {
	try {
		const { addedBy, taxType, rate, restaurant } = req.body

		const checkTax = await Tax.findOne({ restaurant: ObjectId(restaurant) })

		if (checkTax) {
			res
				.status(400)
				.json({ status: 0, message: 'Tax already added for this restaurant' })
		}

		const tax = new Tax({
			addedBy,
			taxType,
			rate,
			restaurant,
		})
		await tax.save()
		return res.send({ status: 1, message: 'Tax is added.', tax })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const updateTax = async (req, res) => {
	const { addedBy, restaurant, taxType, rate } = req.body
	const tax = await Tax.findByIdAndUpdate(
		req.params.taxId,
		{
			addedBy,
			restaurant,
			taxType,
			rate,
		},
		{ new: true },
	)
	return res.status(200).json({ status: 1, message: 'Tax is updated.', tax })
}

const deleteTax = async (req, res) => {
	try {
		console.log(req.params.taxId)
		const tax = await Tax.findByIdAndDelete(req.params.taxId)

		if (!tax) {
			return res.status(404).json({
				status: 0,
				message: 'No tax with this id',
			})
		}

		return res
			.status(200)
			.json({ status: 1, message: 'Tax deleted successfully', tax })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getTaxById = async (req, res) => {
	try {
		const tax = await Tax.aggregate([
			{ $match: { _id: ObjectId(req.params.taxId) } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
		])

		if (!tax) {
			return res.status(404).json({ status: 0, message: 'tax not found' })
		}

		return res.json({ status: 1, message: 'Tax information.', tax })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllTax = async (req, res) => {
	try {
		const tax = await paginate(req, Tax, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
		])

		if (!tax.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'Tax not found',
				tax_count: tax.totalDocs,
			})
		}

		return res.status(200).json({
			status: 1,
			message: 'List of all tax information.',
			tax_count: tax.totalDocs,
			tax,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getTaxByAddedBy = async (req, res) => {
	try {
		const tax = await paginate(req, Tax, [
			{ $sort: { createdAt: -1 } },
			{
				$match: { addedBy: req.params.added_by },
			},
		])

		if (!tax.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'Tax not found',
				tax_count: tax.totalDocs,
			})
		}

		return res.status(200).json({
			status: 1,
			message: 'Tax information is added.',
			tax_count: tax.totalDocs,
			tax,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getTaxByRestaurant = async (req, res) => {
	const { restaurantId } = req.params

	try {
		const tax = await Tax.find({ restaurant: ObjectId(restaurantId) })

		if (!tax.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No tax found for this restaurant id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant tax information',
			tax: tax[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

module.exports = {
	addTax,
	updateTax,
	deleteTax,
	getTaxById,
	getAllTax,
	getTaxByAddedBy,
	getTaxByRestaurant,
}
