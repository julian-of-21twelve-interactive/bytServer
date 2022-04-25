const { ObjectId } = require('mongodb')
const Event = require('../models/event.model')
const paginate = require('../utils/aggregatePaginate.util')

const addEvent = async (req, res) => {
	console.log(req.body)
	try {
		let {
			eventName,
			eventType,
			startDate,
			restaurant,
			status,
			discount,
			endDate,
		} = req.body

		startDate = new Date(startDate)
		endDate = new Date(endDate)
		let diffMs = endDate - startDate
		let duration = Math.floor(diffMs / 1000 / 60)

		let event = new Event({
			eventName,
			eventType,
			startDate,
			endDate,
			duration,
			status,
			restaurant,
			discount,
			endDate,
		})
		await event.save()

		return res.send({ status: 1, message: 'Event added successfully.', event })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateEvent = async (req, res) => {
	try {
		const { eventName, eventType, startDate, endDate, restaurant, status } = req.body

		const updateEvent = await Event.findOne({ _id: req.params.eventId })
		if (!updateEvent) {
			return res.status(404).status({ status: 0, message: 'Event not found' })
		}
		let duration;
		if (startDate & endDate) {
			startDate = new Date(startDate)
			endDate = new Date(endDate)
			let diffMs = endDate - startDate
			duration = Math.floor(diffMs / 1000 / 60)
		} else if (startDate) {
			diffMs = new Date(startDate) - updateEvent.endDate
			//converting in minutes
			duration = Math.floor(diffMs / 1000 / 60)
		} else if (endDate) {
			diffMs = new Date(endDate) - updateEvent.startDate
			//converting in minutes
			duration = Math.floor(diffMs / 1000 / 60)

		}
		const event = await Event.findByIdAndUpdate(req.params.eventId, {
			eventName,
			eventType,
			startDate,
			endDate,
			duration,
			status,
			restaurant,
		})

		return res.status(200).json({ status: 1, message: 'Event is updated.', event })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteEvent = async (req, res) => {
	try {
		const event = await Event.findByIdAndDelete(req.params.eventId)

		if (!event) {
			return res.status(404).json({
				status: 0,
				message: 'No event with this id'
			})
		}

		return res
			.status(200)
			.json({ status: 1, message: 'Event deleted successfully', event })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getEventById = async (req, res) => {
	try {
		const event = await Event.aggregate([
			{ $match: { _id: ObjectId(req.params.eventId) } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurants',
				},
			},
			{
				$lookup: {
					from: 'discounts',
					localField: 'discount',
					foreignField: '_id',
					as: 'discounts',
				},
			},
		])

		if (!event) {
			return res.status(404).json({ status: 0, message: 'Event not found' })
		}

		return res.json({ status: 1, message: 'Event information.', event })
	} catch (error) {
		throw new Error(error.message)
	}
}

const getEventByRestaurant = async (req, res) => {
	try {
		const event = await Event.aggregate([
			{ $sort: { createdAt: -1 } },
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
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
					from: 'discounts',
					localField: 'discount',
					foreignField: '_id',
					as: 'discounts',
				},
			},
		])

		if (!event) {
			return res.status(404).json({
				status: 0,
				message: 'Event not found'
			})
		}

		return res.status(200).json({ status: 1, message: 'Received restaurant event ', event })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllEvent = async (req, res) => {
	try {
		const event = await paginate(req, Event, [
			{ $sort: { createdAt: -1 } },
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
					from: 'discounts',
					localField: 'discount',
					foreignField: '_id',
					as: 'discounts',
				},
			},
		])

		if (!event.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'Event not found',
				event_count: event.totalDocs
			})
		}

		return res.status(200).json({ status: 1, message: 'List of all events.', event_count: event.totalDocs, event })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}


//add discount to event
const addDiscountToEvent = async (req, res) => {
	try {
		const event = await Event.findOneAndUpdate(
			{ _id: req.body.eventId },
			{ $push: { discount: req.body.discount } },
			{ new: true },
		)

		if (!event) {
			return res.status(404).json({
				status: 0,
				message: 'This event no more exists.'
			})
		}

		return res.status(200).json({
			status: 1,
			message: 'Discount for the event added is successfully',
			event
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

//add discount to Event
const removeDiscountToEvent = async (req, res) => {
	try {
		const event = await Event.findOneAndUpdate(
			{ _id: req.body.eventId },
			{ $pull: { discount: req.body.discount } },
			{ new: true },
		)

		if (!event) {
			return res.status(404).json({
				status: 0,
				message: 'This event no more exists.'
			})
		}

		return res.status(200).json({
			status: 1,
			message: 'Discount from the event deleted is successfully',
			event
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addEvent,
	updateEvent,
	deleteEvent,
	getEventById,
	getAllEvent,
	getEventByRestaurant,
	addDiscountToEvent,
	removeDiscountToEvent
}
