const container = document.getElementById("gridContainer");
const startGameButton = document.querySelector("#startGameButton");
const gameButton = document.querySelector("#gameButton");
let minesPosition;

// const minesLeft = document.getElementById("minesLeft");
const flagsElement = document.getElementById("flagsLeft");
let flagsLeft, mineCount, boardSize;
let mines;
const timerContainer = document.getElementById("timerContainer");
let firstMove;
let depth = 0;
let startTime;
let indexes;
let gameInterval;
let timer;

// declaring vectors
const VECTORS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
];

function generateGrid(boardSize = 10, mineCount = 15) {
  const grid = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => 0)
  );

  // plant mines
  let mineX, mineY;
  minesPosition = [];
  while (mineCount > 0) {
    do {
      [mineX, mineY] = [
        Math.floor(Math.random() * boardSize),
        Math.floor(Math.random() * boardSize),
      ];
    } while (grid[mineX][mineY] === "M");

    minesPosition.push(`${mineX}-${mineY}`);
    grid[mineX][mineY] = "M";

    mineCount--;
  }

  // count mines
  minesPosition.forEach((pos) => {
    VECTORS.forEach((vec) => {
      const newPos = toNewPos(pos.split("-"), vec, grid.length);
      if (!newPos) return;
      //
      const [newX, newY] = newPos;
      switch (grid[newX][newY]) {
        case "M":
          break;
        case 0:
          grid[newX][newY] = 1;
          break;
        default:
          grid[newX][newY]++;
          break;
      }
    });
  });

  return grid;
}

function toNewPos(pos, vec, gridSize) {
  let [x, y] = pos;
  x = parseInt(x);
  y = parseInt(y);
  const [vecX, vecY] = vec;

  const [newX, newY] = [parseInt(x + vecX), parseInt(y + vecY)];
  if (newX > gridSize - 1 || newX < 0 || newY > gridSize - 1 || newY < 0)
    return null;

  return [newX, newY];
}

function draw(grid) {
  container.innerHTML = "";
  grid.forEach((row, x) => {
    let rowElement = document.createElement("div");
    rowElement.className = "row";
    row.forEach((square, y) => {
      const squareElement = document.createElement("div");
      squareElement.className = `square facingDown`;
      squareElement.id = `${x}-${y}`;

      squareElement.addEventListener("click", (e) => {
        if (
          e.target.classList.contains("flagged") ||
          e.target.className.includes("_")
        )
          return;
        switch (square) {
          case "M":
            if (firstMove) {
              startGame();
            } else endGame(grid);
            break;
          case 0:
            firstMove = false;
            // reveal squares
            const emptySquares = checkEmptySquares(grid, [squareElement.id]);
            emptySquares.forEach((pos) => {
              const [tempX, tempY] = pos.split("-");
              const emptySquareElement = document.getElementById(pos);
              emptySquareElement.classList.add(`_${grid[tempX][tempY]}`);
              emptySquareElement.classList.add("revealed");
              if (emptySquareElement.classList.contains("flagged")) {
                flagsLeft++;
                flagsElement.innerText = flagsLeft;
                emptySquareElement.classList.remove("flagged");
              }
            });
            checkWinner();
            break;
          default:
            firstMove = false;
            e.target.classList.add(`_${grid[x][y]}`);
            e.target.classList.add("revealed");
            checkWinner();
        }
      });

      squareElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (e.target.classList.value.includes("_")) return;
        if (!flagsLeft && !e.target.classList.contains("flagged")) return;
        e.target.classList.toggle("flagged");

        flagsLeft =
          flagsLeft + (e.target.classList.contains("flagged") ? -1 : +1);
        flagsElement.innerText = flagsLeft;
      });
      rowElement.appendChild(squareElement);
    });
    container.appendChild(rowElement);
  });
}

function endGame(grid) {
  clearInterval(gameInterval);

  grid.forEach((row, x) => {
    row.forEach((square, y) => {
      const squareElement = document.getElementById(`${x}-${y}`);
      squareElement.classList.remove(`flagged`);
      squareElement.classList.add(`_${square}`);
    });
  });
}

function checkWinner() {
  const revealedSquaresNumber = document.getElementsByClassName("revealed")
    .length;
  if (revealedSquaresNumber === boardSize * boardSize - mineCount) {
    clearInterval(gameInterval);
    // gameButton.classList.add;
    revealMines();
    console.log("winner");
  }
}

function revealMines() {
  minesPosition.forEach((squareID) => {
    const mineSquare = document.getElementById(squareID);
    if (!mineSquare.classList.contains("flagged"))
      mineSquare.classList.add("_M");
  });
}

function startGame() {
  clearInterval(gameInterval);
  firstMove = true;
  const inputs = document.querySelectorAll("input");
  boardSize = parseInt(inputs[0].value);
  mineCount = parseInt(inputs[1].value);

  gameInterval = setInterval(() => {
    timer++;
    addjustCounter(timerContainer, timer);
  }, 1000);

  // counters:

  timer = 0;
  flagsLeft = mineCount;
  flagsElement.innerText = mineCount;

  if (!boardSize || !mineCount) {
    alert("please enter board size and mines count");
  } else {
    draw(generateGrid(boardSize, mineCount));
  }
}

function checkEmptySquares(grid, emptySquares, prevLength) {
  if (!depth) {
    startTime = Date.now();
    indexes = [];
  }
  depth++;
  const curLength = emptySquares.length;

  indexes.push(curLength);

  emptySquares.slice(prevLength).forEach((pos) => {
    const [x, y] = pos.split("-");

    VECTORS.slice(0, 4).forEach((vec) => {
      // valid pos
      const newPos = toNewPos([x, y], vec, grid.length);
      if (!newPos) return;

      // already Checked
      const [newX, newY] = newPos;
      const stringPos = `${newX}-${newY}`;
      if (emptySquares.includes(stringPos)) return;

      // empty square
      if (!grid[newX][newY]) {
        emptySquares.push(`${newX}-${newY}`);
      }
    });
  });

  // found all empty squares - adding surrounding squares and returning the final value
  if (curLength === emptySquares.length) {
    const surroundingSquares = [];
    //
    emptySquares.forEach((pos) => {
      const [x, y] = pos.split("-");

      VECTORS.forEach((vec) => {
        // valid pos
        const newPos = toNewPos([x, y], vec, grid.length);
        if (!newPos) return;

        // already Checked
        const [newX, newY] = newPos;
        const stringPos = `${newX}-${newY}`;
        if (
          emptySquares.includes(stringPos) ||
          surroundingSquares.includes(stringPos)
        )
          return;

        // empty square
        if (grid[newX][newY] !== "M")
          surroundingSquares.push(`${newX}-${newY}`);
      });
    });

    console.log(
      `recursion ran ${depth} times, took ${Date.now() - startTime}ms`
    );
    depth = 0;
    // final value
    return [...emptySquares, ...surroundingSquares];
  }

  return checkEmptySquares(grid, [...emptySquares], curLength);
}

function addjustCounter(container, num) {
  if (num <= 999) {
    container.children[0].className = `digit d${Math.floor(num / 100)}`;
    container.children[1].className = `digit d${Math.floor((num % 100) / 10)}`;
    container.children[2].className = `digit d${Math.floor(num % 10)}`;
  }
}

startGameButton.addEventListener("click", startGame);
gameButton.addEventListener("click", startGame);

startGame();
