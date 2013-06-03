/*
 * @file
 *
 * This is the main entry point for the backend library. The backend should
 * provide an HTTP based RESTFUL service.
 */


var restify = require('restify');
var applescript = require("applescript");

var server = restify.createServer();

var nowPlaying;

server.get('now-playing', function(req, res, next) {
  if (nowPlaying) {
    res.send(nowPlaying);
  }

  // server error here.

});

// Regularly sync the iTunes data.
setInterval(function() {
  var script = 'tell application "iTunes" to get current track';
  applescript.execString(script, function(err, rtn) {
    if (err) {
      console.error(err);
      return;
    }
    nowPlaying = rtn;
  });
}, 250);


server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});







