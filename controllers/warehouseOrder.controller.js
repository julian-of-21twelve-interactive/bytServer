const { ObjectId } = require('mongodb')
const WarehouseOrder = require('../models/warehouseOrder.model')
// const WarehouseProduct = require('../models/warehouseProduct.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')
const { getAmount, convertAmount } = require('../utils/currencyConverter.util')

const addWarehouseOrder = async (req, res) => {
	const { currency } = req.query
	const { orders } = req.body

	const orderId = new ObjectId().toString()

	const ordersWithId = orders.map((order) => Object.assign(order, { orderId }))

	if (currency) {
		for (let i = 0; i < orders.length; i++) {
			orders.amount = await getAmount(currency, 'usd', orders.amount)
		}
	}

	try {
		const warehouseOrder = await WarehouseOrder.insertMany(ordersWithId)

		res.status(201).json({
			status: 1,
			message: 'Warehouse order added successfully',
			warehouseOrder,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllWarehouseOrder = async (req, res) => {
	const { currency } = req.query
	try {
		const warehouseOrders = await paginate(req, WarehouseOrder, [
			{ $sort: { createdAt: -1 } },
			...warehouseOrderPopulationPipe,
		])

		if (!warehouseOrders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse orders found',
				warehouseOrders_count: warehouseOrders.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all warehouse orders.',
			warehouseOrders_count: warehouseOrders.totalDocs,
			warehouseOrders: currency
				? await convertAmount(warehouseOrders, 'amount', 'usd', currency)
				: warehouseOrders,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getOrderProduct = async (req, res) => {
	const { currency } = req.query
	try {
		const warehouseOrder = await WarehouseOrder.aggregate([
			{ $match: { _id: ObjectId(req.params.orderProductId) } },
			...warehouseOrderPopulationPipe,
		])

		if (!warehouseOrder.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No order product found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Order products information',
			warehouseOrder: currency
				? await convertAmount(warehouseOrder[0], 'amount', 'usd', currency)
				: warehouseOrder[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getWarehouseOrder = async (req, res) => {
	const { currency } = req.query
	try {
		const orders = await WarehouseOrder.aggregate([
			{ $match: { orderId: ObjectId(req.params.warehouseOrderId) } },
			...warehouseOrderPopulationPipe,
			{
				$group: {
					_id: '$orderId',
					products: { $push: '$$ROOT' },
					total: { $sum: '$amount' },
					count: { $sum: 1 },
				},
			},
			{ $unset: ['products.orderId'] },
		])

		if (!orders.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No warehouse order found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Warehouse order information.',
			orders: currency
				? await convertAmount(orders[0], 'amount', 'usd', currency)
				: orders[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateWarehouseOrder = async (req, res) => {
	let { currency } = req.query
	let {
		productName,
		itemGroup,
		supplier,
		amount,
		email,
		type,
		status,
		quantity,
		expiry,
	} = req.body

	if (currency) amount = getAmount(currency, 'usd', amount)

	try {
		const warehouseOrder = await WarehouseOrder.findByIdAndUpdate(
			req.params.warehouseOrderId,
			{
				productName,
				itemGroup,
				supplier,
				amount,
				email,
				type,
				status,
				quantity,
				expiry,
			},
		)

		if (!warehouseOrder) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse order with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Warehouse order updated successfully',
			warehouseOrder,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteWarehouseOrder = async (req, res) => {
	try {
		const warehouseOrder = await WarehouseOrder.deleteMany({
			orderId: req.params.warehouseOrderId,
		})

		if (!warehouseOrder.deletedCount) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse order with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Warehouse order removed successfully',
			warehouseOrder,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchWarehouseOrder = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const warehouseOrder = await paginate(req, WarehouseOrder, [
			await searchMatchPipeline(WarehouseOrder, field, search, where),
			...warehouseOrderPopulationPipe,
		])

		if (!warehouseOrder.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse order found',
				warehouseOrder_count: warehouseOrder.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Warehouse order information.',
			warehouseOrder_count: warehouseOrder.totalDocs,
			warehouseOrder,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getWarehouseOrderByRestaurant = async (req, res) => {
	const { currency } = req.query
	try {
		const warehouseOrders = await paginate(req, WarehouseOrder, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{
				$lookup: {
					from: 'suppliers',
					localField: 'supplier',
					foreignField: '_id',
					as: 'supplier',
				},
			},
			{ $unset: ['supplier.hash', 'supplier.salt', 'supplier.__v'] },
		])

		if (!warehouseOrders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse order found',
				warehouseOrders_count: warehouseOrders.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant warehouse order information.',
			warehouseOrders_count: warehouseOrders.totalDocs,
			warehouseOrders: currency
				? await convertAmount(warehouseOrders, 'amount', 'usd', currency)
				: warehouseOrders,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getWarehouseOrdersBySupplier = async (req, res) => {
	const { currency } = req.query
	try {
		const warehouseOrders = await paginate(req, WarehouseOrder, [
			{ $match: { supplier: ObjectId(req.params.supplierId) } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
			{ $unset: 'restaurant.__v' },
		])

		if (!warehouseOrders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No warehouse order found',
				warehouseOrders_count: warehouseOrders.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Warehouse order supplier information.',
			warehouseOrders_count: warehouseOrders.totalDocs,
			warehouseOrders: currency
				? await convertAmount(warehouseOrders, 'amount', 'usd', currency)
				: warehouseOrders,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addWarehouseOrder,
	getAllWarehouseOrder,
	getOrderProduct,
	updateWarehouseOrder,
	getWarehouseOrder,
	deleteWarehouseOrder,
	searchWarehouseOrder,
	getWarehouseOrderByRestaurant,
	getWarehouseOrdersBySupplier,
}

const warehouseOrderPopulationPipe = [
	{
		$lookup: {
			from: 'itemgroups',
			localField: 'itemGroup',
			foreignField: '_id',
			as: 'itemGroup',
		},
	},
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
			from: 'suppliers',
			localField: 'supplier',
			foreignField: '_id',
			as: 'supplier',
		},
	},
	{ $set: { itemGroup: { $arrayElemAt: ['$itemGroup', 0] } } },
	{
		$unset: [
			'itemGroup.__v',
			'restaurant.__v',
			'supplier.hash',
			'supplier.salt',
			'supplier.__v',
		],
	},
]
