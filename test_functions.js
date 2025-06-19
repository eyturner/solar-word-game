function runFindAllPossibleWords() {
  let allPossibleWords = findAllPossibleWords(
    gameState.letters,
    gameState.rings,
    gameState.sun.letter,
    dictionary,
  );

  console.log(allPossibleWords);
  let maxScore = 0;
  for (const word of allPossibleWords.words) {
    if (word.length == 3) maxScore += 1;
    else maxScore += word.length;
  }
  console.log("MAX:", maxScore);
}

function findAllPossibleWords(initialLetters, rings, sunLetter, validWords) {
  const allFoundWords = new Set();
  const wordDetails = [];
  const positionsToCheck = [0, 1, 8, 9, 10, 11];

  // Explicitly define ring order to ensure consistent cycling
  const ringNames = ["inner", "middle", "outer", "fourth", "fifth"];
  const totalCombinations = Math.pow(12, ringNames.length);

  console.log(
    `Checking ${totalCombinations} combinations (${ringNames.length} rings)`,
  );

  for (let combination = 0; combination < totalCombinations; combination++) {
    const ringPositions = {};
    let temp = combination;

    // Build positions explicitly in the right order
    for (let i = 0; i < ringNames.length; i++) {
      const ringName = ringNames[i];
      ringPositions[ringName] = (temp % 12) * 30;
      temp = Math.floor(temp / 12);
    }

    // Debug: log every 1000th combination to see the pattern
    // if (combination % 1000 === 0) {
    //   console.log(`Combination ${combination}:`, ringPositions);
    // }

    // Check positions for this ring configuration
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
            ringPositions: { ...ringPositions },
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
    combinationsChecked: totalCombinations,
  };
}

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
  const RING_RADII = [
    FIRST_RING_RADIUS,
    SECOND_RING_RADIUS,
    THIRD_RING_RADIUS,
    FOURTH_RING_RADIUS,
    FIFTH_RING_RADIUS,
  ];
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
