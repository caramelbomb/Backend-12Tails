const express = require('express')
const router = express.Router()
const db = require('../firebase')

router.post('/sale', async (req, res, next) => {
  const { name, price, detail, salerID } = req.body
  try {
    if (!name || !price || !detail || !salerID) {
      return res.status(400).json({ message: 'data incomplete' })
    }
    const products = await db.collection('products').get()
    const allProduct = products.docs.map(doc => doc.data())
    const id = allProduct.length + 1

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

router.put('/buy', async (req, res, next) => {
  const { productID, buyerID } = req.body
  try {
    if (!productID || !buyerID) {
      return res.status(400).json({ message: 'data incomplete' })
    }
    const products = await db.collection('products').get()
    const allProduct = products.docs.map(doc => doc.data())
    const findProduct = allProduct[productID - 1]

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

router.get('/available', async (req, res, next) => {
  try {
    const products = await db.collection('products').get()
    const allProduct = products.docs.map(doc => doc.data())
    const findProduct = allProduct.filter(element => element.status === 'available')

    if (!findProduct) {
      res.status(400).json({ result: [] })
    } else {
      res.status(200).json({ result: findProduct })
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
