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
    const redoPoint = redoStack.pop();
    if (redoPoint) strokes.push(redoPoint);
    dispatchDrawingChanged();
  }
});

interface Point {
  x: number;
  y: number;
}

let strokes: Point[][] = [];
let redoStack: Point[][] = [];
let currentStroke: Point[] = [];

let isDrawing = false;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentStroke = [];
  const point: Point = { x: e.offsetX, y: e.offsetY };
  currentStroke.push(point);
  strokes.push(currentStroke);
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
    currentStroke.push(point);
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
      if (stroke.length > 0) {
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
      }
    }
  }
});

const actions = document.createElement("div");
app.appendChild(actions);
actions.appendChild(clearButton);
actions.appendChild(undoButton);
actions.appendChild(redoButton);
