var USE_CLUSTER = false;

var cluster = USE_CLUSTER? require('cluster'): null,
    app = require('./application'),
    http = require('http'),
    debug = require('debug')('shadow-server:server');

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

var port = normalizePort(process.env.PORT || '3000');

if (cluster && cluster.isMaster) {
  var workers = {};

  function spawn(){
    var worker = cluster.fork();
    workers[worker.pid] = worker;
    return worker;
  }
  
  var count = require('os').cpus().length;
  for (var i = 0; i < count; i++) {
    spawn();
  }
  
  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died. spawning a new process...');
    delete workers[worker.pid];
    spawn();
  });
}
else {
  app.set('port', port);
  var server = http.createServer(app);
  
  server.on('error', function(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    // handle specific listen errors with friendly messages
    var sBind = 'Port ' + port;
    switch (error.code) {
      case 'EACCES':
        console.log(sBind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.log(sBind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
  
  server.on('listening', function() {
    var addr = server.address();
    var sBind = typeof addr === 'string'? 'pipe ' + addr: 'port ' + addr.port;
    debug('Listening on ' + sBind);
  });
  
  server.listen(port);
}
