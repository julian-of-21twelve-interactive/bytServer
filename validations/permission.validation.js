const { check } = require('express-validator')
const mongoose = require('mongoose')

const addPermissionRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('permissions')
		.isArray()
		.isLength({ min: 1 })
		.withMessage('Permissions is required'),
	check('permissions.*.module')
		.trim()
		.notEmpty()
		.withMessage('Module is required')
		.custom(async (name) => {
			const checkModel = await mongoose.connection.db
				.listCollections({ name })
				.hasNext()

			if (!checkModel) throw new Error('Model not found!')

			return true
		}),
	check('permissions.*.create').optional({ checkFalsy: false }).isBoolean(true),
	check('permissions.*.read').optional({ checkFalsy: false }).isBoolean(true),
	check('permissions.*.update').optional({ checkFalsy: false }).isBoolean(true),
	check('permissions.*.delete').optional({ checkFalsy: false }).isBoolean(true),
]

const updatePermissionRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('permissions')
		.isArray()
		.isLength({ min: 1 })
		.withMessage('Permissions is required'),
	check('permissions.*.module')
		.trim()
		.notEmpty()
		.withMessage('Module is required')
		.custom(async (name) => {
			const checkModel = await mongoose.connection.db
				.listCollections({ name })
				.hasNext()

			if (!checkModel) throw new Error('Model not found!')

			return true
		}),
	check('permissions.*.create').optional({ checkFalsy: false }).isBoolean(true),
	check('permissions.*.read').optional({ checkFalsy: false }).isBoolean(true),
	check('permissions.*.update').optional({ checkFalsy: false }).isBoolean(true),
	check('permissions.*.delete').optional({ checkFalsy: false }).isBoolean(true),
]

module.exports = { addPermissionRules, updatePermissionRules }
