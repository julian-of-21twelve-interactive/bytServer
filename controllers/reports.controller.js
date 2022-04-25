const { ObjectId } = require('mongodb')
const moment = require('moment')
const InventoryItemsModal = require('../models/inventoryItem.model')
const AttendanceModal = require('../models/attendance.model')
const MenuItemsModal = require('../models/menuItem.model')
const BundleItem = require('../models/bundleItem.model')
const WarehouseOrderModal = require('../models/warehouseOrder.model')
const RestaurantModal = require('../models/restaurant.model')
const CustomerModal = require('../models/customer.model')
const Order = require('../models/order.model')
const Package = require('../models/package.model')
const InventoryOrder = require('../models/inventoryOrder.model')
const Tax = require('../models/tax.model')
const StaffMember = require('../models/staffMember.model')
const Table = require('../models/table.model')
const paginate = require('../utils/aggregatePaginate.util')
const { convertAmount } = require('../utils/currencyConverter.util')

const getMonthlyEarning = async (req, res) => {
	const { currency } = req.query

	try {
		const orderIncome = await Order.aggregate([
			{ $group: { _id: null, income: { $sum: '$price' } } },
			{ $unset: ['_id'] },
		])
		const monthlyOrderIncome = await Order.aggregate([
			{
				$match: {
					$expr: {
						$eq: [{ $month: '$createdAt' }, { $month: '$$NOW' }],
					},
				},
			},
			{ $group: { _id: null, income: { $sum: '$price' } } },
			{ $unset: ['_id'] },
		])
		const uniqueCustomer = await Order.aggregate([
			{ $group: { _id: '$customer' } },
			{ $count: 'customers' },
		])
		const netProfit = await Package.aggregate([
			{ $group: { _id: null, income: { $sum: '$price' } } },
			{ $unset: ['_id'] },
		])
		const monthlyEarning = await paginate(req, Order, [
			{ $group: { _id: '$restaurant', income: { $sum: '$price' } } },
			{
				$lookup: {
					from: 'restaurants',
					localField: '_id',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
			{ $unset: ['_id', 'restaurant.__v'] },
		])
		const monthlyEarningChart = await Package.aggregate([
			{
				$match: {
					$expr: { $eq: [{ $year: '$createdAt' }, { $year: '$$NOW' }] },
				},
			},
			{
				$group: { _id: { $month: '$createdAt' }, income: { $sum: '$price' } },
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
		const incomeAnalysisYear = await Order.aggregate([
			{
				$group: {
					_id: { $year: '$createdAt' },
					income: { $sum: '$price' },
				},
			},
		])
		const incomeAnalysisMonthly = await Order.aggregate([
			{
				$group: {
					_id: { $month: '$createdAt' },
					income: { $sum: '$price' },
				},
			},
		])
		const incomeAnalysisDaily = await Order.aggregate([
			{
				$match: {
					$expr: { $eq: [{ $month: '$createdAt' }, { $month: '$$NOW' }] },
				},
			},
			{
				$group: {
					_id: { $dayOfMonth: '$createdAt' },
					income: { $sum: '$price' },
				},
			},
			{ $sort: { _id: -1 } },
		])

		const lastYearIncomeAnalysis =
			incomeAnalysisYear.find(
				(data) =>
					data._id.toString() === moment().subtract(1, 'year').format('YYYY'),
			)?.income || 0

		const currentYearIncomeAnalysis =
			incomeAnalysisYear.find(
				(data) => data._id.toString() === moment().format('YYYY'),
			)?.income || 0

		const yearIncomeAnalysis = Number(
			(
				(currentYearIncomeAnalysis /
					(currentYearIncomeAnalysis + lastYearIncomeAnalysis)) *
				100
			).toFixed(2),
		)

		const lastMonthIncomeAnalysis =
			incomeAnalysisMonthly.find(
				(data) =>
					data._id.toString() === moment().subtract(1, 'month').format('M'),
			)?.income || 0

		const currentMonthIncomeAnalysis =
			incomeAnalysisMonthly.find(
				(data) => data._id.toString() === moment().format('M'),
			)?.income || 0

		const monthIncomeAnalysis =
			Number(
				(
					(currentMonthIncomeAnalysis /
						(currentMonthIncomeAnalysis + lastMonthIncomeAnalysis)) *
					100
				).toFixed(2),
			) || 0

		const lastDailyIncomeAnalysis =
			incomeAnalysisDaily.find(
				(data) =>
					data._id.toString() === moment().subtract(1, 'day').format('D'),
			)?.income || 0

		const currentDailyIncomeAnalysis =
			incomeAnalysisDaily.find(
				(data) => data._id.toString() === moment().format('D'),
			)?.income || 0

		const dailyIncomeAnalysis =
			Number(
				(
					(currentDailyIncomeAnalysis /
						(currentDailyIncomeAnalysis + lastDailyIncomeAnalysis)) *
					100
				).toFixed(2),
			) || 0

		res.status(200).json({
			status: 1,
			message: 'Monthly earning data.',
			orderIncome: orderIncome[0]?.income || 0,
			monthlyOrderIncome: monthlyOrderIncome[0]?.income || 0,
			uniqueCustomer: uniqueCustomer[0].customers,
			netProfit: netProfit[0]?.income || 0,
			monthlyEarning: currency
				? (await convertAmount({ monthlyEarning }, 'income', 'usd', currency))
						.monthlyEarning
				: monthlyEarning,
			monthlyEarningChart: currency
				? (
						await convertAmount(
							{ monthlyEarningChart },
							'income',
							'usd',
							currency,
						)
				  ).monthlyEarningChart
				: monthlyEarningChart,
			incomeAnalysis: {
				year: yearIncomeAnalysis,
				monthly: monthIncomeAnalysis,
				daily: dailyIncomeAnalysis,
			},
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getCustomerReport = async (req, res) => {
	const { currency } = req.query

	try {
		const report = await paginate(req, Order, [
			{ $match: { customer: ObjectId(req.params.customerId) } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
		])

		if (!report.totalDocs) {
			return res
				.status(404)
				.json({ status: 0, message: 'No customer report found' })
		}

		res.status(200).json({
			status: 1,
			message: 'List of customer report.',
			report: currency
				? await convertAmount(
						report,
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
				: report,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getBranchProfitability = async (req, res) => {
	const { restaurantId } = req.params
	const { currency } = req.query

	try {
		const orderTotal = await Order.aggregate([
			{
				$match: {
					$expr: {
						$and: [
							{
								$eq: ['$restaurant', ObjectId(restaurantId)],
							},
							{
								$eq: [{ $month: '$deliveryTime' }, { $month: '$$NOW' }],
							},
							{
								$eq: [{ $year: '$deliveryTime' }, { $year: '$$NOW' }],
							},
						],
					},
				},
			},
			{
				$group: {
					_id: null,
					total: { $sum: '$price.total' },
					count: { $sum: 1 },
					orderIds: { $push: '$_id' },
					productTotal: {
						$sum: {
							$reduce: {
								input: '$items',
								initialValue: 0,
								in: {
									$add: ['$$value', '$$this.totalPrice.itemPrice'],
								},
							},
						},
					},
					addonTotal: {
						$sum: {
							$reduce: {
								input: '$items',
								initialValue: 0,
								in: {
									$add: ['$$value', '$$this.totalPrice.addonPrice'],
								},
							},
						},
					},
				},
			},

			{ $unset: ['_id'] },
		])

		const inventoryTotal = await InventoryOrder.aggregate([
			{
				$match: {
					$expr: {
						$and: [
							{ $eq: ['$restaurant', ObjectId(restaurantId)] },
							{ $eq: [{ $month: '$createdAt' }, { $month: '$$NOW' }] },
							{ $eq: [{ $year: '$createdAt' }, { $year: '$$NOW' }] },
						],
					},
				},
			},
			{
				$group: {
					_id: null,
					total: { $sum: '$amount' },
					count: { $sum: 1 },
				},
			},
			{ $unset: ['_id'] },
		])

		if (!orderTotal.length && !inventoryTotal.length) {
			return res.status(404).json({
				status: 0,
				message: 'No reports found for this restaurant id for this month',
			})
		}

		const staffSalary = await StaffMember.aggregate([
			{ $match: { restaurant: ObjectId(restaurantId) } },
			{
				$group: {
					_id: null,
					total: { $sum: '$salary' },
					count: { $sum: 1 },
				},
			},
			{ $unset: ['_id'] },
		])

		const tax = await Tax.findOne(
			{ restaurant: ObjectId(restaurantId) },
			{ rate: 1 },
		)

		const totalSale = orderTotal.length ? orderTotal[0].total : 0
		const totalProduct = orderTotal.length ? orderTotal[0].productTotal : 0
		const totalAddon = orderTotal.length ? orderTotal[0].addonTotal : 0
		const totalInventory = inventoryTotal.length ? inventoryTotal[0].total : 0
		const totalSalary = staffSalary.length ? staffSalary[0].total : 0
		const taxPercent = tax ? tax.rate : '0'

		const taxRate = ((totalSale * Number(taxPercent)) / 100).toFixed(2)

		const profit = totalSale - totalInventory - totalSalary

		const total = totalSale - taxRate

		const response = {
			totalSale,
			totalProduct,
			totalAddon,
			totalInventory,
			totalSalary,
			taxRate,
			profit,
			total,
		}

		res
			.status(200)
			.json(
				currency
					? await convertAmount(
							response,
							[
								'totalSale',
								'totalProduct',
								'totalAddon',
								'totalInventory',
								'totalSalary',
								'taxRate',
								'profit',
								'total',
							],
							'usd',
							currency,
					  )
					: response,
			)
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const getReports = async (req, res) => {
	const { ownerId, restaurantId, reportKey } = req.params

	try {
		const restaurantList = await RestaurantModal.find(
			{ owner: ObjectId(ownerId) },
			{ _id: 1, name: 1, city: 1 },
		)

		if (!restaurantList.length) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant founds with this owner id',
			})
		}

		if (reportKey == 'low_stock_report_ingredients') {
			const counts = await InventoryItemsModal.aggregate([
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$restaurant', ObjectId(restaurantId)] },
								{
									$lt: [
										{
											$toInt: {
												$arrayElemAt: [{ $split: ['$quantity', ' '] }, 0],
											},
										},
										11,
									],
								},
							],
						},
					},
				},
			])

			if (counts.length == 0) {
				res.status(404).json({
					status: 1,
					message: 'No Low stock products found.',
				})
			} else {
				res.json({
					status: 1,
					message: 'Low stock report ingredients',
					reportType: reportKey,
					totalLowStockItemsCount: counts.length,
					totalLowStockItems: counts,
				})
			}
		} else if (reportKey == 'cancelled_orders') {
			let count = await Order.find({
				restaurant: restaurantId,
				orderStatus: 'cancelled',
			})
				.count()
				.exec()
			res.json({
				status: 1,
				reportType: reportKey,
				cancelledOrders: count,
			})
		} else if (reportKey == 'new_customers_report') {
			let weekAgoDate = new Date()
			weekAgoDate.setDate(weekAgoDate.getDate() - 200)
			const customerList = await CustomerModal.find({
				createdAt: { $gte: weekAgoDate.toISOString() },
			}).exec()
			if (customerList.length == 0) {
				res.status(404).json({
					status: 0,
					message: 'no newly added customers found.',
				})
			} else {
				res.json({
					status: 1,
					message: 'Newly added customer list',
					reportType: reportKey,
					newlyAddedCustomers: customerList,
				})
			}
		} else if (reportKey == 'sales_by_location') {
			const restaurantIds = restaurantList.map((restaurant) => restaurant._id)

			// order by locations
			const orderCountByLocations = await Order.aggregate([
				{
					$match: {
						$expr: {
							$in: ['$restaurant', restaurantIds],
						},
					},
				},
				{
					$group: {
						_id: '$restaurant',
						count: { $sum: 1 },
						total: { $sum: '$price.total' },
						itemCount: {
							$sum: {
								$reduce: {
									input: '$items.quantity',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
						itemTotal: {
							$sum: {
								$reduce: {
									input: '$items.totalPrice.itemPrice',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
					},
				},
				{
					$lookup: {
						from: 'restaurants',
						localField: '_id',
						foreignField: '_id',
						as: 'restaurant',
					},
				},
				{ $unwind: '$restaurant' },
				{
					$set: {
						name: '$restaurant.name',
						city: '$restaurant.city',
					},
				},
				{ $unset: ['restaurant'] },
			])

			if (orderCountByLocations.length == 0) {
				res.status(404).json({
					status: 1,
					message: 'No orders found in the restaurants for this owner.',
				})
				return
			} else {
				res.json({
					status: 1,
					report_key: reportKey,
					orderByLocation: orderCountByLocations,
				})
			}
		} else if (reportKey == 'orders_by_location') {
			const restaurantIds = restaurantList.map((restaurant) => restaurant._id)

			// order by locations
			const orderCountByLocations = await Order.aggregate([
				{
					$match: {
						$expr: {
							$in: ['$restaurant', restaurantIds],
						},
					},
				},
				{
					$group: {
						_id: '$restaurant',
						count: { $sum: 1 },
						total: { $sum: '$price.total' },
					},
				},
				{
					$lookup: {
						from: 'restaurants',
						localField: '_id',
						foreignField: '_id',
						as: 'restaurant',
					},
				},
				{ $unwind: '$restaurant' },
				{
					$set: {
						name: '$restaurant.name',
						city: '$restaurant.city',
					},
				},
				{ $unset: ['restaurant'] },
			])

			if (orderCountByLocations.length == 0) {
				res.status(404).json({
					status: 1,
					message: 'No orders found in the restaurants for this owner.',
				})
				return
			} else {
				res.json({
					status: 1,
					report_key: reportKey,
					orderByLocation: orderCountByLocations,
				})
			}
		} else if (reportKey == 'top_customers') {
			const topCustomers = await Order.aggregate([
				{
					$match: {
						$expr: {
							$eq: ['$restaurant', ObjectId(restaurantId)],
						},
					},
				},
				{
					$group: {
						_id: '$customer',
						count: { $sum: 1 },
						totalAmount: { $sum: '$price.total' },
					},
				},
				{
					$lookup: {
						from: 'users',
						localField: '_id',
						foreignField: '_id',
						as: 'customer',
					},
				},
				{ $sort: { count: -1 } },
				{ $limit: 10 },
				{ $unset: ['customer.hash', 'customer.salt', 'customer.saltKey'] },
			])

			if (!topCustomers.length) {
				return res
					.status(404)
					.json({ status: 0, message: 'No top customers found' })
			}

			res.json({
				status: 1,
				report_key: reportKey,
				topCustomers,
			})
		} else if (reportKey == 'total_purchases') {
			const warehouseRecords = await WarehouseOrderModal.aggregate([
				{
					$match: {
						restaurant: ObjectId(restaurantId),
					},
				},
				{
					$group: {
						_id: null,
						totalAmount: { $sum: '$amount' },
						totalCounts: { $sum: 1 },
					},
				},
				{
					$unset: '_id',
				},
			]).exec()

			const inventoryRecords = await InventoryOrder.aggregate([
				{
					$match: {
						restaurant: ObjectId(restaurantId),
					},
				},
				{
					$group: {
						_id: null,
						totalAmount: { $sum: '$amount' },
						totalCounts: { $sum: 1 },
					},
				},
				{
					$unset: '_id',
				},
			]).exec()

			let totalWarehouseOrderAmount = 0
			let totalWarehouseOrderCount = 0
			let totalInventoryOrderAmount = 0
			let totalInventoryOrderCount = 0
			if (warehouseRecords.length === 1) {
				totalWarehouseOrderAmount = warehouseRecords[0]['totalAmount']
				totalWarehouseOrderCount = warehouseRecords[0]['totalCounts']
			}

			if (inventoryRecords.length === 1) {
				totalInventoryOrderAmount = inventoryRecords[0]['totalAmount']
				totalInventoryOrderCount = inventoryRecords[0]['totalCounts']
			}

			res.status(200).json({
				status: 1,
				message: 'Report analytics data for total purchases.',
				reportType: reportKey,
				totalPurchases: {
					warehouseOrders: {
						totalOrders: totalWarehouseOrderCount,
						totalAmount: totalWarehouseOrderAmount,
					},
					inventoryOrders: {
						totalOrders: totalInventoryOrderCount,
						totalAmount: totalInventoryOrderAmount,
					},
					totalPurchaseOrders:
						Number(totalWarehouseOrderCount) + Number(totalInventoryOrderCount),
					totalPurchaseAmount:
						Number(totalWarehouseOrderAmount) +
						Number(totalInventoryOrderAmount),
				},
			})
		} else if (reportKey == 'total_orders') {
			const restaurantIds = restaurantList.map((restaurant) => restaurant._id)

			const totalOrders = await Order.aggregate([
				{
					$match: {
						$expr: {
							$in: ['$restaurant', restaurantIds],
						},
					},
				},
				{
					$group: {
						_id: '$restaurant',
						count: { $sum: 1 },
						totalAmount: { $sum: '$price.total' },
					},
				},
				{
					$lookup: {
						from: 'restaurants',
						let: { restaurantId: '$_id' },
						pipeline: [
							{ $match: { $expr: { $eq: ['$_id', '$$restaurantId'] } } },
							{ $project: { name: 1 } },
						],
						as: 'restaurant',
					},
				},
				{ $sort: { totalAmount: -1 } },
			])

			res.json({
				message: 'total orders',
				report_key: reportKey,
				totalOrders,
			})
			return
		} else if (reportKey == 'number_of_persons_served') {
			const restaurantIds = restaurantList.map(({ _id }) => _id)

			let orderData = await Order.aggregate([
				{
					$match: {
						restaurant: { $in: restaurantIds },
					},
				},
				{
					$project: {
						count: { $size: '$guests' },
					},
				},
				{
					$group: {
						_id: null,
						totalServed: { $sum: '$count' },
					},
				},
				{
					$unset: '_id',
				},
			])

			if (orderData.length === 0) {
				res.status(404).json({
					status: 0,
					message: 'no guest found.',
					reportType: reportKey,
				})
			} else {
				res.json({
					status: 1,
					message: 'total served',
					reportType: reportKey,
					totalPersonServed: orderData[0],
				})
			}
			return
		} else if (reportKey == 'staff_attendance_report') {
			const staffList = await AttendanceModal.aggregate([
				{ $match: { restaurant: ObjectId(restaurantId) } },
				{
					$group: {
						_id: '$staffMember',
						attendance: {
							$push: {
								date: '$date',
								inTime: '$inTime',
								outTime: '$outTime',
								breakTime: '$breakTime',
							},
						},
					},
				},
				{
					$lookup: {
						from: 'staffmembers',
						let: { staffMemberId: '$_id' },
						pipeline: [
							{ $match: { $expr: { $eq: ['$_id', '$$staffMemberId'] } } },
							{ $project: { name: 1, category: 1, mobile: 1 } },
						],
						as: 'staffMember',
					},
				},
			])

			if (staffList.length == 0) {
				res.status(404).json({
					message: 'Data is not found',
				})
			} else {
				res.json({
					status: 1,
					message: 'Staff attendance data.',
					reportType: reportKey,
					staffAttendance: staffList,
				})
			}
		} else if (reportKey == 'total_reservations') {
			const reservations = await Order.aggregate([
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$restaurant', ObjectId(restaurantId)] },
								{ $eq: ['$orderType', 'dine-in'] },
								{ $eq: [{ $size: '$items' }, 0] },
							],
						},
					},
				},
				{
					$group: {
						_id: null,
						mainCount: { $sum: 1 },
					},
				},
				{
					$unset: '_id',
				},
			])
			if (reservations.length == 0) {
				res.status(404).json({
					status: 0,
					report_key: reportKey,
					message: 'No reservations found.',
				})
			} else {
				let mainCount = reservations[0]['mainCount']
				res.status(404).json({
					status: 1,
					message: 'total reservation data',
					report_key: reportKey,
					totalReservations: mainCount,
				})
			}
		} else if (reportKey == 'confirmed_reservations') {
			const totalReservations = await Order.aggregate([
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$restaurant', ObjectId(restaurantId)] },
								{ $eq: ['$orderType', 'dine-in'] },
								{ $eq: [{ $size: '$items' }, 0] },
								{ $eq: ['$orderStatus', 'confirmed'] },
							],
						},
					},
				},
				{
					$group: {
						_id: null,
						mainCount: { $sum: 1 },
					},
				},
				{
					$unset: '_id',
				},
			])
			if (totalReservations.length == 0) {
				res.status(404).json({
					status: 0,
					report_key: reportKey,
					message: 'No confirmed reservations found.',
				})
			} else {
				let mainCount = totalReservations[0]['mainCount']
				res.status(404).json({
					status: 1,
					message: 'Total confirmed reservation data',
					report_key: reportKey,
					totalReservations: mainCount,
				})
			}
		} else if (reportKey == 'top_menu_items') {
			const items = await Order.aggregate([
				{ $match: { $expr: { $eq: ['$restaurant', ObjectId(restaurantId)] } } },
				{ $unwind: '$items' },
				{
					$group: {
						_id: { item: '$items.item', combo: '$items.combo' },
						count: { $sum: 1 },
						totalAmount: { $sum: '$items.totalPrice.total' },
					},
				},
				{ $set: { item: '$_id.item', combo: '$_id.combo' } },
				{
					$lookup: {
						from: 'menuitems',
						let: { menuItemId: '$item' },
						pipeline: [
							{ $match: { $expr: { $eq: ['$_id', '$$menuItemId'] } } },
							{ $project: { name: 1, image: 1, price: 1 } },
						],
						as: 'menuItem',
					},
				},
				{
					$lookup: {
						from: 'bundleitems',
						let: { bundleItemId: '$item' },
						pipeline: [
							{ $match: { $expr: { $eq: ['$_id', '$$bundleItemId'] } } },
							{ $project: { name: 1, image: 1, price: 1 } },
						],
						as: 'bundleItem',
					},
				},
				{ $sort: { count: -1 } },
				{ $unset: ['_id'] },
				{ $limit: 10 },
			])

			if (!items.length) {
				return res.status(404).json({
					status: 0,
					message: 'No items found for this restaurant',
				})
			}

			res.json({
				status: 1,
				report_key: reportKey,
				message: 'menu wise order items',
				menuItemsByOrder: items,
			})
			return
		} else if (reportKey === 'end_of_day_report') {
			const yesterdayOrders = await Order.aggregate([
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$restaurant', ObjectId(restaurantId)] },
								{
									$gte: [
										'$deliveryTime',
										new Date(
											moment().subtract(1, 'd').format('YYYY-MM-DDT') + '00:00',
										),
									],
								},
								{
									$lt: [
										'$deliveryTime',
										new Date(
											moment().subtract(1, 'd').format('YYYY-MM-DDT') + '23:59',
										),
									],
								},
							],
						},
					},
				},
				{
					$group: {
						_id: null,
						count: { $sum: 1 },
						totalAmount: { $sum: '$price.total' },
						itemCount: {
							$sum: {
								$reduce: {
									input: '$items.quantity',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
					},
				},
				{ $unset: ['_id'] },
			])
			const order = await Order.aggregate([
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$restaurant', ObjectId(restaurantId)] },
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
						count: { $sum: 1 },
						totalAmount: { $sum: '$price.total' },
						itemCount: {
							$sum: {
								$reduce: {
									input: '$items.quantity',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
					},
				},
				{ $unset: ['_id'] },
			])

			const warehouseOrders = await WarehouseOrderModal.aggregate([
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$restaurant', ObjectId(restaurantId)] },
								{
									$gte: [
										'$createdAt',
										new Date(moment().format('YYYY-MM-DDT') + '00:00'),
									],
								},
								{
									$lt: [
										'$createdAt',
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
						count: { $sum: 1 },
						totalAmount: { $sum: '$amount' },
					},
				},
				{ $unset: ['_id'] },
			])

			if (!order.length) {
				return res.status(404).json({
					status: 0,
					message: 'No order placed today to generate business report',
				})
			}

			const prevEarning = yesterdayOrders[0]?.totalAmount || 0
			const prevOrderCount = yesterdayOrders[0]?.count || 0

			const warehouseOrderCount = warehouseOrders[0]?.count || 0
			const warehouseOrderTotal = warehouseOrders[0]?.totalAmount || 0

			res.json({
				status: 1,
				report_key: reportKey,
				message: 'end of the day business report',
				business_report: {
					...order[0],
					sellsAvg:
						prevEarning === 0
							? 100
							: (order[0].totalAmount * 100) / prevEarning,
					orderCountAvg:
						prevOrderCount === 0
							? 100
							: (order[0].count * 100) / prevOrderCount,
					warehouseOrderCount,
					warehouseOrderTotal,
				},
			})
		} else if (reportKey === 'total_sales') {
			const orders = await Order.aggregate([
				{ $match: { $expr: { $eq: ['$restaurant', ObjectId(restaurantId)] } } },
				{
					$group: {
						_id: null,
						count: { $sum: 1 },
						totalAmount: { $sum: '$price.total' },
						itemCount: {
							$sum: {
								$reduce: {
									input: '$items.quantity',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
						itemTotal: {
							$sum: {
								$reduce: {
									input: '$items.totalPrice.itemPrice',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
					},
				},
				{ $unset: ['_id'] },
			])

			if (!orders.length) {
				return res.status(404).json({
					status: 0,
					message: 'No orders found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'Total sales',
				orders,
			})
		} else if (reportKey === 'kitchen_reports') {
			const orders = await Order.aggregate([
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$restaurant', ObjectId(restaurantId)] },
								{
									$in: ['$orderStatus', ['preparing', 'accepted', 'completed']],
								},
							],
						},
					},
				},
				{
					$group: {
						_id: '$orderStatus',
						status: { $first: '$orderStatus' },
						count: { $sum: 1 },
						orders: { $push: '$$ROOT' },
						totalAmount: { $sum: '$price.total' },
					},
				},
				{ $unset: ['_id'] },
			])

			if (!orders.length) {
				return res.status(404).json({
					status: 0,
					message: 'No kitchen reports found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'Kitchen reports',
				orders,
			})
		} else if (reportKey === 'trending_items') {
			const menuItems = await MenuItemsModal.aggregate([
				{
					$match: {
						$expr: {
							$eq: ['$restaurant', ObjectId(restaurantId)],
						},
					},
				},
				{
					$lookup: {
						from: 'orders',
						let: { menuItemId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $in: ['$$menuItemId', '$items.item'] },
											{
												$gte: [
													'$deliveryTime',
													new Date(
														moment().subtract(7, 'd').format('YYYY-MM-DDT') +
															'00:00',
													),
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
							{ $count: 'count' },
						],
						as: 'orders',
					},
				},
				{ $unwind: '$orders' },
				{
					$set: {
						orders: '$orders.count',
					},
				},
				{ $sort: { orders: -1 } },
			])
			const bundleItems = await BundleItem.aggregate([
				{
					$match: {
						$expr: {
							$eq: ['$restaurant', ObjectId(restaurantId)],
						},
					},
				},
				{
					$lookup: {
						from: 'orders',
						let: { bundleItemId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $in: ['$$bundleItemId', '$items.combo'] },
											{
												$gte: [
													'$deliveryTime',
													new Date(
														moment().subtract(7, 'd').format('YYYY-MM-DDT') +
															'00:00',
													),
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
							{ $count: 'count' },
						],
						as: 'orders',
					},
				},
				{ $unwind: '$orders' },
				{
					$set: {
						orders: '$orders.count',
					},
				},
				{ $sort: { orders: -1 } },
			])

			if (!menuItems.length && !bundleItems.length) {
				return res.status(404).json({
					status: 0,
					message: 'No trending items found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'Trending items',
				menuItems,
				bundleItems,
			})
		} else if (reportKey === 'delivery_report') {
			const orders = await Order.aggregate([
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$restaurant', ObjectId(restaurantId)] },
								{
									$eq: ['$orderType', 'delivery'],
								},
							],
						},
					},
				},
				{ $sort: { deliveryTime: -1 } },
			])

			if (!orders.length) {
				return res.status(404).json({
					status: 0,
					message: 'No delivery report found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'Delivery report',
				orders,
			})
		} else if (reportKey === 'cogs_by_location') {
			const restaurantIds = restaurantList.map((restaurant) => restaurant._id)

			const orders = await Order.aggregate([
				{
					$match: {
						$expr: {
							$and: [
								{ $in: ['$restaurant', restaurantIds] },
								{
									$eq: [{ $year: '$deliveryTime' }, { $year: '$$NOW' }],
								},
							],
						},
					},
				},

				{
					$group: {
						_id: '$restaurant',
						itemCount: {
							$sum: {
								$reduce: {
									input: '$items.quantity',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
						itemTotal: {
							$sum: {
								$reduce: {
									input: '$items.totalPrice.itemPrice',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
					},
				},
			])

			if (!orders.length) {
				return res.status(404).json({
					status: 0,
					message: 'No COGS report found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'COGS',
				orders,
			})
		} else if (reportKey === 'cogs_by_branch') {
			const orders = await Order.aggregate([
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$restaurant', ObjectId(restaurantId)] },
								{
									$eq: [{ $year: '$deliveryTime' }, { $year: '$$NOW' }],
								},
							],
						},
					},
				},
				{
					$group: {
						_id: null,
						itemCount: {
							$sum: {
								$reduce: {
									input: '$items.quantity',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
						itemTotal: {
							$sum: {
								$reduce: {
									input: '$items.totalPrice.itemPrice',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
					},
				},
				{ $unset: ['_id'] },
			])

			if (!orders.length) {
				return res.status(404).json({
					status: 0,
					message: 'No COGS report found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'COGS',
				orders: orders[0],
			})
		} else if (reportKey === 'wastage_cost_report') {
			const wastage = await MenuItemsModal.aggregate([
				{ $match: { $expr: { $eq: ['$restaurant', ObjectId(restaurantId)] } } },
				{
					$group: {
						_id: '$_id',
						ingredients: { $sum: { $size: '$ingredient' } },
						totalWaste: {
							$sum: {
								$reduce: {
									input: '$ingredient.wastage',
									initialValue: 0,
									in: { $add: ['$$value', '$$this'] },
								},
							},
						},
						totalAmount: { $sum: '$price' },
					},
				},
				{
					$lookup: {
						from: 'menuitems',
						localField: '_id',
						foreignField: '_id',
						as: 'menuItem',
					},
				},
				{
					$set: {
						wasteAmount: {
							$divide: [{ $multiply: ['$totalAmount', '$totalWaste'] }, 100],
						},
						menuItem: { $arrayElemAt: ['$menuItem', 0] },
					},
				},
			])

			if (!wastage.length) {
				return res.status(404).json({
					status: 0,
					message: 'No wastage cost report found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'Wastage cost report',
				wastage,
			})
		} else if (reportKey === 'top_profitable_items') {
			const profitableMenuItems = await MenuItemsModal.aggregate([
				{
					$match: {
						$expr: {
							$eq: ['$restaurant', ObjectId(restaurantId)],
						},
					},
				},
				{
					$lookup: {
						from: 'orders',
						let: { menuItemId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [{ $in: ['$$menuItemId', '$items.item'] }],
									},
								},
							},
							{
								$group: {
									_id: '$items.item',
									totalAmount: {
										$sum: {
											$reduce: {
												input: '$items.totalPrice.itemPrice',
												initialValue: 0,
												in: { $add: ['$$value', '$$this'] },
											},
										},
									},
								},
							},
						],
						as: 'orders',
					},
				},
				{ $unwind: '$orders' },
				{ $set: { orderAmount: '$orders.totalAmount' } },
				{ $unset: ['orders'] },
				{ $sort: { orderAmount: -1 } },
				{ $limit: 10 },
			])

			const profitableComboItems = await BundleItem.aggregate([
				{
					$match: {
						$expr: {
							$eq: ['$restaurant', ObjectId(restaurantId)],
						},
					},
				},
				{
					$lookup: {
						from: 'orders',
						let: { bundleItemId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [{ $in: ['$$bundleItemId', '$items.combo'] }],
									},
								},
							},
							{
								$group: {
									_id: '$items.combo',
									totalAmount: {
										$sum: {
											$reduce: {
												input: '$items.totalPrice.itemPrice',
												initialValue: 0,
												in: { $add: ['$$value', '$$this'] },
											},
										},
									},
								},
							},
						],
						as: 'orders',
					},
				},
				{ $unwind: '$orders' },
				{ $set: { orderAmount: '$orders.totalAmount' } },
				{ $unset: ['orders'] },
				{ $sort: { orderAmount: -1 } },
				{ $limit: 10 },
			])

			if (!profitableMenuItems.length && !profitableComboItems.length) {
				return res.status(404).json({
					status: 0,
					message: 'No profitable items report found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'Top profitable items',
				profitableMenuItems,
				profitableComboItems,
			})
		} else if (reportKey === 'top_selling_items') {
			const restaurantIds = restaurantList.map((restaurant) => restaurant._id)

			const sellingMenuItems = await MenuItemsModal.aggregate([
				{
					$match: {
						$expr: {
							$in: ['$restaurant', restaurantIds],
						},
					},
				},
				{
					$lookup: {
						from: 'orders',
						let: { menuItemId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [{ $in: ['$$menuItemId', '$items.item'] }],
									},
								},
							},
							{
								$group: {
									_id: '$items.item',
									totalAmount: {
										$sum: {
											$reduce: {
												input: '$items.totalPrice.itemPrice',
												initialValue: 0,
												in: { $add: ['$$value', '$$this'] },
											},
										},
									},
								},
							},
						],
						as: 'orders',
					},
				},
				{ $unwind: '$orders' },
				{ $set: { orderAmount: '$orders.totalAmount' } },
				{ $unset: ['orders'] },
				{ $sort: { orderAmount: -1 } },
				{
					$group: {
						_id: '$restaurant',
						items: { $push: '$$ROOT' },
					},
				},
			])

			const sellingComboItems = await BundleItem.aggregate([
				{
					$match: {
						$expr: {
							$in: ['$restaurant', restaurantIds],
						},
					},
				},
				{
					$lookup: {
						from: 'orders',
						let: { bundleItemId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [{ $in: ['$$bundleItemId', '$items.combo'] }],
									},
								},
							},
							{
								$group: {
									_id: '$items.combo',
									totalAmount: {
										$sum: {
											$reduce: {
												input: '$items.totalPrice.itemPrice',
												initialValue: 0,
												in: { $add: ['$$value', '$$this'] },
											},
										},
									},
								},
							},
						],
						as: 'orders',
					},
				},
				{ $unwind: '$orders' },
				{ $set: { orderAmount: '$orders.totalAmount' } },
				{ $unset: ['orders'] },
				{ $sort: { orderAmount: -1 } },
				{
					$group: {
						_id: '$restaurant',
						items: { $push: '$$ROOT' },
					},
				},
			])

			if (!sellingMenuItems.length && !sellingComboItems.length) {
				return res.status(404).json({
					status: 0,
					message: 'No selling items report found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'Top profitable items',
				sellingMenuItems,
				sellingComboItems,
			})
		} else if (reportKey === 'stock_report') {
			const inventory = await InventoryItemsModal.aggregate([
				{
					$match: {
						$expr: {
							$eq: ['$restaurant', ObjectId(restaurantId)],
						},
					},
				},
				{ $sort: { expiry: 1 } },
			])

			if (!inventory.length) {
				return res.status(404).json({
					status: 0,
					message: 'No stock report found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'Stock items',
				inventory,
			})
		} else if (reportKey === 'total_discounts') {
			const menuItems = await MenuItemsModal.aggregate([
				{
					$match: {
						$expr: {
							$eq: ['$restaurant', ObjectId(restaurantId)],
						},
					},
				},
				{
					$group: {
						_id: null,
						count: { $sum: 1 },
						totalDiscount: { $sum: '$discount' },
					},
				},
				{ $set: { avgDiscount: { $divide: ['$totalDiscount', '$count'] } } },
				{ $unset: ['_id'] },
			])

			if (!menuItems.length) {
				return res.status(404).json({
					status: 0,
					message: 'No discount report found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'Total discounts report',
				discounts: menuItems,
			})
		} else if (reportKey === 'table_wise_sales') {
			const tables = await Table.aggregate([
				{
					$match: {
						$expr: {
							$eq: ['$restaurant', ObjectId(restaurantId)],
						},
					},
				},
				{
					$lookup: {
						from: 'orders',
						let: { tableId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [{ $in: ['$$tableId', '$table'] }],
									},
								},
							},
							{
								$group: {
									_id: null,
									totalAmount: {
										$sum: '$price.total',
									},
									count: { $sum: 1 },
								},
							},
						],
						as: 'orders',
					},
				},
				{
					$project: {
						tableNo: 1,
						capacity: 1,
						costPerson: 1,
						orders: 1,
					},
				},
				{
					$set: {
						orderCount: {
							$ifNull: [{ $arrayElemAt: ['$orders.count', 0] }, 0],
						},
						orderTotal: {
							$ifNull: [{ $arrayElemAt: ['$orders.totalAmount', 0] }, 0],
						},
					},
				},
				{ $unset: ['orders'] },
			])

			if (!tables.length) {
				return res.status(404).json({
					status: 0,
					message: 'No table wise sells report found',
				})
			}

			res.status(200).json({
				status: 1,
				message: 'Table wise sell report',
				tables,
			})
		} else
			res.status(404).json({
				status: 0,
				report_key: reportKey,
				message: 'report key is invalid',
			})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	getMonthlyEarning,
	getCustomerReport,
	getBranchProfitability,
	getReports,
}
