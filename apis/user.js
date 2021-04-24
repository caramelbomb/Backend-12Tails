const express = require('express')
const router = express.Router()
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const config = require('../config')
const db = require('../firebase')
const bcrypt = require('bcrypt')
require('../passport.js')

router.post('/login', (req, res, next) => {
  console.log('req', req.body)
  passport.authenticate('local', { session: false }, (err, user, info) => {
    console.log('Login: ', req.body, user, err, info)
    if (err) return next(err)
    if (user) {
      const token = jwt.sign(user, config.SECRET, { expiresIn: '1h' })

      res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          maxAge: 60 * 60,
          sameSite: 'strict',
          path: '/'
        })
      )
      return res.status(200).json({ user, token })
    } else { return res.status(422).json(info) }
  })(req, res, next)
})

router.get('/logout', (req, res) => {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: -1,
      sameSite: 'strict',
      path: '/'
    })
  )
  return res.status(200).json({ message: 'Logout successful' })
})

router.get('/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.status(200).send(req.user)
  })

router.post('/register',
  async (req, res, next) => {
    console.log('register')
    const { username, password } = req.body
    try {
      const SALT_ROUND = 10

      if (!username || !password) {
        return res.status(400).json({ message: 'data incomplete' })
      }
      const users = await db.collection('users').get()
      const allUser = users.docs.map(doc => doc.data())

      const findUser = allUser.find(element => element.username === username)
      if (findUser) {
        return res.status(400).json({ message: 'duplicated user' })
      }

      const id = allUser.length + 1
      const hash = await bcrypt.hash(password, SALT_ROUND)
      const result = await db.collection('users').doc(`${id}`).set({
        username: username,
        password: hash
      })

      if (result) {
        res.status(200).json({ message: 'register success' })
      } else {
        res.status(400).json({ message: 'register fail' })
      }
    } catch (err) {
      next(err)
    }
  })

module.exports = router
