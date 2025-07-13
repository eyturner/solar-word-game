function calculateWordScore(word, hasSun = false) {
  let baseScore;
  const length = word.length;

  // Base scoring (Spelling Bee style)
  if (length === 3) {
    baseScore = 1;
  } else {
    baseScore = length; // 4+ letters get 1 point per letter
  }

  // Bonuses
  if (hasSun) baseScore += 1; // Sun letter bonus

  return baseScore;
}

function getRank(score) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].min) {
      return RANKS[i].name;
    }
  }
  return "Beginner";
}

function getLettersAtPosition(position) {
  const positionAngle = position * 30;
  const oppositeAngle = (positionAngle + 180) % 360;

  // Find letters at the position angle
  const positionLetters = [];
  // Find letters at the opposite angle
  const oppositeLetters = [];

  gameState.letters.forEach((letterObj) => {
    const ringRotation = gameState.rings[letterObj.ring].position;
    const currentAngle = (letterObj.angle + ringRotation) % 360;
    const normalizedCurrentAngle =
      currentAngle < 0 ? currentAngle + 360 : currentAngle;

    // Check if aligns with position angle
    const positionDiff = Math.abs(normalizedCurrentAngle - positionAngle);
    const positionWrappedDiff = Math.min(positionDiff, 360 - positionDiff);

    if (positionWrappedDiff < 15) {
      positionLetters.push({
        letter: letterObj.letter,
        radius: letterObj.radius,
      });
    }

    // Check if aligns with opposite angle
    const oppositeDiff = Math.abs(
      normalizedCurrentAngle -
        (oppositeAngle < 0 ? oppositeAngle + 360 : oppositeAngle),
    );
    const oppositeWrappedDiff = Math.min(oppositeDiff, 360 - oppositeDiff);

    if (oppositeWrappedDiff < 15) {
      oppositeLetters.push({
        letter: letterObj.letter,
        radius: letterObj.radius,
      });
    }
  });

  // Add in blanks for positionLetters and oppositeLetters
  for (let radius of RING_RADII) {
    if (!positionLetters.some((letterObj) => letterObj.radius == radius)) {
      positionLetters.push({
        letter: " ",
        radius,
      });
    }

    if (!oppositeLetters.some((letterObj) => letterObj.radius == radius)) {
      oppositeLetters.push({
        letter: " ",
        radius,
      });
    }
  }

  // Sort position letters by radius (outermost to innermost)
  positionLetters.sort((a, b) => b.radius - a.radius);

  // Sort opposite letters by radius in reverse (innermost to outermost)
  oppositeLetters.sort((a, b) => a.radius - b.radius);

  // Build the sequence: position letters + sun + opposite letters
  const fullSequence = [];

  // Add position side letters
  positionLetters.forEach((item) => fullSequence.push(item.letter));

  // Add sun in the middle
  fullSequence.push(gameState.sun.letter);

  // Add opposite side letters
  oppositeLetters.forEach((item) => fullSequence.push(item.letter));

  return fullSequence;
}

function findWordsInAlignment(letters, position) {
  const words = [];
  const positionAngle = position * 30;

  // Determine reading direction based on sector
  const normalizedAngle = ((positionAngle % 360) + 360) % 360;
  const isVerticalSector =
    normalizedAngle >= 315 ||
    normalizedAngle <= 45 ||
    (normalizedAngle >= 135 && normalizedAngle <= 225);

  // Check all possible starting positions and lengths in the ordered sequence
  // Determine if this word includes the sun
  const includesSun = letters.includes(gameState.sun.letter);

  // Check if this forms a valid word
  const potentialWords = letters.join("").trim().split(" ");
  for (const word of potentialWords) {
    if (dictionary.has(word)) {
      words.push({
        word: word,
        direction: isVerticalSector ? "top-to-bottom" : "left-to-right",
        letters,
        includesSun: includesSun,
      });
    }
  }

  // Remove duplicates based on word text
  const uniqueWords = [];
  const seen = new Set();
  words.forEach((wordObj) => {
    if (!seen.has(wordObj.word)) {
      seen.add(wordObj.word);
      uniqueWords.push(wordObj);
    }
  });

  return uniqueWords;
}

function checkAllPositions() {
  const allWords = [];
  const wordDetails = [];
  const positionsToCheck = [0, 1, 8, 9, 10, 11];
  let newWordsFound = false;
  let bonusScore = 0;

  // Clear previous highlights
  gameState.highlightedLetters.clear();
  gameState.lastCheckResults = [];

  for (let position of positionsToCheck) {
    const letters = getLettersAtPosition(position);
    const wordObjects = findWordsInAlignment(letters, position);

    if (wordObjects.length > 0) {
      // Store visual data for this position
      const positionData = {
        position: position,
        letters: letters,
        words: wordObjects,
        letterPositions: getLetterPositionsAtAngle(position), // New function
      };

      gameState.lastCheckResults.push(positionData);

      // Highlight letters involved in found words (both new and existing)
      wordObjects.forEach((wordObj) => {
        highlightWordLetters(position, wordObj);

        if (!gameState.foundWords.has(wordObj.word)) {
          newWordsFound = true;
          const hasSun = wordObj.word.includes(gameState.sun.letter);
          let wordScore = calculateWordScore(wordObj.word, hasSun);
          gameState.score += wordScore;
        }

        allWords.push(wordObj.word);
      });

      wordDetails.push(positionData);
    }
  }

  // Add new words to found words set
  allWords.forEach((word) => {
    gameState.foundWords.add(word);
  });

  if (newWordsFound) {
    // Multi-word and grand alignment bonuses
    const isMultiWord = allWords.length > 1;
    const isGrandAlignment =
      allWords.length == gameState.numWordsInGrandAlignment;

    if (isMultiWord && !isGrandAlignment) {
      bonusScore += 2 * (allWords.length - 1);
    } else if (isGrandAlignment) {
      bonusScore += 15;
    }

    gameState.score += bonusScore;
    updateWordBank();
    updateScoreDisplay();
    updateRankHighlight();
    updateLocalStorage();
  }
}

function getLetterPositionsAtAngle(position) {
  const positionAngle = position * 30;
  const oppositeAngle = (positionAngle + 180) % 360;
  const letterPositions = [];

  // Find letters at the position angle (one side)
  gameState.letters.forEach((letterObj, index) => {
    const ringRotation = gameState.rings[letterObj.ring].position;
    const currentAngle = (letterObj.angle + ringRotation) % 360;
    const normalizedCurrentAngle =
      currentAngle < 0 ? currentAngle + 360 : currentAngle;

    // Check if aligns with position angle
    const positionDiff = Math.abs(normalizedCurrentAngle - positionAngle);
    const positionWrappedDiff = Math.min(positionDiff, 360 - positionDiff);

    if (positionWrappedDiff < 15) {
      const ringRotationRad = (ringRotation * Math.PI) / 180;
      const totalAngle =
        (letterObj.angle * Math.PI) / 180 + ringRotationRad - Math.PI / 2;

      letterPositions.push({
        index: index,
        letter: letterObj.letter,
        x: gameState.center.x + letterObj.radius * Math.cos(totalAngle),
        y: gameState.center.y + letterObj.radius * Math.sin(totalAngle),
        radius: letterObj.radius,
        color: letterObj.color,
        side: "position", // Mark which side this letter is on
      });
    }

    // Check if aligns with opposite angle
    const oppositeDiff = Math.abs(normalizedCurrentAngle - oppositeAngle);
    const oppositeWrappedDiff = Math.min(oppositeDiff, 360 - oppositeDiff);

    if (oppositeWrappedDiff < 15) {
      const ringRotationRad = (ringRotation * Math.PI) / 180;
      const totalAngle =
        (letterObj.angle * Math.PI) / 180 + ringRotationRad - Math.PI / 2;

      letterPositions.push({
        index: index,
        letter: letterObj.letter,
        x: gameState.center.x + letterObj.radius * Math.cos(totalAngle),
        y: gameState.center.y + letterObj.radius * Math.sin(totalAngle),
        radius: letterObj.radius,
        color: letterObj.color,
        side: "opposite", // Mark which side this letter is on
      });
    }
  });

  // Add sun position (it's always part of words that go through the center)
  letterPositions.push({
    index: "sun",
    letter: gameState.sun.letter,
    x: gameState.center.x,
    y: gameState.center.y,
    radius: 0,
    color: gameState.sun.color,
    side: "center",
  });

  return letterPositions;
}

function updateLocalStorage() {
  window.localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({
      gameId: gameState.gameId,
      foundWords: [...gameState.foundWords], // Storing as array since Sets cannot be stored as JSON
      score: gameState.score,
    }),
  );
}

// Helper Functions
function getNextRing(currentRing) {
  switch (currentRing) {
    case "first":
      return "second";
    case "second":
      return "third";
    case "third":
      return "fourth";
    case "fourth":
      return "fifth";
    case "fifth":
      return "first";
    default:
      return null;
  }
}

function getPreviousRing(currentRing) {
  switch (currentRing) {
    case "first":
      return "fifth";
    case "second":
      return "first";
    case "third":
      return "second";
    case "fourth":
      return "third";
    case "fifth":
      return "fourth";
    default:
      return null;
  }
}

function getHoveredArrow(x, y) {
  const arrowRadius = 25;
  const cornerOffset = 15;
  const arrowSize = 30;

  // Left arrow position
  const leftX = cornerOffset + arrowSize / 2;
  const leftY = cornerOffset + arrowSize / 2;

  // Right arrow position
  const rightX = canvas.width - cornerOffset - arrowSize / 2;
  const rightY = cornerOffset + arrowSize / 2;

  // Check left arrow
  const leftDist = Math.sqrt((x - leftX) ** 2 + (y - leftY) ** 2);
  if (leftDist <= arrowRadius) {
    return "left";
  }

  // Check right arrow
  const rightDist = Math.sqrt((x - rightX) ** 2 + (y - rightY) ** 2);
  if (rightDist <= arrowRadius) {
    return "right";
  }

  return null;
}

function getSavedGameState() {
  const prevGameState = window.localStorage.getItem(LOCAL_STORAGE_KEY);

  // If no state, set to starting state for day
  if (!prevGameState) {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        gameId: gameState.gameId,
        foundWords: [], // Storing as array since Sets cannot be stored as JSON
        score: 0,
      }),
    );
  } else {
    const parsedPrevGameState = JSON.parse(prevGameState);

    // Clear old state if game id doesn't match current:
    if (parsedPrevGameState.gameId != gameState.gameId) {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          gameId: gameState.gameId,
          foundWords: [], // Storing as array since Sets cannot be stored as JSON
          score: 0,
        }),
      );
    } else {
      // Convert foundWords array to Set
      const foundWordsSet = new Set(parsedPrevGameState.foundWords);
      gameState = {
        ...gameState,
        foundWords: foundWordsSet,
        score: parsedPrevGameState.score,
      };

      // Show previous state!
      updateWordBank();
    }
  }
}
