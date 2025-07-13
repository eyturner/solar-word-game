function closeRanksDialog() {
  ranksDialog.close();
}

function updateScoreDisplay() {
  document.getElementById("playerScore").textContent = gameState.score;
  document.getElementById("playerRank").textContent = getRank(gameState.score);
  document.getElementById("wordCount").textContent =
    `${gameState.foundWords.size} words found`;
}

function updateRankHighlight() {
  const rank = getRank(gameState.score);

  if (rank != gameState.rank) {
    // Remove current rank highlight from previous rank
    const prevRankDialog = document.querySelector(".current-rank");
    prevRankDialog.classList.toggle("current-rank");

    // Add current rank highlight to new rank
    const newRankObj = RANKS.find((r) => r.name == rank);
    const newRankDialog = document.querySelector(`#${newRankObj.rankId}`);
    newRankDialog.classList.toggle("current-rank");
  }
}

function rotateRing(ringName, direction) {
  const ring = gameState.rings[ringName];
  let newPosition = ring.targetPosition + direction * 30;

  ring.targetPosition = newPosition;
}

function rotateSystem(degrees) {
  gameState.systemRotation += degrees;

  // Keep rotation between 0-360
  while (gameState.systemRotation < 0) gameState.systemRotation += 360;
  while (gameState.systemRotation >= 360) gameState.systemRotation -= 360;

  // Rotate all rings by the specified amount
  Object.keys(gameState.rings).forEach((ringName) => {
    const ring = gameState.rings[ringName];
    ring.targetPosition += degrees;

    // Keep positions normalized
    while (ring.targetPosition < 0) ring.targetPosition += 360;
    while (ring.targetPosition >= 360) ring.targetPosition -= 360;
  });
}

function updateWordBank() {
  const foundWordsEl = document.getElementById("foundWords");

  if (gameState.foundWords.size === 0) {
    foundWordsEl.innerHTML = "<em>Found words will appear here...</em>";
  } else {
    foundWordsEl.innerHTML = "";

    gameState.foundWords.forEach((word) => {
      const wordEl = document.createElement("div");
      wordEl.className = "word-item";
      wordEl.textContent = word;
      foundWordsEl.appendChild(wordEl);
    });
  }
}

// Function to highlight letters involved in a word
function highlightWordLetters(position, wordObj) {
  const positionAngle = position * 30;
  const oppositeAngle = (positionAngle + 180) % 360;

  // Get all letters that align on this line (both sides + sun)
  const alignedLetters = [];

  // Collect letters from position side (sorted by radius, outermost first)
  const positionSideLetters = [];
  gameState.letters.forEach((letterObj, index) => {
    const ringRotation = gameState.rings[letterObj.ring].position;
    const currentAngle = (letterObj.angle + ringRotation) % 360;
    const normalizedCurrentAngle =
      currentAngle < 0 ? currentAngle + 360 : currentAngle;

    const diff = Math.abs(normalizedCurrentAngle - positionAngle);
    const wrappedDiff = Math.min(diff, 360 - diff);

    if (wrappedDiff < 15) {
      positionSideLetters.push({
        index: index,
        letter: letterObj.letter,
        radius: letterObj.radius,
      });
    }
  });

  // Sort position side by radius (outermost to innermost)
  positionSideLetters.sort((a, b) => b.radius - a.radius);
  alignedLetters.push(...positionSideLetters);

  // Add sun in the middle
  alignedLetters.push({
    index: "sun",
    letter: gameState.sun.letter,
    radius: 0,
  });

  // Collect letters from opposite side (sorted by radius, innermost first)
  const oppositeSideLetters = [];
  gameState.letters.forEach((letterObj, index) => {
    const ringRotation = gameState.rings[letterObj.ring].position;
    const currentAngle = (letterObj.angle + ringRotation) % 360;
    const normalizedCurrentAngle =
      currentAngle < 0 ? currentAngle + 360 : currentAngle;

    const diff = Math.abs(normalizedCurrentAngle - oppositeAngle);
    const wrappedDiff = Math.min(diff, 360 - diff);

    if (wrappedDiff < 15) {
      oppositeSideLetters.push({
        index: index,
        letter: letterObj.letter,
        radius: letterObj.radius,
      });
    }
  });

  // Sort opposite side by radius (innermost to outermost)
  oppositeSideLetters.sort((a, b) => a.radius - b.radius);
  alignedLetters.push(...oppositeSideLetters);

  // Create the full letter sequence (what getLettersAtPosition returns)
  const letterSequence = alignedLetters.map((item) => item.letter);
  const sequenceString = letterSequence.join("");

  // Find where this word appears in the sequence
  const wordStartIndex = sequenceString.indexOf(wordObj.word);

  if (wordStartIndex !== -1) {
    // Highlight each letter position that's part of this word
    for (let i = 0; i < wordObj.word.length; i++) {
      const sequenceIndex = wordStartIndex + i;
      const alignedLetter = alignedLetters[sequenceIndex];

      if (alignedLetter) {
        gameState.highlightedLetters.add(alignedLetter.index);
      }
    }
  }
}

function openHelpDialog() {
  const dialog = document.getElementById("helpDialog");
  dialog.showModal();
}

function closeHelpDialog() {
  const dialog = document.getElementById("helpDialog");
  dialog.classList.add("closing");

  setTimeout(() => {
    dialog.close();
    dialog.classList.remove("closing");
  }, 300);
}
