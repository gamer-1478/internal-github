const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const path = require('path')
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
    res.render('index.ejs')
})

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})