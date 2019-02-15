// Getting modules form the pacakege-lock.json file using require() function to
// load certain files.
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
//logger that records every single HTTP request made to our application
//as well as the URL of the request.
const logger = require("morgan");
const Websocket = require("ws");
//We here utilize's Node's core HTTP module which provides us
//with all necessary functionalities related to HTTP.
const http = require("http");

// The function require() usually returns a JS object
// A module is any file that can be loaded by the fucntion require()
// Sockets are defined by IP address or port number

// Provides access to the index.js file
const indexRouter = require("./routes/index");
// Provides access to the Game.js file
const Game = require("./models/Game");
// Provides access to the Statistics.js file
const statistics = require("./models/Statistics");
// Provides access to the messageTypes.js file
const messageTypes = require("./public/javascripts/messageTypes");
// Provides access to the gameHandlers.js file
const gameHandlers = require("./gameHandlers");
//Express creates a layer on top of the core HTTP module that handles a
//lot of complex things that we don't want to handle ourselves,
//like serving up static HTML, CSS, and client-side JavaScript files.
//The call express() returns an object which is our way of making use of Express' functionalities.
const app = express();

// port number
const port = process.env.PORT || 3000;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// The application is using the desired modules downloaded that were
// loaded before
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//For static files, i.e. files that are not created or changed on the fly,
//e.g. CSS, client-side JavaScript, HTML, images and audio files,
//Express offers us a very simple solution. A single line of code is sufficient to serve static files
app.use(express.static(path.join(__dirname, "public")));

// We dont have to put a slash everytime when determining a path
app.use("/", indexRouter);

// Catch the 404 error and forward the error to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// callback function has two parameters. an HTTP request object and a HTTP response object.
// Callback executed when HTTP request comes in
// This is the error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page and giving a server side error
  res.status(err.status || 500);
  res.render("error");
});

// Creating a server using http module which was exported
// Returns a server object and takes as argument a callback function,
// which is invoked when another endpoint connects.
const server = http.createServer(app);

//Initiate a connection with a websocket server by initiating a
//websocket object wss
const wss = new Websocket.Server({ server });
//We keep track of which client is assigned to which game by mapping a WebSocket
//connection (the property) to a game (the value)
const webSockets = {};
let gameId = 0;

//Wherever we are using a .on function, it gives a server side output.

wss.on("connection", ws => {
  // join the game if not yet joined && add new statistics data
  handleNewConnection();
  //Output on the terminal when a player has left the game
  ws.on("close", m => {
    statistics.totalPlayers--;
    console.log("A player has left the game!");
  });

  //JSON can be parsed with built-in JavaScript functionality (JSON.parse),
  //which turns a JSON string into an object.
  ws.on("message", m => {
    const msg = JSON.parse(m);
    const game = webSockets[ws.id]; // game conserning the current connection (if exists)

    if (game.checkGameEnded()) {
      return;
    }
    switch (msg.type) {
      case messageTypes.THROW_DICE:
        gameHandlers.rollDice(game);
        break;
      case messageTypes.ADD_PLAYER:
        gameHandlers.addPlayerToGame(game, msg.content, ws);
        break;
      case messageTypes.PLAYER_LEFT:
        const playerWhoJustLeft =
          game.playerA.socket === ws ? game.playerA : game.playerB;

        console.log("A player has just left! " + playerWhoJustLeft.name);

        break;
      default:
        console.log("default hit");
    }
  });

  function handleNewConnection() {
    //Adding a player to the game
    if (webSockets[gameId] && webSockets[gameId].canIJoinGame()) {
      ws.id = gameId;
    } else {
      const newGame = new Game(++gameId);
      ws.id = gameId;
      webSockets[gameId] = newGame;
    }

    const activeGames = Object.values(webSockets).filter(game =>
      game.isGameStillActive()
    );
    console.log("here");
    const inActiveGames = Object.values(webSockets).filter(
      game =>
        !activeGames.includes(game) &&
        game.gameState !== game.gameStatusses.ABORD
    );
    //Output on the terminal with the number of games going on
    statistics.calcAvg(inActiveGames);
    console.log("Length of active games is ", activeGames.length);
    statistics.totalGames = activeGames.length;
    statistics.totalPlayers++;
  }
});

// Bind our server to a specific port
server.listen(port, console.log);
