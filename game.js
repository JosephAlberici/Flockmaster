const STORAGE_KEY = "flockmasterSave";
const BASE_TICK_MS = 1000;
// Base rarity odds before upgrades or habitat filtering adjust them.
const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const RARITY_WEIGHTS = {
  Common: 60,
  Uncommon: 25,
  Rare: 10,
  Epic: 4,
  Legendary: 1
};

// Shared save-schema defaults
// Add new saved primitive values here first so loading, importing, and new saves stay aligned.
const GAME_STATE_DEFAULTS = {
  seeds: 100,
  seedMax: 500,
  grubs: 0,
  grubMax: 10000,
  grubsPerClick: 1,
  grubFarmActive: false,
  grubFarmUnlocked: false,
  hardwood: 0,
  mice: 0,
  loggerheadShowingBird: false,
  loggerheadQuestIndex: 0,
  loggerheadMouseLoaded: false,
  loggerheadMouseResult: "",
  loggerheadMousePendingBirdId: null,
  loggerheadMouseIntroSeen: false,
  sawmillProcessingDurationMs: 5 * 60 * 1000,
  sawmillProcessingStart: null,
  sawmillProcessingPendingHardwood: 0,
  sawmillProcessingActive: false,
  sawmillProcessingReady: false,
  sawmillConstructed: false,
  sawmillOverseerId: null,
  sawmillTwigThreshold: 0,
  overseerAssignments: {
    sawmill: null
  },
  coins: 50,
  coinMax: 10000,
  twigs: 0,
  trapPurchased: false,
  trapLoaded: false,
  trapPulled: false,
  trapBaitType: null,
  trapLoadCost: 20,
  trapGrubLoadCost: 25,
  catchRate: 0.5,
  lastTrapResult: "",
  items: {},
  ownedHabitats: ["City Living"],
  redeemedCodes: [],
  parasiteTargets: {},
  parasiteUpgradeTiers: {},
  predatorUpgradeTiers: {},
  newPlotPurchased: false,
  seedDispersalPurchased: false,
  basicBeddingPurchased: false,
  advancedBeddingPurchased: false,
  cafePurchased: false,
  indoorGardenPurchased: false,
  murderPartyPurchased: false,
  flockForestryPurchased: false,
  turtleWakePurchased: false,
  pheromonesPurchased: false,
  basketPurchased: false,
  depositBoxPurchased: false,
  avianRepopulationPurchased: false,
  wildlifeRestorationPurchased: false,
  newSubstratePurchased: false,
  appleTrees: 0,
  pearTrees: 0,
  peachTrees: 0
};

// Validate number-like save fields before keeping them.
function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

// Validate boolean save toggles.
function isBoolean(value) {
  return typeof value === "boolean";
}

// Validate plain text save fields.
function isString(value) {
  return typeof value === "string";
}

// Allow string fields that may intentionally be unset.
function isNullableString(value) {
  return isString(value) || value === null;
}

// Allow number fields that may intentionally be unset.
function isNullableNumber(value) {
  return isFiniteNumber(value) || value === null;
}

// Detect nested save objects while excluding arrays.
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const GAME_STATE_VALIDATORS = {
  seeds: isFiniteNumber,
  seedMax: isFiniteNumber,
  grubs: isFiniteNumber,
  grubMax: isFiniteNumber,
  grubsPerClick: isFiniteNumber,
  grubFarmActive: isBoolean,
  grubFarmUnlocked: isBoolean,
  hardwood: isFiniteNumber,
  mice: isFiniteNumber,
  loggerheadShowingBird: isBoolean,
  loggerheadQuestIndex: isFiniteNumber,
  loggerheadMouseLoaded: isBoolean,
  loggerheadMouseResult: isString,
  loggerheadMousePendingBirdId: isNullableString,
  loggerheadMouseIntroSeen: isBoolean,
  sawmillProcessingDurationMs: isFiniteNumber,
  sawmillProcessingStart: isNullableNumber,
  sawmillProcessingPendingHardwood: isFiniteNumber,
  sawmillProcessingActive: isBoolean,
  sawmillProcessingReady: isBoolean,
  sawmillConstructed: isBoolean,
  sawmillOverseerId: isNullableString,
  sawmillTwigThreshold: isFiniteNumber,
  overseerAssignments: isPlainObject,
  coins: isFiniteNumber,
  coinMax: isFiniteNumber,
  twigs: isFiniteNumber,
  trapPurchased: isBoolean,
  trapLoaded: isBoolean,
  trapPulled: isBoolean,
  trapBaitType: isNullableString,
  trapLoadCost: isFiniteNumber,
  trapGrubLoadCost: isFiniteNumber,
  catchRate: isFiniteNumber,
  lastTrapResult: isString,
  items: isPlainObject,
  ownedHabitats: Array.isArray,
  redeemedCodes: Array.isArray,
  parasiteTargets: isPlainObject,
  parasiteUpgradeTiers: isPlainObject,
  predatorUpgradeTiers: isPlainObject,
  newPlotPurchased: isBoolean,
  seedDispersalPurchased: isBoolean,
  basicBeddingPurchased: isBoolean,
  advancedBeddingPurchased: isBoolean,
  cafePurchased: isBoolean,
  indoorGardenPurchased: isBoolean,
  murderPartyPurchased: isBoolean,
  flockForestryPurchased: isBoolean,
  turtleWakePurchased: isBoolean,
  pheromonesPurchased: isBoolean,
  basketPurchased: isBoolean,
  depositBoxPurchased: isBoolean,
  avianRepopulationPurchased: isBoolean,
  wildlifeRestorationPurchased: isBoolean,
  newSubstratePurchased: isBoolean,
  appleTrees: isFiniteNumber,
  pearTrees: isFiniteNumber,
  peachTrees: isFiniteNumber
};

// Shared save-schema helpers
// Clone defaults so arrays and objects do not share references across saves.
function cloneDefaultValue(value) {
  if (Array.isArray(value)) {
    return value.slice();
  }

  if (isPlainObject(value)) {
    return { ...value };
  }

  return value;
}

// Build the default bird-progress array used by new and repaired saves.
function createDefaultBirdProgress() {
  return cloneBirdLibrary().map(function (bird) {
    return {
      ...bird,
      count: bird.acquired ? 1 : 0,
      variantCounts: createBirdVariantCounts(bird, bird.acquired ? 1 : 0)
    };
  });
}

// Copy the shared save defaults into a fresh object.
function cloneGameStateDefaults() {
  const clonedDefaults = {};

  Object.keys(GAME_STATE_DEFAULTS).forEach(function (key) {
    clonedDefaults[key] = cloneDefaultValue(GAME_STATE_DEFAULTS[key]);
  });

  return clonedDefaults;
}

// Build the default item-count object used by new and repaired saves.
function createDefaultItemCounts() {
  return ITEM_LIBRARY.reduce(function (itemCounts, item) {
    itemCounts[item.id] = item.startingCount || 0;
    return itemCounts;
  }, {});
}

// Merge saved item counts onto the current item library.
function mergeItemCounts(savedItems) {
  const mergedItemCounts = createDefaultItemCounts();

  ITEM_LIBRARY.forEach(function (item) {
    if (savedItems && isFiniteNumber(savedItems[item.id])) {
      mergedItemCounts[item.id] = Math.max(0, savedItems[item.id]);
    }
  });

  return mergedItemCounts;
}

// Fill one save field with its default when validation fails.
function applyValidatedDefault(gameState, key) {
  if (!GAME_STATE_VALIDATORS[key](gameState[key])) {
    gameState[key] = cloneDefaultValue(GAME_STATE_DEFAULTS[key]);
  }
}

// Bird catalog and save-merging helpers
// Return a fresh copy of the bird catalog so save data can mutate safely.
function cloneBirdLibrary() {
  return BIRD_LIBRARY.map(function (bird) {
    return { ...bird };
  });
}

// Build a clean variant-count object for birds with multiple visual forms.
function createBirdVariantCounts(bird, totalCount) {
  if (!bird.variantImages) {
    return undefined;
  }

  const variantKeys = Object.keys(bird.variantImages);
  const variantCounts = {};

  variantKeys.forEach(function (variantKey) {
    variantCounts[variantKey] = 0;
  });

  if (totalCount > 0 && variantKeys.length > 0) {
    variantCounts[variantKeys[0]] = totalCount;
  }

  return variantCounts;
}

// Merge saved visual-variant counts onto the current bird definition.
function mergeBirdVariantCounts(bird, savedBird, totalCount) {
  if (!bird.variantImages) {
    return undefined;
  }

  const fallbackVariantCounts = createBirdVariantCounts(bird, totalCount);

  if (!savedBird || typeof savedBird.variantCounts !== "object" || savedBird.variantCounts === null) {
    return fallbackVariantCounts;
  }

  const mergedVariantCounts = {};
  let assignedCount = 0;

  Object.keys(bird.variantImages).forEach(function (variantKey) {
    const savedCount = typeof savedBird.variantCounts[variantKey] === "number"
      ? savedBird.variantCounts[variantKey]
      : 0;
    mergedVariantCounts[variantKey] = savedCount;
    assignedCount += savedCount;
  });

  if (assignedCount < totalCount) {
    const firstVariantKey = Object.keys(bird.variantImages)[0];
    mergedVariantCounts[firstVariantKey] += (totalCount - assignedCount);
  }

  return mergedVariantCounts;
}

// Merge saved bird progress onto the current bird catalog by stable id.
function mergeBirdProgress(savedBirds) {
  const savedBirdMap = new Map(
    (savedBirds || []).map(function (bird) {
      return [bird.id || bird.species, bird];
    })
  );

  return cloneBirdLibrary().map(function (bird) {
    const savedBird = savedBirdMap.get(bird.id) || savedBirdMap.get(bird.species);

    if (!savedBird) {
      return {
        ...bird,
        count: bird.acquired ? 1 : 0,
        variantCounts: createBirdVariantCounts(bird, bird.acquired ? 1 : 0)
      };
    }

    const mergedCount = typeof savedBird.count === "number"
      ? savedBird.count
      : ((typeof savedBird.acquired === "boolean" ? savedBird.acquired : bird.acquired) ? 1 : 0);

    return {
      ...bird,
      acquired: typeof savedBird.acquired === "boolean" ? savedBird.acquired : bird.acquired,
      count: mergedCount,
      variantCounts: mergeBirdVariantCounts(bird, savedBird, mergedCount)
    };
  });
}

// Define the default save state for a brand new player.
function createDefaultGameState() {
  return {
    ...cloneGameStateDefaults(),
    lastCoinUpdate: Date.now(),
    items: createDefaultItemCounts(),
    birds: createDefaultBirdProgress()
  };
}

// Persist the current game state to browser storage.
function saveGameState(gameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

// Wipe the saved game from browser storage.
function eraseGameProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

// Replace the current save with imported text from an exported file.
function importGameProgress(saveText) {
  const parsedGameState = normalizeGameState(JSON.parse(saveText));
  saveGameState(parsedGameState);
}

// Normalize imported or legacy save data against the current schema.
function normalizeGameState(parsedGameState) {
  Object.keys(GAME_STATE_DEFAULTS).forEach(function (key) {
    applyValidatedDefault(parsedGameState, key);
  });

  if (!isFiniteNumber(parsedGameState.lastCoinUpdate)) {
    parsedGameState.lastCoinUpdate = Date.now();
  }

  if (!isNullableString(parsedGameState.overseerAssignments.sawmill)) {
    parsedGameState.overseerAssignments.sawmill = parsedGameState.sawmillOverseerId || null;
  }

  if (
    !parsedGameState.sawmillConstructed &&
    (
      parsedGameState.sawmillProcessingActive ||
      parsedGameState.sawmillProcessingReady ||
      parsedGameState.sawmillProcessingPendingHardwood > 0 ||
      parsedGameState.sawmillTwigThreshold > 0 ||
      parsedGameState.overseerAssignments.sawmill !== null
    )
  ) {
    parsedGameState.sawmillConstructed = true;
  }

  if (!parsedGameState.grubFarmUnlocked && parsedGameState.grubFarmActive) {
    parsedGameState.grubFarmUnlocked = true;
  }

  parsedGameState.items = mergeItemCounts(parsedGameState.items);
  parsedGameState.birds = mergeBirdProgress(parsedGameState.birds);
  clampGameStateResources(parsedGameState);

  return parsedGameState;
}

// Load and repair the saved game so older saves stay compatible.
function loadGameState() {
  const savedGameState = localStorage.getItem(STORAGE_KEY);

  if (!savedGameState) {
    const defaultGameState = createDefaultGameState();
    saveGameState(defaultGameState);
    return defaultGameState;
  }

  try {
    return normalizeGameState(JSON.parse(savedGameState));
  } catch (error) {
    const defaultGameState = createDefaultGameState();
    saveGameState(defaultGameState);
    return defaultGameState;
  }
}

// Per-bird stat helpers
// Apply per-species visitor modifiers from aviary upgrades.
function getBirdVisitorRatePerDay(bird, gameState, visitedBirdIds) {
  const visitedIds = Array.isArray(visitedBirdIds) ? visitedBirdIds : [];
  const parasiteTargetBird = getParasiteTargetBird(bird, gameState);

  if (parasiteTargetBird) {
    if (visitedIds.includes(bird.id)) {
      return bird.visitorsPerDay || 0;
    }

    return getBirdVisitorRatePerDay(parasiteTargetBird, gameState, visitedIds.concat(bird.id));
  }

  let visitorRate = bird.visitorsPerDay || 0;

  if (isMurderPartyActive(gameState) && bird.id === "crow") {
    visitorRate *= 2;
  }

  if (Array.isArray(bird.abilities)) {
    bird.abilities.forEach(function (abilityId) {
      const ability = ABILITIES[abilityId];

      if (!ability || typeof ability.modifyVisitorsPerDay !== "function") {
        return;
      }

      visitorRate = ability.modifyVisitorsPerDay(visitorRate, {
        bird: bird,
        gameState: gameState,
        totalIndividuals: bird.count
      });
    });
  }

  return visitorRate;
}

// Return only birds the player currently owns.
function getAcquiredBirds(gameState) {
  return gameState.birds.filter(function (bird) {
    return (typeof bird.count === "number" ? bird.count > 0 : bird.acquired === true);
  });
}

// Sum total visitors/day across all owned individual birds.
function getVisitorsPerDay(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + getBirdVisitorRatePerDay(bird, gameState) * bird.count;
  }, 0);
}

// Count unique acquired species for overview and top-bar display.
function getFlockDiversity(gameState) {
  return new Set(
    getAcquiredBirds(gameState).map(function (bird) {
      return bird.species;
    })
  ).size;
}

// Earthworks unlocks once the flock reaches four unique species.
function isEarthworksUnlocked(gameState) {
  return getFlockDiversity(gameState) >= 4;
}

// Build the current catch pool from birds tied to owned habitats.
function getCatchableBirds(gameState) {
  return gameState.birds.filter(function (bird) {
    return gameState.ownedHabitats.includes(bird.nativeHabitat);
  });
}

// Check whether a bird currently has one named ability.
function birdHasAbility(bird, abilityId) {
  return Array.isArray(bird.abilities) && bird.abilities.includes(abilityId);
}

// Track how far a parasite bird has expanded its allowed target rarities.
function getParasiteTargetTier(gameState, birdId) {
  if (!gameState.parasiteUpgradeTiers || typeof gameState.parasiteUpgradeTiers !== "object") {
    return 0;
  }

  const savedTier = gameState.parasiteUpgradeTiers[birdId];
  return isFiniteNumber(savedTier) ? Math.max(0, Math.floor(savedTier)) : 0;
}

// Convert a parasite tier into the highest rarity index it can currently copy.
function getParasiteMaxRarityIndex(gameState, birdId) {
  return Math.min(getParasiteTargetTier(gameState, birdId), 3);
}

// Track how far a predator bird has expanded its maximum seed-bait bonus cap.
function getPredatorUpgradeTier(gameState, birdId) {
  if (!gameState.predatorUpgradeTiers || typeof gameState.predatorUpgradeTiers !== "object") {
    return 0;
  }

  const savedTier = gameState.predatorUpgradeTiers[birdId];
  return isFiniteNumber(savedTier) ? Math.max(0, Math.floor(savedTier)) : 0;
}

// Return the current seed-bait catch-rate cap for one predator species.
function getPredatorMaxBonus(gameState, birdId) {
  const predatorAbility = ABILITIES.predator || {};
  const baseMaxBonus = typeof predatorAbility.baseMaxBonus === "number"
    ? predatorAbility.baseMaxBonus
    : 0.1;
  const upgradeBonusStep = typeof predatorAbility.upgradeBonusStep === "number"
    ? predatorAbility.upgradeBonusStep
    : 0.05;

  return baseMaxBonus + (getPredatorUpgradeTier(gameState, birdId) * upgradeBonusStep);
}

// Sum the seed-bait catch-rate bonus granted by all owned predator species.
function getPredatorCatchRateBonus(gameState, baitType) {
  if (baitType !== "seeds") {
    return 0;
  }

  return getAcquiredBirdsWithAbility(gameState, "predator").reduce(function (totalBonus, bird) {
    const speciesBonus = Math.min(bird.count * 0.02, getPredatorMaxBonus(gameState, bird.id));
    return totalBonus + speciesBonus;
  }, 0);
}

// Return the currently eligible target species a parasite bird can copy from.
function getParasiteEligibleTargetBirds(parasiticBird, gameState) {
  if (!birdHasAbility(parasiticBird, "parasite")) {
    return [];
  }

  const maxRarityIndex = getParasiteMaxRarityIndex(gameState, parasiticBird.id);

  return getAcquiredBirds(gameState).filter(function (candidateBird) {
    const candidateRarityIndex = RARITY_ORDER.indexOf(candidateBird.rarity);

    if (
      candidateBird.id === parasiticBird.id ||
      candidateBird.nativeHabitat !== parasiticBird.nativeHabitat ||
      birdHasAbility(candidateBird, "parasite") ||
      candidateRarityIndex === -1
    ) {
      return false;
    }

    return candidateRarityIndex <= maxRarityIndex;
  }).sort(compareBirdsByRarityThenSpecies);
}

// Read the saved parasite target id for one parasitic species.
function getParasiteTargetId(gameState, birdId) {
  if (!gameState.parasiteTargets || typeof gameState.parasiteTargets !== "object") {
    return null;
  }

  return gameState.parasiteTargets[birdId] || null;
}

// Save or clear the parasite target for one parasitic species.
function setParasiteTargetId(gameState, birdId, targetBirdId) {
  if (!gameState.parasiteTargets || typeof gameState.parasiteTargets !== "object") {
    gameState.parasiteTargets = {};
  }

  if (targetBirdId === null) {
    delete gameState.parasiteTargets[birdId];
    return;
  }

  gameState.parasiteTargets[birdId] = targetBirdId;
}

// Return the active parasite target only if it is still valid and eligible.
function getParasiteTargetBird(parasiticBird, gameState) {
  const targetBirdId = getParasiteTargetId(gameState, parasiticBird.id);

  if (!targetBirdId) {
    return null;
  }

  return getParasiteEligibleTargetBirds(parasiticBird, gameState).find(function (candidateBird) {
    return candidateBird.id === targetBirdId;
  }) || null;
}

// Support both single-diet birds and future birds that can eat multiple bait types.
function birdMatchesBaitType(bird, baitType) {
  if (Array.isArray(bird.diet)) {
    return bird.diet.includes(baitType);
  }

  return bird.diet === baitType;
}

// Filter the habitat catch pool by the bait diet that was loaded into the trap.
function getCatchableBirdsByDiet(gameState, baitType) {
  return getCatchableBirds(gameState).filter(function (bird) {
    return birdMatchesBaitType(bird, baitType);
  });
}

// Build the full special-catch pool for mice-fed birds of prey.
function getBirdsByDiet(gameState, dietType) {
  return gameState.birds.filter(function (bird) {
    return birdMatchesBaitType(bird, dietType);
  });
}

// Split the mouse pool into first-time catches and already-owned repeats.
function getMouseCatchPools(gameState) {
  const mouseBirds = getBirdsByDiet(gameState, "mice");

  return {
    newSpeciesBirds: mouseBirds.filter(function (bird) {
      return bird.count <= 0;
    }),
    repeatBirds: mouseBirds.filter(function (bird) {
      return bird.count > 0;
    })
  };
}

// Resolve the special 100% mouse-catch roll between new-species and repeat pools.
function getRandomMouseCatchBird(gameState) {
  const mouseCatchPools = getMouseCatchPools(gameState);
  let selectedPool = [];

  if (mouseCatchPools.newSpeciesBirds.length === 0 && mouseCatchPools.repeatBirds.length === 0) {
    return null;
  }

  if (mouseCatchPools.newSpeciesBirds.length === 0) {
    selectedPool = mouseCatchPools.repeatBirds;
  } else if (mouseCatchPools.repeatBirds.length === 0) {
    selectedPool = mouseCatchPools.newSpeciesBirds;
  } else {
    selectedPool = Math.random() < 0.5
      ? mouseCatchPools.newSpeciesBirds
      : mouseCatchPools.repeatBirds;
  }

  return getRandomBirdByRarityForGameState(selectedPool, gameState);
}

// Format one readable diet label for UI whether the bird has one diet or many.
function formatBirdDietLabel(bird) {
  if (Array.isArray(bird.diet)) {
    return bird.diet.join(", ");
  }

  return bird.diet || "";
}

// Count owned individuals in a specific rarity bucket.
function getCaughtBirdCountByRarity(gameState, rarityName) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    if (bird.rarity !== rarityName) {
      return total;
    }

    return total + bird.count;
  }, 0);
}

// Report how full a habitat collection is for the header labels.
function getHabitatBirdTotals(gameState, habitatName) {
  const totalSpecies = gameState.birds.filter(function (bird) {
    return bird.nativeHabitat === habitatName;
  }).length;

  const acquiredSpecies = gameState.birds.filter(function (bird) {
    return bird.nativeHabitat === habitatName && bird.acquired;
  }).length;

  return {
    acquiredSpecies: acquiredSpecies,
    totalSpecies: totalSpecies
  };
}

// Return every habitat represented in the current bird library and owned save data.
function getAllHabitatNames(gameState) {
  const habitatNames = [];

  gameState.birds.forEach(function (bird) {
    if (typeof bird.nativeHabitat === "string" && !habitatNames.includes(bird.nativeHabitat)) {
      habitatNames.push(bird.nativeHabitat);
    }
  });

  gameState.ownedHabitats.forEach(function (habitatName) {
    if (typeof habitatName === "string" && !habitatNames.includes(habitatName)) {
      habitatNames.push(habitatName);
    }
  });

  return habitatNames;
}

// Count total individual birds, including duplicates of one species.
function getTotalBirdCount(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + bird.count;
  }, 0);
}

// Count how many habitats have been fully completed.
function getCompletedHabitatCount(gameState) {
  return gameState.ownedHabitats.reduce(function (total, habitatName) {
    const habitatTotals = getHabitatBirdTotals(gameState, habitatName);

    if (habitatTotals.totalSpecies > 0 && habitatTotals.acquiredSpecies === habitatTotals.totalSpecies) {
      return total + 1;
    }

    return total;
  }, 0);
}

// Calculate social leaderboard points from the current save.
function getPoints(gameState) {
  const speciesPoints = Math.max(0, getFlockDiversity(gameState) - 1) * 50;
  const commonPoints = Math.max(0, getCaughtBirdCountByRarity(gameState, "Common") - 1) * 1;
  const uncommonPoints = getCaughtBirdCountByRarity(gameState, "Uncommon") * 3;
  const rarePoints = getCaughtBirdCountByRarity(gameState, "Rare") * 5;
  const epicPoints = getCaughtBirdCountByRarity(gameState, "Epic") * 10;
  const legendaryPoints = getCaughtBirdCountByRarity(gameState, "Legendary") * 25;
  const habitatCompletionPoints = getCompletedHabitatCount(gameState) * 100;
  const constructedHabitatPoints = Math.max(0, gameState.ownedHabitats.length - 1) * 50;

  return (
    speciesPoints +
    commonPoints +
    uncommonPoints +
    rarePoints +
    epicPoints +
    legendaryPoints +
    habitatCompletionPoints +
    constructedHabitatPoints
  );
}

// Apply per-species twig modifiers from aviary upgrades.
function getBirdTwigRatePerSecond(bird, gameState, visitedBirdIds) {
  const visitedIds = Array.isArray(visitedBirdIds) ? visitedBirdIds : [];
  const parasiteTargetBird = getParasiteTargetBird(bird, gameState);

  if (parasiteTargetBird) {
    if (visitedIds.includes(bird.id)) {
      return bird.twigsPerSecond || 0;
    }

    return getBirdTwigRatePerSecond(parasiteTargetBird, gameState, visitedIds.concat(bird.id));
  }

  let twigRate = bird.twigsPerSecond || 0;

  if (gameState.indoorGardenPurchased && bird.id === "kestrel") {
    twigRate *= 2;
  }

  if (isTurtleWakeActive(gameState) && bird.id === "mourningdove") {
    twigRate += 0.04;
  }

  if (gameState.flockForestryPurchased) {
    twigRate *= 2;
  }

  return twigRate;
}

// Return a bird's passive seed income, defaulting to zero when absent.
function getBirdSeedRatePerSecond(bird, gameState, visitedBirdIds) {
  const visitedIds = Array.isArray(visitedBirdIds) ? visitedBirdIds : [];
  const parasiteTargetBird = getParasiteTargetBird(bird, gameState);

  if (parasiteTargetBird) {
    if (visitedIds.includes(bird.id)) {
      return bird.seedsPerSecond || 0;
    }

    return getBirdSeedRatePerSecond(parasiteTargetBird, gameState, visitedIds.concat(bird.id));
  }

  let seedRate = bird.seedsPerSecond || 0;

  if (gameState && gameState.flockForestryPurchased) {
    seedRate *= 2;
  }

  return seedRate;
}

// Return a bird's passive grub income, defaulting to zero when absent.
function getBirdGrubRatePerSecond(bird, gameState, visitedBirdIds) {
  const visitedIds = Array.isArray(visitedBirdIds) ? visitedBirdIds : [];
  const parasiteTargetBird = getParasiteTargetBird(bird, gameState);

  if (parasiteTargetBird) {
    if (visitedIds.includes(bird.id)) {
      return bird.grubsPerSecond || 0;
    }

    return getBirdGrubRatePerSecond(parasiteTargetBird, gameState, visitedIds.concat(bird.id));
  }

  return bird.grubsPerSecond || 0;
}

// Return a bird's apple-tree cap bonus, defaulting to zero when absent.
function getBirdBonusAppleTree(bird, gameState, visitedBirdIds) {
  const visitedIds = Array.isArray(visitedBirdIds) ? visitedBirdIds : [];
  const parasiteTargetBird = getParasiteTargetBird(bird, gameState);

  if (parasiteTargetBird) {
    if (visitedIds.includes(bird.id)) {
      return bird.bonusAppleTree || 0;
    }

    return getBirdBonusAppleTree(parasiteTargetBird, gameState, visitedIds.concat(bird.id));
  }

  return bird.bonusAppleTree || 0;
}

// Return a bird's pear-tree cap bonus, defaulting to zero when absent.
function getBirdBonusPearTree(bird, gameState, visitedBirdIds) {
  const visitedIds = Array.isArray(visitedBirdIds) ? visitedBirdIds : [];
  const parasiteTargetBird = getParasiteTargetBird(bird, gameState);

  if (parasiteTargetBird) {
    if (visitedIds.includes(bird.id)) {
      return bird.bonusPearTree || 0;
    }

    return getBirdBonusPearTree(parasiteTargetBird, gameState, visitedIds.concat(bird.id));
  }

  return bird.bonusPearTree || 0;
}

// Return a bird's peach-tree cap bonus, defaulting to zero when absent.
function getBirdBonusPeachTree(bird, gameState, visitedBirdIds) {
  const visitedIds = Array.isArray(visitedBirdIds) ? visitedBirdIds : [];
  const parasiteTargetBird = getParasiteTargetBird(bird, gameState);

  if (parasiteTargetBird) {
    if (visitedIds.includes(bird.id)) {
      return bird.bonusPeachTree || 0;
    }

    return getBirdBonusPeachTree(parasiteTargetBird, gameState, visitedIds.concat(bird.id));
  }

  return bird.bonusPeachTree || 0;
}

const BIRD_RESOURCE_DEFINITIONS = [
  {
    key: "visitorsPerDay",
    label: "Visitors Per Day",
    getValue: function (bird, gameState) {
      return getBirdVisitorRatePerDay(bird, gameState);
    }
  },
  {
    key: "grubsPerSecond",
    label: "Grubs Per Second",
    getValue: function (bird, gameState) {
      return getBirdGrubRatePerSecond(bird, gameState);
    }
  },
  {
    key: "twigsPerSecond",
    label: "Twigs Per Second",
    getValue: function (bird, gameState) {
      return getBirdTwigRatePerSecond(bird, gameState);
    }
  },
  {
    key: "seedsPerSecond",
    label: "Seeds Per Second",
    getValue: function (bird, gameState) {
      return getBirdSeedRatePerSecond(bird, gameState);
    }
  },
  {
    key: "bonusAppleTree",
    label: "Bonus Apple Trees",
    getValue: function (bird, gameState) {
      return getBirdBonusAppleTree(bird, gameState);
    }
  },
  {
    key: "bonusPearTree",
    label: "Bonus Pear Trees",
    getValue: function (bird, gameState) {
      return getBirdBonusPearTree(bird, gameState);
    }
  },
  {
    key: "bonusPeachTree",
    label: "Bonus Peach Trees",
    getValue: function (bird, gameState) {
      return getBirdBonusPeachTree(bird, gameState);
    }
  }
];

// Return the fixed resource trade used by the grub farm when active.
function getGrubFarmRates(gameState) {
  if (!gameState.grubFarmActive) {
    return {
      seedsPerSecond: 0,
      twigsPerSecond: 0,
      grubsPerSecond: 0
    };
  }

  return {
    seedsPerSecond: 10,
    twigsPerSecond: 1,
    grubsPerSecond: 0.5
  };
}

// Turn a millisecond duration into a compact human-readable label.
function formatDurationLabel(durationMs) {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return hours + "h " + minutes + "m";
    }

    return hours + "h";
  }

  if (minutes > 0) {
    if (seconds > 0) {
      return minutes + "m " + seconds + "s";
    }

    return minutes + "m";
  }

  return seconds + "s";
}

// Return the remaining time on the active sawmill batch.
function getSawmillRemainingMs(gameState, currentTime) {
  if (!gameState.sawmillProcessingActive || gameState.sawmillProcessingReady || gameState.sawmillProcessingStart === null) {
    return 0;
  }

  const elapsedMs = currentTime - gameState.sawmillProcessingStart;
  return Math.max(0, gameState.sawmillProcessingDurationMs - elapsedMs);
}

// Advance sawmill processing based on real time.
function updateSawmillProcessingState(gameState, currentTime) {
  if (!gameState.sawmillProcessingActive || gameState.sawmillProcessingReady || gameState.sawmillProcessingStart === null) {
    return false;
  }

  if (getSawmillRemainingMs(gameState, currentTime) > 0) {
    return false;
  }

  gameState.sawmillProcessingReady = true;
  saveGameState(gameState);
  return true;
}

// Ability, tooltip, and UI-display helpers
// Count how many owned birds currently carry a given ability.
function getBirdAbilityCount(gameState, abilityId) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    if (!Array.isArray(bird.abilities) || !bird.abilities.includes(abilityId)) {
      return total;
    }

    return total + bird.count;
  }, 0);
}

// Return one bird progress entry by stable id.
function getBirdById(gameState, birdId) {
  return gameState.birds.find(function (bird) {
    return bird.id === birdId;
  }) || null;
}

// Return the current owned count for one species id.
function getBirdCountById(gameState, birdId) {
  const bird = getBirdById(gameState, birdId);
  return bird ? bird.count : 0;
}

// Return the current owned count for one inventory item id.
function getItemCount(gameState, itemId) {
  if (!gameState.items || typeof gameState.items !== "object") {
    return 0;
  }

  return isFiniteNumber(gameState.items[itemId]) ? gameState.items[itemId] : 0;
}

// Add item count to the inventory by stable id.
function addItemCount(gameState, itemId, amountToAdd) {
  if (!gameState.items || typeof gameState.items !== "object") {
    gameState.items = createDefaultItemCounts();
  }

  gameState.items[itemId] = getItemCount(gameState, itemId) + amountToAdd;
}

// Spend inventory items if the player has enough of them.
function spendItemCount(gameState, itemId, amountToSpend) {
  if (getItemCount(gameState, itemId) < amountToSpend) {
    return false;
  }

  gameState.items[itemId] -= amountToSpend;
  return true;
}

// Return the current item catalog merged with live owned counts.
function getInventoryItems(gameState) {
  return ITEM_LIBRARY.map(function (item) {
    return {
      ...item,
      count: getItemCount(gameState, item.id)
    };
  });
}

// Award the standard item bundle for constructing a new habitat.
function grantHabitatConstructionRewards(gameState, habitatName) {
  if (typeof habitatName !== "string") {
    return;
  }

  addItemCount(gameState, "seedbaitticket", 10);
}

// Population bonuses only stay active while their flock requirement is still met.
function isMurderPartyActive(gameState) {
  return gameState.murderPartyPurchased && getBirdCountById(gameState, "crow") >= 3;
}

// Population bonuses only stay active while their flock requirement is still met.
function isTurtleWakeActive(gameState) {
  return gameState.turtleWakePurchased && getBirdCountById(gameState, "mourningdove") >= 5;
}

// Return owned species that carry a specific ability.
function getAcquiredBirdsWithAbility(gameState, abilityId) {
  return getAcquiredBirds(gameState).filter(function (bird) {
    return Array.isArray(bird.abilities) && bird.abilities.includes(abilityId);
  });
}

// Return the species id assigned to oversee a given process.
function getAssignedOverseerId(gameState, processKey) {
  if (!gameState.overseerAssignments || typeof gameState.overseerAssignments !== "object") {
    return null;
  }

  return gameState.overseerAssignments[processKey] || null;
}

// Assign one overseer species to a given automated process.
function setAssignedOverseerId(gameState, processKey, birdId) {
  if (!gameState.overseerAssignments || typeof gameState.overseerAssignments !== "object") {
    gameState.overseerAssignments = {};
  }

  gameState.overseerAssignments[processKey] = birdId;
}

// Collect species ids already assigned to other automated processes.
function getAssignedOverseerIdsExcept(gameState, processKey) {
  if (!gameState.overseerAssignments || typeof gameState.overseerAssignments !== "object") {
    return [];
  }

  return Object.keys(gameState.overseerAssignments).reduce(function (assignedIds, currentProcessKey) {
    if (currentProcessKey !== processKey && gameState.overseerAssignments[currentProcessKey]) {
      assignedIds.push(gameState.overseerAssignments[currentProcessKey]);
    }

    return assignedIds;
  }, []);
}

// Cap how much passive time can be converted into resources after returning.
function getMaxOfflineDurationMs(gameState) {
  const baseDurationMs = 4 * 60 * 60 * 1000;
  const bonusDurationMs = getBirdAbilityCount(gameState, "nocturnal") * 10 * 60 * 1000;
  const cappedDurationMs = Math.min(baseDurationMs + bonusDurationMs, 24 * 60 * 60 * 1000);
  return cappedDurationMs;
}

// Format the offline cap as a readable hour value for UI display.
function getMaxOfflineDurationLabel(gameState) {
  return (getMaxOfflineDurationMs(gameState) / (60 * 60 * 1000)).toFixed(1).replace(".0", "");
}

// Return the effective trap success chance after bedding and bait-specific abilities.
function getEffectiveCatchRate(gameState, baitType) {
  let catchRate = gameState.catchRate;

  if (gameState.advancedBeddingPurchased) {
    catchRate += 0.05;
  }

  catchRate += getPredatorCatchRateBonus(gameState, baitType || gameState.trapBaitType);

  return Math.min(1, Math.max(0, catchRate));
}

// Apply all matching ability handlers for a trap seed bait cost calculation.
function getEffectiveTrapSeedCost(gameState) {
  let effectiveCost = gameState.trapLoadCost;

  Object.keys(ABILITIES).forEach(function (abilityId) {
    const ability = ABILITIES[abilityId];
    const totalIndividuals = getBirdAbilityCount(gameState, abilityId);

    if (
      totalIndividuals <= 0 ||
      typeof ability.modifyTrapSeedCost !== "function"
    ) {
      return;
    }

    effectiveCost = ability.modifyTrapSeedCost(effectiveCost, {
      gameState: gameState,
      totalIndividuals: totalIndividuals
    });
  });

  return Math.max(1, effectiveCost);
}

// Turn a bird's ability ids into readable ability names for UI display.
function getBirdAbilityNames(bird) {
  if (!Array.isArray(bird.abilities) || bird.abilities.length === 0) {
    return [];
  }

  return bird.abilities.map(function (abilityId) {
    if (ABILITIES[abilityId] && ABILITIES[abilityId].name) {
      return ABILITIES[abilityId].name;
    }

    return abilityId;
  });
}

// Turn a bird's ability ids into readable descriptions for tooltip display.
function getBirdAbilityDescriptions(bird) {
  if (!Array.isArray(bird.abilities) || bird.abilities.length === 0) {
    return [];
  }

  return bird.abilities.map(function (abilityId) {
    if (ABILITIES[abilityId] && ABILITIES[abilityId].description) {
      return ABILITIES[abilityId].description;
    }

    return abilityId;
  });
}

// Map a rarity name to the shared CSS class used by UI pages.
function getRarityClassName(rarityName) {
  if (typeof rarityName !== "string") {
    return "";
  }

  return "rarity-" + rarityName.toLowerCase();
}

// Sort habitat birds by rarity tier first, then species name alphabetically.
function compareBirdsByRarityThenSpecies(leftBird, rightBird) {
  const leftRarityIndex = RARITY_ORDER.indexOf(leftBird.rarity);
  const rightRarityIndex = RARITY_ORDER.indexOf(rightBird.rarity);
  const normalizedLeftRarityIndex = leftRarityIndex === -1 ? Number.MAX_SAFE_INTEGER : leftRarityIndex;
  const normalizedRightRarityIndex = rightRarityIndex === -1 ? Number.MAX_SAFE_INTEGER : rightRarityIndex;

  if (normalizedLeftRarityIndex !== normalizedRightRarityIndex) {
    return normalizedLeftRarityIndex - normalizedRightRarityIndex;
  }

  return leftBird.species.localeCompare(rightBird.species);
}

// Format per-second style resource values without noisy trailing zeroes.
function formatRateValue(value) {
  const roundedValue = Number(value.toFixed(2));

  if (Number.isInteger(roundedValue)) {
    return roundedValue.toString();
  }

  return roundedValue.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

// Check whether a resource line should display based on either native or inherited stats.
function birdHasDisplayableResourceStat(bird, statKey, gameState) {
  if (typeof bird[statKey] === "number") {
    return true;
  }

  const parasiteTargetBird = getParasiteTargetBird(bird, gameState);
  return Boolean(parasiteTargetBird && typeof parasiteTargetBird[statKey] === "number");
}

// Collect the resource rows a bird should show in the UI.
function getBirdResourceEntries(bird, gameState, options) {
  const displayOptions = options || {};

  return BIRD_RESOURCE_DEFINITIONS.reduce(function (entries, definition) {
    const shouldDisplayStat = displayOptions.baseValues
      ? typeof bird[definition.key] === "number"
      : birdHasDisplayableResourceStat(bird, definition.key, gameState);

    if (!shouldDisplayStat) {
      return entries;
    }

    let value = displayOptions.baseValues
      ? bird[definition.key]
      : definition.getValue(bird, gameState);

    if (displayOptions.multiplyByCount) {
      value *= (bird.count || 0);
    }

    entries.push({
      label: definition.label,
      value: value
    });

    return entries;
  }, []);
}

// Convert shared bird resource rows into reusable HTML snippets.
function getBirdResourceLinesHtml(bird, gameState, options) {
  const displayOptions = options || {};
  const lineTag = displayOptions.lineTag || "p";
  const lineClassName = displayOptions.lineClassName ? " class='" + displayOptions.lineClassName + "'" : "";

  return getBirdResourceEntries(bird, gameState, displayOptions).map(function (entry) {
    return "<" + lineTag + lineClassName + ">" + entry.label + ": +" + formatRateValue(entry.value) + "</" + lineTag + ">";
  }).join("");
}

// Bird rendering and catch-resolution helpers
// Repair older bird-save fields and report whether anything changed.
function repairLegacyBirdProgress(gameState) {
  let didChange = false;

  gameState.birds.forEach(function (bird) {
    const originalCount = typeof bird.count === "number" ? bird.count : null;
    const originalAcquired = bird.acquired === true;

    if (typeof bird.count !== "number") {
      bird.count = bird.acquired ? 1 : 0;
      didChange = true;
    }

    if (bird.count > 0 && bird.acquired !== true) {
      bird.acquired = true;
      didChange = true;
    }

    if (bird.count <= 0 && bird.acquired === true) {
      bird.count = 1;
      didChange = true;
    }

    if (bird.variantImages) {
      if (!bird.variantCounts || typeof bird.variantCounts !== "object") {
        bird.variantCounts = createBirdVariantCounts(bird, bird.count);
        didChange = true;
      } else {
        let assignedVariantCount = 0;

        Object.keys(bird.variantImages).forEach(function (variantKey) {
          if (typeof bird.variantCounts[variantKey] !== "number") {
            bird.variantCounts[variantKey] = 0;
            didChange = true;
          }

          assignedVariantCount += bird.variantCounts[variantKey];
        });

        if (assignedVariantCount !== bird.count) {
          bird.variantCounts = mergeBirdVariantCounts(bird, bird, bird.count);
          didChange = true;
        }
      }
    }

    if (originalCount !== bird.count || originalAcquired !== bird.acquired) {
      didChange = true;
    }
  });

  return {
    didChange: didChange,
    totalIndividuals: getTotalBirdCount(gameState),
    commonIndividuals: getCaughtBirdCountByRarity(gameState, "Common")
  };
}

// Return which visual variants of a bird are currently owned.
function getOwnedBirdVariantKeys(bird) {
  if (!bird.variantImages) {
    return [];
  }

  return Object.keys(bird.variantImages).filter(function (variantKey) {
    return (bird.variantCounts && bird.variantCounts[variantKey] > 0);
  });
}

// Build the image list a habitat panel should show for this species.
function getBirdHabitatImages(bird) {
  if (!bird.variantImages) {
    return [{
      src: bird.image,
      alt: bird.species + " inside the aviary habitat"
    }];
  }

  const visibleVariantKeys = getOwnedBirdVariantKeys(bird);
  const variantKeysToShow = visibleVariantKeys.length > 0
    ? visibleVariantKeys
    : [Object.keys(bird.variantImages)[0]];

  return variantKeysToShow.map(function (variantKey) {
    return {
      variantKey: variantKey,
      src: bird.variantImages[variantKey],
      alt: bird.species + " (" + variantKey + ") inside the aviary habitat"
    };
  });
}

// Pick one representative image for overlays or single-image contexts.
function getBirdPrimaryImage(bird) {
  if (bird.image) {
    return bird.image;
  }

  if (bird.variantImages) {
    const firstVariantKey = Object.keys(bird.variantImages)[0];
    return bird.variantImages[firstVariantKey];
  }

  return "";
}

// Assign one caught individual into a random owned visual variant bucket.
function addBirdToFlock(bird) {
  bird.acquired = true;
  bird.count += 1;

  if (!bird.variantImages) {
    return null;
  }

  const variantKeys = Object.keys(bird.variantImages);

  if (!bird.variantCounts || typeof bird.variantCounts !== "object") {
    bird.variantCounts = createBirdVariantCounts(bird, 0);
  }

  const chosenVariantKey = variantKeys[Math.floor(Math.random() * variantKeys.length)];
  bird.variantCounts[chosenVariantKey] = (bird.variantCounts[chosenVariantKey] || 0) + 1;
  return chosenVariantKey;
}

// Remove owned individuals from one species and keep variant counts in sync.
function removeBirdsFromFlock(gameState, birdId, amountToRemove) {
  const bird = getBirdById(gameState, birdId);

  if (!bird || amountToRemove <= 0 || bird.count < amountToRemove) {
    return false;
  }

  bird.count -= amountToRemove;

  if (bird.variantCounts && typeof bird.variantCounts === "object") {
    let remainingToRemove = amountToRemove;

    Object.keys(bird.variantCounts).forEach(function (variantKey) {
      if (remainingToRemove <= 0) {
        return;
      }

      const removableCount = Math.min(bird.variantCounts[variantKey] || 0, remainingToRemove);
      bird.variantCounts[variantKey] = Math.max(0, (bird.variantCounts[variantKey] || 0) - removableCount);
      remainingToRemove -= removableCount;
    });
  }

  bird.acquired = bird.count > 0;
  return true;
}

// Start from base rarity odds and apply bedding modifiers.
function getBaseRarityWeights(gameState) {
  const baseWeights = { ...RARITY_WEIGHTS };

  if (gameState.basicBeddingPurchased) {
    baseWeights.Common -= 5;
    baseWeights.Uncommon += 4;
    baseWeights.Rare += 1;
  }

  return baseWeights;
}

// Redistribute rarity odds when a habitat pool is missing some tiers.
function getEffectiveRarityWeightsForGameState(birdPool, gameState) {
  const effectiveWeights = {
    Common: 0,
    Uncommon: 0,
    Rare: 0,
    Epic: 0,
    Legendary: 0
  };

  const presentRarities = new Set(
    birdPool.map(function (bird) {
      return bird.rarity;
    })
  );

  RARITY_ORDER.forEach(function (rarity, rarityIndex) {
    const baseWeight = getBaseRarityWeights(gameState)[rarity];

    if (presentRarities.has(rarity)) {
      effectiveWeights[rarity] += baseWeight;
      return;
    }

    for (let i = rarityIndex - 1; i >= 0; i -= 1) {
      if (presentRarities.has(RARITY_ORDER[i])) {
        effectiveWeights[RARITY_ORDER[i]] += baseWeight;
        return;
      }
    }

    for (let i = rarityIndex + 1; i < RARITY_ORDER.length; i += 1) {
      if (presentRarities.has(RARITY_ORDER[i])) {
        effectiveWeights[RARITY_ORDER[i]] += baseWeight;
        return;
      }
    }
  });

  return effectiveWeights;
}

// Pick one random bird after rarity weighting has been resolved.
function getRandomBirdByRarityForGameState(birdPool, gameState) {
  if (birdPool.length === 0) {
    return null;
  }

  const effectiveWeights = getEffectiveRarityWeightsForGameState(birdPool, gameState);
  const roll = Math.random() * 100;
  let cumulativeWeight = 0;
  let selectedRarity = null;

  RARITY_ORDER.forEach(function (rarity) {
    if (selectedRarity !== null) {
      return;
    }

    cumulativeWeight += effectiveWeights[rarity];
    if (roll < cumulativeWeight) {
      selectedRarity = rarity;
    }
  });

  if (selectedRarity === null) {
    selectedRarity = RARITY_ORDER.find(function (rarity) {
      return effectiveWeights[rarity] > 0;
    });
  }

  const birdsInRarity = birdPool.filter(function (bird) {
    return bird.rarity === selectedRarity;
  });

  return birdsInRarity[Math.floor(Math.random() * birdsInRarity.length)];
}

// Resource-rate and formatting helpers
// Convert visitors/day into passive coin income.
function getCoinsPerSecond(gameState) {
  return getVisitorsPerDay(gameState) * getCoinsPerVisitorRate(gameState);
}

// Return how many coins each visitor/day point is worth per second.
function getCoinsPerVisitorRate(gameState) {
  return gameState.cafePurchased ? 0.2 : 0.1;
}

// Sum seed production coming specifically from trees.
function getTreeSeedsPerSecond(gameState) {
  return (
    gameState.appleTrees * 1 +
    gameState.pearTrees * 3 +
    gameState.peachTrees * 5
  );
}

// Sum seed production coming specifically from birds.
function getBirdSeedsPerSecond(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + (getBirdSeedRatePerSecond(bird, gameState) * bird.count);
  }, 0);
}

// Sum twig production coming specifically from birds before other systems modify it.
function getBirdTwigsPerSecond(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + (getBirdTwigRatePerSecond(bird, gameState) * bird.count);
  }, 0);
}

// Sum grub production coming specifically from birds before other systems modify it.
function getBirdGrubsPerSecond(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + (getBirdGrubRatePerSecond(bird, gameState) * bird.count);
  }, 0);
}

// Sum all seed production from both trees and birds.
function getSeedsPerSecond(gameState) {
  return getTreeSeedsPerSecond(gameState) + getBirdSeedsPerSecond(gameState) - getGrubFarmRates(gameState).seedsPerSecond;
}

// Sum all twig production from birds with twig-generating traits.
function getTwigsPerSecond(gameState) {
  return getBirdTwigsPerSecond(gameState) - getGrubFarmRates(gameState).twigsPerSecond;
}

// Sum all grub production from birds with grub-generating traits.
function getGrubsPerSecond(gameState) {
  return getBirdGrubsPerSecond(gameState) + getGrubFarmRates(gameState).grubsPerSecond;
}

// Sum the total tree-cap bonus birds currently grant for one orchard type.
function getBirdTreeBonusTotal(gameState, treeBonusKey) {
  return getAcquiredBirds(gameState).reduce(function (totalBonus, bird) {
    if (treeBonusKey === "bonusAppleTree") {
      return totalBonus + (getBirdBonusAppleTree(bird, gameState) * bird.count);
    }

    if (treeBonusKey === "bonusPearTree") {
      return totalBonus + (getBirdBonusPearTree(bird, gameState) * bird.count);
    }

    if (treeBonusKey === "bonusPeachTree") {
      return totalBonus + (getBirdBonusPeachTree(bird, gameState) * bird.count);
    }

    return totalBonus;
  }, 0);
}

// Tree caps start low and expand through sapling and flock upgrades.
function getTreeMaxCount(gameState, treeKey) {
  let maxCount = 1;

  if (gameState.newPlotPurchased) {
    maxCount += 1;
  }

  if (gameState.seedDispersalPurchased && treeKey === "pearTrees") {
    maxCount += 1;
  }

  if (treeKey === "appleTrees") {
    maxCount += getBirdTreeBonusTotal(gameState, "bonusAppleTree");
  } else if (treeKey === "pearTrees") {
    maxCount += getBirdTreeBonusTotal(gameState, "bonusPearTree");
  } else if (treeKey === "peachTrees") {
    maxCount += getBirdTreeBonusTotal(gameState, "bonusPeachTree");
  }

  return maxCount;
}

// Format coins for UI display.
function formatCoins(coins) {
  return formatLargeNumber(coins);
}

// Format seeds for UI display.
function formatSeeds(seeds) {
  return formatLargeNumber(seeds);
}

// Keep capped resources inside their valid ranges after any update.
function clampGameStateResources(gameState) {
  gameState.coins = Math.max(0, Math.min(gameState.coins, gameState.coinMax));
  gameState.seeds = Math.max(0, Math.min(gameState.seeds, gameState.seedMax));
  gameState.grubs = Math.max(0, Math.min(gameState.grubs, gameState.grubMax));
  gameState.twigs = Math.max(0, gameState.twigs);
  gameState.hardwood = Math.max(0, gameState.hardwood);
  gameState.mice = Math.max(0, gameState.mice);
}

// Abbreviate large numbers with k and M for cleaner UI labels.
function formatLargeNumber(value) {
  const wholeValue = Math.floor(value);

  if (wholeValue >= 1000000) {
    return (wholeValue / 1000000).toFixed(1).replace(".0", "") + "M";
  }

  if (wholeValue >= 10000) {
    const thousandsValue = Number((wholeValue / 1000).toFixed(1));

    if (thousandsValue >= 1000) {
      return "1M";
    }

    return thousandsValue.toString().replace(".0", "") + "k";
  }

  return wholeValue.toString();
}

// Shared top-bar renderer and interaction helpers
// Render or refresh the shared top bar used across pages.
function renderTopBar(topBarElement, gameState) {
  const totalBirds = getTotalBirdCount(gameState);
  const coinsPerSecond = getCoinsPerSecond(gameState);
  const treeSeedsPerSecond = getTreeSeedsPerSecond(gameState);
  const birdSeedsPerSecond = getBirdSeedsPerSecond(gameState);
  const birdGrubsPerSecond = getBirdGrubsPerSecond(gameState);
  const birdTwigsPerSecond = getBirdTwigsPerSecond(gameState);
  const grubFarmRates = getGrubFarmRates(gameState);
  const seedsPerSecond = getSeedsPerSecond(gameState);
  const grubsPerSecond = getGrubsPerSecond(gameState);
  const twigsPerSecond = getTwigsPerSecond(gameState);

  if (!topBarElement.querySelector(".top-bar-content")) {
    topBarElement.innerHTML =
      "<div class='top-bar-content'>" +
        "<div class='top-bar-stats'>" +
          "<span class='top-bar-tooltip'>" +
            "<span class='top-bar-seeds'></span>" +
            "<span class='top-bar-tooltip-box top-bar-seeds-tooltip'></span>" +
          "</span>" +
          "<span class='top-bar-grubs-wrapper' style='display: none;'> | <span class='top-bar-tooltip'><span class='top-bar-grubs'></span><span class='top-bar-tooltip-box top-bar-grubs-tooltip'></span></span></span>" +
          "<span class='top-bar-hardwood-wrapper' style='display: none;'> | <span class='top-bar-hardwood'></span></span>" +
          "<span class='top-bar-mice-wrapper' style='display: none;'> | <span class='top-bar-mice'></span></span>" +
          " | <span class='top-bar-tooltip'>" +
            "<span class='top-bar-coins'></span>" +
            "<span class='top-bar-tooltip-box top-bar-coins-tooltip'></span>" +
          "</span>" +
          "<span class='top-bar-twigs-wrapper' style='display: none;'> | <span class='top-bar-tooltip'>" +
            "<span class='top-bar-twigs'></span>" +
            "<span class='top-bar-tooltip-box top-bar-twigs-tooltip'></span>" +
          "</span></span>" +
          " | <span class='top-bar-birds'></span>" +
          " | <span class='top-bar-species'></span>" +
        "</div>" +
        "<div class='top-bar-nav'>" +
          "<a class='top-bar-link' href='inventory.html'>Inventory</a> | " +
          "<a class='top-bar-link' href='compendium.html'>Compendium</a> | " +
          "<a class='top-bar-link' href='settings.html'>Settings</a>" +
        "</div>" +
      "</div>";
  }

  topBarElement.querySelector(".top-bar-seeds").textContent = "Seeds: " + formatSeeds(gameState.seeds);
  topBarElement.querySelector(".top-bar-grubs").textContent = "Grubs: " + formatLargeNumber(gameState.grubs);
  topBarElement.querySelector(".top-bar-hardwood").textContent = "Hardwood: " + formatLargeNumber(gameState.hardwood);
  topBarElement.querySelector(".top-bar-mice").textContent = "Mice: " + formatLargeNumber(gameState.mice);
  topBarElement.querySelector(".top-bar-coins").textContent = "Coins: " + formatCoins(gameState.coins);
  topBarElement.querySelector(".top-bar-twigs").textContent = "Twigs: " + Math.floor(gameState.twigs);
  topBarElement.querySelector(".top-bar-seeds-tooltip").style.left = "0";
  topBarElement.querySelector(".top-bar-seeds-tooltip").style.transform = "none";
  topBarElement.querySelector(".top-bar-seeds-tooltip").style.whiteSpace = "normal";
  topBarElement.querySelector(".top-bar-seeds-tooltip").style.minWidth = "220px";
  topBarElement.querySelector(".top-bar-seeds-tooltip").style.textAlign = "left";
  topBarElement.querySelector(".top-bar-seeds-tooltip").innerHTML =
    "Seeds from trees: " + treeSeedsPerSecond.toFixed(1) + " seeds/sec<br>" +
    "Seeds from birds: " + birdSeedsPerSecond.toFixed(1) + " seeds/sec<br>" +
    "Seeds from grub farm: -" + grubFarmRates.seedsPerSecond.toFixed(1) + " seeds/sec<br>" +
    "Total: " + seedsPerSecond.toFixed(1) + " seeds/sec | Max seeds: " + formatSeeds(gameState.seedMax);
  topBarElement.querySelector(".top-bar-grubs-tooltip").style.left = "0";
  topBarElement.querySelector(".top-bar-grubs-tooltip").style.transform = "none";
  topBarElement.querySelector(".top-bar-grubs-tooltip").style.whiteSpace = "normal";
  topBarElement.querySelector(".top-bar-grubs-tooltip").style.minWidth = "220px";
  topBarElement.querySelector(".top-bar-grubs-tooltip").style.textAlign = "left";
  topBarElement.querySelector(".top-bar-grubs-tooltip").innerHTML =
    "Grubs from birds: " + birdGrubsPerSecond.toFixed(2) + " grubs/sec<br>" +
    "Grubs from grub farm: " + grubFarmRates.grubsPerSecond.toFixed(2) + " grubs/sec<br>" +
    "Total: " + grubsPerSecond.toFixed(2) + " grubs/sec | Max grubs: " + formatLargeNumber(gameState.grubMax);
  topBarElement.querySelector(".top-bar-coins-tooltip").textContent =
    "Coins from visitors: " + coinsPerSecond.toFixed(1) + " coins/sec | Max coins: " + formatCoins(gameState.coinMax);
  topBarElement.querySelector(".top-bar-twigs-tooltip").textContent =
    "Twigs from birds: " + birdTwigsPerSecond.toFixed(2) +
    " twigs/sec | Twigs from grub farm: -" + grubFarmRates.twigsPerSecond.toFixed(2) +
    " twigs/sec | Total: " + twigsPerSecond.toFixed(2) + " twigs/sec";
  topBarElement.querySelector(".top-bar-twigs-wrapper").style.display =
    (gameState.twigs >= 1 || twigsPerSecond > 0) ? "inline" : "none";
  topBarElement.querySelector(".top-bar-grubs-wrapper").style.display =
    (gameState.grubs >= 1 || grubsPerSecond > 0) ? "inline" : "none";
  topBarElement.querySelector(".top-bar-hardwood-wrapper").style.display =
    gameState.hardwood >= 1 ? "inline" : "none";
  topBarElement.querySelector(".top-bar-mice-wrapper").style.display =
    gameState.mice >= 1 ? "inline" : "none";
  topBarElement.querySelector(".top-bar-birds").textContent = "Individuals: " + totalBirds;
  topBarElement.querySelector(".top-bar-species").textContent = "Species: " + getFlockDiversity(gameState);
}

let sharedButtonSound = null;
let tooltipViewportAdjustmentInitialized = false;

// Play the shared UI click sound on demand after an action succeeds.
function playButtonSound() {
  if (sharedButtonSound === null) {
    sharedButtonSound = new Audio("/Resources/Sound%20Effects/button.mp3");
  }

  sharedButtonSound.currentTime = 0;
  sharedButtonSound.play();
}

// Handle automatic sound for navigation and simple ungated controls.
function initButtonAudio() {
  document.addEventListener("click", function (event) {
    const linkControl = event.target.closest("a.button, a.back-link, a.menu-button, a.top-bar-link");

    if (linkControl && !linkControl.classList.contains("is-locked")) {
      const href = linkControl.getAttribute("href");

      if (
        href &&
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        event.preventDefault();
        playButtonSound();
        setTimeout(function () {
          window.location.href = href;
        }, 120);
      }
      return;
    }

    const buttonControl = event.target.closest("button, .overview-button, .action-button, .danger-button");

    if (
      !buttonControl ||
      buttonControl.classList.contains("log-button") ||
      buttonControl.dataset.requiresSuccess === "true"
    ) {
      return;
    }

    playButtonSound();
  });
}

// Keep visible tooltips inside the viewport even when their content grows over time.
function adjustTooltipIntoViewport(tooltipBox) {
  if (!tooltipBox) {
    return;
  }

  if (!tooltipBox.dataset.originalInlineLeft) {
    tooltipBox.dataset.originalInlineLeft = tooltipBox.style.left || "";
    tooltipBox.dataset.originalInlineRight = tooltipBox.style.right || "";
    tooltipBox.dataset.originalInlineTransform = tooltipBox.style.transform || "";
    tooltipBox.dataset.originalInlineMaxWidth = tooltipBox.style.maxWidth || "";
    tooltipBox.dataset.originalInlineWhiteSpace = tooltipBox.style.whiteSpace || "";
  }

  tooltipBox.style.left = tooltipBox.dataset.originalInlineLeft;
  tooltipBox.style.right = tooltipBox.dataset.originalInlineRight;
  tooltipBox.style.transform = tooltipBox.dataset.originalInlineTransform;
  tooltipBox.style.maxWidth = tooltipBox.dataset.originalInlineMaxWidth;
  tooltipBox.style.whiteSpace = tooltipBox.dataset.originalInlineWhiteSpace;

  const viewportPadding = 8;
  const maxTooltipWidth = Math.max(180, window.innerWidth - (viewportPadding * 2));
  tooltipBox.style.maxWidth = maxTooltipWidth + "px";

  const tooltipRect = tooltipBox.getBoundingClientRect();

  if (tooltipRect.width > maxTooltipWidth) {
    tooltipBox.style.whiteSpace = "normal";
  }

  if (tooltipRect.right > window.innerWidth - viewportPadding) {
    tooltipBox.style.left = "auto";
    tooltipBox.style.right = "0";
    tooltipBox.style.transform = "none";
  }

  if (tooltipBox.getBoundingClientRect().left < viewportPadding) {
    tooltipBox.style.left = "0";
    tooltipBox.style.right = "auto";
    tooltipBox.style.transform = "none";
  }
}

// Watch tooltip hosts and nudge their boxes back on screen when they open.
function initViewportAwareTooltips() {
  if (tooltipViewportAdjustmentInitialized) {
    return;
  }

  tooltipViewportAdjustmentInitialized = true;

  function queueTooltipAdjustFromEvent(event) {
    const tooltipHost = event.target.closest(
      ".top-bar-tooltip, .upgrade-tooltip, .nav-tooltip, .panel-tab-tooltip, .process-tooltip, .compendium-tooltip, .bird-ability-shell"
    );

    if (!tooltipHost) {
      return;
    }

    const tooltipBox = tooltipHost.querySelector("[class*='tooltip-box']");

    if (!tooltipBox) {
      return;
    }

    setTimeout(function () {
      adjustTooltipIntoViewport(tooltipBox);
    }, 0);
  }

  document.addEventListener("mouseover", queueTooltipAdjustFromEvent);
  document.addEventListener("focusin", queueTooltipAdjustFromEvent);
  document.addEventListener("click", queueTooltipAdjustFromEvent);
  window.addEventListener("resize", function () {
    document.querySelectorAll("[class*='tooltip-box']").forEach(function (tooltipBox) {
      adjustTooltipIntoViewport(tooltipBox);
    });
  });
}

// Passive income loop and offline-progress helpers
// Apply passive resource income based on real elapsed time.
function updateCoinsFromElapsedTime(gameState, currentTime) {
  const coinsPerSecond = getCoinsPerSecond(gameState);
  const passiveTreeSeedsPerSecond = getTreeSeedsPerSecond(gameState);
  const passiveBirdSeedsPerSecond = getBirdSeedsPerSecond(gameState);
  const passiveSeedsPerSecond = passiveTreeSeedsPerSecond + passiveBirdSeedsPerSecond;
  const passiveGrubsPerSecond = getBirdGrubsPerSecond(gameState);
  const passiveTwigsPerSecond = getBirdTwigsPerSecond(gameState);
  const grubFarmRates = getGrubFarmRates(gameState);
  const seedsPerSecond = getSeedsPerSecond(gameState);
  const grubsPerSecond = getGrubsPerSecond(gameState);
  const twigsPerSecond = getTwigsPerSecond(gameState);
  const rawElapsedTime = currentTime - gameState.lastCoinUpdate;
  const elapsedTime = Math.min(rawElapsedTime, getMaxOfflineDurationMs(gameState));

  if (elapsedTime <= 0) {
    return false;
  }

  if (coinsPerSecond <= 0 && seedsPerSecond <= 0 && grubsPerSecond <= 0 && twigsPerSecond <= 0) {
    gameState.lastCoinUpdate = currentTime;
    saveGameState(gameState);
    return true;
  }

  const coinsPerMillisecond = coinsPerSecond / 1000;
  const earnedCoins = elapsedTime * coinsPerMillisecond;
  let earnedSeeds = 0;
  let earnedGrubs = 0;
  let earnedTwigs = 0;

  if (!gameState.grubFarmActive) {
    earnedSeeds = elapsedTime * (seedsPerSecond / 1000);
    earnedGrubs = elapsedTime * (grubsPerSecond / 1000);
    earnedTwigs = elapsedTime * (twigsPerSecond / 1000);
  } else {
    const elapsedSeconds = elapsedTime / 1000;
    let operableSeconds = elapsedSeconds;

    if (passiveSeedsPerSecond < grubFarmRates.seedsPerSecond) {
      operableSeconds = Math.min(
        operableSeconds,
        gameState.seeds / (grubFarmRates.seedsPerSecond - passiveSeedsPerSecond)
      );
    }

    if (passiveTwigsPerSecond < grubFarmRates.twigsPerSecond) {
      operableSeconds = Math.min(
        operableSeconds,
        gameState.twigs / (grubFarmRates.twigsPerSecond - passiveTwigsPerSecond)
      );
    }

    operableSeconds = Math.max(0, operableSeconds);

    const inactiveSeconds = Math.max(0, elapsedSeconds - operableSeconds);

    earnedSeeds =
      ((passiveSeedsPerSecond - grubFarmRates.seedsPerSecond) * operableSeconds) +
      (passiveSeedsPerSecond * inactiveSeconds);
    earnedTwigs =
      ((passiveTwigsPerSecond - grubFarmRates.twigsPerSecond) * operableSeconds) +
      (passiveTwigsPerSecond * inactiveSeconds);
    earnedGrubs =
      ((passiveGrubsPerSecond + grubFarmRates.grubsPerSecond) * operableSeconds) +
      (passiveGrubsPerSecond * inactiveSeconds);

    if (operableSeconds < elapsedSeconds) {
      gameState.grubFarmActive = false;
    }
  }

  gameState.coins += earnedCoins;
  gameState.seeds += earnedSeeds;
  gameState.grubs += earnedGrubs;
  gameState.twigs += earnedTwigs;
  clampGameStateResources(gameState);
  gameState.lastCoinUpdate = currentTime;
  saveGameState(gameState);
  return true;
}

// Keep the live income timer simple for now.
function getIncomeTickLength(gameState) {
  const coinsPerSecond = getCoinsPerSecond(gameState);

  if (coinsPerSecond <= 0) {
    return 1000;
  }

  return BASE_TICK_MS;
}

// Start the recurring income loop and resync on tab return.
function startIncomeSystem(gameState, onUpdate) {
  function applyIncomeUpdate() {
    const didUpdate = updateCoinsFromElapsedTime(gameState, Date.now());

    if (didUpdate && typeof onUpdate === "function") {
      onUpdate();
    }
  }

  applyIncomeUpdate();

  let incomeInterval = setInterval(applyIncomeUpdate, getIncomeTickLength(gameState));

  function restartIncomeInterval() {
    clearInterval(incomeInterval);
    incomeInterval = setInterval(applyIncomeUpdate, getIncomeTickLength(gameState));
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      applyIncomeUpdate();
      restartIncomeInterval();
    }
  });

  window.addEventListener("focus", function () {
    applyIncomeUpdate();
    restartIncomeInterval();
  });

  return {
    refresh: function () {
      applyIncomeUpdate();
      restartIncomeInterval();
    }
  };
}
