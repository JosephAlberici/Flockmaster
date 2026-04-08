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
    seeds: 100,
    seedMax: 500,
    grubs: 0,
    grubsPerClick: 1,
    coins: 50,
    twigs: 0,
    lastCoinUpdate: Date.now(),
    trapPurchased: false,
    trapLoaded: false,
    trapPulled: false,
    trapBaitType: null,
    trapLoadCost: 20,
    trapGrubLoadCost: 50,
    catchRate: 0.5,
    lastTrapResult: "",
    ownedHabitats: ["City Living"],
    redeemedCodes: [],
    newPlotPurchased: false,
    seedDispersalPurchased: false,
    basicBeddingPurchased: false,
    cafePurchased: false,
    indoorGardenPurchased: false,
    murderPartyPurchased: false,
    appleTrees: 0,
    pearTrees: 0,
    peachTrees: 0,
    birds: cloneBirdLibrary().map(function (bird) {
      return {
        ...bird,
        count: bird.acquired ? 1 : 0,
        variantCounts: createBirdVariantCounts(bird, bird.acquired ? 1 : 0)
      };
    })
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
  const parsedGameState = JSON.parse(saveText);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedGameState));
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
    const parsedGameState = JSON.parse(savedGameState);

    if (typeof parsedGameState.coins !== "number") {
      parsedGameState.coins = 50;
    }

    if (typeof parsedGameState.seeds !== "number") {
      parsedGameState.seeds = 100;
    }

    if (typeof parsedGameState.seedMax !== "number") {
      parsedGameState.seedMax = 500;
    }

    if (typeof parsedGameState.grubs !== "number") {
      parsedGameState.grubs = 0;
    }

    if (typeof parsedGameState.grubsPerClick !== "number") {
      parsedGameState.grubsPerClick = 1;
    }

    if (typeof parsedGameState.twigs !== "number") {
      parsedGameState.twigs = 0;
    }

    if (typeof parsedGameState.lastCoinUpdate !== "number") {
      parsedGameState.lastCoinUpdate = Date.now();
    }

    if (typeof parsedGameState.trapPurchased !== "boolean") {
      parsedGameState.trapPurchased = false;
    }

    if (typeof parsedGameState.trapLoaded !== "boolean") {
      parsedGameState.trapLoaded = false;
    }

    if (typeof parsedGameState.trapPulled !== "boolean") {
      parsedGameState.trapPulled = false;
    }

    if (typeof parsedGameState.trapBaitType !== "string" && parsedGameState.trapBaitType !== null) {
      parsedGameState.trapBaitType = null;
    }

    if (typeof parsedGameState.trapLoadCost !== "number") {
      parsedGameState.trapLoadCost = 20;
    }

    if (typeof parsedGameState.trapGrubLoadCost !== "number") {
      parsedGameState.trapGrubLoadCost = 50;
    }

    if (typeof parsedGameState.appleTrees !== "number") {
      parsedGameState.appleTrees = 0;
    }

    if (typeof parsedGameState.pearTrees !== "number") {
      parsedGameState.pearTrees = 0;
    }

    if (typeof parsedGameState.peachTrees !== "number") {
      parsedGameState.peachTrees = 0;
    }

    if (typeof parsedGameState.catchRate !== "number") {
      parsedGameState.catchRate = 0.5;
    }

    if (typeof parsedGameState.lastTrapResult !== "string") {
      parsedGameState.lastTrapResult = "";
    }

    if (!Array.isArray(parsedGameState.ownedHabitats)) {
      parsedGameState.ownedHabitats = ["City Living"];
    }

    if (!Array.isArray(parsedGameState.redeemedCodes)) {
      parsedGameState.redeemedCodes = [];
    }

    if (typeof parsedGameState.newPlotPurchased !== "boolean") {
      parsedGameState.newPlotPurchased = false;
    }

    if (typeof parsedGameState.seedDispersalPurchased !== "boolean") {
      parsedGameState.seedDispersalPurchased = false;
    }

    if (typeof parsedGameState.basicBeddingPurchased !== "boolean") {
      parsedGameState.basicBeddingPurchased = false;
    }

    if (typeof parsedGameState.cafePurchased !== "boolean") {
      parsedGameState.cafePurchased = false;
    }

    if (typeof parsedGameState.indoorGardenPurchased !== "boolean") {
      parsedGameState.indoorGardenPurchased = false;
    }

    if (typeof parsedGameState.murderPartyPurchased !== "boolean") {
      parsedGameState.murderPartyPurchased = false;
    }

    parsedGameState.birds = mergeBirdProgress(parsedGameState.birds);

    return parsedGameState;
  } catch (error) {
    const defaultGameState = createDefaultGameState();
    saveGameState(defaultGameState);
    return defaultGameState;
  }
}

// Apply per-species visitor modifiers from aviary upgrades.
function getBirdVisitorRatePerDay(bird, gameState) {
  let visitorRate = bird.visitorsPerDay || 0;

  if (gameState.murderPartyPurchased && bird.id === "crow") {
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

// Filter the habitat catch pool by the bait diet that was loaded into the trap.
function getCatchableBirdsByDiet(gameState, baitType) {
  return getCatchableBirds(gameState).filter(function (bird) {
    return bird.diet === baitType;
  });
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

// Count total individual birds, including duplicates of one species.
function getTotalBirdCount(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + bird.count;
  }, 0);
}

// Apply per-species twig modifiers from aviary upgrades.
function getBirdTwigRatePerSecond(bird, gameState) {
  let twigRate = bird.twigsPerSecond || 0;

  if (gameState.indoorGardenPurchased && bird.id === "kestrel") {
    twigRate *= 2;
  }

  return twigRate;
}

// Return a bird's passive seed income, defaulting to zero when absent.
function getBirdSeedRatePerSecond(bird) {
  return bird.seedsPerSecond || 0;
}

// Return a bird's passive grub income, defaulting to zero when absent.
function getBirdGrubRatePerSecond(bird) {
  return bird.grubsPerSecond || 0;
}

// Count how many owned birds currently carry a given ability.
function getBirdAbilityCount(gameState, abilityId) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    if (!Array.isArray(bird.abilities) || !bird.abilities.includes(abilityId)) {
      return total;
    }

    return total + bird.count;
  }, 0);
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

// Convenience wrapper for callers that do not need upgrade-aware weights.
function getEffectiveRarityWeights(birdPool) {
  return getEffectiveRarityWeightsForGameState(birdPool, createDefaultGameState());
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

// Convenience wrapper for callers that do not need upgrade-aware selection.
function getRandomBirdByRarity(birdPool) {
  return getRandomBirdByRarityForGameState(birdPool, createDefaultGameState());
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

// Convert visitors/day into passive coin income.
function getCoinsPerSecond(gameState) {
  return getVisitorsPerDay(gameState) * getCoinsPerVisitorRate(gameState);
}

// Return how many coins each visitor/day point is worth per second.
function getCoinsPerVisitorRate(gameState) {
  return gameState.cafePurchased ? 0.2 : 0.1;
}

// Sum all sapling-based seed production.
function getSeedsPerSecond(gameState) {
  const saplingSeedsPerSecond = (
    gameState.appleTrees * 1 +
    gameState.pearTrees * 3 +
    gameState.peachTrees * 5
  );

  const birdSeedsPerSecond = getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + (getBirdSeedRatePerSecond(bird) * bird.count);
  }, 0);

  return saplingSeedsPerSecond + birdSeedsPerSecond;
}

// Sum all twig production from birds with twig-generating traits.
function getTwigsPerSecond(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + (getBirdTwigRatePerSecond(bird, gameState) * bird.count);
  }, 0);
}

// Sum all grub production from birds with grub-generating traits.
function getGrubsPerSecond(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + (getBirdGrubRatePerSecond(bird) * bird.count);
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

// Render or refresh the shared top bar used across pages.
function renderTopBar(topBarElement, gameState) {
  const totalBirds = getTotalBirdCount(gameState);
  const coinsPerSecond = getCoinsPerSecond(gameState);
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
          "<a class='top-bar-link' href='compendium.html'>Compendium</a> | " +
          "<a class='top-bar-link' href='settings.html'>Settings</a>" +
        "</div>" +
      "</div>";
  }

  topBarElement.querySelector(".top-bar-seeds").textContent = "Seeds: " + formatSeeds(gameState.seeds);
  topBarElement.querySelector(".top-bar-grubs").textContent = "Grubs: " + formatLargeNumber(gameState.grubs);
  topBarElement.querySelector(".top-bar-coins").textContent = "Coins: " + formatCoins(gameState.coins);
  topBarElement.querySelector(".top-bar-twigs").textContent = "Twigs: " + Math.floor(gameState.twigs);
  topBarElement.querySelector(".top-bar-seeds-tooltip").textContent =
    "Seeds from saplings and birds: " + seedsPerSecond.toFixed(1) + " seeds/sec | Max seeds: " + formatSeeds(gameState.seedMax);
  topBarElement.querySelector(".top-bar-grubs-tooltip").textContent =
    "Grubs from birds: " + grubsPerSecond.toFixed(2) + " grubs/sec";
  topBarElement.querySelector(".top-bar-coins-tooltip").textContent =
    "Coins from visitors: " + coinsPerSecond.toFixed(1) + " coins/sec";
  topBarElement.querySelector(".top-bar-twigs-tooltip").textContent =
    "Twigs from birds: " + twigsPerSecond.toFixed(2) + " twigs/sec";
  topBarElement.querySelector(".top-bar-twigs-wrapper").style.display =
    (gameState.twigs >= 1 || twigsPerSecond > 0) ? "inline" : "none";
  topBarElement.querySelector(".top-bar-grubs-wrapper").style.display =
    (gameState.grubs >= 1 || grubsPerSecond > 0) ? "inline" : "none";
  topBarElement.querySelector(".top-bar-birds").textContent = "Individuals: " + totalBirds;
  topBarElement.querySelector(".top-bar-species").textContent = "Species: " + getFlockDiversity(gameState);
}

let sharedButtonSound = null;

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

// Apply passive resource income based on real elapsed time.
function updateCoinsFromElapsedTime(gameState, currentTime) {
  const coinsPerSecond = getCoinsPerSecond(gameState);
  const seedsPerSecond = getSeedsPerSecond(gameState);
  const grubsPerSecond = getGrubsPerSecond(gameState);
  const twigsPerSecond = getTwigsPerSecond(gameState);
  const elapsedTime = currentTime - gameState.lastCoinUpdate;

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
  const earnedSeeds = elapsedTime * (seedsPerSecond / 1000);
  const earnedGrubs = elapsedTime * (grubsPerSecond / 1000);
  const earnedTwigs = elapsedTime * (twigsPerSecond / 1000);

  gameState.coins += earnedCoins;
  gameState.seeds += earnedSeeds;
  gameState.grubs += earnedGrubs;
  gameState.twigs += earnedTwigs;
  if (gameState.seeds > gameState.seedMax) {
    gameState.seeds = gameState.seedMax;
  }
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
