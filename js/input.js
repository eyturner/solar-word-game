function handleKeyDown(e) {
  if (!gameState.selectedRing) return;

  switch (e.code) {
    case "ArrowLeft":
      e.preventDefault();
      rotateRing(gameState.selectedRing, -1);
      break;
    case "ArrowRight":
      e.preventDefault();
      rotateRing(gameState.selectedRing, 1);
      break;
    case "ArrowUp":
      e.preventDefault();
      gameState.selectedRing = getNextRing(gameState.selectedRing);
      break;
    case "ArrowDown":
      e.preventDefault();
      gameState.selectedRing = getPreviousRing(gameState.selectedRing);
      break;
    case "Space":
      e.preventDefault();
      checkAllPositions();
      break;
  }
}

function handleMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  startDrag(x, y);
}

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  // Check arrow hover
  const prevHoveredArrow = gameState.hoveredArrow;
  gameState.hoveredArrow = getHoveredArrow(x, y);

  // Update cursor
  if (gameState.hoveredArrow) {
    canvas.style.cursor = "pointer";
  } else if (!gameState.dragState) {
    canvas.style.cursor = "pointer";
  }

  // Redraw if hover state changed
  if (prevHoveredArrow !== gameState.hoveredArrow) {
    // No need to call draw() here as it's called by animate()
  }

  updateDrag(x, y);
}

function handleMouseUp(e) {
  endDrag();
}

function handleTouchStart(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (touch.clientX - rect.left) * scaleX;
  const y = (touch.clientY - rect.top) * scaleY;
  startDrag(x, y);
}

function handleTouchMove(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (touch.clientX - rect.left) * scaleX;
  const y = (touch.clientY - rect.top) * scaleY;
  updateDrag(x, y);
}

function handleTouchEnd(e) {
  e.preventDefault();
  endDrag();
}

function startDrag(x, y) {
  // Check if clicking on arrow first
  const clickedArrow = getHoveredArrow(x, y);
  if (clickedArrow) {
    const rotation = clickedArrow === "left" ? -30 : 30;
    rotateSystem(rotation);
    return; // Don't start ring drag
  }

  // Existing ring selection logic
  const distance = Math.sqrt(
    (x - gameState.center.x) ** 2 + (y - gameState.center.y) ** 2,
  );

  let targetRing = null;
  let minDiff = Infinity;

  Object.keys(gameState.rings).forEach((ringName) => {
    const ring = gameState.rings[ringName];
    const diff = Math.abs(distance - ring.radius);
    if (diff < 30 && diff < minDiff) {
      minDiff = diff;
      targetRing = ringName;
    }
  });

  if (targetRing) {
    gameState.selectedRing = targetRing;
    const angle = Math.atan2(y - gameState.center.y, x - gameState.center.x);
    gameState.dragState = {
      ring: targetRing,
      startAngle: angle,
      startPosition: gameState.rings[targetRing].position,
    };
    canvas.style.cursor = "grabbing";
  } else {
    gameState.selectedRing = null;
  }
}

function updateDrag(x, y) {
  if (!gameState.dragState) return;

  const angle = Math.atan2(y - gameState.center.y, x - gameState.center.x);

  // Calculate the shortest angular distance
  let deltaAngle = angle - gameState.dragState.startAngle;

  // Normalize to [-π, π] range to prevent wrapping issues
  while (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
  while (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

  const deltaPosition = (deltaAngle * 180) / Math.PI;
  let newPosition = gameState.dragState.startPosition + deltaPosition;

  // Snap to nearest 30-degree increment
  newPosition = Math.round(newPosition / 30) * 30;

  gameState.rings[gameState.dragState.ring].targetPosition = newPosition;
}

function endDrag() {
  gameState.dragState = null;
  canvas.style.cursor = "pointer";
}

// Input handling
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);

// Keyboard controls
document.addEventListener("keydown", handleKeyDown);

// Rank board input handling
showRanksDialogButton.addEventListener("click", () => {
  ranksDialog.showModal();
});

// Close on backdrop click
document.getElementById("helpDialog").addEventListener("click", (e) => {
  if (e.target.tagName === "DIALOG") {
    closeHelpDialog();
  }
});
