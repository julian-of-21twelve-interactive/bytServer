const { ObjectId } = require('mongodb')
const SideOrder = require('../models/sideOrder.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const addSideOrder = async (req, res) => {
	const { name, restaurant, status } = req.body

	try {
		const sideOrder = new SideOrder({ name, restaurant, status })

		await sideOrder.save()

		res
			.status(201)
			.json({ status: 1, message: 'Side order added successfully', sideOrder })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllSideOrder = async (req, res) => {
	try {
		const sideOrders = await paginate(req, SideOrder, [
			{ $sort: { createdAt: -1 } },
		])

		if (!sideOrders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No side orders found',
				sideOrders_count: sideOrders.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'List of all side orders.', sideOrders_count: sideOrders.totalDocs, sideOrders })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getSideOrder = async (req, res) => {
	try {
		const sideOrder = await SideOrder.findOne({
			_id: req.params.sideOrderId,
		})

		if (!sideOrder) {
			return res
				.status(404)
				.json({ status: 0, message: 'No side order found with this id' })
		}

		res.status(200).json({ status: 1, message: 'Side order details', sideOrder })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateSideOrder = async (req, res) => {
	const { name, restaurant, status } = req.body

	try {
		const sideOrder = await SideOrder.findByIdAndUpdate(
			req.params.sideOrderId,
			{ name, restaurant, status },
		)

		if (!sideOrder) {
			return res.status(404).json({
				status: 0,
				message: 'No side order with this id'
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Side order updated successfully', sideOrder })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteSideOrder = async (req, res) => {
	try {
		const sideOrder = await SideOrder.findByIdAndDelete(req.params.sideOrderId)

		if (!sideOrder) {
			return res.status(404).json({
				status: 0,
				message: 'No side order with this group id'
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Side order removed successfully', sideOrder })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchSideOrder = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const sideOrders = await paginate(req, SideOrder, [
			await searchMatchPipeline(SideOrder, field, search, where),
		])

		if (!sideOrders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No side order found',
				sideOrders_count: sideOrders.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'Side order details.', sideOrders_count: sideOrders.totalDocs, sideOrders })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getSideOrdersByRestaurant = async (req, res) => {
	try {
		const sideOrders = await paginate(req, SideOrder, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
		])

		if (!sideOrders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No side order found',
				sideOrders_count: sideOrders.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'Restaurant side orders.', sideOrders_count: sideOrders.totalDocs, sideOrders })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addSideOrder,
	getAllSideOrder,
	getSideOrder,
	updateSideOrder,
	deleteSideOrder,
	searchSideOrder,
	getSideOrdersByRestaurant,
}
