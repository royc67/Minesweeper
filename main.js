const container = document.getElementById("container");
const startGameButton = document.querySelector("#startGameButton");
let firstMove;
let depth = 0;
let startTime;

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

  // plant mines
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

  // count mines
  minesPosition.forEach((pos) => {
    const [x, y] = pos;
    VECTORS.forEach((vec) => {
      const newPos = toNewPos(pos, vec, grid.length);
      if (!newPos) return;
      //
      const [newX, newY] = newPos;
      switch (grid[newX][newY]) {
        case "💣":
          break;
        case "":
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
  const [x, y] = pos;
  const [vecX, vecY] = vec;

  const [newX, newY] = [x + vecX, y + vecY];
  if (newX >= gridSize || newX < 0 || newY >= gridSize || newY < 0) return null;

  return [newX, newY];
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
            // reveal squares
            const emptySquares = checkEmptySquares(grid, [squareElement.id]);
            console.log(emptySquares);
            emptySquares.forEach((pos) => {
              const [tempX, tempY] = pos.split("-");
              const emptySquareElement = document.getElementById(pos);
              emptySquareElement.innerText = grid[tempX][tempY];
              emptySquareElement.disabled = true;
            });
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

function checkEmptySquares(grid, emptySquares) {
  if (!depth) startTime = Date.now();
  depth++;
  const originalLength = emptySquares.length;

  emptySquares.forEach((pos) => {
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
      if (!grid[newX][newY]) emptySquares.push(`${newX}-${newY}`);
    });
  });

  // found all empty squares - adding surrounding squares and returning the final value
  if (originalLength === emptySquares.length) {
    const surroundingSquares = [];
    //
    emptySquares.forEach((pos) => {
      const [x, y] = pos.split("-");

      VECTORS.slice(0, 4).forEach((vec) => {
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
        if (grid[newX][newY] !== "💣")
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

  return checkEmptySquares(grid, [...emptySquares]);
}

startGameButton.addEventListener("click", startGame);
