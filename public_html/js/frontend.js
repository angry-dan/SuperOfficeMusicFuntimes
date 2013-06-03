/*
 * @file
 *
 */

jQuery(function($){
  // Going to try and get an interface to the backend.

  $.get('http://localhost:8080/now-playing', function(response) {
    console.log(response);
  });

  //http://127.0.0.1:8080/now-playing
});