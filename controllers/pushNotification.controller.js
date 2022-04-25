// import { admin } from '../config/firebase.config'

const { admin } = require('../config/firebase.config')

const sendNotification = async (req, res) => {
	try {
		const { deviceId, title, body } = req.body

		const notification_options = {
			priority: 'high',
			timeToLive: 60 * 60 * 24,
		}

		const message_notification = {
			notification: {
				title: title,
				body: body,
			},
		}

		if (!deviceId)
			return res.status(404).json({
				status: 0,
				message: `send a valid device ID`,
			})
		admin
			.messaging()
			.sendToDevice(deviceId, message_notification, notification_options)
		return res.status(200).json({
			status: 1,
			message: `push notification sent successfuly to ${deviceId} `,
			data: message_notification,
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = { sendNotification }
