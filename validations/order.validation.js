const { check, oneOf } = require('express-validator')
const { isValidObjectId } = require('mongoose')

const orderRules = [
	check('orderName').optional(),
	check('customer')
		.if((val, { req }) => {
			if (val !== '' && req.body.staff === undefined) return true
			throw new Error('Customer or staff required')
		})
		.trim()
		.notEmpty()
		.withMessage('Customer is required')
		.isMongoId()
		.withMessage('Invalid customer id'),
	check('staff')
		.if((val, { req }) => {
			if (val !== '' && req.body.customer === undefined) return true
			throw new Error('Customer or staff required')
		})
		.trim()
		.notEmpty()
		.withMessage('Staff member is required')
		.isMongoId()
		.withMessage('Invalid staff member id'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('restaurant ID is required'),
	check('orderStatus')
		.trim()
		.notEmpty()
		.withMessage('OrderStatus is required')
		.toLowerCase()
		.isIn(['pending', 'preparing', 'cancelled', 'complete']),
	check('orderType')
		.trim()
		.notEmpty()
		.withMessage('Order type is required')
		.toLowerCase()
		.isIn(['dine-in', 'pickup', 'delivery']),
	check('orderFrom')
		.optional({ checkFalsy: false })
		.toLowerCase()
		.isIn(['customer', 'restaurant'])
		.withMessage('Invalid order from value'),
	check('paymentType')
		.trim()
		.notEmpty()
		.withMessage('Payment type is required'),
	check('paymentMethod')
		.trim()
		.notEmpty()
		.withMessage('Payment type is required'),
	check('table')
		.optional({ checkFalsy: false })
		.isArray()
		.custom((val) => {
			val.map((v) => {
				if (!isValidObjectId(v)) throw new Error('Invalid table id')
			})

			return true
		}),
	check('guests')
		.toArray()
		.optional({ checkFalsy: true })
		.isArray()
		.custom((val) => {
			val.map((v) => {
				if (!isValidObjectId(v)) throw new Error('Invalid guest id')
			})

			return true
		}),
	check('items').isArray(),
	check('items.*.item')
		.if((val, { req, path }) => {
			const idx = path.replace('items[', '')[0]
			if (val !== '' && req.body.items[idx].combo === undefined) return true
			//- FIXME:
			throw new Error('Item or combo required')
		})
		.trim()
		.notEmpty()
		.withMessage('Item is required')
		.isMongoId()
		.withMessage('Invalid item id'),
	check('items.*.combo')
		.if((val, { req, path }) => {
			const idx = path.replace('items[', '')[0]
			if (val !== '' && req.body.items[idx].item === undefined) return true
			//- FIXME:
			throw new Error('Item or combo required')
		})
		.trim()
		.notEmpty()
		.withMessage('Combo is required')
		.isMongoId()
		.withMessage('Invalid combo id'),
	check('items.*.customer')
		.isArray()
		.isLength({ min: 1 })
		.withMessage('Customer is required'),
	check('items.*.customer.*.customerId')
		.if(check('staff').not().exists())
		.trim()
		.notEmpty()
		.withMessage('Customer is required')
		.isMongoId()
		.withMessage('Invalid customer id'),
	check('items.*.customer.*.quantity')
		.isInt({ min: 1 })
		.withMessage('Quantity is required'),
	check('items.*.customer.*.addon')
		.optional({ checkFalsy: false })
		.isArray()
		.withMessage('Invalid addon'),
	check('items.*.customer.*.addon.*.id')
		.trim()
		.notEmpty()
		.withMessage('Addon id is required')
		.isMongoId()
		.withMessage('Invalid addon id'),
	check('items.*.customer.*.addon.*.quantity')
		.isInt({ min: 1 })
		.withMessage('Addon quantity is required'),
	check('items.*.customer.*.addon.*.price')
		.isInt({ min: 1 })
		.withMessage('Addon price is required'),
	check('items.*.customer.*.note').optional(),
	check('items.*.price')
		.trim()
		.notEmpty()
		.withMessage('Price is required')
		.isLength({ min: 1 })
		.isInt({ min: 1 })
		.withMessage('Price must be at least 1'),
	check('items.*.addon.*.quantity')
		.optional({ checkFalsy: false })
		.isInt({ min: 1 })
		.withMessage('At least 1 addon quantity is required'),
	check('items.*.addon.*.price')
		.optional({ checkFalsy: false })
		.isInt({ min: 1 })
		.withMessage('Addon price is required'),
	check('items.*.quantity')
		.trim()
		.notEmpty()
		.withMessage('Quantity is required')
		.isInt({ min: 1 })
		.withMessage('Quantity must be at least 1'),
	check('deliveryTime')
		.notEmpty()
		.withMessage('delivery date is required')
		.isISO8601()
		.withMessage('Invalid date format'),
	check('instructions').optional(),
	check('status').optional({ checkFalsy: true }).isBoolean(true),
	check('coupon')
		.optional({ checkFalsy: true })
		.isMongoId()
		.withMessage('Invalid coupon id'),
	check('visitors')
		.notEmpty()
		.withMessage('Visitors count is required')
		.custom((visitors) => {
			visitors.adult = Number(visitors.adult)
			if (typeof visitors.adult === 'number' && visitors.adult < 1)
				throw new Error('At least 1 adult visitor is required')

			return true
		}),
	// check('visitors.adult')
	// 	.optional({ checkFalsy: false })
	// 	.isInt({ min: 1 })
	// 	.withMessage('At least 1 adult visitor is required'),
	check('visitors.children')
		.optional({ checkFalsy: false })
		.isInt()
		.withMessage('Invalid children visitor count'),
	check('tip').optional({ checkFalsy: false }).default(0),
	check('reOrder.orderId')
		.optional({ checkFalsy: false })
		.isMongoId()
		.withMessage('Invalid order id'),
]

const ticketHistoryRules = [
	check('start')
		.optional({ checkFalsy: false })
		.matches('^([0-1]?[0-9]|2[0-4]):([0-5][0-9])$')
		.withMessage('Invalid time format'),
	check('end')
		.optional({ checkFalsy: false })
		.matches('^([0-1]?[0-9]|2[0-4]):([0-5][0-9])$')
		.withMessage('Invalid time format'),
]

module.exports = { orderRules, ticketHistoryRules }
