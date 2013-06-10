/*
 * @file
 *
 * This is the main entry point for the backend library. The backend should
 * provide an HTTP based RESTFUL service.
 */

// For rest and our static content serving
var restify = require('restify');
var server = restify.createServer();

var io = require('socket.io').listen(server);

var Itunes = require('./lib/itunes.js'), itunes = new Itunes();



io.sockets.on('connection', function (socket) {
  itunes.on('refresh', function(info) {
    console.log('refresh:', itunes);
    socket.emit('refresh', info);
  });
});

// A simple REST request path: show currently playing track.
server.get('app/now-playing', function(req, res, next) {
  itunes.nowPlaying(function(info) {

    res.send(200, info);
  });
});

// Static content handling; match "/" and all content under JS
server.get(/(\/|js\/.*?)/, restify.serveStatic({
  'directory': '../',
  'default': 'index.html'
}));

// Run the server, binding to a non-standard port because we don't have root.
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
