function RunScript(command, args) {
    //scriptLocation = "./test.py"
    var spawn = require('child_process').spawn;
    var process = spawn(command, args, { stdio: 'inherit' });

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

module.exports = { RunScript }