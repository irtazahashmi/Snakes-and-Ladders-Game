//Fullscreen button function
//shows off the callback principle, which we come across in all of JavaScript:
//we define what happens when an event fires.
const fullScreenButton = document.getElementById("fullScreenButton");

fullScreenButton.addEventListener("click", fullScreen);

function fullScreen(e) {
  const elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* For Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    /* For Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* For IE/Edge */
    elem.msRequestFullscreen();
  }
}

//Returning to the home page button. Once again, using a callback principle.
const returnToHomeButton = document.getElementById("returnToHomeButton");

returnToHomeButton.addEventListener("click", e => {
  window.location.href = "/";
});
