const { ObjectId } = require('mongodb')
const Address = require('../models/address.model')
const paginate = require('../utils/aggregatePaginate.util')

const addAddress = async (req, res) => {
  const { address, customer, addressType } = req.body

  try {
    const addressData = new Address({ address, customer, addressType })

    await addressData.save()

    res
      .status(201)
      .json({ status: 1, message: 'Address added successfully', address: addressData })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getAllAddress = async (req, res) => {
  try {
    const addresses = await paginate(req, Address, [
      { $sort: { createdAt: -1 } },
    ])

    if (!addresses.totalDocs) {
      return res.status(404).json({
        status: 0,
        message: 'No addresses found',
        addresses_count: addresses.totalDocs
      })
    }

    res.status(200).json({ status: 1, message: 'List of all addresses.', addresses_count: addresses.totalDocs, addresses })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.addressId,
    })

    if (!address) {
      return res.status(404).json({ status: 0, message: 'No address found with this id' })
    }

    res.status(200).json({ status: 1, message: 'Address is successfully received.', address })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getAddressByUser = async (req, res) => {
  try {
    const address = await paginate(req, Address, [
      { $match: { customer: ObjectId(req.user.id) } },
    ])

    if (!address.totalDocs) {
      return res.status(404).json({ status: 0, message: 'No address found with this id' })
    }

    res.status(200).json({ status: 1, message: 'List of user addresses', address })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const updateAddress = async (req, res) => {
  const { address, customer, addressType } = req.body

  try {
    const addressData = await Address.findByIdAndUpdate(req.params.addressId, {
      address,
      customer,
      addressType,
    })

    if (!addressData) {
      return res.status(404).json({
        status: 0,
        message: 'No address with this id'
      })
    }

    res
      .status(200)
      .json({ status: 1, message: 'Address updated successfully', addressData })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.addressId)

    if (!address) {
      return res.status(404).json({
        status: 0,
        message: 'No address with this group id'
      })
    }

    res.status(200).json({ status: 1, message: 'Address removed successfully', address })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

module.exports = {
  addAddress,
  getAllAddress,
  getAddress,
  getAddressByUser,
  updateAddress,
  deleteAddress,
}
