const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const {RunScript} = require('./config/utils')
const { UpdateNginxWithDeploy } = require('./models/NginxUpdate');

app.get('/', (req, res) => {
    res.send('Hello World!')
    RunScript('python',['./test.py'])
})

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})