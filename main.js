console.log("hello world");
const container = document.getElementById("container");
const startGameButton = document.querySelector("#startGameButton");

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

const countMines = (square, grid) => {
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
      grid[newX][newY] === "M" &&
      !squares.some((square) => square[0] === newX && square[1] === newY)
    )
      squares.push([newX, newY]);
  });
  return squares.length;
};
const generateGame = (boardSize = 10, mineCount = 15) => {
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
    } while (grid[mineX][mineY] === "M");

    minesPosition.push([mineX, mineY]);
    grid[mineX][mineY] = "M";

    mineCount--;
  }
  grid.forEach((row, x) => {
    row.forEach((square, y) => {
      if (square === "M") return;
      const counter = countMines([x, y], grid);
      counter && (grid[x][y] = counter);
    });
  });
  return grid;
};
const draw = (grid) => {
  container.innerHTML = "";
  grid.forEach((row, x) => {
    let rowElement = document.createElement("div");
    rowElement.className = "row";
    row.forEach((square, y) => {
      const squareElement = document.createElement("button");
      squareElement.className = `square`;
      squareElement.id = `${x}${y}`;
      squareElement.addEventListener("click", (e) => {
        if (grid[x][y] !== "M") {
          if (grid[x][y] === "") {
            // const emptySquares = getEmptySquares([[x, y]], grid);
            const emptySquares = getEmptySquares2([[x, y]], grid);
            console.log("function success:", emptySquares);
            emptySquares.forEach((square) => {
              document.getElementById(
                `${square[0]}${square[1]}`
              ).disabled = true;
            });
          }
          e.target.innerText = square;
          e.target.disabled = true;
        } else {
          e.innerText = square;
          endGame(grid);
        }
      });
      rowElement.appendChild(squareElement);
    });
    container.appendChild(rowElement);
  });
};
const endGame = (grid) => {
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
};
const startGame = () => {
  const inputs = document.querySelectorAll("input");
  const boardSize = parseInt(inputs[0].value);
  const mineCount = parseInt(inputs[1].value);
  if (!boardSize || !mineCount) {
    alert("please enter board size and mines count");
  } else {
    draw(generateGame(boardSize, mineCount));
  }
};

startGameButton.addEventListener("click", startGame);
