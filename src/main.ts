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

const actions = document.createElement("div");
app.appendChild(actions);
const selectedTool = document.createElement("div");
app.appendChild(selectedTool);

let lineWidth = 2;

interface Tool {
  name: string;
  type: "marker" | "sticker";
  action?: () => void;
  lineWidth?: number;
  stickerEmoji?: string;
}

const tools: Tool[] = [
  {name: "Thin Marker", type: "marker", lineWidth: 2},
  {name: "Thick Marker", type: "marker", lineWidth: 8},
  {name: "😊", type: "sticker", stickerEmoji: "😊"},
  {name: "🌟", type: "sticker", stickerEmoji: "🌟"},
  {name: "🍪", type: "sticker", stickerEmoji: "🍪" },
]

const toolButtons: HTMLButtonElement[] = [];
tools.forEach((tool) => {
  const button = document.createElement("button")
  button.innerText = tool.name;

  button.addEventListener("click", () => {
    if(tool.type === "marker" && tool.lineWidth){
      lineWidth = tool.lineWidth;
      toolPreview.sticker = null;
      dispatchToolMoved(tool.name);
    }

    if(tool.type === "sticker" && tool.stickerEmoji){
      toolPreview.sticker = tool.stickerEmoji;
      dispatchToolMoved(tool.name);
    }

    updateTool(toolButtons, button);
  });

  toolButtons.push(button);
  selectedTool.appendChild(button);
})

function updateTool(buttons: HTMLButtonElement[], selectedButton: HTMLButtonElement) {
  buttons.forEach((button) => {
    button.classList.remove("selectedTool");
  });
  selectedButton.classList.add("selectedTool");
}

function dispatchToolMoved(selectedTool: string): void {
  const event = new CustomEvent("tool-moved", {
    detail: {tool: selectedTool},
  });
  canvas.dispatchEvent(event);
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

interface ToolPreview {
  x: number | null;
  y: number | null;
  lineWidth: number;
  sticker: string | null;
  draw(ctx: CanvasRenderingContext2D): void;
}

const toolPreview: ToolPreview = {
  x: null,
  y: null,
  lineWidth: lineWidth,
  sticker: null,
  draw(ctx: CanvasRenderingContext2D) {
    if (this.x !== null && this.y !== null) {
      if(this.sticker){
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.sticker, this.x, this.y);
      }else{
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();}
    }
  },
};

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
let isDrawing = false;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  toolPreview.x = null;
  toolPreview.y = null;
  const point: Point = { x: e.offsetX, y: e.offsetY };
  strokes.push(createStroke(point));
  redoStack = [];
  dispatchDrawingChanged();
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mouseout", () => {
  toolPreview.x = null;
  toolPreview.y = null;
  isDrawing = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const point: Point = { x: e.offsetX, y: e.offsetY };
    const currentStroke = strokes[strokes.length - 1];
    currentStroke.drag(point);
    dispatchDrawingChanged();
  } else {
    toolPreview.x = e.offsetX;
    toolPreview.y = e.offsetY;
    toolPreview.lineWidth = lineWidth;

    const activeTool = tools.find((tool => tool.type === "sticker" && tool.name === toolPreview.sticker));
    if(activeTool?.type === "sticker"){
      toolPreview.sticker = activeTool.stickerEmoji || null;
    }else{
      toolPreview.sticker = null;
    }

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
    if (!isDrawing) {
      toolPreview.draw(ctx);
    }
  }
});
actions.appendChild(clearButton);
actions.appendChild(undoButton);
actions.appendChild(redoButton);