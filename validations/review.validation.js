const { check, oneOf } = require('express-validator')

const addReviewRules = [
  oneOf(
    [
      check('item')
        .trim()
        .notEmpty()
        .withMessage('Item is required')
        .isMongoId()
        .withMessage('Invalid item id'),
      check('restaurant')
        .trim()
        .notEmpty()
        .withMessage('Restaurant is required')
        .isMongoId()
        .withMessage('Invalid restaurant id'),
    ],
    ({ req }) => {
      console.log(req)
      console.log(req['express-validator#contexts'])
    },
  ),
  check('description').trim(),
  check('rating').trim().default(5),
]

const updateReviewRules = [
  oneOf(
    [
      check('item')
        .trim()
        .notEmpty()
        .withMessage('Item is required')
        .isMongoId()
        .withMessage('Invalid item id'),
      check('restaurant')
        .trim()
        .notEmpty()
        .withMessage('Restaurant is required')
        .isMongoId()
        .withMessage('Invalid restaurant id'),
    ],
    'Item or restaurant id is required',
  ),
  check('description').trim(),
  check('rating').trim().default(5),
]

module.exports = { addReviewRules, updateReviewRules }
