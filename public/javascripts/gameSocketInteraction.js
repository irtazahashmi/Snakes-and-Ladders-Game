// Message types is in the html file prior to that so it does exist

const socket = new WebSocket("ws://localhost:3000");

socket.onclose = function(e) {
  socket.send(JSON.stringify({ type: messageTypes.PLAYER_LEFT }));
};

socket.onopen = function(e) {
  socket.onmessage = function(m) {
    const msg = JSON.parse(m.data); // parse the received message

    console.log(msg);

    switch (msg.type) {
      case messageTypes.START_GAME:
        startGame();
        makeAnnouncement("Lets start playing!");
        break;
      case messageTypes.MOVE_PIN:
        handleMovingPin(msg.content);
        const { newPos, playersName, diceVal } = msg.content;
        makeAnnouncement(
          playersName + " got a " + diceVal + " and moved to position " + newPos
        );
        break;
      case messageTypes.PLAYER_NAMES:
        addPlayersNames(msg.content);
        break;
      case messageTypes.TURN_CHANGE:
        changeTurns();
        break;
      case messageTypes.BROADCAST_TURN:
        broadcastTurn(msg.content);
        break;
      case messageTypes.END_GAME:
        endGame(msg.content);
        makeAnnouncement("Game Over! Player " + msg.content.winner + " won!");
        break;

      //Make announement that player has left
      case messageTypes.PLAYER_LEFT:
        makeAnnouncement("Player has left! Game is aborted!");
        break;
      default:
        console.log("Bro, something's wrong!");
    }
  };
};

function makeAnnouncement(text) {
  const announcementArea = document.getElementById("announcementsContent");
  announcementArea.innerText = text;
}

//Broadcasting turns
function broadcastTurn({ playerName }) {
  document.getElementById("whosTurn").innerText = playerName;
}
//Handling changing turns
function changeTurns() {
  document.getElementById("rollDiceBtn").disabled = false;
}

// Displaying dice values
function displayDiceVal(diceVal) {
  const diceImg = document.getElementById("diceImg").children[0];
  diceImg.setAttribute("src", "/images/dice" + diceVal + ".png");
}
// Handling dice rolls
function handleMovingPin({ newPos, playersName, diceVal }) {
  if (typeof diceVal === "number") {
    displayDiceVal(diceVal);
  } else {
    //If the player got a snake or something
  }

  const playerAName = document.getElementById("playerA").innerText;
  let pin;

  if (playersName === playerAName) {
    pin = document.getElementById("pinPlayerA");
  } else {
    pin = document.getElementById("pinPlayerB");
  }
  movePin(pin, newPos);
}

function movePin(pinEl, newPos) {
  const targetCell = document.getElementsByClassName("cell" + newPos)[0];
  const board = document.getElementById("board");
  pinEl.style.left = targetCell.offsetLeft - board.offsetLeft + 20 + "px";
  pinEl.style.top = targetCell.offsetTop - board.offsetTop + 20 + "px";
}

//Adding the player name to the screen and linking him/her with an id
function addPlayersNames({ playerA, playerB }) {
  const playerASpot = document.getElementById("playerA");
  const pinPlayerA = document.getElementById("pinPlayerA");
  playerASpot.innerText = playerA;
  pinPlayerA.innerText = playerA;

  if (playerB) {
    const playerBSpot = document.getElementById("playerB");
    const pinPlayerB = document.getElementById("pinPlayerB");
    playerBSpot.innerText = playerB;
    pinPlayerB.innerText = playerB;
  }
}

//Starting the game
function startGame() {
  initiateTimer();
}

//Registering a player
const playerNameForm = document.getElementById("playerNameForm");

playerNameForm.addEventListener("submit", async e => {
  e.preventDefault();
  const playerName = e.target.children[2].value.trim();
  if (!playerName) {
    console.log("Make him enter his name");
    return;
  }

  await socket.send(
    JSON.stringify({
      type: messageTypes.ADD_PLAYER,
      content: playerName
    })
  );

  const modal = document.getElementById("modal");
  modal.style.display = "none";
});

//Game time
let gameTimer = null;
let secs = 0;

function initiateTimer() {
  gameTimer = setInterval(incTimeSinceStart, 1000);
}

function incTimeSinceStart() {
  const minutes = document.getElementById("minutes");
  const seconds = document.getElementById("seconds");
  secs++; // increment seconds

  const newSeconds = secs % 60;
  const newMinutes = parseInt(secs / 60, 10);

  seconds.innerText = newSeconds < 10 ? "0" + newSeconds : newSeconds;
  minutes.innerText = newMinutes < 10 ? "0" + newMinutes : newMinutes;
}

//Requesting to roll the dice
const rollDiceBtn = document.getElementById("rollDiceBtn");
rollDiceBtn.addEventListener("click", e => {
  socket.send(JSON.stringify({ type: messageTypes.THROW_DICE }));
  document.getElementById("rollDiceBtn").disabled = true;
  const diceImg = document.getElementById("diceImg").children[0];
  diceImg.classList.toggle("diceImg-active");
});

//Ending the game
function endGame({ winner }) {
  clearInterval(gameTimer);
  document.getElementById("rollDiceBtn").disabled = true;
  const pin = [...document.getElementsByClassName("pin")].filter(
    el => el.innerText === winner
  )[0];
  document.getElementById("returnToHome").style.display = "inline-block";
  // Change the turn announcement area
  document.getElementById("turnContainer").children[0].innerText =
    "Game ended!";
  movePin(pin, 100);
}
