//Making a player object constructor which is acting as a normal function.
function Player(name, socket) {
  this.name = name;
  this.currentPos = 1;
  this.movementsRecord = [];
  this.socket = socket;
}

//The module.exports or exports is a special object which is included in every JS file in the Node.js
//application by default. For this module to be used by the app, we're making the module global so the
//the app can access this module through the require() function
module.exports = Player;
