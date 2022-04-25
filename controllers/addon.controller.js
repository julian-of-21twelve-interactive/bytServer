const { ObjectId } = require('mongodb')
const Addon = require('../models/addon.model')
const MenuItem = require('../models/menuItem.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')
const { convertAmount, getAmount } = require('../utils/currencyConverter.util')

// get addon by id require proper testing

const addAddon = async (req, res) => {
	let { currency } = req.query
	let { name, restaurant, price, quantity } = req.body

	if (currency) price = await getAmount(currency, 'usd', price)

	try {
		const addon = new Addon({ name, restaurant, price, quantity })

		await addon.save()

		res
			.status(201)
			.json({ status: 1, message: 'Addon added successfully', addon })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllAddon = async (req, res) => {
	const { currency } = req.query
	try {
		const addons = await paginate(req, Addon, [{ $sort: { createdAt: -1 } }])

		if (!addons.totalDocs) {
			return res.status(404).json({
				status: 0,
				addons_count: addons.totalDocs,
				message: 'No addons found',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'All Addons list.',
			addons_count: addons.totalDocs,
			addons: currency
				? await convertAmount(addons, 'price', 'usd', currency)
				: addons,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAddon = async (req, res) => {
	const { currency } = req.query
	try {
		const addon = await Addon.findOne({
			_id: req.params.addonId,
		})

		if (!addon) {
			return res
				.status(404)
				.json({ status: 0, message: 'No addon found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Successfully received addon data.',
			addon: currency
				? await convertAmount(addon, 'price', 'usd', currency)
				: addon,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateAddon = async (req, res) => {
	let { currency } = req.query
	let { name, restaurant, price, quantity } = req.body

	if (currency) price = await getAmount(currency, 'usd', price)

	try {
		const addon = await Addon.findByIdAndUpdate(req.params.addonId, {
			name,
			restaurant,
			price,
			quantity,
		})

		if (!addon) {
			return res.status(404).json({
				status: 0,
				message: 'No addon with this id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Addon updated successfully', addon })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteAddon = async (req, res) => {
	try {
		const addon = await Addon.findByIdAndDelete(req.params.addonId)

		if (!addon) {
			return res.status(404).json({
				status: 0,
				message: 'No addon with this group id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Addon removed successfully', addon })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAddonsByRestaurant = async (req, res) => {
	const { currency } = req.query
	try {
		const addons = await paginate(req, Addon, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{ $sort: { createdAt: -1 } },
		])

		if (!addons.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No addons found',
				addons_count: addons.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Successfully received addon data.',
			addons_count: addons.totalDocs,
			addons: currency
				? await convertAmount(addons, 'price', 'usd', currency)
				: addons,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAddonsByMenuItem = async (req, res) => {
	const { currency } = req.query
	try {
		const menuItem = await MenuItem.aggregate([
			{ $match: { _id: ObjectId(req.params.menuItemId) } },
			{ $project: { _id: 0, addon: 1 } },
		])

		if (!menuItem.length) {
			return res.status(404).json({
				status: 0,
				message: 'No menu item found',
			})
		}

		const addons = await paginate(req, Addon, [
			{ $match: { $expr: { $in: ['$_id', menuItem[0].addon] } } },
		])

		if (!addons.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No addons found',
				addons_count: addons.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Successfully received menu item data.',
			addons_count: addons.totalDocs,
			addons: currency
				? await convertAmount(addons, 'price', 'usd', currency)
				: addons,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const searchAddons = async (req, res) => {
	try {
		const { field, search, where } = req.body

		const addons = await paginate(req, Addon, [
			await searchMatchPipeline(Addon, field, search, where),
		])

		if (!addons.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No inventory order found',
				addon_count: addons.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Successfully received addon data.',
			addon_count: addons.totalDocs,
			addons,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

module.exports = {
	addAddon,
	getAllAddon,
	getAddon,
	updateAddon,
	deleteAddon,
	getAddonsByRestaurant,
	getAddonsByMenuItem,
	searchAddons,
}
