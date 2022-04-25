const Roles = require('../models/role.model')

// middleware for doing role-based permissions
const permit = async (req, res, next) => {
	const { method, user } = req

	const role = await Roles.findOne({ _id: user.role }).lean()
	const URIPathName = req.baseUrl.split('/')[3]
	const re = new RegExp(URIPathName.replace('_', '') + '*')

	const permissionObj = role.permissions.find((permission) =>
		re.test(permission.module),
	)

	let operation = 'read'
	if (method === 'POST') operation = 'create'
	else if (['PUT', 'PATCH'].includes(method)) operation = 'update'
	else if (method === 'DELETE') operation = 'delete'

	if (user && ((permissionObj && permissionObj[operation]) || role.isSuper)) {
		next() // role is allowed, so continue on the next middleware
	} else {
		res.status(403).json({ status: 0, message: 'Forbidden' }) // user is forbidden
	}
}

const userAuth =
	(userId, excludeRoles = ['ADMIN']) =>
		async (req, res, next) => {
			const { user } = req

			const roles = (await Roles.find({ name: { $in: excludeRoles } })).map(
				(role) => role._id.toString(),
			)

			if (roles.includes(user.role) || user.id === req.params[userId]) {
				next()
			} else {
				res.status(403).json({ status: 0, message: 'Forbidden' }) // user is forbidden
			}
		}

module.exports = { permit, userAuth }
