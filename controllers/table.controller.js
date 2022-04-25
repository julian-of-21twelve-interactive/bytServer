const { ObjectId } = require('mongodb')
const Table = require('../models/table.model')
const Order = require('../models/order.model')
const Restaurant = require('../models/restaurant.model')
const paginate = require('../utils/aggregatePaginate.util')

const SocketDispatch = require('../socket-handler/handler')
const ACTIONS = require('../socket-handler/actions')

const getAllTables = async (req, res) => {
	const tables = await paginate(req, Table, [{ $sort: { createdAt: 1 } }])

	if (!tables.totalDocs) {
		let response = {
			status: 0,
			tables_count: tables.totalDocs,
			message: 'No tables found',
		}
		SocketDispatch(req, { type: ACTIONS.TABLES.GET_ALL, payload: response })
		return res.status(404).json(response)
	} else {
		let response = {
			status: 1,
			tables_count: tables.totalDocs,
			table_details: tables,
		}
		SocketDispatch(req, { type: ACTIONS.TABLES.GET_ALL, payload: response })
		return res.status(200).json(response)
	}
}

const getTablesByRestaurant = async (req, res) => {
	const { restaurantId, floorType, timestamp } = req.params

	try {
		const tables = await paginate(req, Table, [
			{
				$match: {
					$expr: {
						$and: [
							{
								$eq: ['$restaurant', ObjectId(restaurantId)],
							},
							{
								$or: [
									{ $eq: [floorType, 'all'] },
									{ $eq: ['$floorType', floorType] },
								],
							},
						],
					},
				},
			},
			{ $sort: { createdAt: -1 } },
		])

		if (!tables.totalDocs) {
			let response = {
				status: 0,
				tables_count: tables.totalDocs,
				message: 'No tables found',
			}
			SocketDispatch(req, {
				type: ACTIONS.TABLES.GET_BY_RES,
				payload: response,
			})

			return res.status(404).json(response)
		}

		let table_keys = {}
		if (timestamp) {
			const orders = await Order.aggregate([
				{
					$match: {
						restaurant: ObjectId(restaurantId),
						deliveryTime: {
							$gte: new Date(timestamp),
							$lte: new Date(timestamp),
						},
					},
				},
			])

			let availableCount = tables.totalDocs
			for (const table of tables.result) {
				const order = orders.find((order) => {
					const tableArr = order.table.map((t) => t.toString())
					return tableArr.includes(table._id.toString())
				})

				if (order) availableCount -= 1
				table.tableStatus = table.bookingStatus
					? 'occupied'
					: order
					? 'reserved'
					: 'available'
			}

			const restaurant = await Restaurant.findOne({
				_id: ObjectId(restaurantId),
			}).select('seatingPreference')

			table_keys = {
				availableCount,
				occupiedCount: tables.totalDocs - availableCount,
				seatingPreference: restaurant._doc.seatingPreference,
			}
		}

		let response = {
			status: 1,
			tables_count: tables.totalDocs,
			table_keys,
			table_details: tables,
		}
		SocketDispatch(req, { type: ACTIONS.TABLES.GET_BY_RES, payload: response })

		res.status(200).json({
			status: 1,
			message: 'List of all restaurant tables.',
			tables_count: tables.totalDocs,
			table_keys,
			table_details: tables,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getTable = async (req, res) => {
	const table = await Table.findOne({ _id: req.params.tableId })

	if (!table) {
		let response = { status: 0, message: 'No tables found' }
		SocketDispatch(req, { type: ACTIONS.TABLES.GET, payload: response })
		return res.status(404).json({ status: 0, message: 'No tables found' })
	} else {
		let response = { status: 1, table_details: table }
		SocketDispatch(req, { type: ACTIONS.TABLES.GET, payload: response })
		return res
			.status(200)
			.json({ status: 1, message: 'Table information.', table_details: table })
	}
}

const addTable = async (req, res) => {
	const {
		tableNo,
		capacity,
		restaurant,
		bookingStatus,
		costPerson,
		floorType,
		position,
	} = req.body

	const checkTable = await Table.findOne({
		tableNo,
		restaurant,
	}).countDocuments()

	if (checkTable > 0) {
		return res.status(400).json({
			status: 0,
			message: 'Duplicate entry for table number: ' + tableNo,
		})
	}

	const table = new Table({
		tableNo,
		capacity,
		restaurant,
		bookingStatus,
		costPerson,
		floorType,
		position,
	})

	try {
		await table.save()

		let response = { status: 1, message: 'Table created', tableDetails: table }

		SocketDispatch(req, { type: ACTIONS.TABLES.ADD, payload: response })

		return res.status(201).json(response)
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
		// return res.status(500).json({ status: 0, error: err.message })
	}
}

const updateTable = async (req, res) => {
	const {
		tableNo,
		capacity,
		restaurant,
		bookingStatus,
		costPerson,
		floorType,
		position,
	} = req.body

	try {
		const table = await Table.findByIdAndUpdate(req.params.tableId, {
			tableNo,
			capacity,
			restaurant,
			bookingStatus,
			costPerson,
			floorType,
			position,
		})

		if (!table) {
			return res
				.status(404)
				.json({ status: 0, message: 'No table found with this TableId' })
		} else {
			let response = {
				status: 1,
				message: 'Table updated',
				table_details: table,
			}

			SocketDispatch(req, { type: ACTIONS.TABLES.UPDATE, payload: response })

			return res.status(200).json(response)
		}
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
		// return res.status(404).json({ status: 0, message: 'No tables found' })
	}
}

const deleteTable = async (req, res) => {
	try {
		const table = await Table.findByIdAndDelete(req.params.tableId)
		if (!table) {
			return res
				.status(404)
				.json({ status: 0, message: 'No table found with this TableId' })
		} else if (table.deleteCount === 0) {
			return res
				.status(404)
				.json({ status: 0, message: 'Error deleting this table' })
		} else {
			let response = { message: 'table deleted successfully', table }
			SocketDispatch(req, { type: ACTIONS.TABLES.DELETE, payload: response })
			return res.status(200).json({
				status: 1,
				message: 'table deleted successfully',
				table_details: table,
			})
		}
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
		// return res.status(500).json({ status: 0, error: error })
	}
}

const getAvailableTablesByRestaurant = async (req, res) => {
	const { restaurantId } = req.params
	const { timestamp } = req.body

	try {
		const tables = await paginate(req, Table, [
			{ $match: { restaurant: ObjectId(restaurantId) } },
		])

		if (!tables.totalDocs) {
			let response = {
				status: 0,
				tables_count: tables.totalDocs,
				message: 'No tables available for this restaurant',
			}
			SocketDispatch(req, {
				type: ACTIONS.TABLES.GET_AVAILABLE_TABLE_BY_RES,
				payload: response,
			})
			return res.status(404).json(response)
		}

		const orders = await Order.aggregate([
			{
				$match: {
					restaurant: ObjectId(restaurantId),
					deliveryTime: {
						$gte: new Date(timestamp),
						$lte: new Date(timestamp),
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
			{ $unwind: '$customer' },
			{ $set: { customer: '$customer.name' } },
		])

		tables.result.map((table) => {
			const status = orders.findIndex((order) => {
				order.table = order.table.map((t) => t.toString())
				return order.table.includes(table._id.toString())
			})

			table.availableStatus = status === -1 ? 'available' : 'reserved'
			table.customer = status !== -1 ? orders[status].customer : ''
		})

		let response = {
			status: 1,
			message: ' Tables of restaurants.',
			tables_count: tables.totalDocs,
			tables,
		}
		SocketDispatch(req, {
			type: ACTIONS.TABLES.GET_AVAILABLE_TABLE_BY_RES,
			payload: response,
		})
		res.status(200).json(response)
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	getAllTables,
	getTablesByRestaurant,
	getTable,
	addTable,
	updateTable,
	deleteTable,
	getAvailableTablesByRestaurant,
}
