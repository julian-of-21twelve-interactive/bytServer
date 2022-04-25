const { ObjectId } = require('mongodb')
const Favorite = require('../models/favorite.model')
const { convertAmount } = require('../utils/currencyConverter.util')
const paginate = require('../utils/aggregatePaginate.util')

const addFavorite = async (req, res) => {
	const { menu, combo, restaurant, customer } = req.body

	try {
		let favoriteData = await Favorite.findOne({ customer })
		if (favoriteData) {
			return res
				.status(404)
				.json({ status: 0, message: 'Favorite is exists for that customer id' })
		}
		const favorite = new Favorite({ menu, combo, restaurant, customer })

		await favorite.save()

		res
			.status(201)
			.json({ status: 1, message: 'Favorite added successfully', favorite })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllFavorite = async (req, res) => {
	const { currency } = req.query
	try {
		const favorites = await paginate(req, Favorite, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'menuitems',
					localField: 'menu',
					foreignField: '_id',
					as: 'menu',
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
					from: 'users',
					localField: 'customer',
					foreignField: '_id',
					as: 'customer',
				},
			},
			{ $unset: ['menu.__v', 'restaurant.__v', 'customer.__v'] },
		])

		if (!favorites.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No favorites found',
				favorites_count: favorites.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all favorites.',
			favorites_count: favorites.totalDocs,
			favorites: currency
				? await convertAmount(favorites, 'price', 'usd', currency)
				: favorites,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getFavorite = async (req, res) => {
	const { currency } = req.query
	try {
		const favorite = await Favorite.aggregate([
			{ $match: { _id: ObjectId(req.params.favoriteId) } },
			{
				$lookup: {
					from: 'menuitems',
					localField: 'menu',
					foreignField: '_id',
					as: 'menu',
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
					from: 'users',
					localField: 'customer',
					foreignField: '_id',
					as: 'customer',
				},
			},
			{ $unset: ['menu.__v', 'restaurant.__v', 'customer.__v'] },
		])

		if (!favorite.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No favorite found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Favorite data is received.',
			favorite: currency
				? await convertAmount(favorite[0], 'price', 'usd', currency)
				: favorite[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getFavoriteByMenuItem = async (req, res) => {
	const { currency } = req.query
	try {
		const favorite = await Favorite.aggregate([
			{ $match: { menu: ObjectId(req.params.menuItemId) } },

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
			{ $unset: ['__v', 'restaurant.__v', 'customer.__v'] },
		])

		if (!favorite.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No favorite found with this id' })
		}

		return res.status(200).json({
			status: 1,
			message: 'Favorite menu items received',
			favorite: currency
				? await convertAmount(favorite, 'price', 'usd', currency)
				: favorite,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getFavoriteByBundleItem = async (req, res) => {
	const { currency } = req.query
	try {
		const favorite = await Favorite.aggregate([
			{ $match: { combo: ObjectId(req.params.bundleItemId) } },

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
			{ $unset: ['__v', 'restaurant.__v', 'customer.__v'] },
		])

		if (!favorite.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No favorite found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Favorite bundle items are received.',
			favorite: currency
				? await convertAmount(favorite, 'price', 'usd', currency)
				: favorite,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getFavoriteByUser = async (req, res) => {
	const { currency } = req.query
	try {
		const favorite = await Favorite.aggregate([
			{ $match: { customer: ObjectId(req.user.id) } },
			{
				$lookup: {
					from: 'menuitems',
					localField: 'menu',
					foreignField: '_id',
					as: 'menu',
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
					from: 'users',
					localField: 'customer',
					foreignField: '_id',
					as: 'customer',
				},
			},
			{
				$unset: [
					'menu.__v',
					'restaurant.__v',
					'customer.__v',
					'customer.salt',
					'customer.hash',
				],
			},
		])

		if (!favorite.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No favorite found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'List of favorites according to user.',
			favorite: currency
				? await convertAmount(favorite, 'price', 'usd', currency)
				: favorite,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateFavorite = async (req, res) => {
	const { menu, restaurant, customer } = req.body

	try {
		const favorite = await Favorite.findByIdAndUpdate(req.params.favoriteId, {
			menu,
			restaurant,
			customer,
		})

		if (!favorite) {
			return res.status(404).json({
				status: 0,
				message: 'No favorite with this id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Favorite updated successfully', favorite })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteFavorite = async (req, res) => {
	try {
		const favorite = await Favorite.findByIdAndDelete(req.params.favoriteId)

		if (!favorite) {
			return res.status(404).json({
				status: 0,
				message: 'No favorite with this group id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Favorite removed successfully', favorite })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addFavorite,
	getAllFavorite,
	getFavorite,
	getFavoriteByUser,
	updateFavorite,
	deleteFavorite,
	getFavoriteByBundleItem,
	getFavoriteByMenuItem,
}
