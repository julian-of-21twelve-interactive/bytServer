const { ObjectId } = require('mongodb')
const Subscription = require('../models/subscription.model')
const paginate = require('../utils/aggregatePaginate.util')
const { convertAmount } = require('../utils/currencyConverter.util')

// - TODO: remain other than get request.

const addSubscription = async (req, res) => {
	const { restaurantOwner, package, status } = req.body

	try {
		const subscription = new Subscription({ restaurantOwner, package, status })

		await subscription.save()

		res.status(201).json({
			status: 1,
			message: 'Subscription added successfully',
			subscription,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllSubscription = async (req, res) => {
	const { currency } = req.query
	try {
		const subscriptions = await paginate(req, Subscription, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'restaurantowners',
					localField: 'restaurantOwner',
					foreignField: '_id',
					as: 'restaurantOwner',
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
				$unset: [
					'restaurantOwner.hash',
					'restaurantOwner.salt',
					'restaurantOwner.__v',
				],
			},
		])

		if (!subscriptions.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No subscriptions found',
				subscriptions_count: subscriptions.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all subscriptions.',
			subscriptions_count: subscriptions.totalDocs,
			subscriptions: currency
				? await convertAmount(subscriptions, 'price', 'usd', currency)
				: subscriptions,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getSubscription = async (req, res) => {
	const { currency } = req.query
	const { subscriptionId } = req.params
	console.log('called: ', subscriptionId)
	try {
		const subscription = await Subscription.aggregate([
			{ $match: { _id: ObjectId(subscriptionId) } },
			{
				$lookup: {
					from: 'restaurantowners',
					localField: 'restaurantOwner',
					foreignField: '_id',
					as: 'restaurantOwner',
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
		])

		if (!subscription.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No subscription found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Subscriptions data.',
			subscription: currency
				? await convertAmount(subscription, 'price', 'usd', currency)
				: subscription,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

//get subscription by restaurant
const getSubscriptionByRestaurant = async (req, res) => {
	const { currency } = req.query
	try {
		const subscriptions = await paginate(req, Subscription, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'restaurantowners',
					localField: 'restaurantOwner',
					foreignField: '_id',
					as: 'restaurantOwner',
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
				$unset: [
					'restaurantOwner.hash',
					'restaurantOwner.salt',
					'restaurantOwner.__v',
				],
			},
		])

		if (!subscriptions.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No subscriptions found',
				subscriptions_count: subscriptions.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Restaurant wise Subscription information',
			subscriptions_count: subscriptions.totalDocs,
			subscriptions: currency
				? await convertAmount(subscriptions, 'price', 'usd', currency)
				: subscriptions,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateSubscription = async (req, res) => {
	const { restaurantOwner, package, status } = req.body

	try {
		const subscription = await Subscription.findByIdAndUpdate(
			req.params.subscriptionId,
			{ restaurantOwner, package, status },
		)

		if (!subscription) {
			return res.status(404).json({
				status: 0,
				message: 'No subscription with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Subscription updated successfully',
			subscription,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteSubscription = async (req, res) => {
	try {
		const subscription = await Subscription.findByIdAndDelete(
			req.params.subscriptionId,
		)

		if (!subscription) {
			return res.status(404).json({
				status: 0,
				message: 'No subscription with this group id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Subscription removed successfully',
			subscription,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getSubscriptionsByOwner = async (req, res) => {
	const { currency } = req.query
	try {
		const subscriptions = await paginate(req, Subscription, [
			{ $match: { restaurantOwner: ObjectId(req.params.ownerId) } },
			{
				$lookup: {
					from: 'packages',
					localField: 'package',
					foreignField: '_id',
					as: 'package',
				},
			},
			{ $unset: 'package.__v' },
		])

		if (!subscriptions.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No subscriptions found',
				subscriptions_count: subscriptions.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Owner subscription data.',
			subscriptions_count: subscriptions.totalDocs,
			subscriptions: currency
				? await convertAmount(subscriptions, 'price', 'usd', currency)
				: subscriptions,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addSubscription,
	getAllSubscription,
	getSubscription,
	updateSubscription,
	deleteSubscription,
	getSubscriptionsByOwner,
	getSubscriptionByRestaurant,
}
