const { check, oneOf } = require('express-validator')

const favoriteRules = [
	oneOf(
		[check('menu').isMongoId().exists(), check('combo').isMongoId().exists()],
		'Menu or combo is required',
	),
	// check('menu')
	//   .trim()
	//   .notEmpty()
	//   .withMessage('Menu item is required')
	//   .isMongoId()
	//   .withMessage('Invalid menu item id'),
	check('restaurant')
		.trim()
		.notEmpty()
		.withMessage('Restaurant is required')
		.isMongoId()
		.withMessage('Invalid restaurant id'),
	check('customer')
		.trim()
		.notEmpty()
		.withMessage('Customer is required')
		.isMongoId()
		.withMessage('Invalid customer id'),
]

module.exports = { favoriteRules }
