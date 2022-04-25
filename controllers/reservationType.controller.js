const moment = require('moment')
const ReservationType = require('../models/reservationType.model')
const paginate = require('../utils/aggregatePaginate.util')
const searchMatchPipeline = require('../utils/searchMatchPipeline.util')

const addReservationType = async (req, res) => {
	const { label, from, to } = req.body

	try {
		const checkType = await ReservationType.findOne({
			label,
		}).countDocuments()

		if (checkType) {
			return res.status(400).json({
				status: 0,
				message: 'Reservation type is already added'
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

		const reservationType = new ReservationType({ label, timeSlots })

		await reservationType.save()

		res
			.status(201)
			.json({ status: 1, message: 'Reservation type added successfully', reservationType })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllReservationType = async (req, res) => {
	try {
		const reservationTypes = await paginate(req, ReservationType, [
			{ $sort: { createdAt: -1 } },
		])

		if (!reservationTypes.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No reservation types found',
				reservationTypes_count: reservationTypes.totalDocs
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all reservations type',
			reservationTypes_count: reservationTypes.totalDocs,
			reservationTypes
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getReservationType = async (req, res) => {
	try {
		const reservationType = await ReservationType.findOne({
			_id: req.params.reservationTypeId,
		})

		if (!reservationType) {
			return res
				.status(404)
				.json({ status: 0, message: 'No reservation type found with this id' })
		}

		res.status(200).json({ status: 1, message: 'Reservation type.', reservationType })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateReservationType = async (req, res) => {
	const { label, from, to } = req.body

	try {
		const checkType = await ReservationType.findOne({ label })

		if (
			checkType &&
			checkType._id.toString() !== req.params.reservationTypeId
		) {
			return res.status(400).json({
				status: 0,
				message: 'Duplicate reservation type label - ' + label
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

		const reservationType = await ReservationType.findByIdAndUpdate(
			req.params.reservationTypeId,
			{ label, timeSlots },
			{ new: true },
		)

		if (!reservationType) {
			return res.status(404).json({
				status: 0,
				message: 'No reservation type with this id'
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Reservation type updated successfully',
			reservationType
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteReservationType = async (req, res) => {
	try {
		const reservationType = await ReservationType.findByIdAndDelete(
			req.params.reservationTypeId,
		)

		if (!reservationType) {
			return res.status(404).json({
				status: 0,
				message: 'No reservation type with this group id'
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Reservation type removed successfully',
			reservationType
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const searchReservationType = async (req, res) => {
	const { field, search, where } = req.body

	try {
		const reservationTypes = await paginate(req, ReservationType, [
			await searchMatchPipeline(ReservationType, field, search, where),
		])

		if (!reservationTypes.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No reservation type found',
				reservationTypes_count: reservationTypes.totalDocs
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Search reservation type.',
			reservationTypes_count: reservationTypes.totalDocs,
			reservationTypes
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addReservationType,
	getAllReservationType,
	getReservationType,
	updateReservationType,
	deleteReservationType,
	searchReservationType,
}
