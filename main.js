const gridContainer = document.getElementById("gridContainer");
const startGameButton = document.querySelector("#startGameButton");
const gameButton = document.querySelector("#gameButton");
let minesPosition;

// const minesLeft = document.getElementById("minesLeft");
// const flagsElement = document.getElementById("flagsLeft");
let flagsLeft, mineCount, boardSize;
let mines;

const flagsContainer = document.getElementById("flagsContainer");
const timerContainer = document.getElementById("timerContainer");
let firstMove;
let depth = 0;
let startTime;
let indexes;
let gameInterval;
let winner = false;
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

function plantMines(length, mineCount, pos) {
  const gridClone = Array.from({ length }, () =>
    Array.from({ length }, () => 0)
  );

  let mines = mineCount;

  let mineX, mineY;
  minesPosition = [];
  while (mines > 0) {
    do {
      [mineX, mineY] = [
        Math.floor(Math.random() * boardSize),
        Math.floor(Math.random() * boardSize),
      ];
    } while (gridClone[mineX][mineY] === "M" || `${mineX}-${mineY}` === pos);

    minesPosition.push(`${mineX}-${mineY}`);
    gridClone[mineX][mineY] = "M";

    mines--;
  }

  // count mines
  minesPosition.forEach((pos) => {
    VECTORS.forEach((vec) => {
      const newPos = toNewPos(pos.split("-"), vec, gridClone.length);
      if (!newPos) return;
      //
      const [newX, newY] = newPos;
      switch (gridClone[newX][newY]) {
        case "M":
          break;
        case 0:
          gridClone[newX][newY] = 1;
          break;
        default:
          gridClone[newX][newY]++;
          break;
      }
    });
  });

  return gridClone;
}

function generateGrid(size = 10, mines = 15) {
  boardSize = size;
  mineCount = mines;
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  );

  // return grid;

  // grid[0][0] = "M";

  // plant mines
  let mineX, mineY;
  minesPosition = [];
  while (mines > 0) {
    do {
      [mineX, mineY] = [
        Math.floor(Math.random() * size),
        Math.floor(Math.random() * size),
      ];
    } while (grid[mineX][mineY] === "M");

    minesPosition.push(`${mineX}-${mineY}`);
    grid[mineX][mineY] = "M";

    mines--;
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
  gridContainer.addEventListener("mousedown", (e) => {
    if (winner) return;

    gameButton.classList.add("hold");
  });

  gridContainer.addEventListener("mouseup", (e) => {
    if (winner) return;

    gameButton.classList.remove("hold");
  });

  gridContainer.innerHTML = "";
  grid.forEach((row, x) => {
    let rowElement = document.createElement("div");
    rowElement.className = "row";
    row.forEach((square, y) => {
      const squareElement = document.createElement("div");
      const pos = `${x}-${y}`;
      squareElement.className = `square facingDown`;
      squareElement.id = pos;

      squareElement.addEventListener("click", (e) => {
        if (firstMove && grid[x][y] === "M") {
          const length = grid.length;
          grid = false;

          grid = plantMines(length, mineCount, squareElement.id);
          let firstMoveInterval = setInterval(() => {
            if (grid) {
              handleClick(grid, pos, e.target);
              clearInterval(firstMoveInterval);
            }
          }, 200);
        } else if (
          e.target.classList.contains("flagged") ||
          e.target.className.includes("_")
        ) {
          return;
        } else {
          handleClick(grid, pos, e.target);
        }
      });

      squareElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (e.target.classList.contains("revealed")) return;
        if (e.target.classList.value.includes("_")) return;
        if (!flagsLeft && !e.target.classList.contains("flagged")) return;
        e.target.classList.toggle("facingDown");
        e.target.classList.toggle("flagged");

        flagsLeft =
          flagsLeft + (e.target.classList.contains("flagged") ? -1 : +1);

        // flagsElement.innerText = flagsLeft;
        addjustCounter(flagsContainer, flagsLeft);
      });
      rowElement.appendChild(squareElement);
    });
    gridContainer.appendChild(rowElement);
  });
}

function handleClick(grid, pos, squareElement) {
  const [x, y] = pos.split("-");
  const square = grid[x][y];
  gameButton.classList.remove("hold");
  switch (square) {
    case "M":
      endGame(grid);
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
        emptySquareElement.classList.remove("facingDown");

        if (emptySquareElement.classList.contains("flagged")) {
          flagsLeft++;
          addjustCounter(flagsContainer, flagsLeft);
          // flagsElement.innerText = flagsLeft;
          emptySquareElement.classList.remove("flagged");
        }
      });
      checkWinner();
      break;
    default:
      firstMove = false;
      squareElement.classList.add(`_${square}`);
      squareElement.classList.add("revealed");
      squareElement.classList.remove("facingDown");
      checkWinner();
  }
}

function endGame(grid) {
  clearInterval(gameInterval);

  gameButton.classList.add("lose");

  grid.forEach((row, x) => {
    row.forEach((square, y) => {
      const squareElement = document.getElementById(`${x}-${y}`);
      squareElement.classList.remove(`flagged`);
      squareElement.classList.remove(`facingDown`);
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
    winner = true;
    gameButton.className = "btn win";
    revealMines();
  }
}

function revealMines() {
  minesPosition.forEach((squareID) => {
    const mineSquare = document.getElementById(squareID);
    mineSquare.classList.remove("facingDown");
    if (!mineSquare.classList.contains("flagged"))
      mineSquare.classList.add("_M");
  });
}

function startGame() {
  gameButton.className = "btn";
  clearInterval(gameInterval);
  firstMove = true;
  // const inputs = document.querySelectorAll("input");
  // boardSize = parseInt(inputs[0].value);
  // mineCount = parseInt(inputs[1].value);
  timer = 0;
  addjustCounter(timerContainer, 0);

  gameInterval = setInterval(() => {
    timer++;
    addjustCounter(timerContainer, timer);
  }, 1000);

  flagsLeft = mineCount ? mineCount : 15;
  addjustCounter(flagsContainer, flagsLeft);

  draw(generateGrid(boardSize, mineCount));
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

    // console.log(
    //   `recursion ran ${depth} times, took ${Date.now() - startTime}ms`
    // );
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
gameButton.addEventListener("click", startGame);

startGame();
