const express = require('express')
const router = express.Router()
const db = require('../firebase')
const { getUser } = require('../passport')

router.post('/sale', getUser(), async (req, res, next) => {
  const { name, price, detail, salerID, type } = req.body
  try {
    if (!name || !price || !detail || !salerID || !type) {
      return res.status(400).json({ message: 'data incomplete' })
    }
    const products = await db.collection('products').get()
    const allProduct = products.docs.map(doc => doc.data())
    const id = allProduct.length

    const result = await db.collection('products').doc(`${id}`).set({
      ...req.body,
      status: 'available'
    })

    if (result) {
      res.status(200).json({ message: 'create success' })
    } else {
      res.status(400).json({ message: 'create fail' })
    }
  } catch (err) {
    next(err)
  }
})

router.put('/buy', getUser(), async (req, res, next) => {
  const { productID, buyerID } = req.body
  try {
    if (productID === undefined || !buyerID) {
      return res.status(400).json({ message: 'data incomplete' })
    }
    const products = await db.collection('products').get()
    const allProduct = products.docs.map(doc => doc.data())
    const findProduct = allProduct[productID]

    const result = await db.collection('products').doc(`${productID}`).set({
      ...findProduct,
      buyerID,
      status: 'unavailable'
    })

    if (result) {
      res.status(200).json({ message: 'buy success' })
    } else {
      res.status(400).json({ message: 'buy fail' })
    }
  } catch (err) {
    next(err)
  }
})

router.get('/available', getUser(), async (req, res, next) => {
  try {
    const products = await db.collection('products').get()
    const allProduct = products.docs.map(doc => doc.data())
    const findProduct = allProduct.map((item, index) => {
      return { _id: index, ...item }
    })
    const result = findProduct.filter(element => element.status === 'available')

    if (!result) {
      res.status(400).json({ result: [] })
    } else {
      res.status(200).json({ result })
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
