function findAllPossibleWords(initialLetters, rings, sunLetter, validWords) {
  const allFoundWords = new Set();
  const wordDetails = [];

  // Only check these specific positions
  const positionsToCheck = [0, 1, 8, 9, 10, 11];

  // Get all possible ring positions (each ring can be in 12 positions: 0°, 30°, 60°, ..., 330°)
  const ringNames = Object.keys(rings);
  const totalCombinations = Math.pow(12, ringNames.length);

  // Iterate through all possible combinations of ring positions
  for (let combination = 0; combination < totalCombinations; combination++) {
    // Convert combination number to ring positions
    const ringPositions = {};
    let temp = combination;

    ringNames.forEach((ringName) => {
      ringPositions[ringName] = (temp % 12) * 30; // Convert to degrees
      temp = Math.floor(temp / 12);
    });

    // Check only the specific positions for this ring configuration
    for (let position of positionsToCheck) {
      const letters = getLettersAtPositionForState(
        position,
        initialLetters,
        ringPositions,
        sunLetter,
      );

      const words = findWordsInAlignmentForState(
        letters,
        position,
        validWords,
        sunLetter,
      );

      words.forEach((wordObj) => {
        if (!allFoundWords.has(wordObj.word)) {
          allFoundWords.add(wordObj.word);
          wordDetails.push({
            word: wordObj.word,
            position: position,
            ringPositions: { ...ringPositions }, // Copy the positions
            letters: wordObj.letters,
            includesSun: wordObj.includesSun,
          });
        }
      });
    }
  }

  return {
    words: Array.from(allFoundWords).sort(),
    totalWords: allFoundWords.size,
    details: wordDetails,
    positionsChecked: positionsToCheck,
  };
}

// Helper function - modified version of your getLettersAtPosition
function getLettersAtPositionForState(
  position,
  letters,
  ringPositions,
  sunLetter,
) {
  const positionAngle = position * 30;
  const oppositeAngle = (positionAngle + 180) % 360;

  const positionLetters = [];
  const oppositeLetters = [];

  letters.forEach((letterObj) => {
    const ringRotation = ringPositions[letterObj.ring] || 0;
    const currentAngle = (letterObj.angle + ringRotation) % 360;
    const normalizedCurrentAngle =
      currentAngle < 0 ? currentAngle + 360 : currentAngle;

    // Check position angle
    const positionDiff = Math.abs(normalizedCurrentAngle - positionAngle);
    const positionWrappedDiff = Math.min(positionDiff, 360 - positionDiff);

    if (positionWrappedDiff < 15) {
      positionLetters.push({
        letter: letterObj.letter,
        radius: letterObj.radius,
      });
    }

    // Check opposite angle
    const oppositeDiff = Math.abs(normalizedCurrentAngle - oppositeAngle);
    const oppositeWrappedDiff = Math.min(oppositeDiff, 360 - oppositeDiff);

    if (oppositeWrappedDiff < 15) {
      oppositeLetters.push({
        letter: letterObj.letter,
        radius: letterObj.radius,
      });
    }
  });

  // Add blanks for missing rings
  const RING_RADII = [80, 130, 180, 230, 280]; // Your ring radii
  for (let radius of RING_RADII) {
    if (!positionLetters.some((letterObj) => letterObj.radius == radius)) {
      positionLetters.push({ letter: " ", radius });
    }
    if (!oppositeLetters.some((letterObj) => letterObj.radius == radius)) {
      oppositeLetters.push({ letter: " ", radius });
    }
  }

  // Sort and build sequence
  positionLetters.sort((a, b) => b.radius - a.radius);
  oppositeLetters.sort((a, b) => a.radius - b.radius);

  const fullSequence = [];
  positionLetters.forEach((item) => fullSequence.push(item.letter));
  fullSequence.push(sunLetter);
  oppositeLetters.forEach((item) => fullSequence.push(item.letter));

  return fullSequence;
}

// Helper function - modified version of your findWordsInAlignment
function findWordsInAlignmentForState(
  letters,
  position,
  validWords,
  sunLetter,
) {
  const words = [];
  const positionAngle = position * 30;

  const normalizedAngle = ((positionAngle % 360) + 360) % 360;
  const isVerticalSector =
    normalizedAngle >= 315 ||
    normalizedAngle <= 45 ||
    (normalizedAngle >= 135 && normalizedAngle <= 225);

  const includesSun = letters.includes(sunLetter);
  const potentialWords = letters.join("").trim().split(" ");

  for (const word of potentialWords) {
    if (validWords.has(word) && word.length > 0) {
      words.push({
        word: word,
        direction: isVerticalSector ? "top-to-bottom" : "left-to-right",
        letters,
        includesSun: includesSun,
      });
    }
  }

  return words;
}
