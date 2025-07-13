async function loadDictionary() {
  try {
    const response = await fetch("./valid_words.txt");
    const text = await response.text();

    const words = text
      .split("\n")
      .map((word) => word.trim().toUpperCase())
      .filter((word) => word.length >= 3 && word.length <= 11);

    // console.log(`Loaded ${words.length} words`);
    return new Set(words);
  } catch (error) {
    console.error("Failed to load dictionary:", error);
    return new Set(["SPACE", "STAR", "PLANET"]); // Fallback
  }
}
let dictionary;
loadDictionary().then((raw_dictionary) => {
  dictionary = raw_dictionary;
  // runFindAllPossibleWords(gameState, dictionary);
});

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Score dialog setup
const showRanksDialogButton = document.getElementById("score-panel");
const ranksDialog = document.getElementById("ranksDialog");

function shufflePlanets() {
  const rings = gameState.rings;
  for (let ring of Object.keys(rings)) {
    let randomRotation = 30 * Math.floor(12 * Math.random());
    rings[ring].targetPosition += randomRotation;
  }
}

function initializeRanks() {
  const goodPoints = document.getElementById("goodPoints");
  const greatPoints = document.getElementById("greatPoints");
  const voyagerPoints = document.getElementById("voyagerPoints");
  const stellarPoints = document.getElementById("stellarPoints");
  const redGiantPoints = document.getElementById("redGiantPoints");
  const whiteDwarfPoints = document.getElementById("whiteDwarfPoints");
  const supernovaPoints = document.getElementById("supernovaPoints");
  const neutronStarPoints = document.getElementById("neutronStarPoints");
  const blackHolePoints = document.getElementById("blackHolePoints");

  goodPoints.textContent = RANKS[1].min + " points";
  greatPoints.textContent = RANKS[2].min + " points";
  voyagerPoints.textContent = RANKS[3].min + " points";
  stellarPoints.textContent = RANKS[4].min + " points";
  redGiantPoints.textContent = RANKS[5].min + " points";
  whiteDwarfPoints.textContent = RANKS[6].min + " points";
  supernovaPoints.textContent = RANKS[7].min + " points";
  neutronStarPoints.textContent = RANKS[8].min + " points";
  blackHolePoints.textContent = RANKS[9].min + "+ points";
}
