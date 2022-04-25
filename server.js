const express = require('express')
const app = express()
const server = require('http').createServer(app)
const config = require('./config/config')
const cors = require('cors')

const port = process.env.PORT || config.server.port
const db = require('./db/dbConnection')
const passport = require('./config/passport')
const io = require('socket.io')(server, { cors: { origin: '*' } })

// routes
const commonRoute = require('./routes/common.route')
const userRoute = require('./routes/user.route')
const menuItemRoute = require('./routes/menuItem.route')
const customerRoute = require('./routes/customer.route')
const warehouseProductRoute = require('./routes/warehouseProduct.route')
const tableRoute = require('./routes/table.route')
const reviewRoute = require('./routes/review.route')
const restaurantRoute = require('./routes/restaurant.route')
const restaurantOwnerRoute = require('./routes/restaurantOwner.route')
const itemGroupRoute = require('./routes/itemGroup.route')
const inventoryItemRoute = require('./routes/inventoryItem.route')
const inventoryOrderRoute = require('./routes/inventoryOrder.route')
const staffMemberRoute = require('./routes/staffMember.route')
const orderRoute = require('./routes/order.route')
const invoiceRoute = require('./routes/invoice.route')
const attendanceRoute = require('./routes/attendance.route')
const warehouseOrderRoute = require('./routes/warehouseOrder.route')
const kitchenRoute = require('./routes/kitchenDisplay.route')
const reservationRoute = require('./routes/reservation.route')
const settingRoute = require('./routes/setting.route')
const packageRoute = require('./routes/package.route')
const cartRoute = require('./routes/cart.route')
const dashboardRoute = require('./routes/dashboard.route')
const creditCardRoute = require('./routes/creditCard.route')
const addressRoute = require('./routes/address.route')
const favoriteRoute = require('./routes/favorite.route')
const notificationRoute = require('./routes/notification.route')
const subscriptionRoute = require('./routes/subscription.route')
const filterRoute = require('./routes/filter.route')
const favoriteRestaurantRoute = require('./routes/favoriteRestaurant.route')
const siteVisitorRoute = require('./routes/siteVisitor.route')
const addonRoute = require('./routes/addon.route')
const reportsRoute = require('./routes/reports.route')
const menuTagRoute = require('./routes/menuTag.route')
const searchHistoryRoute = require('./routes/searchHistory.route')
const couponRoute = require('./routes/coupon.route')
const bundleItemRoute = require('./routes/bundleItem.route')
const sideOrderRoute = require('./routes/sideOrder.route')
const reservationTypeRoute = require('./routes/reservationType.route')
const timeSlotRoute = require('./routes/timeSlot.route')
const roleRoute = require('./routes/role.route')
const permissionRoute = require('./routes/permission.route')
const supplierRoute = require('./routes/supplier.route')
const supplierItemRoute = require('./routes/supplierItem.route')
const pettyCashRoute = require('./routes/pettyCash.route')
const pettyCashTransactionRoute = require('./routes/pettyCashTransaction.route')
const taxRoute = require('./routes/tax.route')
const eventRoute = require('./routes/event.route')
const discountRoute = require('./routes/discount.route')
const promotionRoute = require('./routes/promotion.route')
const riderRoute = require('./routes/rider.route')
const pushNotificationRoute = require('./routes/pushNotification.route')
const searchRoute = require('./routes/search.route')
const currencyRoute = require('./routes/currency.route')

// Enable All CORS Requests
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Passport middleware
app.use(passport.initialize())

db.once('open', () => {
	console.log('Database connected...')
})

//set uploads folder as public
app.use(`${config.server.urlPrefix}/uploads`, express.static('uploads'))
app.use(`${config.server.urlPrefix}/assets`, express.static('assets'))

app.use(`*`, (req, res, next) => {
	req.io = io
	next()
})

app.get('/', (req, res) => {
	res.json({ status: 1, message: 'Server is up and running..' })
})

app.use(`${config.server.urlPrefix}/user`, userRoute)
app.use(`${config.server.urlPrefix}/menu_item`, menuItemRoute)
app.use(`${config.server.urlPrefix}/customer`, customerRoute)
app.use(`${config.server.urlPrefix}/warehouse_product`, warehouseProductRoute)
app.use(`${config.server.urlPrefix}/table`, tableRoute)
app.use(`${config.server.urlPrefix}/review`, reviewRoute)
app.use(`${config.server.urlPrefix}/restaurant`, restaurantRoute)
app.use(`${config.server.urlPrefix}/restaurant_owner`, restaurantOwnerRoute)
app.use(`${config.server.urlPrefix}/item_group`, itemGroupRoute)
app.use(`${config.server.urlPrefix}/inventory_item`, inventoryItemRoute)
app.use(`${config.server.urlPrefix}/inventory_order`, inventoryOrderRoute)
app.use(`${config.server.urlPrefix}/staff_member`, staffMemberRoute)
app.use(`${config.server.urlPrefix}/order`, orderRoute)
app.use(`${config.server.urlPrefix}/invoice`, invoiceRoute)
app.use(`${config.server.urlPrefix}/attendance`, attendanceRoute)
app.use(`${config.server.urlPrefix}/warehouse_order`, warehouseOrderRoute)
app.use(`${config.server.urlPrefix}/kitchen`, kitchenRoute)
app.use(`${config.server.urlPrefix}/reservation`, reservationRoute)
app.use(`${config.server.urlPrefix}/setting`, settingRoute)
app.use(`${config.server.urlPrefix}/package`, packageRoute)
app.use(`${config.server.urlPrefix}/cart`, cartRoute)
app.use(`${config.server.urlPrefix}/dashboard`, dashboardRoute)
app.use(`${config.server.urlPrefix}/credit_card`, creditCardRoute)
app.use(`${config.server.urlPrefix}/address`, addressRoute)
app.use(`${config.server.urlPrefix}/favorite`, favoriteRoute)
app.use(`${config.server.urlPrefix}/notification`, notificationRoute)
app.use(`${config.server.urlPrefix}/filter`, filterRoute)
app.use(`${config.server.urlPrefix}/subscription`, subscriptionRoute)
app.use(
	`${config.server.urlPrefix}/favorite_restaurant`,
	favoriteRestaurantRoute,
)
app.use(`${config.server.urlPrefix}/site_visitor`, siteVisitorRoute)
app.use(`${config.server.urlPrefix}/addon`, addonRoute)
app.use(`${config.server.urlPrefix}/reports`, reportsRoute)
app.use(`${config.server.urlPrefix}/menu_tag`, menuTagRoute)
app.use(`${config.server.urlPrefix}/search_history`, searchHistoryRoute)
app.use(`${config.server.urlPrefix}/coupon`, couponRoute)
app.use(`${config.server.urlPrefix}/bundle_item`, bundleItemRoute)
app.use(`${config.server.urlPrefix}/side_order`, sideOrderRoute)
app.use(`${config.server.urlPrefix}/reservation_type`, reservationTypeRoute)
app.use(`${config.server.urlPrefix}/time_slot`, timeSlotRoute)
app.use(`${config.server.urlPrefix}/role`, roleRoute)
app.use(`${config.server.urlPrefix}/permission`, permissionRoute)
app.use(`${config.server.urlPrefix}/supplier`, supplierRoute)
app.use(`${config.server.urlPrefix}/supplier_item`, supplierItemRoute)
app.use(`${config.server.urlPrefix}/petty_cash`, pettyCashRoute)
app.use(
	`${config.server.urlPrefix}/petty_cash_transaction`,
	pettyCashTransactionRoute,
)
app.use(`${config.server.urlPrefix}/tax`, taxRoute)
app.use(`${config.server.urlPrefix}/event`, eventRoute)
app.use(`${config.server.urlPrefix}/discount`, discountRoute)
app.use(`${config.server.urlPrefix}/promotion`, promotionRoute)
app.use(`${config.server.urlPrefix}/rider`, riderRoute)
app.use(`${config.server.urlPrefix}/push_notification`, pushNotificationRoute)
app.use(`${config.server.urlPrefix}/search`, searchRoute)
app.use(`${config.server.urlPrefix}/currency`, currencyRoute)

// Common routes
app.use(`${config.server.urlPrefix}`, commonRoute)

// Handle errors.
app.use((err, req, res, next) => {
	res.status(err.status || 500).json({
		type: 'error',
		error: err.message || 'Something Went Wrong!',
		status: 0,
	})
})

app.all('*', (req, res) => {
	res.status(404).send({ status: 0, message: 'Not found' })
})

server.listen(port, () => {
	console.log(`Server is now running on port ${port}`)
})
