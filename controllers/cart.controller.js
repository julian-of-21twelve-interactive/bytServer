const { ObjectId } = require('mongodb')
const Cart = require('../models/cart.model')

const addCart = async (req, res) => {
  const { customer, item, quantity } = req.body

  try {
    const cart = new Cart({ customer, item, quantity })

    await cart.save()

    res.status(201).json({ status: 1, message: 'Cart added successfully', cart })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getAllCart = async (req, res) => {
  try {
    const carts = await Cart.aggregate([{ $sort: { createdAt: -1 } }])

    if (!carts.length) {
      return res.status(404).json({
        status: 0,
        message: 'No carts found',
        carts_count: carts.length
      })
    }

    res
      .status(200)
      .json({ status: 1, message: 'List of all carts.', carts_count: carts.length, carts: res.paginatedResult })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      _id: req.params.cartId,
    })

    if (!cart) {
      return res.status(404).json({ status: 0, message: 'No cart found with this id' })
    }

    res.status(200).json({ status: 1, message: 'Successfully received cart.', cart })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const updateCart = async (req, res) => {
  const { customer, item, quantity } = req.body

  try {
    const cart = await Cart.findByIdAndUpdate(req.params.cartId, {
      customer,
      item,
      quantity,
    })

    if (!cart) {
      return res.status(404).json({ status: 0, message: 'No cart with this id' })
    }

    res.status(200).json({ status: 1, message: 'Cart updated successfully', cart })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.cartId)

    if (!cart) {
      return res.status(404).json({
        status: 0,
        message: 'No cart with this group id'
      })
    }

    res.status(200).json({ status: 1, message: 'Cart removed successfully', cart })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

module.exports = { addCart, getAllCart, getCart, updateCart, deleteCart }
