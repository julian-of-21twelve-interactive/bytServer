const { ObjectId } = require('mongodb')
const moment = require('moment')
const Restaurant = require('../models/restaurant.model')
const RestaurantOwner = require('../models/restaurantOwner.model')
const Filter = require('../models/filter.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const addRestaurant = async (req, res) => {
	const {
		name,
		city,
		isOwner,
		owner,
		std,
		contact,
		location,
		coords,
		status,
		alcoholServe,
		services,
		seating,
		seatingPreference,
		paymentMethod,
		cuisines,
		tags,
		openDays,
		openTiming,
		email,
		website,
		package,
		description,
		facebook,
		instagram,
		twitter,
		discount,
		lightChargePUnit,
	} = req.body

	try {
		const restaurant = new Restaurant({
			name,
			city,
			isOwner,
			owner,
			std,
			contact: JSON.parse(contact),
			location,
			coords: { coordinates: coords && coords.split(',') },
			status,
			alcoholServe,
			services,
			seating,
			seatingPreference,
			paymentMethod,
			cuisines,
			tags,
			openDays,
			openTiming,
			email,
			website,
			image: req.file?.path,
			package,
			description,
			facebook,
			instagram,
			twitter,
			discount,
			lightChargePUnit,
		})
		await restaurant.save()

		const checkRestaurant = await Restaurant.find({
			owner: ObjectId(owner),
		}).countDocuments()

		await RestaurantOwner.findByIdAndUpdate(owner, {
			restaurantCount: checkRestaurant,
			restaurantType: checkRestaurant === 1 ? true : false,
		})

		res
			.status(201)
			.json({ status: 1, message: 'Restaurant added successfully', restaurant })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllRestaurants = async (req, res) => {
	const { sortBy = 'desc' } = req.params
	const { lat = 0, long = 0 } = req.query

	try {
		const restaurants = await paginate(req, Restaurant, [
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [Number(lat), Number(long)],
					},
					spherical: true,
					includeLocs: 'coords',
					distanceField: 'distance',
					distanceMultiplier: 0.000621371,
				},
			},
			{ $sort: { createdAt: sortBy === 'desc' ? -1 : 1 } },
			{
				$lookup: {
					from: 'restaurantowners',
					localField: 'owner',
					foreignField: '_id',
					as: 'owner',
				},
			},
			{
				$lookup: {
					from: 'packages',
					localField: 'package',
					foreignField: '_id',
					as: 'package',
				},
			},
			{
				$lookup: {
					from: 'menuitems',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'menus',
				},
			},
			{
				$lookup: {
					from: 'reviews',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'reviews',
				},
			},
			{
				$lookup: {
					from: 'orders',
					localField: '_id',
					foreignField: 'restaurant',
					as: 'orders',
				},
			},
			...favoriteAndAvailTableTaxPipe(req),
			{
				$set: {
					menuCount: { $size: '$menus' },
					reviewCount: { $size: '$reviews' },
					tableCount: { $size: '$tableCount' },
					distance: { $cond: [lat, { $round: ['$distance', 2] }, -1] },
					income: { $sum: '$orders.price' },
					favouriteCount: { $size: '$favouriteRestaurant' },
				},
			},
			{
				$unset: ['orders', 'owner.hash', 'owner.salt', 'owner.__v'],
			},
		])

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurants found',
				restaurants_count: restaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all restaurant.',
			restaurants_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteRestaurant = async (req, res) => {
	try {
		const restaurant = await Restaurant.findByIdAndDelete(
			req.params.restaurantId,
		)

		if (!restaurant) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant found with restaurant id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant removed successfully',
			restaurant,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRestaurant = async (req, res) => {
	const { lat = 0, long = 0 } = req.query

	try {
		const restaurant = await Restaurant.aggregate([
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [Number(lat), Number(long)],
					},
					spherical: true,
					includeLocs: 'coords',
					distanceField: 'distance',
					distanceMultiplier: 0.000621371,
				},
			},
			{
				$match: { _id: ObjectId(req.params.restaurantId) },
			},
			{
				$lookup: {
					from: 'restaurantowners',
					localField: 'owner',
					foreignField: '_id',
					as: 'owner',
				},
			},
			{
				$lookup: {
					from: 'packages',
					localField: 'package',
					foreignField: '_id',
					as: 'package',
				},
			},
			{
				$lookup: {
					from: 'menuitems',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'menus',
				},
			},
			{
				$lookup: {
					from: 'addons',
					let: {
						addonId: {
							$reduce: {
								input: '$menus.addon',
								initialValue: [],
								in: { $setUnion: ['$$this', '$$value'] },
							},
						},
					},
					pipeline: [
						{
							$match: {
								$expr: { $in: ['$_id', '$$addonId'] },
							},
						},
						// { $set: { addonId: '$$addonId' } },
						{ $unset: '__v' },
					],
					as: 'addons',
				},
			},
			{
				$lookup: {
					from: 'menutags',
					let: {
						menuTagId: {
							$reduce: {
								input: '$menus.menuTag',
								initialValue: [],
								in: { $setUnion: ['$$this', '$$value'] },
							},
						},
					},
					pipeline: [
						{
							$match: {
								$expr: { $in: ['$_id', '$$menuTagId'] },
							},
						},
						{ $unset: '__v' },
					],
					as: 'menuTags',
				},
			},
			{
				$lookup: {
					from: 'reviews',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'reviews',
				},
			},
			...favoriteAndAvailTableTaxPipe(req),
			{
				$lookup: {
					from: 'users',
					let: { reviewerId: '$reviews.reviewerId' },
					pipeline: [
						{ $match: { $expr: { $in: ['$_id', '$$reviewerId'] } } },
						{ $unset: ['hash', 'salt', '__v'] },
					],
					as: 'reviewer',
				},
			},
			{
				$lookup: {
					from: 'restaurants',
					let: { restaurantId: '$reviews.restaurant' },
					pipeline: [
						{ $match: { $expr: { $in: ['$_id', '$$restaurantId'] } } },
						{ $project: { name: 1 } },
					],
					as: 'reviewsRestaurants',
				},
			},
			{
				$lookup: {
					from: 'menuitems',
					let: { itemId: '$reviews.item' },
					pipeline: [
						{ $match: { $expr: { $in: ['$_id', '$$itemId'] } } },
						{ $project: { name: 1 } },
					],
					as: 'reviewsMenuItems',
				},
			},
			{
				$lookup: {
					from: 'roles',
					let: { roleId: '$reviewer.role' },
					pipeline: [
						{ $match: { $expr: { $in: ['$_id', '$$roleId'] } } },
						{ $project: { name: 1 } },
					],
					as: 'roles',
				},
			},
			{
				$set: {
					menuCount: { $size: '$menus' },
					reviewCount: { $size: '$reviews' },
					menus: {
						$map: {
							input: '$menus',
							in: {
								$mergeObjects: [
									'$$this',
									{
										addon: {
											$let: {
												vars: {
													addonId: {
														$setIntersection: ['$addons._id', '$$this.addon'],
													},
												},
												in: {
													$filter: {
														input: '$addons',
														as: 'addon',
														cond: {
															$in: ['$$addon._id', '$$addonId'],
														},
													},
												},
											},
										},
										menuTag: {
											$let: {
												vars: {
													menuTagId: {
														$setIntersection: [
															'$menuTags._id',
															'$$this.menuTag',
														],
													},
												},
												in: {
													$filter: {
														input: '$menuTags',
														as: 'menuTag',
														cond: {
															$in: ['$$menuTag._id', '$$menuTagId'],
														},
													},
												},
											},
										},
									},
								],
							},
						},
					},
					reviews: {
						$map: {
							input: '$reviews',
							as: 'review',
							in: {
								$mergeObjects: [
									'$$review',
									{
										reviewerId: {
											$mergeObjects: [
												{
													$arrayElemAt: [
														'$reviewer',
														{
															$indexOfArray: [
																'$reviewer._id',
																'$$review.reviewerId',
															],
														},
													],
												},
												{
													role: {
														$arrayElemAt: [
															'$roles',
															{
																$indexOfArray: [
																	'$roles._id',
																	'$$review.reviewerId.role',
																],
															},
														],
													},
												},
											],
										},
										restaurant: {
											$arrayElemAt: [
												'$reviewsRestaurants',
												{
													$indexOfArray: [
														'$reviewsRestaurants._id',
														'$$review.restaurant',
													],
												},
											],
										},
										item: {
											$arrayElemAt: [
												'$reviewsMenuItems',
												{
													$indexOfArray: [
														'$reviewsMenuItems._id',
														'$$review.item',
													],
												},
											],
										},
									},
								],
							},
						},
					},
					distance: { $cond: [lat, { $round: ['$distance', 2] }, -1] },
				},
			},
			{
				$unset: [
					'owner.hash',
					'owner.salt',
					'owner.__v',
					'tableCount',
					'favouriteRestaurant',
					'reviewer',
					'reviewsRestaurants',
					'reviewsMenuItems',
					'roles',
					'addons',
					'menuTags',
				],
			},
		])

		if (!restaurant.length) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant found with restaurant id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurants data.',
			restaurant: restaurant[0],
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateRestaurant = async (req, res) => {
	const {
		name,
		city,
		isOwner,
		std,
		contact,
		location,
		coords,
		status,
		alcoholServe,
		services,
		seating,
		seatingPreference,
		paymentMethod,
		cuisines,
		tags,
		openDays,
		openTiming,
		email,
		website,
		package,
		description,
		facebook,
		instagram,
		twitter,
		discount,
		lightChargePUnit,
	} = req.body

	let image = req.file?.path

	if (!image) {
		const restaurantData = await Restaurant.findOne(
			{ _id: req.params.restaurantId },
			'-_id image',
		)

		image = restaurantData.image
	}

	try {
		const restaurant = await Restaurant.findByIdAndUpdate(
			req.params.restaurantId,
			{
				name,
				city,
				isOwner,
				std,
				contact: JSON.parse(contact),
				location,
				coords: {
					type: 'Point',
					coordinates: coords && coords.split(','),
				},
				status,
				alcoholServe,
				services,
				seating,
				seatingPreference,
				paymentMethod,
				cuisines,
				tags: JSON.parse(tags),
				openDays: JSON.parse(openDays),
				openTiming: JSON.parse(openTiming),
				email,
				website,
				image,
				package,
				description,
				facebook,
				instagram,
				twitter,
				discount,
				lightChargePUnit,
			},
			{ new: true },
		)

		if (!restaurant) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant found with restaurant id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant updated successfully',
			restaurant,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRestaurantsByOwner = async (req, res) => {
	try {
		const restaurants = await paginate(req, Restaurant, [
			{ $match: { owner: ObjectId(req.params.ownerId) } },
		])

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurants found for this owner',
				restaurants_count: restaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Owner restaurants list.',
			restaurants_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRestaurantDetails = async (req, res) => {
	const { lat = 0, long = 0 } = req.query

	try {
		const breakfastTag = await Restaurant.aggregate([
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [Number(lat), Number(long)],
					},
					spherical: true,
					includeLocs: 'coords',
					distanceField: 'distance',
					distanceMultiplier: 0.000621371,
				},
			},
			{
				$match: {
					$expr: {
						$in: ['breakfast', '$tags'],
					},
				},
			},
			...favoriteAndAvailTableTaxPipe(req),
			{
				$set: {
					distance: { $cond: [lat, { $round: ['$distance', 2] }, -1] },
				},
			},
			{ $unset: ['tableCount', 'favouriteRestaurant'] },
		])
		const lunchTag = await Restaurant.aggregate([
			{ $match: { $expr: { $in: ['lunch', '$tags'] } } },
			...favoriteAndAvailTableTaxPipe(req),
			{ $unset: ['tableCount', 'favouriteRestaurant'] },
		])
		const info = await Restaurant.aggregate([
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [Number(lat), Number(long)],
					},
					spherical: true,
					includeLocs: 'coords',
					distanceField: 'distance',
					distanceMultiplier: 0.000621371,
				},
			},
			{ $sort: { createdAt: -1 } },
			{
				$unset: [
					'isOwner',
					'owner',
					'alcoholServe',
					'services',
					'cuisines',
					'package',
					'createdAt',
					'__v',
				],
			},
			{
				$lookup: {
					from: 'menuitems',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'menus',
				},
			},
			{
				$lookup: {
					from: 'reviews',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'reviews',
				},
			},
			...favoriteAndAvailTableTaxPipe(req),
			{
				$set: {
					menuCount: { $size: '$menus' },
					reviewCount: { $size: '$reviews' },
					tableCount: { $size: '$tableCount' },
					distance: { $cond: [lat, { $round: ['$distance', 2] }, -1] },
				},
			},
			{ $unset: 'favouriteRestaurant' },
		])

		const topRated = await Restaurant.aggregate([
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [Number(lat), Number(long)],
					},
					spherical: true,
					includeLocs: 'coords',
					distanceField: 'distance',
					distanceMultiplier: 0.000621371,
				},
			},
			{ $match: { ratings: { $gte: 4 } } },
			{ $sort: { ratings: -1 } },
			{
				$unset: [
					'isOwner',
					'owner',
					'alcoholServe',
					'services',
					'cuisines',
					'package',
					'createdAt',
					'__v',
				],
			},
			{
				$lookup: {
					from: 'reviews',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'reviewCount',
				},
			},
			...favoriteAndAvailTableTaxPipe(req),
			{
				$set: {
					reviewCount: { $size: '$reviewCount' },
					distance: { $cond: [lat, { $round: ['$distance', 2] }, -1] },
				},
			},
			{ $unset: ['tableCount', 'favouriteRestaurant'] },
		])

		res.status(200).json({
			status: 1,
			message: 'Restaurant details.',
			breakfast: breakfastTag,
			lunch: lunchTag,
			info,
			topRated,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getTrendingRestaurants = async (req, res) => {
	const { lat = 0, long = 0 } = req.query

	let matchQuery = { $match: {} }

	if (lat !== 0 && long !== 0) {
		matchQuery = {
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
		}
	}

	try {
		const restaurants = await paginate(req, Restaurant, [
			matchQuery,
			{
				$lookup: {
					from: 'orders',
					let: { id: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$id'] } } },
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
			{
				$lookup: {
					from: 'restaurantowners',
					localField: 'owner',
					foreignField: '_id',
					as: 'owner',
				},
			},
			{
				$lookup: {
					from: 'packages',
					localField: 'package',
					foreignField: '_id',
					as: 'package',
				},
			},
			{
				$lookup: {
					from: 'reviews',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'review',
				},
			},
			...favoriteAndAvailTableTaxPipe(req),
			{
				$set: {
					reviewCount: { $size: '$review' },
					tableCount: { $size: '$tableCount' },
					distance: { $cond: [lat, { $round: ['$distance', 2] }, -1] },
				},
			},
			{
				$unset: [
					'owner.hash',
					'owner.salt',
					'owner.__v',
					'favouriteRestaurant',
				],
			},
		])

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No trending restaurant found',
				restaurants_count: restaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurants trending.',
			restaurants_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getNearRestaurants = async (req, res) => {
	const { lat, long } = req.query

	try {
		const restaurants = await paginate(req, Restaurant, [
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [Number(lat), Number(long)],
					},
					maxDistance: 20 * 1609,
					spherical: true,
					distanceField: 'fullDistance',
					distanceMultiplier: 0.000621371,
				},
			},
			{ $sort: { coords: 1 } },
			{ $set: { distance: { $round: ['$fullDistance', 2] } } },
			{
				$lookup: {
					from: 'restaurantowners',
					localField: 'owner',
					foreignField: '_id',
					as: 'owner',
				},
			},
			{
				$lookup: {
					from: 'packages',
					localField: 'package',
					foreignField: '_id',
					as: 'package',
				},
			},
			{
				$lookup: {
					from: 'reviews',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'review',
				},
			},
			...favoriteAndAvailTableTaxPipe(req),
			{
				$set: {
					reviewCount: { $size: '$review' },
					tableCount: { $size: '$tableCount' },
				},
			},
			{
				$unset: [
					'owner.hash',
					'owner.salt',
					'owner.__v',
					'favouriteRestaurant',
				],
			},
		])

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant found in this location',
				restaurants_count: restaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurants near',
			restaurants_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getHotshotRestaurants = async (req, res) => {
	const { lat = 0, long = 0 } = req.query

	let matchQuery = { $match: {} }

	if (lat !== 0 && long !== 0) {
		matchQuery = {
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [Number(lat), Number(long)],
				},
				maxDistance: 20 * 1609,
				spherical: true,
				distanceField: 'fullDistance',
				distanceMultiplier: 0.000621371,
			},
		}
	}

	try {
		const restaurants = await paginate(req, Restaurant, [
			matchQuery,
			{ $sort: { ratings: -1 } },
			{
				$set: {
					distance: { $cond: [lat, { $round: ['$fullDistance', 2] }, -1] },
				},
			},
			{
				$lookup: {
					from: 'restaurantowners',
					localField: 'owner',
					foreignField: '_id',
					as: 'owner',
				},
			},
			{
				$lookup: {
					from: 'packages',
					localField: 'package',
					foreignField: '_id',
					as: 'package',
				},
			},
			{
				$lookup: {
					from: 'reviews',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'review',
				},
			},
			...favoriteAndAvailTableTaxPipe(req),
			{
				$set: {
					reviewCount: { $size: '$review' },
					tableCount: { $size: '$tableCount' },
				},
			},
			{
				$unset: [
					'owner.hash',
					'owner.salt',
					'owner.__v',
					'favouriteRestaurant',
				],
			},
		])

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant found in this location',
				restaurants_count: restaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all restaurants.',
			restaurants_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRestaurantByTag = async (req, res) => {
	const { lat = 0, long = 0 } = req.query

	try {
		const restaurants = await paginate(req, Restaurant, [
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [Number(lat), Number(long)],
					},
					spherical: true,
					includeLocs: 'coords',
					distanceField: 'distance',
					distanceMultiplier: 0.000621371,
				},
			},
			{ $match: { $expr: { $in: [req.params.tagName, '$tags'] } } },
			{
				$lookup: {
					from: 'reviews',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'review',
				},
			},
			...favoriteAndAvailTableTaxPipe(req),
			{
				$set: {
					reviewCount: { $size: '$review' },
					tableCount: { $size: '$tableCount' },
					distance: { $cond: [lat, { $round: ['$distance', 2] }, -1] },
				},
			},
			{ $unset: 'favouriteRestaurant' },
		])

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant found for this tag',
				restaurants_count: restaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant tag.',
			restaurants_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getTopRatedRestaurants = async (req, res) => {
	try {
		const restaurants = await paginate(req, Restaurant, [
			{ $match: { ratings: { $gte: 4 } } },
			{ $sort: { ratings: -1 } },
			{
				$lookup: {
					from: 'reviews',
					let: { restaurantId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
						{ $unset: ['__v'] },
					],
					as: 'review',
				},
			},
			{
				$lookup: {
					from: 'restaurantowners',
					localField: 'owner',
					foreignField: '_id',
					as: 'owner',
				},
			},
			{
				$lookup: {
					from: 'packages',
					localField: 'package',
					foreignField: '_id',
					as: 'package',
				},
			},
			...favoriteAndAvailTableTaxPipe(req),
			{
				$set: {
					reviewCount: { $size: '$review' },
				},
			},
			{
				$unset: [
					'isOwner',
					'owner',
					'alcoholServe',
					'services',
					'cuisines',
					'package',
					'createdAt',
					'__v',
					'tableCount',
					'favouriteRestaurant',
				],
			},
		])

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant found',
				restaurants_count: restaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all rated restaurants.',
			restaurants_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchRestaurant = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const restaurants = await paginate(req, Restaurant, [
			await searchMatchPipeline(Restaurant, field, search, where),
		])

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant found',
				restaurant_count: restaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of search restaurants.',
			restaurant_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getRestaurantByCost = async (req, res) => {
	const { min, max } = req.query

	try {
		const restaurants = await paginate(req, Restaurant, [
			{
				$lookup: {
					from: 'tables',
					localField: '_id',
					foreignField: 'restaurant',
					as: 'tables',
				},
			},
			{
				$match: {
					'tables.costPerson': { $gte: Number(min), $lt: Number(max) },
				},
			},
			{ $sort: { 'tables.costPerson': 1 } },
			...favoriteAndAvailTableTaxPipe(req),
			{ $unset: ['tableCount', 'favouriteRestaurant'] },
		])

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant found',
				restaurant_count: restaurants.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant cost data.',
			restaurant_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getStaffMemberByRestaurantsId = async (req, res) => {
	try {
		var staffMember = await Restaurant.aggregate([
			{ $match: { _id: ObjectId(req.params.restaurantId) } },
			{
				$lookup: {
					from: 'staffmembers',
					localField: '_id',
					foreignField: 'restaurant',
					as: 'Staffmembers',
				},
			},
		])

		res.send({ status: 1, message: 'Staff member data.', staffMember })
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const getRestaurantByFilter = async (req, res) => {
	const { filterId, queryParams = '' } = req.params

	try {
		const filter =
			filterId && (await Filter.findOne({ 'filters._id': filterId }))

		if (!filter) {
			return res.status(404).json({ status: 0, message: 'Invalid filter id' })
		}

		let aggregateQuery =
			filterId &&
			filter.filters.find((filter) => filter._id.toString() === filterId).query

		if (queryParams) {
			queryParams
				.split(',')
				.map(
					(v) =>
						(aggregateQuery = aggregateQuery.replace(
							'"{ val }"',
							isNaN('' + v) ? `"${v}"` : v,
						)),
				)
		}

		if (aggregateQuery.includes('{ val }')) {
			return res
				.status(404)
				.json({ status: 0, message: 'Invalid query params' })
		}

		aggregateQuery = JSON.parse(aggregateQuery)

		const restaurants = await paginate(req, Restaurant, aggregateQuery)

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				restaurants_count: restaurants.totalDocs,
				message: 'No restaurant found',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant filter data',
			restaurants_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ status: 0, message: error.message })
	}
}

const getTopIncomeRestaurant = async (req, res) => {
	try {
		const restaurants = await paginate(req, Restaurant, [
			{
				$lookup: {
					from: 'orders',
					localField: '_id',
					foreignField: 'restaurant',
					as: 'orders',
				},
			},
			{ $set: { income: { $round: [{ $sum: '$orders.price.total' }, 2] } } },
			{ $unset: ['orders'] },
			{ $sort: { income: -1 } },
		])

		if (!restaurants.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No restaurant found',
				restaurants_count: restaurants.totalDocs,
			})
		}
		res.status(200).json({
			status: 1,
			message: 'Restaurant income data.',
			restaurants_count: restaurants.totalDocs,
			restaurants,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

module.exports = {
	addRestaurant,
	getAllRestaurants,
	deleteRestaurant,
	getRestaurant,
	updateRestaurant,
	getRestaurantsByOwner,
	getRestaurantDetails,
	getTrendingRestaurants,
	getNearRestaurants,
	getHotshotRestaurants,
	getRestaurantByTag,
	getTopRatedRestaurants,
	searchRestaurant,
	getRestaurantByCost,
	getStaffMemberByRestaurantsId,
	getRestaurantByFilter,
	getTopIncomeRestaurant,
}

const roundedTime = () => {
	const time = moment()
	const minRemainder = time.minute() % 30

	return moment(time)
		.subtract(minRemainder, 'minutes')
		.format('YYYY-MM-DD HH:mm')
}

const favoriteAndAvailTableTaxPipe = (req) => [
	{
		$lookup: {
			from: 'tables',
			let: { restaurantId: '$_id' },
			pipeline: [
				{ $match: { $expr: { $eq: ['$restaurant', '$$restaurantId'] } } },
			],
			as: 'tableCount',
		},
	},
	{
		$lookup: {
			from: 'orders',
			let: { restaurantId: '$_id', tablesId: '$tableCount._id' },
			pipeline: [
				{
					$match: {
						$and: [
							{ $expr: { $eq: ['$restaurant', '$$restaurantId'] } },
							{
								$expr: {
									$gte: [
										{
											$size: {
												$ifNull: [
													{
														$setIntersection: ['$table', '$$tablesId'],
													},
													[],
												],
											},
										},
										1,
									],
								},
							},
							{ $expr: { $eq: ['$deliveryTime', new Date(roundedTime())] } },
						],
					},
				},
				{ $project: { table: 1, deliveryTime: 1, tables: '$$tablesId' } },
			],
			as: 'availableTable',
		},
	},
	{
		$lookup: {
			from: 'favoriterestaurants',
			localField: '_id',
			foreignField: 'restaurant',
			as: 'favouriteRestaurant',
		},
	},
	{
		$lookup: {
			from: 'taxes',
			localField: '_id',
			foreignField: 'restaurant',
			as: 'tax',
		},
	},
	{
		$set: {
			isFavourite: {
				$let: {
					vars: {
						isFav: {
							$in: [
								{ $toObjectId: req.user?.id },
								'$favouriteRestaurant.customer',
							],
						},
					},
					in: {
						status: '$$isFav',
						id: {
							$cond: [
								'$$isFav',
								{
									$arrayElemAt: [
										'$favouriteRestaurant._id',
										{
											$indexOfArray: [
												'$favouriteRestaurant.customer',
												{ $toObjectId: req.user?.id },
											],
										},
									],
								},
								'',
							],
						},
					},
				},
			},
			availableTable: {
				$subtract: [{ $size: '$tableCount' }, { $size: '$availableTable' }],
			},
			tax: { $arrayElemAt: ['$tax', 0] },
		},
	},
]
