const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const { UpdateNginxWithDeploy } = require('./models/NginxUpdate');

app.get('/', (req, res) => {

    UpdateNginxWithDeploy("hmm", 8990)
    res.send('Hello World!')

})

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})