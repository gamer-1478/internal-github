const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const {RunScript} = require('./config/utils')
const { UpdateNginxWithDeploy } = require('./models/NginxUpdate');

const {AddGeoliteRepoWithUser} = require('./models/GeoliteUpdate')
AddGeoliteRepoWithUser('hmm', 'hmm',[], './test/test.gitolite.conf')
console.log('node version', process.version)
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})