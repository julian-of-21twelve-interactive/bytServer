const { ObjectId } = require('mongodb')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const Order = require('../models/order.model')
const User = require('../models/user.model')
const MenuItem = require('../models/menuItem.model')
const InventoryItem = require('../models/inventoryItem.model')
const Invoice = require('../models/invoice.model')
const Tax = require('../models/tax.model')
const Restaurant = require('../models/restaurant.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')
const { convertAmount } = require('../utils/currencyConverter.util')
const SocketDispatch = require('../socket-handler/handler')
const ACTIONS = require('../socket-handler/actions')
const { sendPush } = require('../utils/sendPush.util')
const config = require('../config/config')
const jwtConfig = require('../config/jwt.config')
const ShareLink = require('../models/shareLink.model')
const { kioskCustomerId } = require('../config/config')

//Get all order
const getOrders = async (req, res) => {
	const { currency } = req.query
	try {
		const orders = await paginate(req, Order, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'users',
					localField: 'customer',
					foreignField: '_id',
					as: 'customer',
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'guests',
					foreignField: '_id',
					as: 'guests',
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
			...orderAggregatePipe,
		])

		if (!orders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No Orders Found',
				order_count: orders.totalDocs,
			})
		}
		return res.status(200).json({
			status: 1,
			message: 'List of all orders.',
			order_count: orders.totalDocs,
			orders: currency
				? await convertAmount(
						orders,
						[
							'price',
							'itemPrice',
							'addonPrice',
							'total',
							'addon',
							'tip',
							'subtotal',
							'tax',
						],
						'usd',
						currency,
				  )
				: orders,
		})
	} catch (err) {
		console.log(err)
		throw new Error('No Orders found')
	}
}

//Get an order by Id
const getOrder = async (req, res) => {
	const { currency } = req.query
	try {
		const orders = await Order.aggregate([
			{ $match: { _id: ObjectId(req.params.orderId) } },
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
					from: 'users',
					localField: 'customer',
					foreignField: '_id',
					as: 'customer',
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'guests',
					foreignField: '_id',
					as: 'guests',
				},
			},
			...orderAggregatePipe,
			{
				$unset: [
					'customer.hash',
					'customer.salt',
					'customer.__v',
					'guests.hash',
					'guests.salt',
					'guests.__v',
				],
			},
		])

		if (!orders.length) {
			return res.status(404).json({ status: 0, message: 'No orders found' })
		}

		return res.status(200).json({
			status: 1,
			message: 'Order data',
			orders: currency
				? await convertAmount(orders[0], 'price', 'usd', currency)
				: orders[0],
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

//Add a order
const addOrder = async (req, res) => {
	const {
		orderName,
		customer,
		staff,
		restaurant,
		orderStatus,
		orderType,
		orderFrom,
		paymentType,
		paymentMethod,
		table,
		guests,
		items,
		deliveryTime,
		tip,
		visitors,
		instructions,
		coupon,
		reOrder,
	} = req.body

	if (customer) guests.push(customer)

	if (reOrder?.orderId) {
		const reOrderCount = await Order.find({
			'reOrder.orderId': reOrder.orderId,
		}).countDocuments()
		reOrder.count = reOrderCount + 1
	}

	if (!customer && staff && orderFrom === 'restaurant') {
		addKioskCustomerId(items)
	}

	calcOrderItems(items)

	const category = await getOrderCategory(items)

	const { estimatedTime, price } = calcEstimateTimeAndPrice(items)

	const taxRate = await Tax.findOne({ restaurant }, { rate: 1 })

	const taxAmount = (price.total * (taxRate?.rate || 0)) / 100

	price.tax = taxAmount
	price.total += price.tax
	price.tip = tip
	price.total += price.tip

	const waitingList = await Order.find({
		deliveryTime,
		table: { $in: [...table] },
	}).countDocuments()

	try {
		const order = new Order({
			orderName,
			customer,
			staff,
			restaurant,
			category,
			orderStatus,
			orderType,
			orderFrom,
			paymentType,
			paymentMethod,
			table,
			guests,
			items,
			deliveryTime,
			price,
			visitors,
			instructions,
			waitingList,
			coupon,
			reOrder,
			estimatedTime,
		})
		await order.save()

		const restaurantOwner = await Restaurant.findOne(
			{ _id: ObjectId(restaurant) },
			{ owner: 1 },
		)

		if (restaurantOwner) {
			await sendPush(
				[restaurantOwner.owner],
				'restaurantOwner',
				'Book Your Table',
				'New order placed by a customer',
				{ type: 'byt_new_order' },
			)
		}

		await sendPush(
			guests,
			'user',
			'Book Your Table',
			'You are invited in order',
			{
				type: 'byt_new_order_action',
				action: 'pending',
				orderId: order._id.toString(),
			},
		)

		if (customer) {
			const avgSpend = await Order.aggregate([
				{ $match: { customer: ObjectId(customer) } },
				{
					$group: {
						_id: null,
						sumPrice: { $sum: '$price' },
						count: { $sum: 1 },
					},
				},
				{
					$project: {
						avgPrice: { $divide: ['$sumPrice', '$count'] },
					},
				},
				{ $unset: '_id' },
			])

			await User.findByIdAndUpdate(customer, {
				avgSpend: avgSpend[0].avgPrice.toFixed(1),
			})
		}

		// response preparation for order and socket
		let response = {
			status: 1,
			message: 'Order created successfully',
			order,
			restaurantId: restaurant,
		}
		SocketDispatch(req, { type: ACTIONS.ORDERS.ADD, payload: response })

		res.status(201).json(response)
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

//Update a orders
const updateOrder = async (req, res) => {
	const {
		orderName,
		customer,
		staff,
		restaurant,
		orderStatus,
		orderType,
		paymentType,
		paymentMethod,
		table,
		guests,
		items,
		deliveryTime,
		tip,
		visitors,
		instructions,
		coupon,
		status,
	} = req.body

	try {
		const { orderId } = req.params

		if (!customer && staff) {
			addKioskCustomerId(items)
		}

		calcOrderItems(items)

		const category = await getOrderCategory(items)

		const { estimatedTime, price } = calcEstimateTimeAndPrice(items)

		const taxRate = await Tax.findOne({ restaurant }, { rate: 1 })

		const taxAmount = (price.total * (taxRate?.rate || 0)) / 100

		price.tax = taxAmount
		price.total += price.tax
		price.tip = tip
		price.total += price.tip

		const order = await Order.findByIdAndUpdate(
			orderId,
			{
				orderName,
				customer,
				staff,
				restaurant,
				category,
				orderStatus,
				orderType,
				paymentType,
				paymentMethod,
				table,
				guests,
				items,
				deliveryTime,
				price,
				visitors,
				instructions,
				coupon,
				status,
				estimatedTime,
			},
			{ new: true },
		)
		if (!order) {
			return res.status(404).json({ status: 0, message: 'No orders found' })
		}

		if (price && customer) {
			const checkOrders = await Order.aggregate([
				{ $match: { customer: ObjectId(customer) } },
				{
					$group: {
						_id: null,
						sumPrice: { $sum: '$price' },
						count: { $sum: 1 },
					},
				},
				{
					$project: {
						avgPrice: { $divide: ['$sumPrice', '$count'] },
					},
				},
				{ $unset: '_id' },
			])

			await User.findByIdAndUpdate(customer, {
				avgSpend: checkOrders[0].avgPrice.toFixed(1),
			})
		}

		if (orderStatus === 'completed' && status === true) {
			const menuIds = order.items.map((data) => data.item)

			const ingredients = await MenuItem.aggregate([
				{
					$match: {
						$expr: {
							$in: ['$_id', menuIds],
						},
					},
				},
				{
					$project: {
						ingredient: 1,
						_id: 0,
					},
				},
			])

			ingredients.forEach(async ({ ingredient }) => {
				ingredient.forEach(async (i) => {
					const inventoryItem = await InventoryItem.findOne({
						name: i.item,
						restaurant,
					})

					const unit = ' ' + inventoryItem.quantity.split(' ')[1]
					const quantity =
						parseFloat(inventoryItem.quantity) - parseFloat(i.quantity) + unit

					await InventoryItem.findByIdAndUpdate(inventoryItem._id, {
						quantity,
					})
				})
			})

			const checkInvoice = await Invoice.find({
				order: orderId,
				restaurant,
			}).countDocuments()

			if (!checkInvoice) {
				await Invoice.create({
					customer,
					restaurant,
					order: orderId,
				})
			}

			if (paymentType === 'split') {
				const pointSplit = price.points / order.guests.length

				order.guests.forEach(async (guestId) => {
					await User.findByIdAndUpdate(guestId, {
						$inc: { bytPoints: pointSplit },
					})
				})
			}
		}

		let response = { status: 1, message: 'Order updated successfully', order }
		// socket action dispatch
		SocketDispatch(req, { type: ACTIONS.ORDERS.UPDATE, payload: response })
		return res.status(200).json(response)
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

//Delete a order
const deleteOrder = async (req, res) => {
	try {
		const orders = await Order.findByIdAndDelete(req.params.orderId)

		if (!orders) {
			res.status(404).json({ status: 0, message: 'No Orders Found' })
			return
		}

		// socket dispatch
		let orderId = req.params.orderId

		let response = {
			status: 1,
			message: 'Order deleted successfully',
			order: { _id: orderId },
		}
		SocketDispatch(req, { type: 'ORDER_DELETE', payload: response })
		return res.status(200).json(response)
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const getOrdersByUser = async (req, res) => {
	const { currency } = req.query
	try {
		const orders = await paginate(req, Order, [
			{ $sort: { createdAt: -1 } },
			{ $match: { guests: { $in: [ObjectId(req.params.userId)] } } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
			{
				$set: {
					estimatedWaitTime: {
						$multiply: ['$waitingList', 30],
					},
				},
			},
			...orderAggregatePipe,
			{
				$unset: [
					'restaurant.isOwner',
					'restaurant.owner',
					'restaurant.alcoholServe',
					'restaurant.services',
					'restaurant.cuisines',
					'restaurant.package',
					'restaurant.createdAt',
					'restaurant.__v',
					'waitingOrders',
				],
			},
		])

		if (!orders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No Orders Found',
				order_count: orders.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all orders.',
			orders: currency
				? await convertAmount(orders, 'price', 'usd', currency)
				: orders,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchOrder = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const orders = await paginate(req, Order, [
			await searchMatchPipeline(Order, field, search, where),
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'users',
					localField: 'customer',
					foreignField: '_id',
					as: 'customer',
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
			...orderAggregatePipe,
			{
				$set: {
					estimatedWaitTime: {
						$multiply: ['$waitingList', 30],
					},
				},
			},
			{
				$unset: [
					'customer.hash',
					'customer.salt',
					'customer.__v',
					'restaurant.__v',
				],
			},
		])

		if (!orders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No orders found',
				orders_count: orders.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Search order data.',
			orders_count: orders.totalDocs,
			orders,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getWaitingListCount = async (req, res) => {
	const { table, restaurant, datetime } = req.body

	try {
		const count = await Order.find({
			table: { $in: [ObjectId(table)] },
			restaurant: ObjectId(restaurant),
			deliveryTime: new Date(datetime),
		}).countDocuments()

		res.status(200).json({
			status: 1,
			message: 'Waiting list count',
			waitingListCount: count,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getOrdersByRestaurant = async (req, res) => {
	const { currency } = req.query
	try {
		const orders = await paginate(req, Order, [
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
					from: 'users',
					localField: 'customer',
					foreignField: '_id',
					as: 'customer',
				},
			},
			...orderAggregatePipe,
			{
				$set: {
					estimatedWaitTime: {
						$multiply: ['$waitingList', 30],
					},
				},
			},
			{ $unset: ['customer.hash', 'customer.salt', 'customer.__v'] },
		])

		if (!orders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No orders found',
				orders_count: orders.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all restaurants orders data.',
			orders_count: orders.totalDocs,
			orders: currency
				? await convertAmount(orders, 'price', 'usd', currency)
				: orders,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateOrderStatus = async (req, res) => {
	const { orderId, status } = req.params

	try {
		const prevOrder = await Order.findOne({ _id: orderId })
		const orderUpdateObj = {
			orderStatus: status,
			preparationTime: prevOrder.preparationTime,
		}

		if (status === 'preparing') {
			orderUpdateObj.preparationTime.start = new Date()
		} else if (status === 'completed') {
			orderUpdateObj.preparationTime.end = new Date()
			orderUpdateObj.status = true
		} else {
			delete orderUpdateObj.preparationTime
		}

		const order = await Order.findByIdAndUpdate(orderId, orderUpdateObj, {
			new: true,
		})

		if (!order) {
			return res.status(404).json({
				status: 0,
				message: 'No order found with this id',
			})
		}

		if (status === 'completed') {
			const menuIds = order.items.map((data) => data.item)

			const ingredients = await MenuItem.aggregate([
				{
					$match: {
						$expr: {
							$in: ['$_id', menuIds],
						},
					},
				},
				{
					$project: {
						ingredient: 1,
						_id: 0,
					},
				},
			])

			ingredients.forEach(async ({ ingredient }) => {
				ingredient.forEach(async (i) => {
					const inventoryItem = await InventoryItem.findOne({
						name: i.item,
						restaurant: order.restaurant,
					})

					const unit = ' ' + inventoryItem.quantity.split(' ')[1]
					const quantity =
						parseFloat(inventoryItem.quantity) - parseFloat(i.quantity) + unit

					await InventoryItem.findByIdAndUpdate(inventoryItem._id, {
						quantity,
					})
				})
			})

			const checkInvoice = await Invoice.find({
				order: orderId,
				restaurant: order.restaurant,
			}).countDocuments()

			if (!checkInvoice) {
				await Invoice.create({
					customer: order.customer,
					restaurant: order.restaurant,
					order: orderId,
				})
			}

			if (order.paymentType === 'split') {
				const pointSplit = price.points / order.guests.length

				order.guests.forEach(async (guestId) => {
					await User.findByIdAndUpdate(guestId, {
						$inc: { bytPoints: pointSplit },
					})
				})
			}
		}

		res
			.status(200)
			.json({ status: 1, message: 'Order Status updated successfully' })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getKitchenDisplayOrders = async (req, res) => {
	const { restaurantId, category } = req.params
	const { currency } = req.query

	try {
		const categoryQuery = category ? { category } : {}

		const orders = await paginate(req, Order, [
			{
				$match: {
					restaurant: ObjectId(restaurantId),
					orderStatus: { $in: ['accepted', 'preparing'] },
					...categoryQuery,
				},
			},
			{
				$lookup: {
					from: 'tables',
					localField: 'table',
					foreignField: '_id',
					as: 'table',
				},
			},
			...orderAggregatePipe,
			{ $unset: ['customer.hash', 'customer.salt', 'customer.__v'] },
		])

		if (!orders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No order found',
				orders_count: orders.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all kitchen display orders.',
			orders_count: orders.totalDocs,
			orders: currency
				? await convertAmount(orders, 'price', 'usd', currency)
				: orders,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getTicketHistory = async (req, res) => {
	const { restaurantId } = req.params
	const { start = '00:00', end = '23:59' } = req.body

	try {
		const orders = await paginate(req, Order, [
			{
				$match: {
					restaurant: ObjectId(restaurantId),
					deliveryTime: {
						$gte: new Date(moment().format('YYYY-MM-DDT') + start),
						$lt: new Date(moment().format('YYYY-MM-DDT') + end),
					},
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'customer',
					foreignField: '_id',
					as: 'customer',
				},
			},
			...orderAggregatePipe,
			{ $unset: ['customer.hash', 'customer.salt', 'customer.__v'] },
		])

		if (!orders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No order found',
				orders_count: orders.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all ticket history.',
			orders_count: orders.totalDocs,
			orders,
		})
	} catch (error) {
		console.error(error)
		throw new Error(error.message)
	}
}

const getOrderByOrderNo = async (req, res) => {
	const { orderNo } = req.params
	const { currency } = req.query

	try {
		const orders = await Order.aggregate([
			{ $match: { orderNo } },
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
					from: 'users',
					localField: 'customer',
					foreignField: '_id',
					as: 'customer',
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'guests',
					foreignField: '_id',
					as: 'guests',
				},
			},
			...orderAggregatePipe,
			{
				$unset: [
					'customer.hash',
					'customer.salt',
					'customer.__v',
					'guests.hash',
					'guests.salt',
					'guests.__v',
				],
			},
		])

		if (!orders.length) {
			return res.status(404).json({ status: 0, message: 'No orders found' })
		}

		res.status(200).json({
			status: 1,
			message: 'Order data.',
			orders: currency
				? await convertAmount(orders[0], 'price', 'usd', currency)
				: orders[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchUserOrderByRestaurant = async (req, res) => {
	const { userId, searchQuery = '.' } = req.params

	try {
		const orders = await paginate(req, Order, [
			{ $match: { guests: { $in: [ObjectId(userId)] }, orderType: 'dine-in' } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
			{
				$match: {
					'restaurant.name': { $regex: searchQuery, $options: 'is' },
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'guests',
					foreignField: '_id',
					as: 'guests',
				},
			},
			...orderAggregatePipe,
		])

		if (!orders.totalDocs) {
			return res.status(404).json({ status: 0, message: 'No orders found' })
		}

		res
			.status(200)
			.json({ status: 1, message: 'Search reservations data', orders })
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const searchRestaurantOrderByUser = async (req, res) => {
	const { restaurantId, searchQuery } = req.params

	try {
		const orders = await paginate(req, Order, [
			{ $match: { restaurant: ObjectId(restaurantId) } },
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'users',
					localField: 'customer',
					foreignField: '_id',
					as: 'customer',
				},
			},
			{
				$match: {
					'customer.name': { $regex: searchQuery, $options: 'i' },
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
			...orderAggregatePipe,
			{
				$set: {
					estimatedWaitTime: {
						$multiply: ['$waitingList', 30],
					},
				},
			},
			{
				$unset: [
					'customer.hash',
					'customer.salt',
					'customer.__v',
					'restaurant.__v',
				],
			},
		])

		if (!orders.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No orders found',
				orders_count: orders.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Search order data.',
			orders_count: orders.totalDocs,
			orders,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getOrderShareLink = async (req, res) => {
	const { orderId } = req.params

	try {
		const linkId = new ObjectId().toString()
		await ShareLink.create({
			linkId,
			type: 'order',
			expire: moment().add('1', 'd'),
		})

		const token = jwt.sign({ orderId }, jwtConfig.linkSecret, {
			expiresIn: '1D',
			jwtid: linkId,
		})

		const link = config.client.baseUrl + '/oi/' + token

		res.status(200).json({
			status: 1,
			message: 'Order share link',
			link,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	getOrders,
	getOrder,
	addOrder,
	updateOrder,
	deleteOrder,
	getOrdersByUser,
	searchOrder,
	getWaitingListCount,
	getOrdersByRestaurant,
	updateOrderStatus,
	getKitchenDisplayOrders,
	getTicketHistory,
	getOrderByOrderNo,
	searchUserOrderByRestaurant,
	searchRestaurantOrderByUser,
	getOrderShareLink,
}

const calcOrderItems = (items) => {
	items.forEach((item) => {
		const itemPrice = item.price * item.quantity
		const addonPrice = item.customer.reduce(
			(a, c) =>
				a + c.addon?.reduce((a, add) => a + add.price * add.quantity, 0) || 0,
			0,
		)
		const total = Number(itemPrice) + Number(addonPrice)

		item.totalPrice = { itemPrice, addonPrice, total }

		const addons = item.customer.map(
			(c) =>
				c.addon?.map((add) => ({ id: add.id, quantity: add.quantity })) || [],
		)

		item.addons = addons.reduce((arr, addon) => {
			arr.push(...addon)
			return arr
		}, [])

		item.customer.forEach((c) => {
			const total =
				(c.addon?.reduce((a, adn) => a + adn.price * adn.quantity, 0) || 0) +
				item.price * c.quantity

			c.totalPrice = total
		})
	})
}

const calcEstimateTimeAndPrice = (items) => {
	return items.reduce(
		(a, item) => {
			a.price.addon += item.totalPrice.addonPrice
			a.price.subtotal += item.totalPrice.itemPrice
			a.price.total += item.totalPrice.total
			a.estimatedTime += item.estimatedTime * item.quantity
			return a
		},
		{ estimatedTime: 0, price: { addon: 0, subtotal: 0, total: 0 } },
	)
}

const getOrderCategory = async (items) => {
	const menuItemsIds = items.map((item) => item.item)

	const menuItems = await MenuItem.find({ _id: { $in: menuItemsIds } })

	let category = 'vegetarian'

	menuItems.map((item) => {
		if (item.category.toLowerCase() === 'non-vegetarian')
			category = 'non-vegetarian'
	})

	return category
}

const addKioskCustomerId = (items) => {
	items.forEach((item) => {
		item.customer.forEach((customer) => {
			customer.customerId = kioskCustomerId
		})
	})
}

const orderAggregatePipe = [
	{
		$lookup: {
			from: 'menuitems',
			localField: 'items.item',
			foreignField: '_id',
			as: 'menuitems',
		},
	},
	{
		$lookup: {
			from: 'tables',
			localField: 'table',
			foreignField: '_id',
			as: 'table',
		},
	},
	{
		$lookup: {
			from: 'bundleitems',
			let: { bundleItemIds: '$items.combo' },
			pipeline: [
				{ $match: { $expr: { $in: ['$_id', '$$bundleItemIds'] } } },
				{ $unset: ['__v'] },
			],
			as: 'bundleItems',
		},
	},
	{
		$lookup: {
			from: 'users',
			localField: 'items.customer.customerId',
			foreignField: '_id',
			as: 'customers',
		},
	},
	{
		$lookup: {
			from: 'addons',
			localField: 'items.customer.addon.id',
			foreignField: '_id',
			as: 'addon',
		},
	},
	{
		$lookup: {
			from: 'reviews',
			let: { menuItemId: '$items.item' },
			pipeline: [
				{ $match: { $expr: { $in: ['$item', '$$menuItemId'] } } },
				{
					$group: {
						_id: '$item',
						totalRating: { $sum: '$rating' },
						count: { $sum: 1 },
					},
				},
				{
					$set: {
						avgRating: {
							$divide: ['$totalRating', '$count'],
						},
					},
				},
			],
			as: 'reviews',
		},
	},
	{
		$set: {
			items: {
				$map: {
					input: '$items',
					in: {
						$mergeObjects: [
							'$$this',
							{
								item: {
									$cond: [
										'$$this.item',
										{
											$arrayElemAt: [
												'$menuitems',
												{ $indexOfArray: ['$menuitems._id', '$$this.item'] },
											],
										},
										'$$REMOVE',
									],
								},
								combo: {
									$cond: [
										'$$this.combo',
										{
											$arrayElemAt: [
												'$bundleItems',
												{ $indexOfArray: ['$bundleItems._id', '$$this.combo'] },
											],
										},
										'$$REMOVE',
									],
								},
								customer: {
									$map: {
										input: '$$this.customer',
										in: {
											$mergeObjects: [
												'$$this',
												{
													customerId: {
														$arrayElemAt: [
															'$customers',
															{
																$indexOfArray: [
																	'$customers._id',
																	'$$this.customerId',
																],
															},
														],
													},
													addon: {
														$map: {
															input: '$$this.addon',
															in: {
																$mergeObjects: [
																	'$$this',
																	{
																		id: {
																			$arrayElemAt: [
																				'$addon',
																				{
																					$indexOfArray: [
																						'$addon._id',
																						'$$this.id',
																					],
																				},
																			],
																		},
																	},
																],
															},
														},
													},
												},
											],
										},
									},
								},
								review: {
									$arrayElemAt: [
										'$reviews',
										{
											$indexOfArray: ['$reviews._id', '$$this._id'],
										},
									],
								},
							},
						],
					},
				},
			},
		},
	},
	{
		$unset: [
			'items.customer.customerId.hash',
			'items.customer.customerId.salt',
			'items.customer.customerId.__v',
			'items.review._id',
			'items.review.totalRating',
			'restaurant.__v',
			'menuitems',
			'bundleItems',
			'customers',
			'addon',
			'reviews',
		],
	},
]
