// run a dev-server to build displaying page
var http = require('http')
var ecstatic = require('ecstatic')
var port = parseInt(process.argv[2], 10) || 8080

http
  .createServer(ecstatic({root: __dirname}))
  .listen(port)
  .on('listening', function () {
    console.log('visit http://localhost:' + port + ' to see it!')
  })
  .on('error', function (e) {
    console.error('oops, there was a problem!: %s', e)
    process.exit(1)
  })
