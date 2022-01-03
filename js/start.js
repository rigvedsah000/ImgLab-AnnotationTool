const express = require('express')
const path = require('path')

const dirName = path.join(__dirname, '../' )

const app = express()

app.use(express.static(dirName))

// app.get('', (req, resp) => {
//     resp.send("Hello Express!")    
// })

// app.get('/about', (req, resp) => {
//     resp.send("About Express!")    
// })

app.listen(8080)