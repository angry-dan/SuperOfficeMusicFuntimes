/*
 * @file
 *
 * This file is the main entry point for the fronted. It is responsible for
 * loading all of the data we need to display and update track information.
 */
jQuery(function($){
  var $app = $('#application').contextual();

  $.get('/app/now-playing', refresh);

  var socket = io.connect();
  socket.on('refresh', refresh);

  var nowPlaying = null;
  function refresh(data) {
    $app('.now-playing .track-name').text(data.track.name);
    $app('.now-playing .artist').text(data.track.artist);
    $app('.now-playing .album').text(data.track.album);

    var img = $('<img />')
      .attr('src', 'data:;base64,' + data.track.art)
      .height(200)

    $app('.now-playing .art')
      .empty()
      .append(img);


    nowPlaying = data;
    setCurrentPosition(data.position);
  }

  /**
   * Use requestAnimationFrame to attempt to achieve 1 frame per second.
   * Refresh is used to correct the actual values.
   *
   * Current position is updated by updateTime
   */

  var currentPosition = 0;
  function setCurrentPosition(pos) {
    currentPosition = pos;
  }

  var progressBarWidth = $app('.progress').width();

  setInterval(function(){
    if (!nowPlaying) {
      $app('.progress .indicator').width(0);
      return;
    }
    // rough %age of how far we are into the track. Mustn't go above 1.
    var fraction = Math.min(currentPosition / nowPlaying.length, 1);

    var progressWidth = fraction * progressBarWidth;
    $app('.progress .indicator').animate({ width: progressWidth }, 500);

    // Only assume that the player state is changing if we are playing.
    if (nowPlaying.state == 'playing') {
      currentPosition += 0.5;
    }
   }, 500);

});

jQuery.fn.contextual = function() {
  var context = this;
  return function(arg) {
    return jQuery(arg, context);
  };
};