//The require() method is used to load and cache JavaScript modules.
//So, if you want to load a local, relative JavaScript module into a Node.js application,
//you can simply use the require() method.
const Player = require("./Player");

//Making a game object constructor
function Game(gameId) {
  this.playerA = null;
  this.playerB = null;
  this.id = gameId;
  this.gameState = "0_JOINT";
  this.startTime = null;
  this.endTime = null;
  this.whosTurn = null;
}

// Using game.prototypes makes properties available
// to all objects.
// Allows us to set inheritance through prototyping
// Might have issues such as that the code can be easily a accessed/changed
// deleted from anywhere -- bad code maintainiblity

//Different types of gameStatuses
//Game statusses object are inheriting from a the Game object
Game.prototype.gameStatusses = {
  "0_JOINT": "0_JOINT",
  "1_JOINT": "1_JOINT",
  "2_JOINT": "2_JOINT",
  A_WON: "A_WON",
  B_WON: "B_WON",
  ABORTED: "ABORTED"
};

//Making the snakes
Game.prototype.snakes = {
  16: 6,
  46: 25,
  49: 11,
  62: 19,
  64: 60,
  74: 53,
  89: 68,
  92: 88,
  95: 75,
  99: 80
};

//Making the ladders
Game.prototype.ladders = {
  2: 38,
  7: 14,
  8: 31,
  15: 26,
  21: 42,
  28: 86,
  36: 44,
  51: 67,
  71: 91,
  78: 98,
  87: 94
};

// All the statusses are taken from the gameStatusses object
Game.prototype.isValidState = function(newState) {
  return newState in this.gameStatusses;
};

//Setting a gameState
Game.prototype.setState = function(newState) {
  console.assert(
    typeof newState == "string",
    "%s: Expecting a string, got a %s",
    arguments.callee.name,
    typeof w
  );

  // Checking if its a valid state before setting it to a new state
  if (this.isValidState(newState)) {
    this.gameState = newState;
  }

  //If its not a valid state, give an error.
  else {
    return new Error(
      "Impossible status change from %s to %s",
      this.gameState,
      newState
    );
  }
};

//Adding a new player
Game.prototype.addPlayer = function(newPlayer) {
  console.assert(
    newPlayer instanceof Player,
    "%s: Expecting a player (WebSocket), got a %s",
    arguments.callee.name,
    typeof newPlayer
  );

  if (this.gameState === this.gameStatusses["0_JOINT"]) {
    this.playerA = newPlayer;
    this.setState(this.gameStatusses["1_JOINT"]);
  } else if (this.gameState === this.gameStatusses["1_JOINT"]) {
    this.playerB = newPlayer;
    this.setState(this.gameStatusses["2_JOINT"]);
  } else {
    console.log("Sorry! Cant add more players...");
  }
};

//Connecting to players
Game.prototype.hasTwoConnectedPlayers = function() {
  return this.gameState === this.gameStatusses["2_JOINT"];
};

//Is it possible to join the game or nah?
Game.prototype.canIJoinGame = function() {
  return (
    this.gameState === this.gameStatusses["0_JOINT"] ||
    this.gameState === this.gameStatusses["1_JOINT"]
  );
};

//Changing the turns between the players
Game.prototype.changeTurn = function() {
  this.whosTurn = this.whosTurn === this.playerA ? this.playerB : this.playerA;
};

//Handling the next movement
Game.prototype.handleNextMovement = function(player, movementVal) {
  if (typeof movementVal !== "number") {
    return new Error("Not a numeric value...");
  }

  player.currentPos += movementVal;
  player.movementsRecord.push(movementVal);
  this.checkGameEnded();
};

//A function checking if the game has ended or not.
Game.prototype.checkGameEnded = function() {
  if (!this.playerA || !this.playerB) {
    return false;
  }
  if (this.playerA.currentPos >= 100) {
    this.setState(this.gameStatusses.A_WON);
    this.endTime = Date.now();
    return this.playerA;
  } else if (this.playerB.currentPos >= 100) {
    this.setState(this.gameStatusses.B_WON);
    this.endTime = Date.now();
    return this.playerB;
  }
  return null;
};

//Check wheather a player has stepped on a snake or a ladder.
Game.prototype.checkIfStoppedOnSnakeOrLadder = function(player) {
  if (player.currentPos in this.snakes) {
    // calculate the value of the movement.
    const movementVal = this.snakes[player.currentPos] - player.currentPos;
    // record the value of the movement.
    player.movementsRecord.push("Snake =" + movementVal);
    // move the position of the player.
    this.handleNextMovement(player, movementVal);
    return true;
  } else if (player.currentPos in this.ladders) {
    // calculate the value of the movements
    const movementVal = this.ladders[player.currentPos] - player.currentPos;
    // record it
    player.movementsRecord.push("Ladder +" + movementVal);
    this.handleNextMovement(player, movementVal);
    return true;
  }
  // Return false if didnt step on anything
  return false;
};

//Check if the game is still active or not
Game.prototype.isGameStillActive = function() {
  return (
    this.gameState === this.gameStatusses["0_JOINT"] ||
    this.gameState === this.gameStatusses["1_JOINT"] ||
    this.gameState === this.gameStatusses["2_JOINT"]
  );
};

//The module.exports or exports is a special object which is included in every JS file in the Node.js
//application by default. For this module to be used by the app, we're making the module global so the
//the app can access this module through the require() function
module.exports = Game;
