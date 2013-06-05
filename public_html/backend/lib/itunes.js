/*
 * @file
 *
 */

var applescript = require("applescript");
var util = require("util");
var events = require("events");

function Itunes() {
  events.EventEmitter.call(this);
  startMonitoring(this);
}
util.inherits(Itunes, events.EventEmitter);

Itunes.prototype.currentTrackId = null;
Itunes.prototype.votes = 0;

Itunes.prototype.nowPlaying = function(callback) {
  applescript.execString('tell application "iTunes" to get name of current track', function(err, rtn) {
    if (err) {
      throw err;
    }
    callback(rtn);
  });
}

Itunes.prototype.voteDown = function() {
  // Vote down the current track. We will store a count of votes against the
  // current track and once it reaches a predetermined number we issue a next
  // track call. That call will emit a refresh event.
  this.votes ++;
  if (this.votes > 3) {
    this.next()
  }
}

Itunes.prototype.refresh = function() {
  this.nowPlaying(function(info){
    this.emit('refresh', info);
  });
}

/**
 *
 * @param Itunes itunes
 */
function startMonitoring(itunes) {


  updateCurrentTrack();


  // Every second we ask iTunes what the current track is, and if it has changed
  // we let our people know.
  // We do this in case an external entity tries to mess around with things.
  var currentId;
  setInterval(function() {
    // Get ID of the current track.
    // if currentId && currentId != newId emit event.
  }, 1000);
}

function updateCurrentTrack(itunes) {
  apiWrapper('get id of current track', function(id) {
    var previousId = itunes.currentTrackId;
    if (itunes.currentTrackId && itunes.currentTrackId !== id) {
      itunes.refresh();
    }
    itunes.currentTrackId = id;
  });
}

function apiWrapper(command, callback) {
  applescript.execString('tell application "iTunes" to ' + command, function(err, rtn) {
    if (err) {
      throw err;
    }
    callback(rtn);
  });
}

module.exports = Itunes;