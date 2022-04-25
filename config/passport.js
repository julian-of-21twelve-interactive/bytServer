const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JWTstrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const User = require('../models/user.model')
const Roles = require('../models/role.model')
const RestaurantOwner = require('../models/restaurantOwner.model')
const Supplier = require('../models/supplier.model')
const Rider = require('../models/rider.model')
const StaffMember = require('../models/staffMember.model')
const jwtConfig = require('../config/jwt.config')

// use static authenticate method of model in LocalStrategy
// passport.use(User.createStrategy())

passport.use(
	'local',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async function (email, password, done) {
			const roleId = await Roles.findOne({ isUser: true }, { _id: 1 })

			// look for the user data
			User.findOne({ email, role: roleId._id }, function (err, user) {
				// if there is an error
				if (err) {
					return done(err)
				}

				// if user doesn't exist
				if (!user) {
					return done(null, false, {
						name: 'IncorrectUsernameError',
						message: 'User is not registered!',
					})
				}

				// if the password isn't correct
				user.authenticate(password, (err, user, passwordErr) => {
					if (!user) {
						return done(err, false, passwordErr)
					}

					// if the user is properly authenticated
					return done(null, user)
				})
			})
		},
	),
)

passport.use(
	'supplier',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async function (email, password, done) {
			const roleId = await Roles.findOne({ isSupplier: true }, { _id: 1 })

			// look for the user data
			Supplier.findOne({ email, role: roleId._id }, function (err, supplier) {
				// if there is an error
				if (err) {
					return done(err)
				}

				// if supplier doesn't exist
				if (!supplier) {
					return done(null, false, {
						name: 'IncorrectsuppliernameError',
						message: 'supplier is not registered!',
					})
				}

				// if the password isn't correct
				supplier.authenticate(password, (err, supplier, passwordErr) => {
					if (!supplier) {
						return done(err, false, passwordErr)
					}

					// if the supplier is properly authenticated
					return done(null, supplier)
				})
			})
		},
	),
)
passport.use(
	'rider',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async function (email, password, done) {
			const roleId = await Roles.findOne({ isRider: true }, { _id: 1 })

			// look for the user data
			Rider.findOne({ email, role: roleId._id }, function (err, rider) {
				// if there is an error
				if (err) {
					return done(err)
				}

				// if rider doesn't exist
				if (!rider) {
					return done(null, false, {
						name: 'Incorrect rider nameError',
						message: 'Rider is not registered!',
					})
				}

				// if the password isn't correct
				rider.authenticate(password, (err, rider, passwordErr) => {
					if (!rider) {
						return done(err, false, passwordErr)
					}

					// if the rider is properly authenticated
					return done(null, rider)
				})
			})
		},
	),
)

passport.use(
	'staff',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async function (email, password, done) {
			const roleId = await Roles.findOne({ isStaff: true }, { _id: 1 })

			// look for the user data
			StaffMember.findOne({ email, role: roleId._id }, function (err, staff) {
				// if there is an error
				if (err) {
					return done(err)
				}

				// if staff doesn't exist
				if (!staff) {
					return done(null, false, {
						name: 'Incorrect staff nameError',
						message: 'Staff member is not registered!',
					})
				}

				// if the password isn't correct
				staff.authenticate(password, (err, staff, passwordErr) => {
					if (!staff) {
						return done(err, false, passwordErr)
					}

					// if the staff is properly authenticated
					return done(null, staff)
				})
			})
		},
	),
)

passport.use(
	'restaurant',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async function (email, password, done) {
			const roleId = await Roles.findOne(
				{ isRestaurantOwner: true },
				{ _id: 1 },
			)

			// look for the user data
			RestaurantOwner.findOne(
				{ email, role: roleId._id },
				function (err, user) {
					// if there is an error
					if (err) {
						return done(err)
					}

					// if user doesn't exist
					if (!user) {
						return done(null, false, {
							name: 'IncorrectUsernameError',
							message: 'User is not registered!',
						})
					}

					// if the password isn't correct
					user.authenticate(password, (err, user, passwordErr) => {
						if (!user) {
							return done(err, false, passwordErr)
						}

						// if the user is properly authenticated
						return done(null, user)
					})
				},
			)
		},
	),
)

passport.use(
	'admin',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async function (email, password, done) {
			const roleId = await Roles.findOne({ isSuper: true }, { _id: 1 })

			// look for the user data
			User.findOne({ email, role: roleId._id }, function (err, user) {
				// if there is an error
				if (err) {
					return done(err)
				}

				// if user doesn't exist
				if (!user) {
					return done(null, false, {
						name: 'IncorrectUsernameError',
						message: 'Admin is not registered!',
					})
				}

				// if the password isn't correct
				user.authenticate(password, (err, user, passwordErr) => {
					if (!user) {
						return done(err, false, passwordErr)
					}

					// if the user is properly authenticated
					return done(null, user)
				})
			})
		},
	),
)

passport.use(
	'jwt',
	new JWTstrategy(
		{
			secretOrKey: jwtConfig.secret,
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
		},
		async (token, done) => {
			try {
				return done(null, token.user)
			} catch (error) {
				done(error)
			}
		},
	),
)

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

module.exports = passport
