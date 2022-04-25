const { check } = require('express-validator')
const mongoose = require('mongoose')

const addRoleRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('permissions')
		.optional({ checkFalsy: false })
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
	check('color')
		.optional({ checkFalsy: false })
		.isHexColor()
		.withMessage('Must be a valid hexadecimal color code'),
	check('refModel').optional(),
	check('creator')
		.optional({ checkFalsy: false })
		.isMongoId()
		.withMessage('Invalid creator id'),
	check('permissionList')
		.optional({ checkFalsy: false })
		.isMongoId()
		.withMessage('Invalid permission list id'),
	check('roleAccessTags').optional({ checkFalsy: false }).isArray(),
	check('hasAccessTags').optional({ checkFalsy: false }).isArray(),
	check('isRestaurantOwner').optional({ checkFalsy: false }).isBoolean(true),
	check('isUser').optional({ checkFalsy: false }).isBoolean(true),
	check('isSupplier').optional({ checkFalsy: false }).isBoolean(true),
	check('isStaff').optional({ checkFalsy: false }).isBoolean(true),
]

const updateRoleRules = [
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
	check('color')
		.optional({ checkFalsy: false })
		.isHexColor()
		.withMessage('Must be a valid hexadecimal color code'),
	check('refModel')
		.trim()
		.notEmpty()
		.withMessage('Reference model is required'),
	check('creator')
		.trim()
		.notEmpty()
		.withMessage('Creator is required')
		.isMongoId()
		.withMessage('Invalid creator id'),
	check('permissionList')
		.optional({ checkFalsy: false })
		.isMongoId()
		.withMessage('Invalid permission list id'),
	check('roleAccessTags').optional({ checkFalsy: false }).isArray(),
	check('hasAccessTags').optional({ checkFalsy: false }).isArray(),
]

module.exports = { addRoleRules, updateRoleRules }
