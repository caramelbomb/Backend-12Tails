const db = require('./firebase')
const { SECRET } = require('./config')
const bcrypt = require('bcrypt')

const passport = require('passport')

const passportJWT = require('passport-jwt')
const ExtractJWT = passportJWT.ExtractJwt
const JWTStrategy = passportJWT.Strategy
const LocalStrategy = require('passport-local').Strategy

const isValidUser = async (username, password) => {
  const users = await db.collection('users').get()
  const allUser = users.docs.map(doc => doc.data())
  const index = allUser.findIndex((item) => item.username === username)
  return await bcrypt.compare(password, allUser[index].password)
}

const checkExistingUser = async (username) => {
  const users = await db.collection('users').get()
  const allUser = users.docs.map(doc => doc.data())
  return allUser.findIndex((item) => item.username === username)
}

passport.use(
  new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, async (username, password, cb) => {
    const users = await db.collection('users').get()
    const allUser = users.docs.map(doc => doc.data())
    const index = await checkExistingUser(username)
    if (index && await isValidUser(username, password)) {
      const { username } = allUser[index]
      return cb(null,
        { username, _id: index },
        { message: 'success' })
    } else { return cb(null, false, { message: 'Incorrect user or password.' }) }
  }))

const strategy = new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET
},
async (jwtPayload, cb) => {
  try {
    const users = await db.collection('users').get()
    const allUser = users.docs.map(doc => doc.data())
    const index = await checkExistingUser(jwtPayload.username)
    if (index) {
      const { username } = allUser[index]
      return cb(null, { _id: index, username })
    } else {
      return cb(null, false)
    }
  } catch (error) {
    return cb(error, false)
  }
}
)

const getUser = () => {
  passport.use('jwt', strategy)
  return passport.authenticate('jwt', { session: false })
}

const initialize = () => {
  return passport.initialize()
}

module.exports = {
  getUser,
  initialize
}
