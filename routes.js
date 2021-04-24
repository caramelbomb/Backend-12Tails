const express = require('express')
const router = express.Router()
const userRoutes = require('./apis/user')
const productRoutes = require('./apis/product')

router.use('/user', userRoutes)
router.use('/product', productRoutes)

module.exports = router
