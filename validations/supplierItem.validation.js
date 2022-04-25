const { check } = require('express-validator')



 const additemRules = [
    check('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      ,
    check('price')
      .trim()
      .notEmpty()
      .withMessage('Price is required'),
    check('sku')
      .trim()
      .notEmpty()
      .withMessage('SKU is required')
      
  ]


  module.exports={
    additemRules
  }