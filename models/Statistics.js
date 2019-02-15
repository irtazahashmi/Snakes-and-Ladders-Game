/*Stats function*/
function Statistics() {
  this.totalGames = 0;
  this.totalPlayers = 0;
  this.avgTime = null;
}

/*Calculate average time of the game*/
Statistics.prototype.calcAvg = function(games) {
  const durations = [];
  if (games.length === 0) {
    return;
  }
  for (const game of games) {
    console.log(
      "game with start time " +
        game.startTime +
        ", and end time " +
        game.endTime
    );

    //In order to get the time in seconds
    const duration = Math.floor((game.endTime - game.startTime) / 1000);
    durations.push(duration);
  }

  const numDurations = durations.length;
  const sumDurations = durations.reduce((acc, val) => acc + val, 0);
  this.avgTime = Math.floor(sumDurations / numDurations);

  console.log("Calculating the average game time... ");
  console.log(games);
  console.log(durations);
  console.log(sumDurations);
};

//The module.exports or exports is a special object which is included in every JS file in the Node.js
//application by default. For this module to be used by the app, we're making the module global so the
//the app can access this module through the require() function
module.exports = new Statistics();
