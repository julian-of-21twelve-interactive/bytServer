const moment = require('moment')
const { ObjectId } = require('mongodb')
const Attendance = require('../models/attendance.model')
const paginate = require('../utils/aggregatePaginate.util')
const { convertAmount } = require('../utils/currencyConverter.util')

const addAttendance = async (req, res) => {
	const { staffMember, restaurant, date, inTime, outTime, breakTime } = req.body

	try {
		let todayEntries = await Attendance.find({
			date: new Date(date),
			staffMember: ObjectId(staffMember),
		}).count()

		let newDate = new Date(date)
		let currentDate = new Date(new Date().toISOString(0, 10))

		if (newDate.getTime() > currentDate.getTime()) {
			res.status(422).json({
				status: 0,
				message: 'Can not add future date entry.',
			})
			return
		}

		if (todayEntries) {
			res.status(422).json({
				status: 0,
				message: 'Entry is already found for the provided date.',
			})
			return
		}

		const workingTime = moment
			.duration(moment(date + ' ' + outTime).diff(date + ' ' + inTime), 'ms')
			.subtract(breakTime, 'm')
			.asMinutes()

		let inDateTime = new Date(date + ' ' + inTime)
		let outDateTime = new Date(date + ' ' + outTime)

		if (inDateTime.getTime() > outDateTime.getTime()) {
			res.status(422).json({
				status: 0,
				message: 'The in-time can not come after the out-time.',
			})
			return
		}

		const attendance = new Attendance({
			staffMember,
			restaurant,
			date,
			inTime,
			outTime,
			breakTime,
			workingTime,
		})

		await attendance.save()

		res
			.status(201)
			.json({ status: 1, message: 'Attendance added successfully', attendance })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllAttendance = async (req, res) => {
	const { currency } = req.query
	try {
		const attendances = await paginate(req, Attendance, [
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: 'staffmembers',
					localField: 'staffMember',
					foreignField: '_id',
					as: 'staffMember',
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
			{ $unset: ['staffMember.__v', 'restaurant.__v'] },
		])

		if (!attendances.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No attendances found',
				attendances_count: attendances.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all attendances.',
			attendances_count: attendances.totalDocs,
			attendances: currency
				? await convertAmount(attendances, 'salary', 'usd', currency)
				: attendances,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAttendance = async (req, res) => {
	const { currency } = req.query
	try {
		const attendance = await Attendance.aggregate([
			{ $match: { _id: ObjectId(req.params.attendanceId) } },
			{
				$lookup: {
					from: 'staffmembers',
					localField: 'staffMember',
					foreignField: '_id',
					as: 'staffMember',
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
					staffMember: { $arrayElemAt: ['$staffMember', 0] },
				},
			},
			{ $unset: ['staffMember.__v', 'restaurant.__v'] },
		])

		if (!attendance.length) {
			return res
				.status(404)
				.json({ status: 0, message: 'No attendance found with this id' })
		}

		res.status(200).json({
			status: 1,
			message: 'Attendances data successfully received.',
			attendance: currency
				? await convertAmount(attendance, 'salary', 'usd', currency)
				: attendance,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateAttendance = async (req, res) => {
	const { staffMember, restaurant, date, inTime, outTime, breakTime } = req.body

	try {
		const workingTime = moment
			.duration(moment(date + ' ' + outTime).diff(date + ' ' + inTime), 'ms')
			.subtract(breakTime, 'm')
			.asMinutes()

		let newDate = new Date(date)
		let currentDate = new Date(new Date().toISOString(0, 10))

		if (newDate.getTime() > currentDate.getTime()) {
			res.status(422).json({
				status: 0,
				message: 'Can not update to future date entry.',
			})
			return
		}

		let inDateTime = new Date(date + ' ' + inTime)
		let outDateTime = new Date(date + ' ' + outTime)

		if (inDateTime.getTime() > outDateTime.getTime()) {
			res.status(422).json({
				status: 0,
				message: 'The in-time can not come after the out-time.',
			})
			return
		}

		const attendance = await Attendance.findByIdAndUpdate(
			req.params.attendanceId,
			{
				staffMember,
				restaurant,
				date,
				inTime,
				outTime,
				breakTime,
				workingTime,
			},
		)

		if (!attendance) {
			return res.status(404).json({
				status: 0,
				message: 'No attendance with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Attendance updated successfully',
			attendance,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteAttendance = async (req, res) => {
	try {
		const attendance = await Attendance.findByIdAndDelete(
			req.params.attendanceId,
		)

		if (!attendance) {
			return res.status(404).json({
				status: 0,
				message: 'No attendance with this group id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Attendance removed successfully',
			attendance,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAttendanceByStaffMember = async (req, res) => {
	try {
		const attendance = await paginate(req, Attendance, [
			{ $match: { staffMember: ObjectId(req.params.staffMemberId) } },
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurant',
					foreignField: '_id',
					as: 'restaurant',
				},
			},
			{ $unset: 'restaurant.__v' },
		])

		if (!attendance.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No attendance found',
				attendance_count: attendance.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Staff Attendance.',
			attendance_count: attendance.totalDocs,
			attendance,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const getAttendanceByRestaurant = async (req, res) => {
	const { currency } = req.query
	try {
		const attendance = await paginate(req, Attendance, [
			{ $match: { restaurant: ObjectId(req.params.restaurantId) } },
			{
				$lookup: {
					from: 'staffmembers',
					localField: 'staffMember',
					foreignField: '_id',
					as: 'staffMember',
				},
			},
			{ $unset: 'staffMember.__v' },
		])

		res.status(200).json({
			status: 1,
			message: 'Restaurant attendance data.',
			attendance_count: attendance.totalDocs,
			attendance: currency
				? await convertAmount(attendance, 'salary', 'usd', currency)
				: attendance,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

module.exports = {
	addAttendance,
	getAllAttendance,
	getAttendance,
	updateAttendance,
	deleteAttendance,
	getAttendanceByStaffMember,
	getAttendanceByRestaurant,
}
