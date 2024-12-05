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
if (ctx) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
app.appendChild(canvas);

const clearButton = document.createElement("button");
clearButton.innerText = "clear";
clearButton.addEventListener("click", () => {
  points = [];
  ctx?.fillRect(0, 0, canvas.width, canvas.height);
});
app.appendChild(clearButton);

interface Point {
  x: number;
  y: number;
}
let points: Point[] = [];

let isDrawing = false;
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const point: Point = { x: e.offsetX, y: e.offsetY };
  points.push(point);
  dispatchDrawingChanged();
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  ctx?.closePath();
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const point: Point = { x: e.offsetX, y: e.offsetY };
    points.push(point);
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
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
  }
});
