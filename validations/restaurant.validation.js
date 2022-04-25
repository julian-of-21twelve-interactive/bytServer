const { check } = require('express-validator')
const Restaurant = require('../models/restaurant.model')

const addRestaurantRules = [
	check('name')
		.trim()
		.notEmpty()
		.withMessage('Restaurant name is required')
		.isLength({ min: 3 }),
	check('city').trim().notEmpty().withMessage('City name is required'),
	check('isOwner').isBoolean(),
	check('owner').notEmpty().isMongoId().withMessage('Enter valid group id'),
	check('std').trim().notEmpty().withMessage('Restaurant phone is required'),
	check('contact')
		.trim()
		.notEmpty()
		.withMessage('Restaurant contact number is required')
		.custom((val) => {
			const contactArr = JSON.parse(val)
			contactArr.forEach((contact) => {
				if (contact.toString().length < 10)
					throw new Error('Invalid restaurant mobile number')
			})
			return true
		}),
	check('location')
		.optional({ checkFalsy: true })
		.trim()
		.notEmpty()
		.withMessage('Restaurant location is required'),
	check('coords')
		.optional({ checkFalsy: false })
		.isLatLong()
		.withMessage('Invalid coordinates'),
	check('status')
		.notEmpty()
		.withMessage('Opening status is required')
		.isBoolean(true),
	check('alcoholServe').optional({ checkFalsy: false }).isBoolean(true),
	check('services').optional(),
	check('seating')
		.optional({ checkFalsy: true })
		.toLowerCase()
		.isIn([
			'seating available',
			'no seating available',
			'indoor seating',
			'outdoor',
		])
		.withMessage('Invalid seating type'),
	check('seatingPreference')
		.optional({ checkFalsy: true })
		.toLowerCase()
		.toArray()
		.isArray()
		.withMessage('Invalid seating preference'),
	check('paymentMethod')
		.optional({ checkFalsy: true })
		.toLowerCase()
		.isIn(['card and cash', 'cash only']),
	check('cuisines').optional(),
	check('tags').optional(),
	check('openDays')
		.optional({ checkFalsy: true })
		.toLowerCase()
		.custom((val) => {
			const days = [
				'monday',
				'tuesday',
				'wednesday',
				'thursday',
				'friday',
				'saturday',
				'sunday',
			]

			val.forEach((day) => {
				if (!days.includes(day)) throw new Error('Invalid day - ' + day)
			})

			return true
		}),
	check('openTiming')
		.optional({ checkFalsy: true })
		.custom((val) => {
			// const timingJson = JSON.parse(val)
			if (typeof val === 'string') {
				if (!val.includes(' to ')) throw new Error('Invalid restaurant time')
			} else {
				val.forEach((v) => {
					if (!v.includes(' to ')) throw new Error('Invalid restaurant time')
				})
			}

			return true
		}),
	check('email')
		.optional({ checkFalsy: true })
		.isEmail()
		.withMessage('Invalid email address'),
	check('website')
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage('Invalid website link'),
	check('package')
		.optional({ checkFalsy: false })
		.isMongoId()
		.withMessage('Invalid package id'),
	check('facebook')
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage('Invalid facebook link'),
	check('instagram')
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage('Invalid instagram link'),
	check('twitter')
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage('Invalid twitter link'),
	check('description')
		.optional({ checkFalsy: false })
		.isLength({ min: 10 })
		.withMessage('Minimum of 10 letters are required for description'),
	check('discount')
		.optional({ checkFalsy: true })
		.isInt({ min: 1, max: 100 })
		.withMessage('Invalid discount number'),
	check('lightChargePUnit')
		.optional({ checkFalsy: false })
		.isInt({ min: 1 })
		.withMessage('Invalid light charge per unit'),
]

const updateRestaurantRules = [
	check('name')
		.trim()
		.notEmpty()
		.withMessage('Restaurant name is required')
		.isLength({ min: 3 }),
	check('city').trim().notEmpty().withMessage('City name is required'),
	check('isOwner').isBoolean(),
	check('std').trim().notEmpty().withMessage('Restaurant phone is required'),
	check('contact')
		.trim()
		.notEmpty()
		.withMessage('Restaurant contact number is required')
		.custom((val) => {
			const contactArr = JSON.parse(val)
			contactArr.forEach((contact) => {
				if (contact.toString().length < 10)
					throw new Error('Invalid restaurant mobile number')
			})
			return true
		}),
	check('location')
		.trim()
		.notEmpty()
		.withMessage('Restaurant location is required'),
	check('coords')
		.trim()
		.notEmpty()
		.withMessage('Restaurant coordinates are required')
		.isLatLong()
		.withMessage('Invalid coordinates'),
	check('status').isBoolean(true),
	check('alcoholServe').isBoolean(true),
	check('services').trim().notEmpty().withMessage('Services are required'),
	check('seating')
		.optional({ checkFalsy: true })
		.toLowerCase()
		.isIn([
			'seating available',
			'no seating available',
			'indoor seating',
			'outdoor',
		])
		.withMessage('Invalid seating type'),
	check('seatingPreference')
		.toLowerCase()
		.toArray()
		.isArray()
		.withMessage('Invalid seating preference')
		.isLength({ min: 1 })
		.withMessage('Seating preference is required'),
	check('paymentMethod')
		.trim()
		.notEmpty()
		.withMessage('Payment method is required')
		.toLowerCase()
		.isIn(['card and cash', 'cash only'])
		.withMessage('Invalid payment method'),
	check('cuisines').optional(),
	check('tags').trim().notEmpty().withMessage('Tags are required'),
	check('openDays')
		.trim()
		.notEmpty()
		.withMessage('Opening days are required')
		.toLowerCase()
		.custom((val) => {
			const days = [
				'monday',
				'tuesday',
				'wednesday',
				'thursday',
				'friday',
				'saturday',
				'sunday',
			]

			JSON.parse(val).forEach((day) => {
				if (!days.includes(day)) throw new Error('Invalid day - ' + day)
			})

			return true
		}),
	check('openTiming')
		.trim()
		.notEmpty()
		.custom((val) => {
			if (!val.startsWith('[')) {
				if (!val.includes(' to ')) throw new Error('Invalid restaurant time')
			} else {
				JSON.parse(val).forEach((v) => {
					if (!v.includes(' to ')) throw new Error('Invalid restaurant time')
				})
			}

			return true
		}),
	check('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Invalid email address'),
	check('website')
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage('Invalid website link'),
	check('package')
		.trim()
		.notEmpty()
		.withMessage('Package is required')
		.isMongoId()
		.withMessage('Invalid package id'),
	check('discount')
		.optional({ checkFalsy: true })
		.isInt({ min: 1, max: 100 })
		.withMessage('Invalid discount number'),
	check('lightChargePUnit')
		.optional({ checkFalsy: false })
		.isInt({ min: 1 })
		.withMessage('Invalid light charge per unit'),
]

const searchRestaurantRules = [
	check('field')
		.trim()
		.notEmpty()
		.withMessage('Field is required')
		.custom(async (val) => {
			const checkField = await Restaurant.aggregate([
				{ $match: { [val]: { $exists: true } } },
				{ $limit: 5 },
			])
			if (!checkField.length) throw new Error('Invalid field name')

			return true
		}),
	check('search').trim().notEmpty().withMessage('Search text is required'),
]

const getRestaurantByCostRules = [
	check('min')
		.trim()
		.notEmpty()
		.withMessage('Minimum cost is required')
		.isInt({ min: 0 })
		.withMessage('Invalid minimum cost'),
	check('max')
		.trim()
		.notEmpty()
		.withMessage('Maximum cost is required')
		.isInt({ min: 0 })
		.withMessage('Invalid minimum cost')
		.custom((val, { req }) => {
			if (val < Number(req.query.min))
				throw new Error('Minimum cost cannot be greater than maximum cost')

			return true
		}),
]

const getRestaurantByFilterRules = [
	check('filterId')
		.trim()
		.notEmpty()
		.withMessage('Filter is required')
		.isMongoId()
		.withMessage('Invalid filter id'),
]

module.exports = {
	addRestaurantRules,
	updateRestaurantRules,
	searchRestaurantRules,
	getRestaurantByCostRules,
	getRestaurantByFilterRules,
}
