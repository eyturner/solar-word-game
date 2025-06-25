const FIRST_RING_COLOR = "#ff6b6b";
const SECOND_RING_COLOR = "#297a23";
const THIRD_RING_COLOR = "#45b7d1";
const FOURTH_RING_COLOR = "#9945d1";
const FIFTH_RING_COLOR = "#9e297b";

const FIRST_RING_RADIUS = 60;
const SECOND_RING_RADIUS = 110;
const THIRD_RING_RADIUS = 160;
const FOURTH_RING_RADIUS = 210;
const FIFTH_RING_RADIUS = 260;

const RING_RADII = [
  FIRST_RING_RADIUS,
  SECOND_RING_RADIUS,
  THIRD_RING_RADIUS,
  FOURTH_RING_RADIUS,
  FIFTH_RING_RADIUS,
];

const RING_COLORS = [
  FIRST_RING_COLOR,
  SECOND_RING_COLOR,
  THIRD_RING_COLOR,
  FOURTH_RING_COLOR,
  FIFTH_RING_COLOR,
];

const RING_NAME_MAP = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
};

export function runFindAllPossibleWords(gameState, dictionary) {
  let allPossibleWords = findAllPossibleWords(
    gameState.letters,
    gameState.rings,
    gameState.sun.letter,
    dictionary,
  );

  // These words will give the players points, but won't contribute to the score needed for ranks
  let wordsNotCountingTowardMaxScore = [
    "PERI",
    "PILI",
    "PILY",
    "RET",
    "ROLF",
    "SERE",
    "SORI",
    "SOT",
    "TOLE",
    "TOR",
    "TORI",
    "WILE",
    "LEA",
    "LEAS",
    "LEAL",
  ];

  console.log(allPossibleWords);
  let maxScore = 0;
  for (const word of allPossibleWords.words) {
    // Don't count obscure words toward the max, but allow the player to get points from them
    if (!wordsNotCountingTowardMaxScore.includes(word)) {
      if (word.length == 3) maxScore += 1;
      else maxScore += word.length;
    }
  }
  console.log("MAX:", maxScore);
}

function findAllPossibleWords(initialLetters, rings, sunLetter, validWords) {
  const allFoundWords = new Set();
  const wordDetails = [];
  const positionsToCheck = [0, 1, 8, 9, 10, 11];

  // Explicitly define ring order to ensure consistent cycling
  const ringNames = ["first", "second", "third", "fourth", "fifth"];
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
  const FIRST_RING_RADIUS = 60;
  const SECOND_RING_RADIUS = 110;
  const THIRD_RING_RADIUS = 160;
  const FOURTH_RING_RADIUS = 210;
  const FIFTH_RING_RADIUS = 260;
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

function createLettersArray(words) {
  let letters = [];

  // words array contains words of the form: { word: 'lorem', angle: 0-360 (increments of 30), startingRing: 1-5 }
  for (const word of words) {
    const wordLetters = word.word.split("");

    // Rings go out -> in between 8 o'clock and 1 o'clock (240deg -> 30deg)
    const outToIn = word.angle >= 240 || word.angle <= 30;

    for (let i = 0; i < wordLetters.length; i++) {
      const ringNumber = outToIn
        ? word.startingRing - i // ringNumber decreases with each letter
        : word.startingRing + i; // ringNumber increases with each letter

      // If ringNumber is 0, then it's the sun -> don't add to the array
      if (ringNumber !== 0) {
        letters.push({
          letter: wordLetters[i].toUpperCase(),
          angle: ringNumber < 0 ? (word.angle + 180) % 360 : word.angle,
          radius: RING_RADII[Math.abs(ringNumber) - 1],
          ring: RING_NAME_MAP[Math.abs(ringNumber)],
          color: RING_COLORS[Math.abs(ringNumber) - 1],
        });
      }
    }
  }

  return letters;
}

// oak, pine, birch, sycamore, palm, tree, willow -> sycamore, willow, oak, pine, palm, tree
const words = [
  { word: "oak", angle: 210, startingRing: 0 },
  { word: "sycamore", angle: 330, startingRing: 5 },
  { word: "willow", angle: 270, startingRing: 4 },
  { word: "pine", angle: 30, startingRing: 5 },
  { word: "tree", angle: 120, startingRing: 2 },
  { word: "palm", angle: 300, startingRing: 5 },
];
console.log(createLettersArray(words));
