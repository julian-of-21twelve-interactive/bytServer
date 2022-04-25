const Customer = require('../models/customer.model')
const User = require('../models/user.model')

const addCustomer = async (req, res) => {
  const { name, mobile, dob, spend, diet, email, location, profile } = req.body

  const customer = new User({
    name,
    mobile,
    dob,
    spend,
    diet,
    email,
    location,
    profile,
  })

  try {
    await customer.save()

    res.status(201).json({ status: 1, message: 'Customer added successfully', customer })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getCustomer = async (req, res) => {
  // const customer = await Customer.aggregate([
  // 	{ $match: { _id: req.params.customerId } },
  // ])
  const customer = await User.findOne({
    _id: req.params.customerId,
    role: 'USER',
  })

  res.json({
    status: 1,
    message: 'Successfully received customer.',
    customer
  })
}

const getAllCustomers = async (req, res) => {
  const customers = await User.aggregate([
    {
      $match: { role: 'USER' },
    },
    { $sort: { createdAt: -1 } },
    { $unset: ['salt', 'hash'] },
  ])

  res.json({
    status: 1,
    message: 'List of all customers.',
    customers
  })
}

const updateCustomer = async (req, res) => {
  const { name, mobile, dob, spend, diet, email, location, blacklist } =
    req.body

  try {
    const customer = await User.findByIdAndUpdate(req.params.customerId, {
      name,
      mobile,
      dob,
      spend,
      diet,
      email,
      location,
      blacklist,
    })

    res.status(200).json({
      status: 1,
      message: 'Customer is updated.',
      customer
    })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

module.exports = { addCustomer, getCustomer, getAllCustomers, updateCustomer }
