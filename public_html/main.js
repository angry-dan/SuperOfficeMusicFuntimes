/*
 * @file
 *
 */
var applescript = require("applescript");

var script = 'tell application "iTunes" to get current track';

applescript.execString(script, function(err, rtn) {
  if (err) {
    // Something went wrong!
    console.error(err);
  }

  console.log(rtn);
});

