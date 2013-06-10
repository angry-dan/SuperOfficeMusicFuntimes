/*
 * @file
 *
 */

var applescript = require("applescript");
var util = require("util");
var events = require("events");

function Itunes() {
  // Parent constructor
  events.EventEmitter.call(this);

  // Wait for refreshes.
  startMonitoring(this);
}
// class Itunes extends EventEmitter
util.inherits(Itunes, events.EventEmitter);

Itunes.prototype.currentTrackId = null;
Itunes.prototype.votes = 0;

Itunes.prototype.nowPlaying = function(callback) {
  apiWrapperLong(
'tell current track\n\
  set export to {name:name, album:album, artist:artist}\n\
end tell', function(name) {
    callback(name);
  });
};

Itunes.prototype.voteDown = function() {
  // Vote down the current track. We will store a count of votes against the
  // current track and once it reaches a predetermined number we issue a next
  // track call. That call will emit a refresh event.
  this.votes ++;
  if (this.votes > 3) {
    this.next();
  }
};

Itunes.prototype.refresh = function() {
  var itunes = this;
  this.nowPlaying(function(name){
    itunes.emit('refresh', name);
  });
};

/**
 *
 * @param Itunes itunes
 */
function startMonitoring(itunes) {
  updateCurrentTrack(itunes);
  setInterval(function() {
    updateCurrentTrack(itunes);
  }, 1000);
}

function updateCurrentTrack(itunes) {
  apiWrapper('get id of current track', function(id) {
    var previousId = itunes.currentTrackId;
    itunes.currentTrackId = id;
    if (previousId && previousId !== id) {
      itunes.refresh();
    }
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

function apiWrapperLong(command, callback) {
  applescript.execString('tell application "iTunes"\n' + command + '\nend tell', function(err, rtn) {
    if (err) {
      throw err;
    }
    callback(rtn);
  });
}


module.exports = Itunes;


/*
 * tell application "iTunes"
	tell current track
		set exportTrack to {name:name, album:album, artist:artist, time:time}
	end tell
	set export to {track:exportTrack, position:player position, state:player state}
end tell
 */