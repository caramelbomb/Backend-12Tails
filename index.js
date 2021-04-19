const express = require('express')
const app = express()

app.get('/health', (req, res) => {
  res.send('test')
})

app.listen(9000)
