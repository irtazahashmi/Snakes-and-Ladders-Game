//Routing is the mechanism by which requests are routed to the code that handles them.
//The routes are specified by a URL and HTTP method.
//Route handlers are middleware

const { Router } = require("express");
const router = Router();
const statistics = require("../models/Statistics");

function convertToMinAndSec(secs) {
  const newSeconds = secs % 60;
  const newMinutes = parseInt(secs / 60, 10);

  seconds.innerText = newSeconds < 10 ? "0" + newSeconds : newSeconds;
  minutes.innerText = newMinutes < 10 ? "0" + newMinutes : newMinutes;

  return newMinutes + ":" + newSeconds;
}

//Getting the home page
router.get("/", (req, res, next) => {
  // Implementing cookies
  if (req.cookies["gameCookie"]) {
    res.cookie("gameCookie", "playing", { maxAge: new Date() });
  }
  //use Express' res.render in order to render a view and send the rendered HTML to the client
  res.render("splash", {
    totalPlayers: statistics.totalPlayers,
    totalGames: statistics.totalGames,
    avgGameTime: statistics.avgTime
      ? convertToMinAndSec(statistics.avgTime)
      : "Not Enough Data..."
  });
});

// Getting the how to play page
router.get("/howToPlay", (req, res) => {
  res.render("howToPlay");
});

/* Get game page. */
router.get("/game", (req, res, next) => {
  // Implementing cookies
  if (req.cookies["gameCookie"]) {
    res.render("splash", {
      // Giving a message and kicking you out if youre already playing
      error: "You are already playing..."
    });
  }

  // Creating a new cookie
  res.cookie("gameCookie", "playing", { httpOnly: true, maxAge: 3000000 });
  res.render("game", {
    error: "Please enter the game by filling your name! :)",
    totalPlayers: statistics.totalPlayers,
    totalGames: statistics.totalGames,
    avgGameTime: statistics.avgTime
      ? convertToMinAndSec(statistics.avgTime)
      : "Not Enough Data..."
  });
});

module.exports = router;
