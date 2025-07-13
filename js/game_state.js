// Constants - Ring diameters, colors, etc.
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

const LOCAL_STORAGE_KEY = "solarWordGameState";

// Game state - now with flexible letter positioning
let gameState = {
  gameId: "The Ocean and The Sea",
  letters: [
    {
      letter: "C",
      angle: 270,
      radius: 160,
      ring: "third",
      color: "#45b7d1",
    },
    {
      letter: "O",
      angle: 270,
      radius: 110,
      ring: "second",
      color: "#297a23",
    },
    {
      letter: "R",
      angle: 270,
      radius: 60,
      ring: "first",
      color: "#ff6b6b",
    },
    {
      letter: "L",
      angle: 90,
      radius: 60,
      ring: "first",
      color: "#ff6b6b",
    },
    {
      letter: "O",
      angle: 330,
      radius: 160,
      ring: "third",
      color: "#45b7d1",
    },
    {
      letter: "C",
      angle: 330,
      radius: 110,
      ring: "second",
      color: "#297a23",
    },
    {
      letter: "E",
      angle: 330,
      radius: 60,
      ring: "first",
      color: "#ff6b6b",
    },
    {
      letter: "N",
      angle: 150,
      radius: 60,
      ring: "first",
      color: "#ff6b6b",
    },
    {
      letter: "S",
      angle: 120,
      radius: 160,
      ring: "third",
      color: "#45b7d1",
    },
    {
      letter: "E",
      angle: 120,
      radius: 210,
      ring: "fourth",
      color: "#9945d1",
    },
    {
      letter: "A",
      angle: 120,
      radius: 260,
      ring: "fifth",
      color: "#9e297b",
    },
    {
      letter: "W",
      angle: 180,
      radius: 110,
      ring: "second",
      color: "#297a23",
    },
    {
      letter: "A",
      angle: 180,
      radius: 160,
      ring: "third",
      color: "#45b7d1",
    },
    {
      letter: "V",
      angle: 180,
      radius: 210,
      ring: "fourth",
      color: "#9945d1",
    },
    {
      letter: "E",
      angle: 180,
      radius: 260,
      ring: "fifth",
      color: "#9e297b",
    },
    {
      letter: "R",
      angle: 60,
      radius: 110,
      ring: "second",
      color: "#297a23",
    },
    {
      letter: "E",
      angle: 60,
      radius: 160,
      ring: "third",
      color: "#45b7d1",
    },
    {
      letter: "E",
      angle: 60,
      radius: 210,
      ring: "fourth",
      color: "#9945d1",
    },
    {
      letter: "F",
      angle: 60,
      radius: 260,
      ring: "fifth",
      color: "#9e297b",
    },
    {
      letter: "G",
      angle: 240,
      radius: 260,
      ring: "fifth",
      color: "#9e297b",
    },
    {
      letter: "U",
      angle: 240,
      radius: 210,
      ring: "fourth",
      color: "#9945d1",
    },
    {
      letter: "L",
      angle: 240,
      radius: 160,
      ring: "third",
      color: "#45b7d1",
    },
    {
      letter: "F",
      angle: 240,
      radius: 110,
      ring: "second",
      color: "#297a23",
    },
  ],
  rings: {
    first: {
      position: 0,
      targetPosition: 0,
      radius: FIRST_RING_RADIUS,
      color: FIRST_RING_COLOR,
    },
    second: {
      position: 0,
      targetPosition: 0,
      radius: SECOND_RING_RADIUS,
      color: SECOND_RING_COLOR,
    },
    third: {
      position: 0,
      targetPosition: 0,
      radius: THIRD_RING_RADIUS,
      color: THIRD_RING_COLOR,
    },
    fourth: {
      position: 0,
      targetPosition: 0,
      radius: FOURTH_RING_RADIUS,
      color: FOURTH_RING_COLOR,
    },
    fifth: {
      position: 0,
      targetPosition: 0,
      radius: FIFTH_RING_RADIUS,
      color: FIFTH_RING_COLOR,
    },
  },
  foundWords: new Set(),
  numWordsInGrandAlignment: 6,
  score: 0,
  maxScore: 127,
  dragState: null,
  selectedRing: "first",
  center: { x: 300, y: 300 },
  sun: { letter: "A", radius: 20, color: "#ffdd44" },
  systemRotation: 0,
  hoveredArrow: null,
  rank: "Beginner",
  highlightedLetters: new Set(), // Set of letter indices currently highlighted
  lastCheckResults: [], // Store results from last word check for highlighting
};

// Scoring system
const RANKS = [
  { name: "Beginner", min: 0, rankId: "rankBeginner" },
  {
    name: "Good",
    min: Math.floor(gameState.maxScore * 0.1),
    rankId: "rankGood",
  },
  {
    name: "Great",
    min: Math.floor(gameState.maxScore * 0.2),
    rankId: "rankGreat",
  },
  {
    name: "Voyager",
    min: Math.floor(gameState.maxScore * 0.3),
    rankId: "rankVoyager",
  },
  {
    name: "Stellar",
    min: Math.floor(gameState.maxScore * 0.4),
    rankId: "rankStellar",
  },
  {
    name: "Red Giant",
    min: Math.floor(gameState.maxScore * 0.5),
    rankId: "rankRedGiant",
  },
  {
    name: "White Dwarf",
    min: Math.floor(gameState.maxScore * 0.6),
    rankId: "rankWhiteDwarf",
  },
  {
    name: "Supernova",
    min: Math.floor(gameState.maxScore * 0.7),
    rankId: "rankSupernova",
  },
  {
    name: "Neutron Star",
    min: Math.floor(gameState.maxScore * 0.8),
    rankId: "rankNeutronStar",
  },
  {
    name: "Black Hole",
    min: gameState.maxScore,
    rankId: "rankBlackHole",
  },
];
