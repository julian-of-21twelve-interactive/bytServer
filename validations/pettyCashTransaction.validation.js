const { check } = require('express-validator')





const pettyCashTransactionRules = [
    check('transactionAmount').trim().notEmpty().withMessage('Transaction Amount  is required'),
    check('receivedBy').trim().notEmpty().withMessage('Received By Amount is required'),
    check('pettyCash').trim().notEmpty().withMessage('Petty Cash is required'),
   
  ]
  
  module.exports = {pettyCashTransactionRules}