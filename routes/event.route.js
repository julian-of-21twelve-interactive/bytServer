const express = require('express')
const router = express.Router()
const {
	 addEvent,
     deleteEvent,
     getEventById,
     getAllEvent,
     updateEvent,
     getEventByRestaurant,
     removeDiscountToEvent,
     addDiscountToEvent
    
} = require('../controllers/event.controller')
const validateObjectId = require('../middlewares/validateObjectId.middleware')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const {
	addEventRules
} = require('../validations/event.validation')

const validate = require('../validations/validator')


router.param('eventId', validateObjectId('eventId'))

router.post('/',validate,addEventRules, addEvent);
router.delete('/:eventId',isAuthenticated(),deleteEvent)
router.get('/:eventId',getEventById)
router.get('/',getAllEvent)
router.put('/:eventId',isAuthenticated(),updateEvent)


router.param('restaurantId', validateObjectId('restaurantId'))
router.get('/restaurant/:restaurantId',getEventByRestaurant)
router.post('/add_discount',   addDiscountToEvent)
router.post('/remove_discount',   removeDiscountToEvent)








module.exports=router;