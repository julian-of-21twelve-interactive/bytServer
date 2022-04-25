const { check } = require('express-validator')
const moment = require('moment')

const addTableRules = [
	check('tableNo').trim().notEmpty().withMessage('Enter Table Number'),
	check('capacity')
		.trim()
		.notEmpty()
		.withMessage('Enter capacity for the table'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('bookingStatus').trim().default(false),
	check('costPerson')
		.notEmpty()
		.withMessage('Cost per person is required')
		.isInt({ min: 1 })
		.withMessage('Invalid cost number'),
	check('floorType').trim().notEmpty().withMessage('Floor type is required'),
	check('position.x')
		.trim()
		.notEmpty()
		.withMessage('Table position x is required')
		.isInt({ min: 1 })
		.withMessage('Invalid x number'),
	check('position.y')
		.trim()
		.notEmpty()
		.withMessage('Table position y is required')
		.isInt({ min: 1 })
		.withMessage('Invalid y number'),
	check('position.align')
		.trim()
		.notEmpty()
		.withMessage('Table position alignment is required')
		.isIn(['horizontal', 'vertical'])
		.withMessage('Invalid table alignment'),
]

const updateTableRules = [
	check('tableNo').trim().notEmpty().withMessage('Enter Table Number'),
	check('capacity')
		.trim()
		.notEmpty()
		.withMessage('Enter capacity for the table'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('costPerson')
		.notEmpty()
		.withMessage('Cost per person is required')
		.isInt({ min: 1 })
		.withMessage('Invalid cost number'),
	check('floorType').trim().notEmpty().withMessage('Floor type is required'),
	check('position.x')
		.trim()
		.notEmpty()
		.withMessage('Table position x is required')
		.isInt({ min: 1 })
		.withMessage('Invalid x number'),
	check('position.y')
		.trim()
		.notEmpty()
		.withMessage('Table position y is required')
		.isInt({ min: 1 })
		.withMessage('Invalid y number'),
	check('position.align')
		.trim()
		.notEmpty()
		.withMessage('Table position alignment is required')
		.isIn(['horizontal', 'vertical'])
		.withMessage('Invalid table alignment'),
]

const getAvailableTablesByRestaurantRules = [
	check('timestamp')
		.trim()
		.notEmpty()
		.withMessage('Timestamp is required')
		.isISO8601({ strict: true, strictSeparator: true })
		.withMessage('Invalid date time value'),
]

const getTablesByRestaurantRules = [
	check('timestamp')
		.optional({ checkFalsy: false })
		.toInt()
		.custom((val) => {
			if (!moment(val).isValid()) throw new Error('Invalid date time value')

			return true
		}),
]

module.exports = {
	addTableRules,
	updateTableRules,
	getAvailableTablesByRestaurantRules,
	getTablesByRestaurantRules,
}
