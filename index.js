const express = require('express')
const app = express()
const PORT = 9000

// router
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const routes = require('./routes')
app.use('/api', routes)

app.get('/health', (req, res) => {
  res.send('OK')
})

// connect firebase
const db = require('./firebase')

// test firebase
app.get('/firebase', async (req, res) => {
  const result = await db.collection('test').doc('document').update({ test: 'success' })
  if (result) {
    res.status(200).json({ message: 'success' })
  } else {
    res.status(400).json({ message: 'fail' })
  }
})

app.listen(PORT, () => {
  console.log('connecting port: ', PORT)
})
