/*
 * @file
 *
 * This file is the main entry point for the fronted. It is responsible for
 * loading all of the data we need to display and update track information.
 */


//jQuery(function($){
//  $.get('/app/now-playing', function(response) {
//    console.log(response);
//  });
//});

var socket = io.connect();
socket.on('refresh', function (data) {
  console.log(data);
});