const User = require('../models/user.model')
const Role = require('../models/role.model')
const RestaurantOwner = require('../models/restaurantOwner.model')
const StaffMember = require('../models/staffMember.model')

const changePassword = async (req, res, next) => {
	const { oldPassword, newPassword } = req.body

	const role = await Role.findOne({ _id: req.user.role })

	let Model = User
	if (role?.isRestaurantOwner) Model = RestaurantOwner
	if (role?.isStaff) Model = StaffMember

	try {
		const user = await Model.findOne({ _id: req.user.id })

		var error
		if (!user) {
			return res
				.status(404)
				.json({ status: 0, message: 'No user found with this id' })
		}
		if (oldPassword.toString() === newPassword.toString()) {
			error = new Error(
				'Your old password and new password are same. Please enter different password.',
			)

			return next(error)
		}
		user.changePassword(oldPassword, newPassword, function (err) {
			if (err) {
				if (err.name === 'IncorrectPasswordError') {
					error = new Error('Incorrect password')
					return next(error)
					// Return error
				} else {
					error = new Error(
						'Something went wrong!! Please try again after sometimes.',
					)
					return next(error)
				}
			}

			res.status(200).json({
				status: 1,
				message: 'Your password has been changed successfully',
			})
		})
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

const changeLanguage = async (req, res) => {
	const { language } = req.body

	try {
		const user = await User.findByIdAndUpdate(req.user.id, { language })

		if (!user) {
			res.status(404).json({ status: 0, message: 'User not found!' })
		}

		res
			.status(200)
			.json({ status: 1, message: 'Language change successfully!' })
	} catch (error) {
		console.log(error)
		throw new Error(error.message)
	}
}

module.exports = { changePassword, changeLanguage }
