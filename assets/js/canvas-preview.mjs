import { shade } from "./utils.mjs";

export function createStagePainter({ getState, getContext }) {
  let animationFrame = 0;

  function cancelStagePaint() {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  function scheduleStagePaint() {
    const canvas = document.getElementById("stage-canvas");
    if (!canvas) {
      return;
    }
    cancelStagePaint();
    const paint = (time) => {
      drawStage(canvas, time, getState(), getContext());
      animationFrame = window.requestAnimationFrame(paint);
    };
    animationFrame = window.requestAnimationFrame(paint);
  }

  return { cancelStagePaint, scheduleStagePaint };
}

function drawStage(canvas, time, state, context) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const t = time / 1000;
  drawBackground(ctx, width, height, t, state);
  drawTimeline(ctx, width, height);
  drawAvatar(ctx, width, height, t, state);
  drawBadges(ctx, width, state, context);
}

function drawBackground(ctx, width, height, t, state) {
  ctx.clearRect(0, 0, width, height);
  const palettes = {
    archive: ["#25211c", "#b68b20", "#f2ead7"],
    forest: ["#142018", "#3f7d4a", "#d8c67a"],
    city: ["#171b24", "#665a9e", "#42a4a8"],
    cosmos: ["#151719", "#bf5b37", "#f7f7f2"],
    studio: ["#1f2024", "#1e7777", "#f7f7f2"]
  };
  const colors = palettes[state.scene] || palettes.archive;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.58, shade(colors[0], 18));
  gradient.addColorStop(1, colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = colors[2];
  ctx.lineWidth = 1;
  for (let x = -80; x < width + 80; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(t + x) * 6, 0);
    ctx.lineTo(x - 80, height);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  if (state.scene === "forest") {
    for (let i = 0; i < 12; i += 1) {
      const x = i * 86 + Math.sin(t + i) * 8;
      drawTree(ctx, x, height - 60, 110 + (i % 3) * 28);
    }
  } else if (state.scene === "city") {
    for (let i = 0; i < 12; i += 1) {
      const h = 90 + (i % 5) * 26;
      ctx.fillStyle = i % 2 ? "#272d38" : "#20252e";
      ctx.fillRect(i * 82, height - h, 60, h);
      ctx.fillStyle = "#d8c67a";
      ctx.globalAlpha = 0.42;
      ctx.fillRect(i * 82 + 14, height - h + 18, 8, 8);
      ctx.fillRect(i * 82 + 38, height - h + 44, 8, 8);
      ctx.globalAlpha = 1;
    }
  } else if (state.scene === "cosmos") {
    ctx.fillStyle = "#f7f7f2";
    for (let i = 0; i < 80; i += 1) {
      const x = (i * 127 + Math.sin(t + i) * 16) % width;
      const y = (i * 71) % height;
      ctx.globalAlpha = 0.35 + (i % 4) * 0.12;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
}

function drawTree(ctx, x, y, size) {
  ctx.fillStyle = "#1b3323";
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x - size * 0.38, y);
  ctx.lineTo(x + size * 0.38, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#5d4730";
  ctx.fillRect(x - 5, y - 12, 10, 35);
}

function drawTimeline(ctx, width, height) {
  const y = height - 78;
  ctx.strokeStyle = "rgba(247, 247, 242, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(84, y);
  ctx.lineTo(width - 84, y);
  ctx.stroke();
  const points = [0.18, 0.38, 0.62, 0.82];
  points.forEach((point, index) => {
    const x = 84 + (width - 168) * point;
    ctx.fillStyle = index % 2 ? "#bf5b37" : "#1e7777";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawAvatar(ctx, width, height, t, state) {
  const centerX = width * 0.5;
  const baseY = height * 0.68;
  const pulse = Math.sin(t * 3) * 4;
  const talking = state.progress > 0 && state.progress < 100 ? Math.abs(Math.sin(t * 10)) : Math.abs(Math.sin(t * 2)) * 0.3;
  const type = state.subjectType;
  const accent = type === "mythical" ? "#bf5b37" : type === "animal" ? "#d8c67a" : type === "artifact" ? "#8f8a80" : type === "fictional" ? "#665a9e" : "#1e7777";

  ctx.save();
  ctx.translate(centerX, baseY + pulse);

  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 96, 145, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = shade(accent, -22);
  ctx.beginPath();
  ctx.roundRect(-86, 10, 172, 138, 34);
  ctx.fill();

  if (type === "mythical") {
    drawWing(ctx, -84, 18, -1, t);
    drawWing(ctx, 84, 18, 1, t);
  }
  if (type === "artifact") {
    ctx.fillStyle = "#6e6a61";
    ctx.fillRect(-58, -105, 116, 142);
    ctx.strokeStyle = "#c7b888";
    ctx.lineWidth = 3;
    for (let y = -76; y < 10; y += 24) {
      ctx.beginPath();
      ctx.moveTo(-38, y);
      ctx.lineTo(38, y + Math.sin(t + y) * 3);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.ellipse(0, -58, 82, 94, 0, 0, Math.PI * 2);
    ctx.fill();
    if (type === "animal") {
      ctx.beginPath();
      ctx.moveTo(-54, -132);
      ctx.lineTo(-25, -84);
      ctx.lineTo(-78, -86);
      ctx.closePath();
      ctx.moveTo(54, -132);
      ctx.lineTo(25, -84);
      ctx.lineTo(78, -86);
      ctx.closePath();
      ctx.fill();
    }
    if (type === "fictional") {
      ctx.strokeStyle = "#f7f7f2";
      ctx.lineWidth = 3;
      ctx.strokeRect(-60, -116, 120, 116);
    }
  }

  ctx.fillStyle = "#f7f7f2";
  ctx.beginPath();
  ctx.arc(-28, -72, 8, 0, Math.PI * 2);
  ctx.arc(28, -72, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111318";
  ctx.beginPath();
  ctx.arc(-28 + Math.sin(t) * 2, -72, 3, 0, Math.PI * 2);
  ctx.arc(28 + Math.sin(t) * 2, -72, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#111318";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(-25, -35, 50, 8 + talking * 22, 10);
  ctx.stroke();

  ctx.strokeStyle = "rgba(247, 247, 242, 0.72)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -58, 116 + state.expression * 0.18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawWing(ctx, x, y, side, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 2) * 5);
  ctx.scale(side, 1);
  ctx.fillStyle = "rgba(191, 91, 55, 0.7)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(95, -88, 138, 38);
  ctx.quadraticCurveTo(70, 18, 0, 62);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBadges(ctx, width, state, context) {
  const label = state.exportId ? "EXPORT " + state.exportId.slice(-6).toUpperCase() : context.label.toUpperCase();
  ctx.fillStyle = "rgba(17, 19, 24, 0.74)";
  ctx.fillRect(22, 22, 230, 38);
  ctx.fillStyle = "#f7f7f2";
  ctx.font = "16px Consolas, monospace";
  ctx.fillText(label, 38, 47);

  ctx.fillStyle = "rgba(17, 19, 24, 0.74)";
  ctx.fillRect(width - 246, 22, 224, 38);
  ctx.fillStyle = "#f7f7f2";
  ctx.fillText("C2PA " + (state.c2pa ? "ON" : "OFF") + "  VTT " + (state.captions ? "ON" : "OFF"), width - 230, 47);
}

export function startLaunchCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(320, Math.floor(rect.width * window.devicePixelRatio));
    canvas.height = Math.max(260, Math.floor(rect.height * window.devicePixelRatio));
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);
  function paint(time) {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const t = time / 1000;
    ctx.clearRect(0, 0, w, h);
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#151719");
    gradient.addColorStop(0.7, "#25211c");
    gradient.addColorStop(1, "#1e7777");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i += 1) {
      const x = 54 + i * (w - 108) / 8;
      const y = h * 0.22 + Math.sin(t + i) * 16;
      ctx.strokeStyle = i % 2 ? "#bf5b37" : "#f7f7f2";
      ctx.globalAlpha = 0.38;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(w * 0.5, h * 0.55);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "#1e7777";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.48, 92, 112, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f7f7f2";
    ctx.beginPath();
    ctx.arc(w * 0.5 - 30, h * 0.43, 8, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 30, h * 0.43, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f7f7f2";
    ctx.lineWidth = 3;
    ctx.strokeRect(w * 0.5 - 150, h * 0.48 - 138, 300, 254);
    ctx.fillStyle = "rgba(17,19,24,0.72)";
    ctx.fillRect(34, h - 90, w - 68, 52);
    ctx.fillStyle = "#f7f7f2";
    ctx.font = "15px Consolas, monospace";
    ctx.fillText("EchoFrame contextual deployments", 52, h - 58);
    requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);
}
