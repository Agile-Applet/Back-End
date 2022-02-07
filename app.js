const express = require('express')
const ConnectToMongo = require('./user/config/db')
const user = require("./user/routes/user")
const bodyParser = require('body-parser')


const app = express()
const port = 3000


ConnectToMongo()

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/user", user)

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

