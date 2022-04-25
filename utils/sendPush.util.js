const { ObjectId } = require('mongodb')
const { admin } = require('../config/firebase.config')
const Notification = require('../models/notification.model')
const User = require('../models/user.model')
const RestaurantOwner = require('../models/restaurantOwner.model')

const sendPush = async (userIds, userType, title, body, data = {}) => {
	const userData = await getFirebaseTokens(userIds, userType)

	const tokens = userData.filter((data) => data.firebaseToken)

	if (!userData.length || !tokens.length) {
		console.log('No firebase tokens found for,', userIds)
		return false
	}

	const message = []

	userData.map((user) => {
		if (!user.firebaseToken) return
		data.notificationId = user.notificationId.toString()
		message.push({
			notification: {
				title,
				body,
			},
			apns: {
				payload: {
					aps: {
						category: data?.type || '',
						sound: 'default',
					},
				},
			},
			data,
			token: user.firebaseToken,
		})
	})

	admin
		.messaging()
		.sendAll(message)
		.then(async (res) => {
			// Response is a message ID string.
			console.log('Successfully sent message:', res)

			if (userData.length) {
				const notificationArr = []
				userData.forEach((user) => {
					if (data.notificationId) delete data.notificationId
					const obj = {
						user: user._id,
						title,
						body,
						data,
						_id: user.notificationId,
					}

					if (data.action) obj.action = data.action

					notificationArr.push(obj)
				})

				await Notification.insertMany(notificationArr)
			}

			return res
		})
		.catch((error) => {
			console.log('Error sending message:', error)
			throw new Error(error.message)
		})
}

/**
 * Sends the multiple messages to devices
 *
 * @param notificationData (object[]) - Array of message objects
 * 		@example
 * 			```javascript
 * 				notificationData = [{
 *					notification: { title: 'Price drop', body: '5% off all electronics' },
 *					apns: { payload: { aps: { category: data?.type || '', sound: 'default', }, }, },
 *					data: { type: 'byt_regular },
 *					token: registrationToken,
 *				}]
 * 			```
 *
 * @param userIds (objectId[]) - Array of user ids you want send message to
 * @returns A Promise fulfilled with an object representing the result of the
 *   send operation.
 */

const sendMultiPush = (notificationData, userIds) => {
	admin
		.messaging()
		.sendAll(notificationData)
		.then(async (res) => {
			// Response is a message ID string.
			console.log('Successfully sent message:', res)

			const notificationArr = []
			notificationData.forEach((data, i) => {
				notificationArr.push({
					user: userIds[i],
					title: data.notification.title,
					body: data.notification.body,
				})
			})

			await Notification.insertMany(notificationArr)

			return res
		})
		.catch((error) => {
			console.log('Error sending message:', error)
			throw new Error(error.message)
		})
}

module.exports = { sendPush, sendMultiPush }

const getFirebaseTokens = async (userIds, modelName) => {
	userIds = userIds.map(String)

	let Model = User
	if (modelName === 'restaurantOwner') Model = RestaurantOwner

	const userData = await Model.aggregate([
		{ $match: { $expr: { $in: [{ $toString: '$_id' }, userIds] } } },
		{ $project: { firebaseToken: 1, notificationId: new ObjectId() } },
	])

	return userData
}
