const { ObjectId } = require('mongodb')
const SupplierItems = require('../models/supplierItem.model')
const paginate = require('../utils/aggregatePaginate.util')
const { convertAmount, getAmount } = require('../utils/currencyConverter.util')

const addItem = async (req, res, next) => {
	let { currency } = req.query
	try {
		let { name, price, sku, supplier } = req.body

		if (currency) price = getAmount(currency, 'usd', price)

		var supplieritems = new SupplierItems({
			name,
			price,
			sku,
			supplier,
			image: req.file?.path,
		})
		const result = await supplieritems.save()
		return res.send({ status: 1, message: 'Item is added.', item: result })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
		// let response = {
		// 	message: err.message,
		// 	status: 0
		// }
		// return res.status(404).send(response)
	}
}

const updateItemById = async (req, res, next) => {
	const { currency } = req.query
	try {
		let { name, price, sku, supplier } = req.body

		if (currency) price = getAmount(currency, 'usd', price)

		const item = await SupplierItems.findByIdAndUpdate(req.params.itemId, {
			name,
			price,
			sku,
			supplier,
			image: req.file?.path,
		})

		return res
			.status(200)
			.json({ status: 1, message: 'Items is updated.', item })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
		// let response = {
		// 	message: err.message,
		// 	status: 0
		// }
		// return res.status(404).send(response)
	}
}

const deleteItem = async (req, res) => {
	try {
		const item = await SupplierItems.findByIdAndDelete(req.params.itemId)

		if (!item) {
			return res.status(404).json({
				status: 0,
				message: 'No item with this id',
			})
		}

		return res
			.status(200)
			.json({ status: 1, message: 'item deleted successfully', item })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}
//- TODO: require to check this api.
//- ISSUE: Implemented the function but not getting converted values in response
const getItemById = async (req, res) => {
	const { currency } = req.query

	try {
		const item = await SupplierItems.findOne({ _id: req.params.itemId })

		if (!item) {
			return res.status(404).json({ status: 0, message: 'item not found' })
		}

		return res.json({
			status: 1,
			message: 'Item details.',
			item: currency
				? await convertAmount(item._doc, 'price', 'usd', currency)
				: item,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllItems = async (req, res) => {
	const { currency } = req.query
	try {
		const item = await paginate(req, SupplierItems, [
			{ $sort: { createdAt: -1 } },
		])

		if (!item.totalDocs) {
			return res.status(404).json({ status: 0, message: 'Item not found' })
		}

		return res.status(200).json({
			status: 1,
			message: 'List of all items.',
			item_count: item.totalDocs,
			item: currency
				? await convertAmount(item, 'price', 'usd', currency)
				: item,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getItemsBySupplier = async (req, res) => {
	const { currency } = req.query
	const { supplierId } = req.params

	try {
		const items = await paginate(req, SupplierItems, [
			{ $match: { supplier: ObjectId(supplierId) } },
			{ $sort: { createdAt: -1 } },
		])

		if (!items.totalDocs) {
			return res.status(404).json({
				status: 0,
				items_count: items.totalDocs,
				message: 'Item not found',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of items by supplier.',
			items_count: items.totalDocs,
			items: currency
				? await convertAmount(items, 'price', 'usd', currency)
				: items,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addItem,
	updateItemById,
	deleteItem,
	getItemById,
	getAllItems,
	getItemsBySupplier,
}
