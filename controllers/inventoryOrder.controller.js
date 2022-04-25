const { ObjectId } = require('mongodb')
const InventoryOrder = require('../models/inventoryOrder.model')
const InventoryItem = require('../models/inventoryItem.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')
const { convertAmount, getAmount } = require('../utils/currencyConverter.util')

const addInventoryOrder = async (req, res) => {
	const { currency } = req.query
	const { orders } = req.body

	const orderId = new ObjectId().toString()

	const ordersWithId = orders.map((order) => Object.assign(order, { orderId }))

	if (currency)
		for (let i = 0; i < orders.length; i++) {
			orders[i].price = await getAmount(currency, 'usd', orders[i].price)
		}

	try {
		const inventoryOrder = await InventoryOrder.insertMany(ordersWithId)

		res.status(201).json({
			status: 1,
			message: 'Inventory order added successfully',
			inventoryOrder,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllInventoryOrder = async (req, res) => {
	const { currency } = req.query
	try {
		const inventoryOrders = await paginate(req, InventoryOrder, [
			{ $sort: { createdAt: -1 } },
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
				$set: { itemGroup: { $arrayElemAt: ['$itemGroup', 0] } },
			},
		])

		if (!inventoryOrders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory orders found',
				inventoryOrders_count: inventoryOrders.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all inventory orders.',
			inventoryOrders_count: inventoryOrders.totalDocs,
			inventoryOrders: currency
				? await convertAmount(inventoryOrders, 'amount', 'usd', currency)
				: inventoryOrders,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getOrderProduct = async (req, res) => {
	const { currency } = req.query
	try {
		const inventoryOrder = await InventoryOrder.aggregate([
			{ $match: { _id: ObjectId(req.params.orderProductId) } },
			{
				$lookup: {
					from: 'itemgroups',
					localField: 'itemGroup',
					foreignField: '_id',
					as: 'itemGroup',
				},
			},
			{ $set: { itemGroup: { $arrayElemAt: ['$itemGroup', 0] } } },
		])

		if (!inventoryOrder.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No order product found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'List of order products',
			inventoryOrder: currency
				? await convertAmount(inventoryOrder[0], 'amount', 'usd', currency)
				: inventoryOrder[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getInventoryOrder = async (req, res) => {
	const { currency } = req.query
	try {
		const orders = await InventoryOrder.aggregate([
			{ $match: { orderId: ObjectId(req.params.inventoryOrderId) } },
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
			{ $set: { itemGroup: { $arrayElemAt: ['$itemGroup', 0] } } },
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
				.json({ status: 0, message: 'No inventory order found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Inventory orders data.',
			orders: currency
				? await convertAmount(orders[0], 'amount', 'usd', currency)
				: orders[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateInventoryOrder = async (req, res) => {
	let { currency } = req.query
	let {
		productName,
		product,
		itemGroup,
		amount,
		email,
		type,
		status,
		quantity,
		expiry,
	} = req.body

	if (currency) amount = await getAmount(currency, 'usd', amount)

	try {
		const inventoryOrder = await InventoryOrder.findByIdAndUpdate(
			req.params.inventoryOrderId,
			{
				productName,
				product,
				itemGroup,
				amount,
				email,
				type,
				status,
				quantity,
				expiry,
			},
			{ new: true },
		)

		if (!inventoryOrder) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory order with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Inventory order updated successfully',
			inventoryOrder,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteInventoryOrder = async (req, res) => {
	try {
		const inventoryOrder = await InventoryOrder.deleteMany({
			orderId: req.params.inventoryOrderId,
		})

		if (!inventoryOrder.deletedCount) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory order with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Inventory order removed successfully',
			inventoryOrder,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchInventoryOrder = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const inventoryOrder = await paginate(req, InventoryOrder, [
			await searchMatchPipeline(InventoryOrder, field, search, where),
		])

		if (!inventoryOrder.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory order found',
				inventoryOrder_count: inventoryOrder.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Search inventory data.',
			inventoryOrder_count: inventoryOrder.totalDocs,
			inventoryOrder,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getInventoryOrdersByRestaurant = async (req, res) => {
	const { currency } = req.query
	try {
		const inventoryOrders = await paginate(req, InventoryOrder, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{
				$lookup: {
					from: 'itemgroups',
					localField: 'itemGroup',
					foreignField: '_id',
					as: 'itemGroup',
				},
			},
		])

		if (!inventoryOrders.totalDocs) {
			return res.status(404).json({
				status: 0,
				inventoryOrders_count: inventoryOrders.totalDocs,
				message: 'No inventory order found',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Inventory orders by restaurant.',
			inventoryOrders_count: inventoryOrders.totalDocs,
			inventoryOrders: currency
				? await convertAmount(inventoryOrders, 'amount', 'usd', currency)
				: inventoryOrders,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const setTransferToInventory = async (req, res) => {
	const { restaurant, products } = req.body

	try {
		const inventoryOrders = await InventoryOrder.find({
			_id: { $in: products.map((product) => product.id) },
		})

		if (!inventoryOrders.length) {
			res
				.status(404)
				.json({ status: 0, message: 'No inventory order products found' })
		}

		const items = inventoryOrders.map((order) => {
			const { quantity } = products.find(
				(product) => product.id === order._id.toString(),
			)

			return {
				_id: order._id,
				name: order.productName,
				itemGroup: order.itemGroup,
				price: order.amount,
				onHand: quantity,
				type: order.type,
				quantity: quantity,
				expiry: order.expiry,
				restaurant,
			}
		})

		const inventoryItems = await InventoryItem.insertMany(items)

		//- FIXME:
		// if (inventoryItems.length) {
		// 	products.map(async (product) => {
		// 		await InventoryOrder.findByIdAndUpdate(product.id, {
		// 			$set: {
		// 				quantity: {
		// 					$concat: [
		// 						{
		// 							$toString: {
		// 								$subtract: [
		// 									{
		// 										$toInt: {
		// 											$arrayElemAt: [{ $split: ['$quantity', ' '] }, 0],
		// 										},
		// 									},
		// 									Number(product.quantity.split(' ')[0]),
		// 								],
		// 							},
		// 						},
		// 						' ',
		// 						{
		// 							$toString: {
		// 								$arrayElemAt: [{ $split: ['$quantity', ' '] }, 1],
		// 							},
		// 						},
		// 					],
		// 				},
		// 			},
		// 		})
		// 	})
		// }

		console.log(inventoryItems)

		res.status(201).json({
			status: 1,
			message: 'Inventory order transferred successfully!',
			inventoryItems,
		})
	} catch (err) {
		console.error(err)
		throw new Error(err.message)
	}
}

module.exports = {
	addInventoryOrder,
	getAllInventoryOrder,
	getOrderProduct,
	updateInventoryOrder,
	getInventoryOrder,
	deleteInventoryOrder,
	searchInventoryOrder,
	getInventoryOrdersByRestaurant,
	setTransferToInventory,
}
