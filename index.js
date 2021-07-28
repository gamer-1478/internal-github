const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const { UpdateNginxWithDeploy } = require('./models/NginxUpdate');

var child_process = require('child_process');

console.log("Node Version: ", process.version);

function RunScript() {
    var spawn = require('child_process').spawn;
    var process = spawn('python', ["./test.py"], { stdio: 'inherit' });

    if (process.stdout != null) {
        process.stdout.on('data', function (data) {
            console.log('stdout: ' + data.toString());
        });
    }
    if (process.stderr != null) {
        process.stderr.on('data', function (data) {
            console.log('stderr: ' + data.toString());
        });
    }

    process.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
    });

}
RunScript()
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})