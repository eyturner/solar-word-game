function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}

function update() {
  // Existing smooth rotation animations
  let rotationChanged = false;
  Object.keys(gameState.rings).forEach((ringName) => {
    const ring = gameState.rings[ringName];
    let diff = ring.targetPosition - ring.position;

    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    if (Math.abs(diff) > 0.01) {
      ring.position += diff * 0.15;
      rotationChanged = true;
    }
  });

  // Clear highlights when rings are rotated
  if (rotationChanged) {
    gameState.highlightedLetters.clear();
  }
}
