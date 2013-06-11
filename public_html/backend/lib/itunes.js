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
Itunes.prototype.playerState = null;
Itunes.prototype.votes = 0;

Itunes.prototype.nowPlaying = function(callback) {
  apiWrapperLong(
'tell current track\n\
		set exportTrack to {name:name, album:album, artist:artist, time:time, art: ""}\n\
    if (count of artwork) > 0 then	\n\
      set art of exportTrack to data of artwork 1\n\
    end if\n\
  end tell\n\
	set export to {track:exportTrack, position:player position, state:player state}', function(data) {

    data.length = hmsToSeconds(data.track.time);
    if (data.track.art) {
      data.track.art = data.track.art.toString('base64');
    }
    callback(data);
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
  apiWrapper('get {id:id of current track, state:player state}', function(info) {
    if (!info) {
      return; // Who knows why this happens?
    }
    // TODO this function get's called at least every second.
    // if the player position has moved by more than 2 seconds then we are out
    // of sync with the iTunes player position and we should refresh our clients.
    var previousId = itunes.currentTrackId;
    var previousPlayerState = itunes.playerState;
    itunes.currentTrackId = info.id;
    itunes.playerState = info.state;
    if ((previousId && previousId !== info.id) || (previousPlayerState && previousPlayerState !== info.state)) {
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

function hmsToSeconds(str) {
  //http://stackoverflow.com/questions/9640266/convert-hhmmss-string-to-seconds-only-in-javascript
    var p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}

module.exports = Itunes;