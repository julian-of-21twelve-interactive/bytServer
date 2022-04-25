const express = require('express')
const router = express.Router()

//Get Controllers
const {
	getOrders,
	getOrder,
	addOrder,
	updateOrder,
	deleteOrder,
	getOrdersByUser,
	searchOrder,
	getWaitingListCount,
	getOrdersByRestaurant,
	updateOrderStatus,
	getKitchenDisplayOrders,
	getOrderByOrderNo,
	getTicketHistory,
	searchUserOrderByRestaurant,
	searchRestaurantOrderByUser,
	getOrderShareLink,
} = require('../controllers/order.controller')

//Validators
const { isAuthenticated } = require('../middlewares/auth.middleware')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const validate = require('../validations/validator')
const {
	orderRules,
	ticketHistoryRules,
} = require('../validations/order.validation')
const Order = require('../models/order.model')
const { searchByFieldRules } = require('../validations/common.validation')
const { permit } = require('../middlewares/permission.middleware')

//validate params
router.param('orderId', validateObjectId('orderId'))

//Get all orders
router.get('/', isAuthenticated(), permit, getOrders)

router.post(
	'/search',
	isAuthenticated(),
	searchByFieldRules(Order),
	validate,
	searchOrder,
)

router.get(
	'/search_user_orders/user/:userId/query/:searchQuery?',
	validateObjectId('userId'),
	searchUserOrderByRestaurant,
)

router.get(
	'/search_restaurant_orders/restaurant/:restaurantId/query/:searchQuery',
	validateObjectId('restaurantId'),
	searchRestaurantOrderByUser,
)

//Get order by Id
router.get('/:orderId', isAuthenticated(), getOrder)

router.get('/order_no/:orderNo', isAuthenticated(), getOrderByOrderNo)

router.put('/:orderId/status/:status', updateOrderStatus)

router.get(
	'/restaurant/:restaurantId',
	isAuthenticated(),
	validateObjectId('restaurantId'),
	getOrdersByRestaurant,
)

router.get(
	'/kitchen_display/:restaurantId/:category?',
	isAuthenticated(),
	permit,
	validateObjectId('restaurantId'),
	getKitchenDisplayOrders,
)

router.post(
	'/ticket_history/:restaurantId',
	isAuthenticated(),
	permit,
	validateObjectId('restaurantId'),
	ticketHistoryRules,
	validate,
	getTicketHistory,
)

router.get(
	'/user/:userId',
	isAuthenticated(),
	validateObjectId('userId'),
	getOrdersByUser,
)

router.post('/waiting_list', getWaitingListCount)

router.get('/share_link/:orderId', isAuthenticated(), getOrderShareLink)

//Add a order
router.post('/', isAuthenticated(), orderRules, validate, addOrder)

//Update a order
router.put('/:orderId', isAuthenticated(), orderRules, validate, updateOrder)

//Delete Order
router.delete('/:orderId', isAuthenticated(), deleteOrder)

module.exports = router
