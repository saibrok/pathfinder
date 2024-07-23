const COLS = Math.floor((innerWidth - 10) / 20);
const ROWS = Math.floor((innerHeight - 10) / 20);

const START_COL = 0;
const START_ROW = 0;
const END_COL = COLS - 1;
const END_ROW = ROWS - 1;

// const WIDTH = 900;
// const HEIGHT = 900;
const WIDTH = innerWidth - 10;
const HEIGHT = innerHeight - 10 - 100;

const RANDOM_SEED = 0.5; // 0.0 - 1.0

// const w = innerWidth;
// const h = innerHeight;

const path = [];

let method = 'quadratic';

class Spot {
  constructor(i, j, g = 0, h = 0, f = 0) {
    this.i = i;
    this.j = j;
    this.g = g;
    this.h = h;
    this.f = f;
  }

  neighbors = [];
  prev = null;
  block = false;

  show(selectedColor) {
    fill(selectedColor);
    noStroke();

    if (this.block) {
      circle(
        this.i * (WIDTH / COLS) + HEIGHT / ROWS / 2,
        this.j * (HEIGHT / ROWS) + HEIGHT / ROWS / 2,
        WIDTH / COLS / 2
      );
    } else {
      rect(this.i * (WIDTH / COLS), this.j * (HEIGHT / ROWS), WIDTH / COLS, HEIGHT / ROWS);
    }
  }

  // showProperty() {
  //   textSize(10);
  //   fill(0);
  //   text(this.g, this.i * (WIDTH / COLS) + 3, this.j * (HEIGHT / ROWS) + 10);
  //   text(this.h, this.i * (WIDTH / COLS) + 3, this.j * (HEIGHT / ROWS) + 40);
  //   textSize(15);
  //   text(this.h, this.i * (WIDTH / COLS) + WIDTH / COLS / 2 - 5, this.j * (HEIGHT / ROWS) + HEIGHT / ROWS / 2 + 5);
  // }

  addNeighbors(grid) {
    if (grid?.[this.i]?.[this.j - 1]) this.neighbors.push(grid[this.i][this.j - 1]); // ⬆️
    if (grid?.[this.i + 1]?.[this.j - 1]) this.neighbors.push(grid[this.i + 1][this.j - 1]); // ↗️
    if (grid?.[this.i + 1]?.[this.j]) this.neighbors.push(grid[this.i + 1][this.j]); // ➡️
    if (grid?.[this.i + 1]?.[this.j + 1]) this.neighbors.push(grid[this.i + 1][this.j + 1]); // ↘️
    if (grid?.[this.i]?.[this.j + 1]) this.neighbors.push(grid[this.i][this.j + 1]); // ⬇️
    if (grid?.[this.i - 1]?.[this.j + 1]) this.neighbors.push(grid[this.i - 1][this.j + 1]); // ↙️
    if (grid?.[this.i - 1]?.[this.j]) this.neighbors.push(grid[this.i - 1][this.j]); // ⬅️
    if (grid?.[this.i - 1]?.[this.j - 1]) this.neighbors.push(grid[this.i - 1][this.j - 1]); // ↖️
  }
}

function rnd(n) {
  return Math.floor(Math.random() * n);
}

const grig = [...Array(COLS)].map((_, indexI) => [...Array(ROWS)].map((_, indexY) => new Spot(indexI, indexY)));

// const start = grig[START_COL][START_ROW];
// const end = grig[END_COL][END_ROW];
const start = grig[rnd(COLS)][rnd(ROWS)];
const end = grig[rnd(COLS)][rnd(ROWS)];

start.start = true;
end.end = true;

const openSet = [start];
const closedSet = [];

function getHeuristic(a, b) {
  switch (method) {
    case 'through':
      return 1;
    case 'straight':
      return sqrt(floor(sqrt(pow(abs(a.i - b.i), 2) + pow(abs(a.j - b.j), 2)) * 10), 2);
    case 'distance':
      return floor(sqrt(pow(abs(a.i - b.i), 2) + pow(abs(a.j - b.j), 2)) * 10);
    case 'quadratic':
      return floor(pow(abs(a.i - b.i), 2) + pow(abs(a.j - b.j), 2) * 10);
  }
}

function removeFromArray(arr, elt) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function setup() {
  noStroke();
  // frameRate(24);
  createCanvas(WIDTH, HEIGHT);

  background(79, 85, 107);

  grig.forEach((col, _index, grig) => {
    col.forEach((spot) => {
      spot.addNeighbors(grig);

      if (random(0, 1) < RANDOM_SEED) {
        spot.block = true;
      }
    });
  });

  start.block = false;
  end.block = false;

  [...document.querySelectorAll('input')].forEach((s, i, arr) => {
    s.addEventListener('input', () => {
      method = s.value;
    });
  });
}

function draw() {
  if (!openSet.length) {
    alert('No solution!');
    noLoop();

    return;
  }

  let best = 0;

  openSet.forEach((spot, index) => {
    if (spot.f < openSet[best].f) {
      best = index;
    }
  });

  let current = openSet[best];

  background(79, 85, 107, 5);

  closedSet.push(current);
  removeFromArray(openSet, current);

  const neighbors = current.neighbors;

  neighbors.forEach((neighbor) => {
    if (!closedSet.includes(neighbor) && !neighbor.block) {
      const tempG = current.g + getHeuristic(current, neighbor);

      let newPath = false;

      if (openSet.includes(neighbor)) {
        if (tempG < neighbor.g) {
          neighbor.g = tempG;
          newPath = true;
        }
      } else {
        neighbor.g = tempG;
        newPath = true;
        openSet.push(neighbor);
      }

      if (newPath) {
        neighbor.h = getHeuristic(neighbor, end);
        neighbor.f = neighbor.g + neighbor.h;

        neighbor.prev = current;
      }
    }
  });

  grig.forEach((col) => {
    col.forEach((spot) => {
      if (spot.block) {
        spot.show(color(135, 145, 183));
      }

      if (spot.start) {
        spot.show(color(255, 0, 0));
      }

      if (spot.end) {
        spot.show(color(0, 255, 0));
      }
    });
  });

  // openSet.forEach((spot) => {
  //   spot.show(color(200, 255, 50, 1));
  // });

  // closedSet.forEach((spot) => {
  //   spot.show(color(255, 100, 0, 1));
  // });

  path.length = 0;

  let temp = current;

  path.push(temp);

  while (temp.prev) {
    path.push(temp.prev);
    temp = temp.prev;
  }

  noFill();
  stroke(0, 255, 67);
  strokeWeight(WIDTH / COLS / 4);
  beginShape();

  path.forEach((spot) => {
    vertex(spot.i * (WIDTH / COLS) + WIDTH / COLS / 2, spot.j * (HEIGHT / ROWS) + HEIGHT / ROWS / 2);
  });

  endShape();

  // grig.forEach((col) => {
  //   col.forEach((spot) => spot.showProperty());
  // });

  if (current === end) {
    console.log('LOG ::: index.js : DONE!!:');

    noFill();
    stroke(255, 255, 67);
    strokeWeight(WIDTH / COLS / 4);
    beginShape();

    path.forEach((spot) => {
      vertex(spot.i * (WIDTH / COLS) + WIDTH / COLS / 2, spot.j * (HEIGHT / ROWS) + HEIGHT / ROWS / 2);
    });

    endShape();

    noLoop();

    return;
  }
}
