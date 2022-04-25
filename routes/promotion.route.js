const express = require('express')
const router = express.Router()

const {
	addPromotion,
    getPromotionByDate,
    getAllPromotion,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    removeDiscountToPromotion,
    addDiscountToPromotion,
    getPromotionByAddedBy
    
	
} = require('../controllers/promotion.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const { addPromotionRules } = require('../validations/promotion.validation')
const validateObjectId = require('../middlewares/validateObjectId.middleware')



const validate = require('../validations/validator')
const { permit } = require('../middlewares/permission.middleware')

router.param('promotionId', validateObjectId('promotionId'))
router.param('addedBy', validateObjectId('addedBy'))

router.post('/',addPromotionRules,addPromotion)
router.put('/:promotionId',updatePromotion)
router.delete('/:promotionId',deletePromotion)
router.post('/by_date',   getPromotionByDate)
router.post('/add_discount',   addDiscountToPromotion)
router.post('/remove_discount',   removeDiscountToPromotion)

router.get('/',  getAllPromotion)
router.get('/:promotionId',   getPromotionById)
router.get('/added_by/:addedBy',   getPromotionByAddedBy)



module.exports = router