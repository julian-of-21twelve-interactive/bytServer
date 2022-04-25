const SiteVisitor = require('../models/siteVisitor.model')
const paginate = require('../utils/aggregatePaginate.util')
const moment = require('moment')

const addSiteVisitor = async (req, res) => {
  try {
    const checkCount = await SiteVisitor.findOne({
      date: moment().format('YYYY-MM-DD'),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    })

    if (checkCount) {
      await SiteVisitor.findByIdAndUpdate(checkCount._id, {
        $inc: { count: 1 },
      })

      return res.status(400).json({ status: 0, message: 'Already up to date!' })
    }

    const siteVisitor = new SiteVisitor({
      date: moment().format('YYYY-MM-DD'),
      count: 1,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    })

    await siteVisitor.save()

    res
      .status(201)
      .json({ status: 1, message: 'Site visitor added successfully', siteVisitor })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getAllSiteVisitor = async (req, res) => {
  try {
    const siteVisitors = await paginate(req, SiteVisitor, [
      { $sort: { createdAt: -1 } },
    ])

    if (!siteVisitors.totalDocs) {
      return res.status(404).json({
        status: 0,
        message: 'No site visitors found',
        siteVisitors_count: siteVisitors.totalDocs
      })
    }

    res
      .status(200)
      .json({ status: 1, message: 'List of all site visitors.', siteVisitors_count: siteVisitors.totalDocs, siteVisitors })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getSiteVisitor = async (req, res) => {
  try {
    const siteVisitor = await SiteVisitor.findOne({
      _id: req.params.siteVisitorId,
    })

    if (!siteVisitor) {
      return res
        .status(404)
        .json({ status: 0, message: 'No site visitor found with this id' })
    }

    res.status(200).json({ status: 1, message: 'Visitors data', siteVisitor })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const deleteSiteVisitor = async (req, res) => {
  try {
    const siteVisitor = await SiteVisitor.findByIdAndDelete(
      req.params.siteVisitorId,
    )

    if (!siteVisitor) {
      return res.status(404).json({
        status: 0,
        message: 'No site visitor with this group id'
      })
    }

    res
      .status(200)
      .json({ status: 1, message: 'Site visitor removed successfully', siteVisitor })
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

module.exports = {
  addSiteVisitor,
  getAllSiteVisitor,
  getSiteVisitor,
  deleteSiteVisitor,
}
