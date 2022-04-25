const { ObjectId } = require('mongodb')
const moment = require('moment')
const TimeSlot = require('../models/timeSlot.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const addTimeSlot = async (req, res) => {
	const { label, restaurant, from, to } = req.body

	try {
		const checkSlot = await TimeSlot.findOne({
			label,
			restaurant,
		}).countDocuments()

		if (checkSlot) {
			return res.status(400).json({
				status: 0,
				message: 'Time slot label is already added'
			})
		}

		let start = from
		const timeSlots = []
		while (start <= to) {
			timeSlots.push(start)
			start = moment('1970-01-01T' + start)
				.add(30, 'minute')
				.format('HH:mm')
		}

		const timeSlot = new TimeSlot({ label, restaurant, timeSlots })

		await timeSlot.save()

		res.status(201).json({ status: 1, message: 'Time slot added successfully', timeSlot })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllTimeSlot = async (req, res) => {
	try {
		const timeSlots = await paginate(req, TimeSlot, [
			{ $sort: { createdAt: -1 } },
		])

		if (!timeSlots.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No time slots found',
				timeSlots_count: timeSlots.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'List of all time slot.', timeSlots_count: timeSlots.totalDocs, timeSlots })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getTimeSlot = async (req, res) => {
	try {
		const timeSlot = await TimeSlot.findOne({
			_id: req.params.timeSlotId,
		})

		if (!timeSlot) {
			return res
				.status(404)
				.json({ status: 0, message: 'No time slot found with this id' })
		}

		res.status(200).json({ status: 1, message: 'Time slot information.', timeSlot })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateTimeSlot = async (req, res) => {
	const { label, restaurant, from, to } = req.body

	try {
		const checkSlot = await TimeSlot.findOne({
			label,
			restaurant,
		})

		if (checkSlot && checkSlot._id.toString() !== req.params.timeSlotId) {
			return res.status(400).json({
				status: 0,
				message: 'Duplicate time slot label - ' + label
			})
		}

		let start = from
		const timeSlots = []
		while (start < to) {
			timeSlots.push(start)
			start = moment('1970-01-01T' + start)
				.add(30, 'minute')
				.format('HH:mm:ss')
		}

		const timeSlot = await TimeSlot.findByIdAndUpdate(
			req.params.timeSlotId,
			{
				label,
				restaurant,
				timeSlots,
			},
			{ new: true },
		)

		if (!timeSlot) {
			return res.status(404).json({
				status: 0,
				message: 'No time slot with this id'
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Time slot updated successfully', timeSlot })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteTimeSlot = async (req, res) => {
	try {
		const timeSlot = await TimeSlot.findByIdAndDelete(req.params.timeSlotId)

		if (!timeSlot) {
			return res.status(404).json({
				status: 0,
				message: 'No time slot with this group id'
			})
		}

		res
			.status(200)
			.json({ status: 1, message: 'Time slot removed successfully', timeSlot })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchTimeSlot = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const timeSlots = await paginate(req, TimeSlot, [
			await searchMatchPipeline(TimeSlot, field, search, where),
		])

		if (!timeSlots.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No time slot found',
				timeSlots_count: timeSlots.totalDocs
			})
		}

		res.status(200).json({ status: 1, message: 'Time slot search information.', timeSlots_count: timeSlots.totalDocs, timeSlots })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getTimeSlotsByRestaurant = async (req, res) => {
	try {
		const timeSlots = await paginate(req, TimeSlot, [
			{
				$match: {
					restaurant: ObjectId(req.params.restaurantId),
				},
			},
		])

		if (!timeSlots.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No time slot found',
				timeSlots_count: timeSlots.totalDocs
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Time slot information by restaurant.',
			timeSlots_count: timeSlots.totalDocs,
			timeSlots
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchTimeSlotByRestaurant = async (req, res) => {
	const { restaurantId, label } = req.params

	try {
		const timeSlot = await TimeSlot.find({
			restaurant: ObjectId(restaurantId),
			label: { $regex: '^' + label + '$', $options: 'i' },
		})

		if (!timeSlot.length) {
			return res.status(404).json({
				status: 0,
				message: 'No time slot found'
			})
		}

		res.status(200).json({ status: 1, message: 'Time slot restaurant search information.', timeSlot })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addTimeSlot,
	getAllTimeSlot,
	getTimeSlot,
	updateTimeSlot,
	deleteTimeSlot,
	searchTimeSlot,
	getTimeSlotsByRestaurant,
	searchTimeSlotByRestaurant,
}
