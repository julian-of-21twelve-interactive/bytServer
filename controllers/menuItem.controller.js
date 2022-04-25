const { ObjectId } = require('mongodb')
const MenuItem = require('../models/menuItem.model')
const BundleItem = require('../models/bundleItem.model')
const Filter = require('../models/filter.model')
const MenuTag = require('../models/menuTag.model')
const Restaurant = require('../models/restaurant.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')
const { convertAmount, getAmount } = require('../utils/currencyConverter.util')

const getAllMenuItems = async (req, res) => {
	const { currency } = req.query

	try {
		const menuItems = await paginate(req, MenuItem, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'addons',
					localField: 'addon',
					foreignField: '_id',
					as: 'addon',
				},
			},
		])

		if (!menuItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No menu items found',
				menuItem_count: menuItems.totalDocs,
			})
		}

		res.json({
			status: 1,
			message: 'List of all menu items.',
			menuItems_count: menuItems.totalDocs,
			menuItems: currency
				? await convertAmount(menuItems, 'price', 'usd', currency)
				: menuItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getMenuItem = async (req, res) => {
	const { currency } = req.query
	try {
		const menuItem = await MenuItem.aggregate([
			{ $match: { _id: ObjectId(req.params.menuItemId) } },
			{
				$lookup: {
					from: 'addons',
					localField: 'addon',
					foreignField: '_id',
					as: 'addon',
				},
			},
			{
				$lookup: {
					from: 'favorites',
					let: { menuItemId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$menu', '$$menuItemId'] } } },
						{ $group: { _id: null, count: { $sum: 1 } } },
						{
							$set: {
								count: {
									$ifNull: ['$count', 0],
								},
							},
						},
					],
					as: 'favCount',
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
										{ $eq: [{ $year: '$createdAt' }, { $year: '$$NOW' }] },
										{ $eq: [{ $month: '$createdAt' }, { $month: '$$NOW' }] },
										{
											$eq: [
												{ $dayOfMonth: '$createdAt' },
												{ $dayOfMonth: '$$NOW' },
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
					restaurant: {
						$ifNull: [{ $arrayElemAt: ['$restaurant', 0] }, {}],
					},
					favCount: {
						$ifNull: [{ $arrayElemAt: ['$favCount.count', 0] }, 0],
					},
					todaysOrder: {
						$ifNull: [{ $arrayElemAt: ['$orders.count', 0] }, 0],
					},
				},
			},
			{ $unset: ['orders'] },
		])

		if (!menuItem.length) {
			return res.status(404).json({ status: 0, message: 'Menu item not found' })
		}

		res.json({
			status: 1,
			message: 'Menu item received.',
			menuItem: currency
				? await convertAmount(menuItem[0], 'price', 'usd', currency)
				: menuItem[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getMenuItemByFilter = async (req, res) => {
	const { currency } = req.query
	const { filterId, field, search, where } = req.body

	const filter = filterId && (await Filter.findOne({ 'filters._id': filterId }))

	const aggregateQuery = filterId
		? JSON.parse(
				filter.filters.find((filter) => filter._id.toString() === filterId)
					.query,
		  )
		: [await searchMatchPipeline(MenuItem, field, search, where)]

	try {
		const menuItems = await paginate(req, MenuItem, aggregateQuery)

		res.status(200).json({
			status: 1,
			message: 'Menu Item filter data.',
			menuItems: currency
				? await convertAmount(menuItems, 'price', 'usd', currency)
				: menuItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const addMenuItem = async (req, res) => {
	let { currency: currencyQuery } = req.query
	let {
		name,
		description,
		price,
		currency,
		status,
		category,
		discount,
		ingredient,
		restaurant,
		addon,
		estimatedTime,
		menuTag,
	} = req.body

	if (currencyQuery) price = await getAmount(currencyQuery, 'usd', price)

	const image = req.files?.map((file) => file.path)

	let ingredientJSON = []

	if (ingredient) {
		ingredientJSON = JSON.parse(ingredient).map((item) => {
			const wastage = Number(item.wastage.toString().replace('%', ''))
			return Object.assign(item, { wastage })
		})
	}

	const menuItem = new MenuItem({
		name,
		description,
		image,
		price,
		currency,
		status,
		category,
		discount,
		ingredient: ingredientJSON,
		restaurant,
		addon,
		estimatedTime,
		menuTag,
	})

	try {
		await menuItem.save()

		res
			.status(201)
			.json({ status: 1, message: 'Menu Item added successfully', menuItem })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const updateMenuItem = async (req, res) => {
	let { currency: currencyQuery } = req.query
	const {
		name,
		description,
		price,
		currency,
		status,
		category,
		discount,
		ingredient,
		restaurant,
		addon,
		estimatedTime,
		menuTag,
	} = req.body

	if (currencyQuery) price = await getAmount(currencyQuery, 'usd', price)

	let image = req.files?.map((file) => file.path)

	if (!image.length) {
		const menuItemData = await MenuItem.findOne(
			{ _id: req.params.menuItemId },
			'-_id image',
		)

		image = menuItemData.image
	}

	const ingredientJSON = JSON.parse(ingredient).map((item) => {
		const wastage = Number(item.wastage.toString().replace('%', ''))
		return Object.assign(item, { wastage })
	})

	try {
		const menuItem = await MenuItem.findByIdAndUpdate(
			req.params.menuItemId,
			{
				name,
				description,
				price,
				currency,
				status,
				category,
				discount,
				image,
				ingredient: ingredientJSON,
				restaurant,
				addon,
				estimatedTime,
				menuTag,
			},
			{ new: true },
		)

		if (!menuItem) {
			return res
				.status(404)
				.json({ status: 0, message: 'No menu item found with menu item id' })
		}

		res
			.status(200)
			.json({ status: 1, message: 'Menu item is updated.', data: menuItem })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteMenuItem = async (req, res) => {
	try {
		const menuItem = await MenuItem.findByIdAndDelete(req.params.menuItemId)

		if (!menuItem) {
			return res.status(404).json({
				status: 0,
				message: 'No menu item found with menu item id',
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Menu Item removed successfully', menuItem })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getMenuItemsByRestaurant = async (req, res) => {
	const { currency } = req.query

	try {
		const menuItems = await paginate(req, MenuItem, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{
				$lookup: {
					from: 'addons',
					localField: 'addon',
					foreignField: '_id',
					as: 'addon',
				},
			},
			{
				$lookup: {
					from: 'menutags',
					localField: 'menuTag',
					foreignField: '_id',
					as: 'menuTag',
				},
			},
		])

		if (!menuItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No menu item found for this restaurant',
				menuItems_count: menuItems.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all restaurant menu items',
			menuItems_count: menuItems.totalDocs,
			menuItems: currency
				? await convertAmount(menuItems, 'price', 'usd', currency)
				: menuItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getMenuItemsByTag = async (req, res) => {
	const { currency } = req.query
	const isPopular = await MenuTag.findOne({ _id: req.params.menuTagId })

	const aggregate =
		isPopular.name === 'popular'
			? [
					{ $match: { restaurant: ObjectId(isPopular.restaurant) } },
					{
						$lookup: {
							from: 'orders',
							let: { id: '$_id' },
							pipeline: [
								{ $match: { $expr: { $in: ['$$id', '$items.item'] } } },
								{ $count: 'count' },
							],
							as: 'orders',
						},
					},
					{
						$set: {
							orders: {
								$cond: [
									{ $size: '$orders' },
									{ $arrayElemAt: ['$orders.count', 0] },
									0,
								],
							},
						},
					},
					{ $sort: { orders: -1 } },
			  ]
			: [
					{
						$match: {
							$expr: { $in: [ObjectId(req.params.menuTagId), '$menuTag'] },
						},
					},
			  ]

	try {
		const menuItems = await paginate(req, MenuItem, aggregate)

		if (!menuItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No menu item found for this menu tag',
				menuItems_count: menuItems.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of menu items by tags.',
			menuItems_count: menuItems.totalDocs,
			menuItems: currency
				? await convertAmount(menuItems, 'price', 'usd', currency)
				: menuItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getMenuItemsByTagAndCategory = async (req, res) => {
	const { currency } = req.query
	const isPopular = await MenuTag.findOne({ _id: req.params.menuTagId })

	const aggregate =
		isPopular.name === 'popular'
			? [
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ['$restaurant', ObjectId(isPopular.restaurant)] },
									{
										$eq: [
											{ $toLower: '$category' },
											req.params.category.toLowerCase(),
										],
									},
								],
							},
						},
					},
					{
						$lookup: {
							from: 'orders',
							let: { id: '$_id' },
							pipeline: [
								{ $match: { $expr: { $in: ['$$id', '$items.item'] } } },
								{ $count: 'count' },
							],
							as: 'orders',
						},
					},
					{
						$set: {
							orders: {
								$cond: [
									{ $size: '$orders' },
									{ $arrayElemAt: ['$orders.count', 0] },
									0,
								],
							},
						},
					},
					{ $sort: { orders: -1 } },
			  ]
			: [
					{
						$match: {
							$expr: {
								$and: [
									{ $in: [ObjectId(req.params.menuTagId), '$menuTag'] },
									{
										$eq: [
											{ $toLower: '$category' },
											req.params.category.toLowerCase(),
										],
									},
								],
							},
						},
					},
			  ]

	try {
		const menuItems = await paginate(req, MenuItem, aggregate)

		if (!menuItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No menu item found for this menu tag',
				menuItems_count: menuItems.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Tag and category menu items are received.',
			menuItems_count: menuItems.totalDocs,
			menuItems: currency
				? await convertAmount(menuItems, 'price', 'usd', currency)
				: menuItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRecommendedMenuItemsByRestaurant = async (req, res) => {
	const { currency } = req.query

	try {
		const menuItems = await paginate(req, MenuItem, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{
				$lookup: {
					from: 'reviews',
					let: { menuItemId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$item', '$$menuItemId'] } } },
						{
							$group: {
								_id: null,
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
					as: 'review',
				},
			},

			{
				$set: {
					avgRating: {
						$ifNull: [{ $arrayElemAt: ['$review.avgRating', 0] }, 0],
					},
				},
			},
			{ $sort: { avgRating: -1 } },
			{ $unset: ['review'] },
		])

		res.status(200).json({
			status: 1,
			message: 'List of all recommended menu items.',
			menuItems_count: menuItems.totalDocs,
			menuItems: currency
				? await convertAmount(menuItems, 'price', 'usd', currency)
				: menuItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getMenuItemsByOwner = async (req, res) => {
	const { ownerId } = req.params

	try {
		const restaurants = await Restaurant.find(
			{ owner: ObjectId(ownerId) },
			{ name: 1 },
		)

		if (!restaurants.length) {
			return res.status(404).json({
				status: 0,
				message: 'No menu item found for this owner',
			})
		}

		const restaurantIds = restaurants.map((restaurant) => restaurant._id)

		const menuItems = await paginate(req, MenuItem, [
			{
				$match: {
					$expr: {
						$in: ['$restaurant', restaurantIds],
					},
				},
			},
			{ $sort: { createdAt: -1 } },
		])

		if (!menuItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No menu item found for this owner',
				menuItems_count: menuItems.totalDocs,
			})
		}

		res
			.status(200)
			.json({ status: 1, menuItems_count: menuItems.totalDocs, menuItems })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getMenuComboItemsByRestaurant = async (req, res) => {
	const { restaurantId, menuTagId } = req.params

	try {
		const menuTagQuery = menuTagId
			? { $in: [{ $toObjectId: menuTagId }, '$menuTag'] }
			: {}

		const menuComboItems = await paginate(req, MenuItem, [
			{
				$match: {
					$expr: {
						$and: [
							{ $eq: ['$restaurant', ObjectId(restaurantId)] },
							menuTagQuery,
						],
					},
				},
			},
			{ $set: { type: 'menu' } },
			{
				$lookup: {
					from: 'menutags',
					localField: 'menuTag',
					foreignField: '_id',
					as: 'menuTag',
				},
			},
			{
				$lookup: {
					from: 'addons',
					localField: 'addon',
					foreignField: '_id',
					as: 'addon',
				},
			},
			{
				$unionWith: {
					coll: 'bundleitems',
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$restaurant', ObjectId(restaurantId)] },
										menuTagQuery,
									],
								},
							},
						},
						{ $set: { type: 'combo' } },
						{
							$lookup: {
								from: 'menutags',
								localField: 'menuTag',
								foreignField: '_id',
								as: 'menuTag',
							},
						},
						{
							$lookup: {
								from: 'addons',
								localField: 'addon',
								foreignField: '_id',
								as: 'addon',
							},
						},
						{
							$lookup: {
								from: 'menuitems',
								let: { menuItemIds: '$items.item' },
								pipeline: [
									{ $match: { $expr: { $in: ['$_id', '$$menuItemIds'] } } },
									{ $unset: ['__v'] },
								],
								as: 'menuItems',
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
														$arrayElemAt: [
															'$menuItems',
															{
																$indexOfArray: [
																	'$menuItems._id',
																	'$$this.item',
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
						},
						{ $unset: ['menuItems'] },
					],
				},
			},
			{ $sort: { createdAt: -1 } },
		])

		if (!menuComboItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				menuComboItems_count: menuComboItems.totalDocs,
				message: 'No menu or combo items found',
			})
		}

		res.status(200).json({
			status: 1,
			menuComboItems_count: menuComboItems.totalDocs,
			menuComboItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const getRecommendedMenuItems = async (req, res) => {
	const { lat = 0, long = 0 } = req.query

	try {
		let matchQuery = {}

		if (lat !== 0 && long !== 0) {
			const restaurants = await Restaurant.aggregate([
				{
					$geoNear: {
						near: {
							type: 'Point',
							coordinates: [Number(lat), Number(long)],
						},
						maxDistance: 20 * 1609,
						spherical: true,
						distanceField: 'distance',
						distanceMultiplier: 0.000621371,
					},
				},
				{ $project: { name: 1 } },
			])

			const restaurantIds = restaurants.map((restaurant) => restaurant._id)

			matchQuery = {
				$expr: { $in: [{ $toObjectId: '$restaurant' }, restaurantIds] },
			}
		}

		const menuItems = await paginate(req, MenuItem, [
			{
				$match: matchQuery,
			},
			{
				$lookup: {
					from: 'reviews',
					let: { menuItemId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$item', '$$menuItemId'] } } },
						{
							$group: {
								_id: null,
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
					as: 'review',
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
					from: 'menutags',
					localField: 'menuTag',
					foreignField: '_id',
					as: 'menuTag',
				},
			},
			{
				$lookup: {
					from: 'addons',
					localField: 'addon',
					foreignField: '_id',
					as: 'addon',
				},
			},
			{
				$set: {
					avgRating: {
						$ifNull: [{ $arrayElemAt: ['$review.avgRating', 0] }, 0],
					},
				},
			},
			{ $sort: { avgRating: -1 } },
			{ $unset: ['review'] },
		])
		const comboItems = await paginate(req, BundleItem, [
			{
				$match: matchQuery,
			},
			{
				$lookup: {
					from: 'reviews',
					let: { comboItemId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$combo', '$$comboItemId'] } } },
						{
							$group: {
								_id: null,
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
					as: 'review',
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
					from: 'menutags',
					localField: 'menuTag',
					foreignField: '_id',
					as: 'menuTag',
				},
			},
			{
				$lookup: {
					from: 'addons',
					localField: 'addon',
					foreignField: '_id',
					as: 'addon',
				},
			},
			{
				$lookup: {
					from: 'menuitems',
					let: { menuItemIds: '$items.item' },
					pipeline: [
						{ $match: { $expr: { $in: ['$_id', '$$menuItemIds'] } } },
						{ $unset: ['__v'] },
					],
					as: 'menuItems',
				},
			},
			{
				$set: {
					avgRating: {
						$ifNull: [{ $arrayElemAt: ['$review.avgRating', 0] }, 0],
					},
					items: {
						$map: {
							input: '$items',
							in: {
								$mergeObjects: [
									'$$this',
									{
										item: {
											$arrayElemAt: [
												'$menuItems',
												{
													$indexOfArray: ['$menuItems._id', '$$this.item'],
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
			{ $sort: { avgRating: -1 } },
			{ $unset: ['review', 'menuItems'] },
		])

		if (!menuItems.totalDocs && !comboItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				menuItems_count: menuItems.totalDocs,
				message: 'No menu items found',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all recommended menu items.',
			menuItems_count: menuItems.totalDocs,
			menuItems,
			comboItems_count: comboItems.totalDocs,
			comboItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getPopularMenuItems = async (req, res) => {
	const { lat = 0, long = 0 } = req.query

	try {
		let matchQuery = {}

		if (lat !== 0 && long !== 0) {
			const restaurants = await Restaurant.aggregate([
				{
					$geoNear: {
						near: {
							type: 'Point',
							coordinates: [Number(lat), Number(long)],
						},
						maxDistance: 20 * 1609,
						spherical: true,
						distanceField: 'distance',
						distanceMultiplier: 0.000621371,
					},
				},
				{ $project: { name: 1 } },
			])

			const restaurantIds = restaurants.map((restaurant) => restaurant._id)

			matchQuery = {
				$expr: { $in: [{ $toObjectId: '$restaurant' }, restaurantIds] },
			}
		}

		const menuItems = await paginate(req, MenuItem, [
			{
				$match: matchQuery,
			},
			{
				$lookup: {
					from: 'orders',
					let: { menuItemId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $in: ['$$menuItemId', '$items.item'] } } },
						{ $count: 'count' },
					],
					as: 'orders',
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
					from: 'menutags',
					localField: 'menuTag',
					foreignField: '_id',
					as: 'menuTag',
				},
			},
			{
				$lookup: {
					from: 'addons',
					localField: 'addon',
					foreignField: '_id',
					as: 'addon',
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
		const comboItems = await paginate(req, BundleItem, [
			{
				$match: matchQuery,
			},
			{
				$lookup: {
					from: 'orders',
					let: { comboItemId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $in: ['$$comboItemId', '$items.combo'] } } },
						{ $count: 'count' },
					],
					as: 'orders',
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
					from: 'menutags',
					localField: 'menuTag',
					foreignField: '_id',
					as: 'menuTag',
				},
			},
			{
				$lookup: {
					from: 'addons',
					localField: 'addon',
					foreignField: '_id',
					as: 'addon',
				},
			},
			{
				$lookup: {
					from: 'menuitems',
					let: { menuItemIds: '$items.item' },
					pipeline: [
						{ $match: { $expr: { $in: ['$_id', '$$menuItemIds'] } } },
						{ $unset: ['__v'] },
					],
					as: 'menuItems',
				},
			},
			{ $unwind: '$orders' },
			{
				$set: {
					orders: '$orders.count',
					items: {
						$map: {
							input: '$items',
							in: {
								$mergeObjects: [
									'$$this',
									{
										item: {
											$arrayElemAt: [
												'$menuItems',
												{
													$indexOfArray: ['$menuItems._id', '$$this.item'],
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
			{ $unset: ['menuItems'] },
			{ $sort: { orders: -1 } },
		])

		if (!menuItems.totalDocs && !comboItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				menuItems_count: menuItems.totalDocs,
				message: 'No menu items found',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of popular menu items nearby.',
			menuItems_count: menuItems.totalDocs,
			menuItems,
			comboItems_count: comboItems.totalDocs,
			comboItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const getPopularMenuItemsByRestaurant = async (req, res) => {
	const { restaurantId } = req.params

	try {
		const menuComboItems = await paginate(req, MenuItem, [
			{
				$match: { restaurant: ObjectId(restaurantId) },
			},
			{
				$lookup: {
					from: 'orders',
					let: { menuItemId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $in: ['$$menuItemId', '$items.item'] } } },
						{ $count: 'count' },
					],
					as: 'orders',
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
					from: 'menutags',
					localField: 'menuTag',
					foreignField: '_id',
					as: 'menuTag',
				},
			},
			{
				$lookup: {
					from: 'addons',
					localField: 'addon',
					foreignField: '_id',
					as: 'addon',
				},
			},
			{ $unwind: '$orders' },
			{
				$set: {
					orders: '$orders.count',
					type: 'menu',
				},
			},
			{
				$unionWith: {
					coll: 'bundleitems',
					pipeline: [
						{
							$match: { restaurant: ObjectId(restaurantId) },
						},
						{
							$lookup: {
								from: 'orders',
								let: { comboItemId: '$_id' },
								pipeline: [
									{
										$match: {
											$expr: { $in: ['$$comboItemId', '$items.combo'] },
										},
									},
									{ $count: 'count' },
								],
								as: 'orders',
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
								from: 'menutags',
								localField: 'menuTag',
								foreignField: '_id',
								as: 'menuTag',
							},
						},
						{
							$lookup: {
								from: 'addons',
								localField: 'addon',
								foreignField: '_id',
								as: 'addon',
							},
						},
						{
							$lookup: {
								from: 'menuitems',
								let: { menuItemIds: '$items.item' },
								pipeline: [
									{ $match: { $expr: { $in: ['$_id', '$$menuItemIds'] } } },
									{ $unset: ['__v'] },
								],
								as: 'menuItems',
							},
						},
						{ $unwind: '$orders' },
						{
							$set: {
								orders: '$orders.count',
								items: {
									$map: {
										input: '$items',
										in: {
											$mergeObjects: [
												'$$this',
												{
													item: {
														$arrayElemAt: [
															'$menuItems',
															{
																$indexOfArray: [
																	'$menuItems._id',
																	'$$this.item',
																],
															},
														],
													},
												},
											],
										},
									},
								},
								type: 'combo',
							},
						},
						{ $unset: ['menuItems'] },
					],
				},
			},
			{ $sort: { orders: -1 } },
		])

		if (!menuComboItems.totalDocs) {
			return res.status(404).json({
				status: 0,
				menuComboItems_count: menuComboItems.totalDocs,
				message: 'No menu combo items found',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of popular menu combo items of restaurant.',
			menuComboItems_count: menuComboItems.totalDocs,
			menuComboItems,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

module.exports = {
	getAllMenuItems,
	getMenuItem,
	getMenuItemByFilter,
	addMenuItem,
	updateMenuItem,
	deleteMenuItem,
	getMenuItemsByRestaurant,
	getMenuItemsByTag,
	getMenuItemsByTagAndCategory,
	getRecommendedMenuItems,
	getRecommendedMenuItemsByRestaurant,
	getMenuItemsByOwner,
	getMenuComboItemsByRestaurant,
	getPopularMenuItems,
	getPopularMenuItemsByRestaurant,
}
