const { ObjectId } = require('mongodb')
const Notification = require('../models/notification.model')
const Order = require('../models/order.model')
const paginate = require('../utils/aggregatePaginate.util')

const addNotification = async (req, res) => {
	const { title, body, user, data, action, isArchived } = req.body

	try {
		const notification = new Notification({
			title,
			body,
			user,
			data,
			action,
			isArchived,
			image: req.file?.path,
		})

		await notification.save()

		res.status(201).json({
			status: 1,
			message: 'Notification added successfully',
			notification,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getAllNotification = async (req, res) => {
	try {
		const notifications = await paginate(req, Notification, [
			{ $sort: { createdAt: -1 } },
		])

		if (!notifications.totalDocs) {
			return res.status(404).json({
				status: 0,
				message: 'No notifications found',
				notifications_count: notifications.totalDocs,
			})
		}

		res.status(200).json({
			status: 1,
			message: 'List of all notifications',
			notifications_count: notifications.totalDocs,
			notifications,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getNotification = async (req, res) => {
	try {
		const notification = await Notification.findOne({
			_id: req.params.notificationId,
		})

		if (!notification) {
			return res
				.status(404)
				.json({ status: 0, message: 'No notification found with this id' })
		}

		res
			.status(200)
			.json({ status: 1, message: 'Notification data.', notification })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const getNotificationByUser = async (req, res) => {
	const { userId } = req.params

	try {
		const notification = await paginate(req, Notification, [
			{ $match: { user: ObjectId(userId) } },
			{ $sort: { createdAt: -1 } }
		])

		if (!notification.totalDocs) {
			return res
				.status(404)
				.json({ status: 0, message: 'No notification found with this id' })
		}

		res
			.status(200)
			.json({ status: 1, message: 'List of user notifications.', notification })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const updateNotification = async (req, res) => {
	const { title, body, user, data, action, isArchived } = req.body

	let image = req.file?.path

	if (!image) {
		const notificationData = await Notification.findOne(
			{ _id: req.params.notificationId },
			'-_id image',
		)

		if (!notificationData) {
			return res.status(404).json({
				status: 0,
				message: 'No notification with this id',
			})
		}

		image = notificationData.image
	}

	try {
		const notification = await Notification.findByIdAndUpdate(
			req.params.notificationId,
			{ title, body, user, data, action, isArchived, image },
		)

		if (!notification) {
			return res.status(404).json({
				status: 0,
				message: 'No notification with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Notification updated successfully',
			notification,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const deleteNotification = async (req, res) => {
	try {
		const notification = await Notification.findByIdAndDelete(
			req.params.notificationId,
		)

		if (!notification) {
			return res.status(404).json({
				status: 0,
				message: 'No notification with this group id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Notification removed successfully',
			notification,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const setNotificationAction = async (req, res) => {
	const { action, type, userId } = req.body

	try {
		const notification = await Notification.findByIdAndUpdate(
			req.params.notificationId,
			{ action },
			{ new: true },
		)

		if (action === 'declined' && type === 'byt_new_order_action') {
			await Order.findByIdAndUpdate(notification.data.orderId, {
				$pull: { guests: ObjectId(userId) },
			})
		}

		if (!notification) {
			return res.status(404).json({
				status: 0,
				message: 'No notification with this id',
			})
		}

		res.status(200).json({
			status: 1,
			message: 'Notification updated successfully',
			notification,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = {
	addNotification,
	getAllNotification,
	getNotification,
	getNotificationByUser,
	updateNotification,
	deleteNotification,
	setNotificationAction,
}
