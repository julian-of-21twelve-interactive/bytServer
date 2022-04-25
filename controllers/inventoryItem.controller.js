const { ObjectId } = require('mongodb')
const InventoryItem = require('../models/inventoryItem.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')
const { getAmount, convertAmount } = require('../utils/currencyConverter.util')

const addInventoryItem = async (req, res) => {
	const { currency } = req.query
	const {
		name,
		itemGroup,
		restaurant,
		price,
		lastPurchase,
		onHand,
		type,
		status,
		quantity,
		expiry,
	} = req.body

	if (currency) price = await getAmount(currency, 'USD', price)

	try {
		const inventoryItem = new InventoryItem({
			name,
			itemGroup,
			restaurant,
			price,
			lastPurchase,
			onHand,
			type,
			status,
			quantity,
			image: req.file.path,
			expiry,
		})

		await inventoryItem.save()

		res.status(201).json({
			status: 1,
			message: 'Inventory item added successfully',
			inventoryItem,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllInventoryItem = async (req, res) => {
	const { page = 1 } = req.query
	const { currency } = req.query

	try {
		const inventoryItems = await InventoryItem.aggregate([
			{ $sort: { createdAt: -1 } },
			{ $skip: (page - 1) * 10 },
			{ $limit: 10 },
			{
				$lookup: {
					from: 'itemgroups',
					localField: 'itemGroup',
					foreignField: '_id',
					as: 'itemGroup',
				},
			},
			{
				$set: {
					itemGroup: { $arrayElemAt: ['$itemGroup', 0] },
				},
			},
		])

		if (!inventoryItems.length) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory items found',
				inventoryItems_count: inventoryItems.length,
			})
		}

		if (currency)
			for (let i = 0; i < inventoryItems.length; i++) {
				inventoryItems[i] = await convertAmount(
					inventoryItems[i],
					'price',
					'usd',
					currency,
				)
			}

		res.status(200).json({
			status: 1,
			message: 'List of all inventory item',
			inventoryItems_count: inventoryItems.length,
			inventoryItems: inventoryItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getInventoryItem = async (req, res) => {
	const { currency } = req.query
	try {
		const inventoryItem = await InventoryItem.aggregate([
			{ $match: { _id: ObjectId(req.params.inventoryItemId) } },
			{
				$lookup: {
					from: 'itemgroups',
					localField: 'itemGroup',
					foreignField: '_id',
					as: 'itemGroup',
				},
			},
			{
				$set: {
					itemGroup: { $arrayElemAt: ['$itemGroup', 0] },
				},
			},
		])

		if (!inventoryItem.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No inventory item found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Inventory item data.',
			inventoryItem: currency
				? await convertAmount(inventoryItem[0], 'price', 'usd', currency)
				: inventoryItem[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateInventoryItem = async (req, res) => {
	const {
		name,
		itemGroup,
		restaurant,
		lastPurchase,
		onHand,
		type,
		status,
		quantity,
		expiry,
	} = req.body

	let image = req.file?.path

	if (!image) {
		const inventoryItemData = await InventoryItem.findOne(
			{ _id: req.params.inventoryItemId },
			'-_id image',
		)

		if (!inventoryItemData) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory item with this id',
			})
		}

		image = inventoryItemData.image
	}

	try {
		const inventoryItem = await InventoryItem.findByIdAndUpdate(
			req.params.inventoryItemId,
			{
				name,
				itemGroup,
				restaurant,
				lastPurchase,
				onHand,
				type,
				status,
				quantity,
				expiry,
				image,
			},
		)

		if (!inventoryItem) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory item with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Inventory item updated successfully',
			inventoryItem,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteInventoryItem = async (req, res) => {
	try {
		const inventoryItem = await InventoryItem.findByIdAndDelete(
			req.params.inventoryItemId,
		)

		if (!inventoryItem) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory item with this group id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Inventory item removed successfully',
			inventoryItem,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchInventoryItem = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const inventoryItems = await paginate(req, InventoryItem, [
			await searchMatchPipeline(InventoryItem, field, search, where),
		])

		if (!inventoryItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory items found',
				inventoryItems_count: inventoryItems.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Search list of inventory items.',
			inventoryItems_count: inventoryItems.totalDocs,
			inventoryItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getInventoryItemsByRestaurant = async (req, res) => {
	const { currency } = req.query
	try {
		const inventoryItems = await paginate(req, InventoryItem, [
			{
				$match: {
					$expr: {
						$eq: ['$restaurant', { $toObjectId: req.params.restaurantId }],
					},
				},
			},
			{
				$lookup: {
					from: 'itemgroups',
					localField: 'itemGroup',
					foreignField: '_id',
					as: 'itemGroup',
				},
			},
		])

		if (!inventoryItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory items found',
				inventoryItems_count: inventoryItems.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of restaurant inventory items',
			inventoryItems_count: inventoryItems.totalDocs,
			inventoryItems: currency
				? await convertAmount(inventoryItems, 'price', 'usd', currency)
				: inventoryItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addInventoryItem,
	getAllInventoryItem,
	getInventoryItem,
	updateInventoryItem,
	deleteInventoryItem,
	searchInventoryItem,
	getInventoryItemsByRestaurant,
}
