const NginxConfFile = require('nginx-conf').NginxConfFile

const filename = `./test.conf`;


function UpdateNginxWithDeploy(subdomain, port) {
    NginxConfFile.create(filename, function (err, conf) {
        if (err || !conf) {
            console.log(err);
            return;
        }
        const onFlushed = () => {
            console.log('finished writing to disk');
        };
    
        conf.on('flushed', onFlushed);
    
        console.log('user: ' + conf.nginx.user?.[0]._value);
        console.log('http.server.listen: ' + conf.nginx.http?.[0].server?.[0].listen?.[0]._value);

        //conf.nginx.user?.[0]._add('user',conf.nginx.user?.[0]._value)
        //conf.nginx.worker_processes?.[0]._add('worker_processes',conf.nginx.worker_processes?.[0]._value)
        //conf.nginx.pid?.[0]._add('pid',conf.nginx.pid?.[0]._value)
        //conf.nginx.include?.[0]._add('include',conf.nginx.include?.[0]._value)
        //conf.nginx.events?.[0]._add('worker_connections','768')

        conf.nginx.http?.[0]._add('server');
        const whichServer = conf.nginx.http?.[0].server.length - 1
        conf.nginx.http?.[0].server?.[whichServer]._add('listen', '80');
        conf.nginx.http?.[0].server?.[whichServer]._add('server_name', subdomain+'.domain.com');
        conf.nginx.http?.[0].server?.[whichServer]._add('location', '/');
        conf.nginx.http?.[0].server?.[whichServer].location?.[0]._add('proxy_pass', 'http://localhost:'+port);
        
        conf.off('flushed', onFlushed);

        // kill process when done writing to disk
        conf.on('flushed', () => {
            console.log('finished writing to disk');
        });
    
        conf.flush();
    
        //console.log('http.server.location.root:' + conf.nginx.http?.[0].server?.[0].location?.[3].root?.[0]._value);
    });
}

module.exports = {UpdateNginxWithDeploy};