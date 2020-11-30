console.log("hello world");
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
