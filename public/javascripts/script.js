$(document).ready(function() {
  console.log('first');
  $(".nav > li").click(function() {
    $(this).toggleClass("active");
  });
  
});
