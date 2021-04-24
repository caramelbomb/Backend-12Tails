const express = require('express')
const app = express()
const PORT = 9000

const cors = require('cors')
const corsOptions = {
  origin: '*'
}
app.use(cors(corsOptions))

// router
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
  res.send('OK')
})

const routes = require('./routes')
app.use('/api', routes)

app.listen(PORT, () => {
  console.log('connecting port: ', PORT)
})
