const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const { RunScript } = require('./config/utils')
const { UpdateNginxWithDeploy } = require('./models/NginxUpdate');

const { RemoveGitoliteUser } = require('./models/GitoliteUpdate')


console.log('node version', process.version)
app.get('/', async (req, res) => {
    res.send('Hello World!')
    let resp1 = RemoveGitoliteUser('hmm', './test/keydirr')
    console.log(resp1)
})

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})