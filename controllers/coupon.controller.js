const Coupon = require('../models/coupon.model')
const paginate = require('../utils/aggregatePaginate.util')

const addCoupon = async (req, res) => {
  const { name, description, code, expiry } = req.body

  try {
    const coupon = new Coupon({ name, description, code, expiry })

    await coupon.save()

    res.status(201).json({ status: 1, message: 'Coupon added successfully', coupon })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getAllCoupon = async (req, res) => {
  try {
    const coupons = await paginate(req, Coupon, [{ $sort: { createdAt: -1 } }])

    if (!coupons.totalDocs) {
      return res.status(404).json({
        status: 0,
        message: 'No coupons found',
        coupons_count: coupons.totalDocs
      })
    }

    res.status(200).json({ status: 1, message: 'List of all coupons.', coupons_count: coupons.totalDocs, coupons })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      _id: req.params.couponId,
    })

    if (!coupon) {
      return res.status(404).json({ status: 0, message: 'No coupon found with this id' })
    }

    res.status(200).json({ status: 1, message: 'Successfully received coupon data.', coupon })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const updateCoupon = async (req, res) => {
  const { name, description, code, expiry } = req.body

  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.couponId, {
      name,
      description,
      code,
      expiry,
    })

    if (!coupon) {
      return res.status(404).json({ status: 0, message: 'No coupon with this id' })
    }

    res.status(200).json({ status: 1, message: 'Coupon updated successfully', coupon })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.couponId)

    if (!coupon) {
      return res.status(404).json({
        status: 0,
        message: 'No coupon with this group id'
      })
    }

    res.status(200).json({ status: 1, message: 'Coupon removed successfully', coupon })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

module.exports = {
  addCoupon,
  getAllCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
}
