const express = require('express')
const app = express()
const port = 3000

app.use(express.static(__dirname + '/public/'));  // mention the dir where ststic files will be

app.get('/', (req, res) => res.sendFile('index.html'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})