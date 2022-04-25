const { ObjectId } = require('mongodb')
const CreditCard = require('../models/creditCard.model')
const paginate = require('../utils/aggregatePaginate.util')

const addCreditCard = async (req, res) => {
  const { name, cardNumber, expiry, customer } = req.body

  try {
    const creditCard = new CreditCard({ name, cardNumber, expiry, customer })

    await creditCard.save()

    res
      .status(201)
      .json({ status: 1, message: 'Credit card added successfully', creditCard })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getAllCreditCard = async (req, res) => {
  try {
    const creditCards = await paginate(req, CreditCard, [
      { $sort: { createdAt: -1 } },
    ])

    if (!creditCards.totalDocs) {
      return res.status(404).json({
        status: 0,
        message: 'No credit cards found',
        creditCards_count: creditCards.totalDocs
      })
    }

    res
      .status(200)
      .json({ status: 1, message: 'List of all credit cards.', creditCards_count: creditCards.totalDocs, creditCards })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getCreditCard = async (req, res) => {
  try {
    const creditCard = await CreditCard.findOne({
      _id: req.params.creditCardId,
    })

    if (!creditCard) {
      return res
        .status(404)
        .json({ status: 0, message: 'No credit card found with this id' })
    }

    res.status(200).json({ status: 1, message: 'Successfully received credit card.', creditCard })

  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getCreditCardByUser = async (req, res) => {
  try {
    const creditCard = await paginate(req, CreditCard, [
      { $match: { customer: ObjectId(req.user.id) } },
    ])

    if (!creditCard.totalDocs) {
      return res
        .status(404)
        .json({ status: 0, message: 'No credit card found with this id' })
    }

    res.status(200).json({ status: 1, message: 'Successfully received user credit card', creditCard })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const updateCreditCard = async (req, res) => {
  const { name, cardNumber, expiry, customer } = req.body

  try {
    const creditCard = await CreditCard.findByIdAndUpdate(
      req.params.creditCardId,
      { name, cardNumber, expiry, customer },
    )

    if (!creditCard) {
      return res.status(404).json({
        status: 0,
        message: 'No credit card with this id'
      })
    }

    res
      .status(200)
      .json({ status: 1, message: 'Credit card updated successfully', creditCard })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const deleteCreditCard = async (req, res) => {
  try {
    const creditCard = await CreditCard.findByIdAndDelete(
      req.params.creditCardId,
    )

    if (!creditCard) {
      return res.status(404).json({
        status: 0,
        message: 'No credit card with this group id'
      })
    }

    res
      .status(200)
      .json({ status: 1, message: 'Credit card removed successfully', creditCard })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

module.exports = {
  addCreditCard,
  getAllCreditCard,
  getCreditCard,
  getCreditCardByUser,
  updateCreditCard,
  deleteCreditCard,
}
