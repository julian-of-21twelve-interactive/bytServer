const { check } = require('express-validator')





const pettyCashRules = [
    check('addedBy').trim().notEmpty().withMessage('AddedBy  is required'),
    check('dayStartAmount').trim().notEmpty().withMessage('Day start Amount is required'),
   
  ]
  
  module.exports = {pettyCashRules}