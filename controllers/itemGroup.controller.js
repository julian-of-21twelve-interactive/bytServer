const { ObjectId } = require('mongodb')
const ItemGroup = require('../models/itemGroup.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const addItemGroup = async (req, res) => {
	const { name, restaurant } = req.body
	const duplicate = await ItemGroup.findOne({ name, restaurant })

	if (duplicate && name === duplicate.name) {
		return res.status(404).json({ status: 0, message: name + ' is already created' })
	}

	try {
		const itemGroup = new ItemGroup({ name, restaurant })

		await itemGroup.save()

		res
			.status(201)
			.json({ status: 1, message: 'Item Group added successfully', itemGroup })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getItemGroup = async (req, res) => {
	try {
		const itemGroup = await ItemGroup.aggregate([
			{ $match: { _id: ObjectId(req.params.itemGroupId) } },
		])

		if (!itemGroup.length) {
			return res.status(404).json({
				status: 0,
				message: 'No item group with this group id'
			})
		}

		res.status(200).json({ status: 1, message: 'Item group data.', itemGroup })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllItemGroup = async (req, res) => {
	const { page = 1 } = req.query

	try {
		const itemGroups = await ItemGroup.aggregate([
			{ $sort: { createdAt: -1 } },
			{ $skip: (page - 1) * 10 },
			{ $limit: 10 },
		])

		if (!itemGroups.length) {
			return res.status(404).json({
				status: 0,
				message: 'No item groups found',
				itemGroups_count: itemGroups.length
			})
		}

		res.status(200).json({ status: 1, message: 'List of all item group.', itemGroups_count: itemGroups.length, itemGroups })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateItemGroup = async (req, res) => {
	const { name } = req.body

	try {
		const itemGroup = await ItemGroup.findByIdAndUpdate(
			req.params.itemGroupId,
			{ name },
		)

		if (!itemGroup) {
			return res.status(404).json({
				status: 0,
				message: 'No item group with this group id'
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Item group updated successfully', itemGroup })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteItemGroup = async (req, res) => {
	try {
		const itemGroup = await ItemGroup.findByIdAndDelete(req.params.itemGroupId)

		if (!itemGroup) {
			return res.status(404).json({
				status: 0,
				message: 'No item group with this group id'
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Item group removed successfully', itemGroup })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchItemGroup = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const itemGroups = await paginate(req, ItemGroup, [
			await searchMatchPipeline(ItemGroup, field, search, where),
		])

		if (!itemGroups.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No item group found',
				itemGroups_count: itemGroups.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'Search item group list.', itemGroups_count: itemGroups.totalDocs, itemGroups })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getItemGroupsByRestaurant = async (req, res) => {
	try {
		const itemGroups = await paginate(req, ItemGroup, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
		])

		if (!itemGroups.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No item group found',
				itemGroups_count: itemGroups.totalDocs
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'List of all item groups of a restaurants.', itemsGroups_count: itemGroups.totalDocs, itemGroups })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addItemGroup,
	getItemGroup,
	getAllItemGroup,
	updateItemGroup,
	deleteItemGroup,
	searchItemGroup,
	getItemGroupsByRestaurant,
}
