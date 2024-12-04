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
  if (ctx) {
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
});
app.appendChild(clearButton);

let isDrawing = false;
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  if (ctx) {
    ctx.moveTo(e.offsetX, e.offsetY);
    ctx.beginPath();
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  if (ctx) ctx.closePath();
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    if (ctx) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    }
  }
});
