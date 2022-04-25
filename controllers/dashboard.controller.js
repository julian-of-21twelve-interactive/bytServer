const { ObjectId } = require('mongodb')
const moment = require('moment')
const User = require('../models/user.model')
const Restaurant = require('../models/restaurant.model')
const Order = require('../models/order.model')
const InventoryOrder = require('../models/inventoryOrder.model')
const Review = require('../models/review.model')
const { convertAmount } = require('../utils/currencyConverter.util')

const getAllCount = async (req, res) => {
	const { currency } = req.query

	try {
		const date = new Date()

		const users = await User.count()
		const restaurants = await Restaurant.count()
		const orders = await Order.count()
		const sells = await Order.aggregate([
			{
				$group: {
					_id: null,
					total: { $sum: '$price' },
				},
			},
		])

		date.setDate(new Date().getDate() - 2)
		const recentOrders = await Order.aggregate([
			{
				$match: {
					createdAt: { $gt: date },
				},
			},
			{ $sort: { createdAt: -1 } },
			{ $limit: 10 },
		])

		date.setDate(new Date().getDate() - 7)
		const newUsers = await User.aggregate([
			{
				$match: {
					createdAt: { $gt: (date / 1000).toFixed(0) },
				},
			},
			{ $unset: ['hash', 'salt'] },
			{ $sort: { createdAt: -1 } },
			{ $limit: 10 },
		])

		date.setDate(new Date().getDate() - 7)
		const recentInventoryOrders = await InventoryOrder.aggregate([
			{
				$match: {
					createdAt: { $gt: date },
				},
			},
			{ $sort: { createdAt: -1 } },
			{ $limit: 10 },
		])

		date.setDate(new Date().getDate() - 7)
		const recentReviews = await Review.aggregate([
			{
				$match: {
					date: { $gt: date },
				},
			},
			{ $sort: { date: -1 } },
			{ $limit: 10 },
		])

		// if (!dashboards) {
		// 	return res.status(404).json({
		// 		dashboards_count: dashboards.length,
		// 		message: 'No dashboards found',
		// 	})
		// }

		res.status(200).json({
			status: 1,
			message: 'List of all counts.',
			count: {
				users,
				restaurants,
				orders,
				sells: sells[0].total,
				recentOrders: currency
					? (
							await convertAmount(
								{ recentOrders },
								[
									'price',
									'itemPrice',
									'addonPrice',
									'total',
									'totalPrice',
									'addon',
									'tip',
									'subtotal',
									'tax',
								],
								'usd',
								currency,
							)
					  ).recentOrders
					: recentOrders,
				newUsers,
				recentInventoryOrders: currency
					? (
							await convertAmount(
								{ recentInventoryOrders },
								'amount',
								'usd',
								currency,
							)
					  ).recentInventoryOrders
					: recentInventoryOrders,
				recentReviews,
			},
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllRestaurantCount = async (req, res) => {
	const { restaurantId } = req.params
	const { currency } = req.query

	try {
		const date = new Date()

		const sells = await Order.aggregate([
			{ $match: { restaurant: ObjectId(restaurantId) } },
			{
				$group: {
					_id: null,
					total: { $sum: '$price.total' },
				},
			},
		])
		const orders = await Order.find({
			restaurant: ObjectId(restaurantId),
		}).countDocuments()

		date.setDate(new Date().getDate() - 3)
		const recentOrders = await Order.aggregate([
			{
				$match: {
					restaurant: ObjectId(restaurantId),
					createdAt: { $gt: date },
				},
			},
			{ $sort: { createdAt: -1 } },
			{ $limit: 10 },
		])

		date.setDate(new Date().getDate() - 7)
		const recentInventoryOrders = await InventoryOrder.aggregate([
			{
				$match: {
					restaurant: ObjectId(restaurantId),
					createdAt: { $gt: date },
				},
			},
			{ $sort: { createdAt: -1 } },
			{ $limit: 10 },
		])

		date.setDate(new Date().getDate() - 7)
		const recentReviews = await Review.aggregate([
			{
				$match: {
					restaurant: ObjectId(restaurantId),
					createdAt: { $gt: date },
				},
			},
			{ $sort: { date: -1 } },
			{ $limit: 10 },
		])

		const monthlyEarningChart = await Order.aggregate([
			{
				$match: {
					$expr: {
						$and: [
							{ $eq: [{ $year: '$createdAt' }, { $year: '$$NOW' }] },
							{ $eq: ['$restaurant', ObjectId(restaurantId)] },
						],
					},
				},
			},
			{
				$group: {
					_id: { $month: '$createdAt' },
					income: { $sum: '$price.total' },
				},
			},
			{
				$set: {
					month: {
						$let: {
							vars: {
								monthsInString: [
									'Jan',
									'Feb',
									'Mar',
									'Apr',
									'May',
									'Jun',
									'Jul',
									'Aug',
									'Sep',
									'Oct',
									'Nov',
									'Dec',
								],
							},
							in: {
								$arrayElemAt: ['$$monthsInString', '$_id'],
							},
						},
					},
				},
			},
		])

		const weeklyEarnings = await Order.aggregate([
			{
				$match: {
					$expr: {
						$and: [
							{ $eq: [{ $month: '$createdAt' }, { $month: '$$NOW' }] },
							{ $eq: ['$restaurant', ObjectId(restaurantId)] },
						],
					},
				},
			},
			{
				$group: {
					_id: { $floor: { $divide: [{ $dayOfMonth: '$createdAt' }, 7] } },
					income: { $sum: '$price.total' },
					dayOfMonth: { $addToSet: { $dayOfMonth: '$createdAt' } },
				},
			},
			{ $sort: { _id: 1 } },
		])

		weeklyEarnings.forEach((earning, i) => {
			const prevEarning = weeklyEarnings[i - 1]?.income || 0
			earning.revenue = (
				prevEarning === 0 ? 100 : (earning.income * 100) / prevEarning
			).toFixed(2)
		})

		const repeatOrders = await Order.aggregate([
			{
				$match: {
					$expr: {
						$and: [
							{ $eq: ['$restaurant', ObjectId(restaurantId)] },
							{ $gt: ['$reOrder.count', 0] },
						],
					},
				},
			},
			{ $count: 'count' },
		])

		const cancelledOrders = await Order.aggregate([
			{
				$match: {
					$expr: {
						$and: [
							{ $eq: ['$restaurant', ObjectId(restaurantId)] },
							{ $eq: ['$orderStatus', 'cancelled'] },
						],
					},
				},
			},
			{ $count: 'count' },
		])

		const orderChart = await Order.aggregate([
			{
				$match: {
					$expr: {
						$and: [
							{
								$eq: ['$restaurant', ObjectId(restaurantId)],
							},
							{
								$gte: [
									'$deliveryTime',
									new Date(moment().format('YYYY-MM-DDT') + '00:00'),
								],
							},
							{
								$lt: [
									'$deliveryTime',
									new Date(moment().format('YYYY-MM-DDT') + '23:59'),
								],
							},
						],
					},
				},
			},
			{
				$group: {
					_id: null,
					orders: { $push: '$$ROOT' },
				},
			},
			{
				$set: {
					filter: orderTimeSetPipe,
				},
			},
			{ $unset: ['_id', 'orders'] },
			{ $replaceRoot: { newRoot: { $mergeObjects: ['$filter'] } } },
		])

		res.status(200).json({
			status: 1,
			message: 'All restaurant counts.',
			sells: sells[0]?.total || 0,
			orders,
			repeatOrders: repeatOrders[0]?.count || 0,
			cancelledOrders: cancelledOrders[0]?.count || 0,
			recentOrders: currency
				? (
						await convertAmount(
							{ recentOrders },
							[
								'price',
								'itemPrice',
								'addonPrice',
								'total',
								'totalPrice',
								'addon',
								'tip',
								'subtotal',
								'tax',
							],
							'usd',
							currency,
						)
				  ).recentOrders
				: recentOrders,
			recentInventoryOrders: currency
				? (
						await convertAmount(
							{ recentInventoryOrders },
							'amount',
							'usd',
							currency,
						)
				  ).recentInventoryOrders
				: recentInventoryOrders,
			recentReviews,
			monthlyEarningChart,
			weeklyEarnings,
			orderChart: orderChart[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getFavouriteChartData = async (req, res) => {
	const { ownerId, weekday = 0 } = req.params
	const date = moment().weekday(weekday).format('YYYY-MM-DDT') + '00:00'
	const prevDate = moment(date).subtract(1, 'd').format('YYYY-MM-DDT') + '00:00'

	try {
		let restaurants = await Restaurant.aggregate([
			{ $match: { owner: ObjectId(ownerId) } },
			{ $project: { name: 1 } },
		])

		for (let i = 0; i < restaurants.length; i += 1) {
			const orders = await Order.aggregate([
				{
					$match: {
						restaurant: ObjectId(restaurants[i]._id),
						deliveryTime: {
							$gte: new Date(date),
							$lt: new Date(moment(date).format('YYYY-MM-DDT') + '23:59'),
						},
					},
				},
				{
					$group: {
						_id: null,
						count: { $sum: 1 },
						total: { $sum: '$price.total' },
					},
				},
				{ $unset: '_id' },
			])
			const prevDateOrders = await Order.aggregate([
				{
					$match: {
						restaurant: ObjectId(restaurants[i]._id),
						deliveryTime: {
							$gte: new Date(prevDate),
							$lt: new Date(moment(prevDate).format('YYYY-MM-DDT') + '23:59'),
						},
					},
				},
				{
					$group: {
						_id: null,
						count: { $sum: 1 },
						total: { $sum: '$price.total' },
					},
				},
				{ $unset: ['_id'] },
			])

			const prevCount = prevDateOrders[0]?.count || 1
			const prevTotal = prevDateOrders[0]?.total || 1
			restaurants[i].ordersCount = orders[0]?.count || 0
			restaurants[i].prevOrderCount = prevDateOrders[0]?.count || 0
			restaurants[i].orderAvg = ((orders[0]?.count || 0) * 100) / prevCount
			restaurants[i].profit = ((orders[0]?.total || 0) * 100) / prevTotal
		}

		res.status(200).json({ status: 1, restaurants })
	} catch (error) {
		console.error(error)
		throw new Error(error.message)
	}
}

module.exports = { getAllCount, getAllRestaurantCount, getFavouriteChartData }

const orderTimeSetPipe = [00, 02, 04, 06, 08, 10, 12, 14, 16, 18, 20, 22].map(
	(h) => {
		const startHour = h.toString().padStart(2, '0')
		const endHour = (h + 1).toString().padStart(2, '0')
		return {
			[h]: {
				$filter: {
					input: '$orders',
					cond: {
						$and: [
							{
								$gte: [
									'$$this.deliveryTime',
									new Date(moment().format('YYYY-MM-DDT') + `${startHour}:00`),
								],
							},
							{
								$lt: [
									'$$this.deliveryTime',
									new Date(moment().format('YYYY-MM-DDT') + `${endHour}:59`),
								],
							},
						],
					},
				},
			},
		}
	},
)
