const container = document.getElementById("container");
const startGameButton = document.querySelector("#startGameButton");
let firstMove;

// declaring vectors
let VECTORS = [
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
    Array.from({ length: boardSize }, () => "")
  );

  let mineX, mineY;
  let minesPosition = [];
  while (mineCount > 0) {
    do {
      [mineX, mineY] = [
        Math.floor(Math.random() * boardSize),
        Math.floor(Math.random() * boardSize),
      ];
    } while (grid[mineX][mineY] === "💣");

    minesPosition.push([mineX, mineY]);
    grid[mineX][mineY] = "💣";

    mineCount--;
  }
  grid.forEach((row, x) => {
    row.forEach((square, y) => {
      if (square === "💣") return;
      const counter = countMines([x, y], grid);
      counter && (grid[x][y] = counter);
    });
  });
  return grid;
}

function toNewPos(pos, vec, gridSize) {
  const [x, y] = pos;
  const [vecX, vecY] = vec;

  const [newX, newY] = [x + vecX, y + vecY];
  if (newX >= gridSize || newX < 0 || newY >= gridSize || newY < 0) return null;

  return [newX, newY];
}

function countMines(square, grid) {
  const [squareX, squareY] = square;
  const squares = [];
  VECTORS.forEach((vector) => {
    const [vecX, vecY] = vector;
    let newX =
      squareX > 0
        ? Math.min(grid.length - 1, squareX + vecX)
        : Math.max(0, squareX + vecX);
    let newY =
      squareY > 0
        ? Math.min(grid.length - 1, squareY + vecY)
        : Math.max(0, squareY + vecY);

    if (
      grid[newX][newY] === "💣" &&
      !squares.some((square) => square[0] === newX && square[1] === newY)
    )
      squares.push([newX, newY]);
  });
  return squares.length;
}

function draw(grid) {
  container.innerHTML = "";
  grid.forEach((row, x) => {
    let rowElement = document.createElement("div");
    rowElement.className = "row";
    row.forEach((square, y) => {
      const squareElement = document.createElement("button");
      squareElement.className = `square`;
      squareElement.id = `${x}${y}`;
      squareElement.addEventListener("click", (e) => {
        switch (square) {
          case "💣":
            if (firstMove) {
              console.log("mine on first click");
              startGame([x, y]);
            } else endGame(grid);
            break;
          case "":
            firstMove = false;
            e.target.innerText = square;
            e.target.disabled = true;
            break;
          default:
            firstMove = false;
            e.target.innerText = square;
            e.target.disabled = true;
        }
      });
      rowElement.appendChild(squareElement);
    });
    container.appendChild(rowElement);
  });
}

function endGame(grid) {
  container.innerHTML = "";
  grid.forEach((row) => {
    let rowElement = document.createElement("div");
    rowElement.className = "row";
    row.forEach((square) => {
      const squareElement = document.createElement("button");
      squareElement.className = `square`;
      squareElement.innerText = square;
      squareElement.disabled = true;
      rowElement.appendChild(squareElement);
    });
    container.appendChild(rowElement);
  });
}

function startGame(firstClick = false) {
  firstMove = true;
  const inputs = document.querySelectorAll("input");
  const boardSize = parseInt(inputs[0].value);
  const mineCount = parseInt(inputs[1].value);
  if (!boardSize || !mineCount) {
    alert("please enter board size and mines count");
  } else {
    draw(generateGrid(boardSize, mineCount));
  }
}

startGameButton.addEventListener("click", startGame);
