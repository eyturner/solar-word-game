function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw orbital rings (guidelines)
  drawOrbitalRings();

  // Draw reading direction indicators
  drawReadingIndicators();

  // Draw planets
  drawPlanets();

  // Draw sun
  drawSun();

  // Draw rotation arrows
  drawRotationArrows();

  // Draw any word visualization
  drawWordLines();
}

function drawOrbitalRings() {
  // Draw rings based on unique radii from letters
  const radii = [
    ...new Set(Object.values(gameState.rings).map((ring) => ring.radius)),
  ];
  radii.forEach((radius) => {
    const ringName = Object.keys(gameState.rings).find(
      (name) => gameState.rings[name].radius === radius,
    );
    const isSelected = gameState.selectedRing === ringName;

    ctx.strokeStyle = isSelected ? "#ffdd44" : "#444";
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.setLineDash(isSelected ? [] : [5, 5]);

    ctx.beginPath();
    ctx.arc(gameState.center.x, gameState.center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.setLineDash([]);
}

function drawReadingIndicators() {
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  ctx.font = "10px Arial";
  ctx.fillStyle = "#888";

  // Draw subtle lines at all 12 positions
  for (let pos = 0; pos < 8; pos++) {
    const angle = ((pos * 45 - 90) * Math.PI) / 180;

    if (pos % 2 === 1) {
      // Show main positions (12, 3, 6, 9)
      const x1 = gameState.center.x + 60 * Math.cos(angle);
      const y1 = gameState.center.y + 60 * Math.sin(angle);
      const x2 = gameState.center.x + 300 * Math.cos(angle);
      const y2 = gameState.center.y + 300 * Math.sin(angle);

      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "#ffdd44";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

function drawPlanets() {
  gameState.letters.forEach((letterObj, index) => {
    // Calculate current position based on ring rotation
    const ringRotation =
      (gameState.rings[letterObj.ring].position * Math.PI) / 180;
    const totalAngle =
      (letterObj.angle * Math.PI) / 180 + ringRotation - Math.PI / 2;

    const x = gameState.center.x + letterObj.radius * Math.cos(totalAngle);
    const y = gameState.center.y + letterObj.radius * Math.sin(totalAngle);

    const isHighlighted = gameState.highlightedLetters.has(index);

    // Enhanced planet body with highlighting
    if (isHighlighted) {
      // Glowing effect for highlighted letters
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
      glowGradient.addColorStop(0, letterObj.color);
      glowGradient.addColorStop(0.7, "#ffdd44");
      glowGradient.addColorStop(1, "rgba(255, 221, 68, 0)");

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Planet body
    ctx.fillStyle = letterObj.color;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    // Planet border
    ctx.strokeStyle = isHighlighted ? "#fff" : "#fff";
    ctx.lineWidth = isHighlighted ? 4 : 2;
    ctx.stroke();

    // Letter styling
    ctx.fillStyle = "white";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letterObj.letter, x, y);
  });
}

function drawSun() {
  const sun = gameState.sun;

  // Sun glow
  const gradient = ctx.createRadialGradient(
    gameState.center.x,
    gameState.center.y,
    0,
    gameState.center.x,
    gameState.center.y,
    sun.radius + 10,
  );
  gradient.addColorStop(0, "#ffdd44");
  gradient.addColorStop(0.7, "#ffaa00");
  gradient.addColorStop(1, "rgba(255, 170, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(
    gameState.center.x,
    gameState.center.y,
    sun.radius + 10,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Sun body
  ctx.fillStyle = sun.color;
  ctx.beginPath();
  ctx.arc(gameState.center.x, gameState.center.y, sun.radius, 0, Math.PI * 2);
  ctx.fill();

  // Sun border
  ctx.strokeStyle = "#ffaa00";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Sun letter
  ctx.fillStyle = "#333";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(gameState.sun.letter, gameState.center.x, gameState.center.y);
}

function drawWordLines() {
  // TODO
  // This will show visual connections for found words
  // Implementation can be added later for visual feedback
  return;
}

function drawRotationArrows() {
  const arrowSize = 30;
  const cornerOffset = 15;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Left top arrow (counter-clockwise)
  const leftX = cornerOffset + arrowSize / 2;
  const leftY = cornerOffset + arrowSize / 2;
  drawRotationArrow(leftX, leftY, "left");

  // Right top arrow (clockwise)
  const rightX = canvasWidth - cornerOffset - arrowSize / 2;
  const rightY = cornerOffset + arrowSize / 2;
  drawRotationArrow(rightX, rightY, "right");
}

function drawRotationArrow(x, y, direction) {
  const radius = 25;
  const isHovered = gameState.hoveredArrow === direction;

  ctx.save();

  // Draw background circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = isHovered
    ? "rgba(78, 205, 196, 0.3)"
    : "rgba(26, 26, 62, 0.9)";
  ctx.fill();

  // Draw border
  ctx.strokeStyle = isHovered ? "#ffdd44" : "#4ecdc4";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw the arrow symbol
  ctx.strokeStyle = isHovered ? "#ffdd44" : "#4ecdc4";
  ctx.fillStyle = isHovered ? "#ffdd44" : "#4ecdc4";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (direction === "left") {
    // Counter-clockwise: upward triangle on the left with arc connecting to bottom

    // Draw upward-pointing triangle on the left
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 12); // Top point
    ctx.lineTo(x - 12, y - 4); // Bottom left
    ctx.lineTo(x - 4, y - 4); // Bottom right
    ctx.closePath();
    ctx.fill();

    // Draw arc connecting from triangle bottom, sweeping counter-clockwise
    ctx.beginPath();
    ctx.arc(x, y, 10, Math.PI * 1.2, Math.PI * 0.2, false);
    ctx.stroke();
  } else {
    // Clockwise: upward triangle on the right with arc connecting to bottom

    // Draw upward-pointing triangle on the right
    ctx.beginPath();
    ctx.moveTo(x + 8, y - 12); // Top point
    ctx.lineTo(x + 4, y - 4); // Bottom left
    ctx.lineTo(x + 12, y - 4); // Bottom right
    ctx.closePath();
    ctx.fill();

    // Draw arc connecting from triangle bottom, sweeping clockwise
    ctx.beginPath();
    ctx.arc(x, y, 10, Math.PI * 0.8, Math.PI * 1.8, false);
    ctx.stroke();
  }

  ctx.restore();
}
