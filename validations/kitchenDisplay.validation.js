const { check } = require('express-validator')

const kitchenDisplayRules = [
  check('orderType')
    .trim()
    .notEmpty()
    .withMessage('order type is required')
    .toLowerCase(),
  check('orderId')
    .notEmpty()
    .withMessage('orderId is required')
    .isMongoId()
    .withMessage('Enter valid order id'),
  check('tableNo')
    .trim()
    .notEmpty()
    .withMessage('TableNo is required')
    .toLowerCase(),
  check('paymentType')
    .trim()
    .notEmpty()
    .withMessage('PaymentType is required')
    .toLowerCase(),
  check('items.*.item').trim().notEmpty().withMessage('item name is required '),
  check('items.*.quantity')
    .trim()
    .notEmpty()
    .withMessage('item quantity is required'),
]

module.exports = kitchenDisplayRules
