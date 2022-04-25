const Reservation = require('../models/reservation.model')

// - TODO: Input / Output currency data conversation pending.
const getAllReservations = async (req, res) => {
	try {
		const reservations = await Reservation.aggregate([
			{
				$sort: { createdAt: -1 },
			},
			{
				$lookup: {
					from: 'users',
					localField: 'host',
					foreignField: '_id',
					as: 'host',
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'guests.guest',
					foreignField: '_id',
					as: 'guests',
				},
			},
			{
				$lookup: {
					from: 'tables',
					localField: 'tableDetails',
					foreignField: '_id',
					as: 'tableDetails',
				},
			},
			{ $unset: ['guests.hash', 'guests.salt', 'host.hash', 'host.salt'] },
		])

		if (!reservations) {
			return res.status(404).json({
				status: 0,
				message: 'No reservation found',
				Reservation_count: reservations.length,
			})
		}
		return res.status(200).json({
			status: 1,
			message: 'List of all reservations.',
			Reservation_count: reservations.length,
			reservation_details: reservations,
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const getReservation = async (req, res) => {
	const reservation = await Reservation.findById(req.params.reservationId)
	if (!reservation) {
		return res.status(404).json({ status: 0, message: 'No reservation found' })
	} else {
		return res.status(200).json({
			status: 1,
			message: 'Reservation data.',
			reservation_details: reservation,
		})
	}
}

const addReservation = async (req, res) => {
	const { host, guests, reservationDetails, tableDetails } = req.body
	const reservation = new Reservation({
		host,
		guests,
		reservationDetails,
		tableDetails,
	})

	try {
		await reservation.save()
		return res.status(201).json({
			status: 1,
			message: 'Reservation added successfully',
			reservation,
		})
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
		// let response = {
		//   data: err.message,
		//   status: 0
		// }
		// return res.status(500).json(response)
	}
}

const updateReservation = async (req, res) => {
	const { host, guests, reservationDetails, tableDetails } = req.body

	try {
		const reservation = await Reservation.findByIdAndUpdate(
			req.params.reservationId,
			{ host, guests, reservationDetails, tableDetails },
		)

		if (!reservation) {
			return res
				.status(404)
				.json({ status: 0, message: 'No reservation found' })
		} else {
			return res.status(200).json({
				status: 1,
				message: 'Reservation updated',
				reservation_details: reservation,
			})
		}
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

const deleteReservation = async (req, res) => {
	try {
		const reservation = await Reservation.findByIdAndDelete(
			req.params.reservationId,
		)

		if (!reservation) {
			return res
				.status(404)
				.json({ status: 0, message: 'No reservation found' })
		} else if (reservation.deleteCount === 0) {
			return res
				.status(404)
				.json({ status: 0, message: 'Error deleting this reservation' })
		} else {
			return res
				.status(200)
				.json({ status: 1, message: 'Reservation deleted successfully' })
		}
	} catch (err) {
		console.log(err)
		throw new Error(err.message)
	}
}

module.exports = {
	getAllReservations,
	getReservation,
	addReservation,
	updateReservation,
	deleteReservation,
}
