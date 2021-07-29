const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const { RunScript } = require('./config/utils')
const { UpdateNginxWithDeploy } = require('./models/NginxUpdate');

const { AddUsersToExistingGitoliteRepo } = require('./models/GitoliteUpdate')


console.log('node version', process.version)
app.get('/', async (req, res) => {
    res.send('Hello World!')
    let resp = await AddUsersToExistingGitoliteRepo([{ username: 'fuckme1', perms: 'ad' }, { username: 'ohyeah1', perms: 'r' }], 'testingThisBAdSite', './test/test.gitolite.conf')
    //console.log(resp)
})

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})