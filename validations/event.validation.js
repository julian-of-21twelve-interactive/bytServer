const { check } = require('express-validator')

const addEventRules = [
  check('eventName').trim().notEmpty().withMessage('Eventname is required'),
  check('eventType')
    .trim()
    .notEmpty()
    .withMessage('EventType is required'),
  check('startDate').trim().notEmpty().withMessage('StartDate is required'),
  check('duration').trim().notEmpty().withMessage('Duration is required'),
  check('status').trim().notEmpty().withMessage('Status is required'),
  check('restaurant').trim().notEmpty().isMongoId().withMessage('Restaurant is required')
  
]



module.exports = {addEventRules}