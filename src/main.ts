import "./style.css";

const APP_NAME = "Stickerpad Fun";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

const game_name = document.createElement("h1");
game_name.innerText = APP_NAME;
app.appendChild(game_name);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
const ctx = canvas.getContext("2d");

function clearCanvas() {
  ctx?.fillRect(0, 0, canvas.width, canvas.height);
}
if (ctx) ctx.fillStyle = "white";
clearCanvas();
app.appendChild(canvas);

let lineWidth = 2;

//thin marker button
const thinButton = document.createElement("button");
thinButton.innerText = "Thin Marker";
thinButton.addEventListener("click", () => {
  lineWidth = 2;
  updateTool(thinButton);
});

//thick marker button
const thickButton = document.createElement("button");
thickButton.innerText = "Thick Marker";
thickButton.addEventListener("click", () => {
  lineWidth = 8;
  updateTool(thickButton);
});

function updateTool(selectedButton: HTMLButtonElement) {
  [thinButton, thickButton].forEach((button) => {
    button.classList.remove("selectedTool");
  });
  selectedButton.classList.add("selectedTool");
}

//clear button
const clearButton = document.createElement("button");
clearButton.innerText = "clear";
clearButton.addEventListener("click", () => {
  strokes = [];
  redoStack = [];
  clearCanvas();
});

//undo button
const undoButton = document.createElement("button");
undoButton.innerText = "undo";
undoButton.addEventListener("click", () => {
  if (strokes.length > 0) {
    const lastStroke = strokes.pop();
    if (lastStroke) redoStack.push(lastStroke);
    dispatchDrawingChanged();
  }
});

//redo button
const redoButton = document.createElement("button");
redoButton.innerText = "redo";
redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const redoStroke = redoStack.pop();
    if (redoStroke) strokes.push(redoStroke);
    dispatchDrawingChanged();
  }
});

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  lineWidth: number;
  drag(point: Point): void;
  display(ctx: CanvasRenderingContext2D): void;
}

function createStroke(initialPoint: Point): Stroke {
  return {
    points: [initialPoint],
    lineWidth: lineWidth,
    drag(point: Point) {
      this.points.push(point);
    },
    display(ctx: CanvasRenderingContext2D): void {
      if (this.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
      }
    },
  };
}

let strokes: Stroke[] = [];
let redoStack: Stroke[] = [];
//let currentStroke: Point[] = [];

let isDrawing = false;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const point: Point = { x: e.offsetX, y: e.offsetY };
  strokes.push(createStroke(point));
  redoStack = [];
  dispatchDrawingChanged();
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const point: Point = { x: e.offsetX, y: e.offsetY };
    const currentStroke = strokes[strokes.length - 1];
    currentStroke.drag(point);
    dispatchDrawingChanged();
  }
});

function dispatchDrawingChanged() {
  const event = new CustomEvent("drawing-changed");
  canvas.dispatchEvent(event);
}

canvas.addEventListener("drawing-changed", () => {
  if (ctx) {
    ctx.fillStyle = "white";
    clearCanvas();
    for (const stroke of strokes) {
      stroke.display(ctx);
    }
  }
});

const actions = document.createElement("div");
app.appendChild(actions);
actions.appendChild(thinButton);
actions.appendChild(thickButton);
actions.appendChild(clearButton);
actions.appendChild(undoButton);
actions.appendChild(redoButton);

updateTool(thinButton);
