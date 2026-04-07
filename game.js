const STORAGE_KEY = "flockmasterSave";
const BASE_TICK_MS = 1000;
const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const RARITY_WEIGHTS = {
  Common: 60,
  Uncommon: 25,
  Rare: 10,
  Epic: 4,
  Legendary: 1
};

function cloneBirdLibrary() {
  return BIRD_LIBRARY.map(function (bird) {
    return { ...bird };
  });
}

function mergeBirdProgress(savedBirds) {
  const savedBirdMap = new Map(
    (savedBirds || []).map(function (bird) {
      return [bird.id || bird.species, bird];
    })
  );

  return cloneBirdLibrary().map(function (bird) {
    const savedBird = savedBirdMap.get(bird.id) || savedBirdMap.get(bird.species);

    if (!savedBird) {
      return bird;
    }

    return {
      ...bird,
      acquired: typeof savedBird.acquired === "boolean" ? savedBird.acquired : bird.acquired,
      count: typeof savedBird.count === "number"
        ? savedBird.count
        : ((typeof savedBird.acquired === "boolean" ? savedBird.acquired : bird.acquired) ? 1 : 0)
    };
  });
}

function createDefaultGameState() {
  return {
    seeds: 100,
    seedMax: 500,
    coins: 50,
    twigs: 0,
    lastCoinUpdate: Date.now(),
    trapPurchased: false,
    trapLoaded: false,
    trapPulled: false,
    trapLoadCost: 20,
    catchRate: 0.5,
    lastTrapResult: "",
    ownedHabitats: ["City Living"],
    newPlotPurchased: false,
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
        count: bird.acquired ? 1 : 0
      };
    })
  };
}

function saveGameState(gameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

function eraseGameProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

function importGameProgress(saveText) {
  const parsedGameState = JSON.parse(saveText);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedGameState));
}

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

    if (typeof parsedGameState.trapLoadCost !== "number") {
      parsedGameState.trapLoadCost = 20;
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

    if (typeof parsedGameState.newPlotPurchased !== "boolean") {
      parsedGameState.newPlotPurchased = false;
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

function getBirdVisitorRatePerDay(bird, gameState) {
  let visitorRate = bird.visitorsPerDay || 0;

  if (gameState.murderPartyPurchased && bird.id === "crow") {
    visitorRate *= 2;
  }

  return visitorRate;
}

function getAcquiredBirds(gameState) {
  return gameState.birds.filter(function (bird) {
    return (typeof bird.count === "number" ? bird.count > 0 : bird.acquired === true);
  });
}

function getVisitorsPerDay(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + getBirdVisitorRatePerDay(bird, gameState) * bird.count;
  }, 0);
}

function getFlockDiversity(gameState) {
  return new Set(
    getAcquiredBirds(gameState).map(function (bird) {
      return bird.species;
    })
  ).size;
}

function getCatchableBirds(gameState) {
  return gameState.birds.filter(function (bird) {
    return gameState.ownedHabitats.includes(bird.nativeHabitat);
  });
}

function getCaughtBirdCountByRarity(gameState, rarityName) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    if (bird.rarity !== rarityName) {
      return total;
    }

    return total + bird.count;
  }, 0);
}

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

function getTotalBirdCount(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + bird.count;
  }, 0);
}

function getBirdTwigRatePerSecond(bird, gameState) {
  let twigRate = bird.twigsPerSecond || 0;

  if (gameState.indoorGardenPurchased && bird.id === "kestrel") {
    twigRate *= 2;
  }

  return twigRate;
}

function getEffectiveRarityWeights(birdPool) {
  return getEffectiveRarityWeightsForGameState(birdPool, createDefaultGameState());
}

function getBaseRarityWeights(gameState) {
  const baseWeights = { ...RARITY_WEIGHTS };

  if (gameState.basicBeddingPurchased) {
    baseWeights.Common -= 5;
    baseWeights.Uncommon += 4;
    baseWeights.Rare += 1;
  }

  return baseWeights;
}

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

function getRandomBirdByRarity(birdPool) {
  return getRandomBirdByRarityForGameState(birdPool, createDefaultGameState());
}

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

function getCoinsPerSecond(gameState) {
  return getVisitorsPerDay(gameState) * getCoinsPerVisitorRate(gameState);
}

function getCoinsPerVisitorRate(gameState) {
  return gameState.cafePurchased ? 0.2 : 0.1;
}

function getSeedsPerSecond(gameState) {
  return (
    gameState.appleTrees * 1 +
    gameState.pearTrees * 3 +
    gameState.peachTrees * 5
  );
}

function getTwigsPerSecond(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + (getBirdTwigRatePerSecond(bird, gameState) * bird.count);
  }, 0);
}

function getTreeMaxCount(gameState) {
  return gameState.newPlotPurchased ? 2 : 1;
}

function formatCoins(coins) {
  return formatLargeNumber(coins);
}

function formatSeeds(seeds) {
  return formatLargeNumber(seeds);
}

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

function renderTopBar(topBarElement, gameState) {
  const totalBirds = getTotalBirdCount(gameState);
  const coinsPerSecond = getCoinsPerSecond(gameState);
  const seedsPerSecond = getSeedsPerSecond(gameState);
  const twigsPerSecond = getTwigsPerSecond(gameState);

  if (!topBarElement.querySelector(".top-bar-content")) {
    topBarElement.innerHTML =
      "<div class='top-bar-content'>" +
        "<div class='top-bar-stats'>" +
          "<span class='top-bar-tooltip'>" +
            "<span class='top-bar-seeds'></span>" +
            "<span class='top-bar-tooltip-box top-bar-seeds-tooltip'></span>" +
          "</span>" +
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
        "<a class='top-bar-link' href='settings.html'>Settings</a>" +
      "</div>";
  }

  topBarElement.querySelector(".top-bar-seeds").textContent = "Seeds: " + formatSeeds(gameState.seeds);
  topBarElement.querySelector(".top-bar-coins").textContent = "Coins: " + formatCoins(gameState.coins);
  topBarElement.querySelector(".top-bar-twigs").textContent = "Twigs: " + Math.floor(gameState.twigs);
  topBarElement.querySelector(".top-bar-seeds-tooltip").textContent =
    "Seeds from saplings: " + seedsPerSecond.toFixed(1) + " seeds/sec | Max seeds: " + formatSeeds(gameState.seedMax);
  topBarElement.querySelector(".top-bar-coins-tooltip").textContent =
    "Coins from visitors: " + coinsPerSecond.toFixed(1) + " coins/sec";
  topBarElement.querySelector(".top-bar-twigs-tooltip").textContent =
    "Twigs from birds: " + twigsPerSecond.toFixed(2) + " twigs/sec";
  topBarElement.querySelector(".top-bar-twigs-wrapper").style.display =
    (gameState.twigs >= 1 || twigsPerSecond > 0) ? "inline" : "none";
  topBarElement.querySelector(".top-bar-birds").textContent = "Individuals: " + totalBirds;
  topBarElement.querySelector(".top-bar-species").textContent = "Species: " + getFlockDiversity(gameState);
}

function updateCoinsFromElapsedTime(gameState, currentTime) {
  const coinsPerSecond = getCoinsPerSecond(gameState);
  const seedsPerSecond = getSeedsPerSecond(gameState);
  const twigsPerSecond = getTwigsPerSecond(gameState);
  const elapsedTime = currentTime - gameState.lastCoinUpdate;

  if (elapsedTime <= 0) {
    return false;
  }

  if (coinsPerSecond <= 0 && seedsPerSecond <= 0 && twigsPerSecond <= 0) {
    gameState.lastCoinUpdate = currentTime;
    saveGameState(gameState);
    return true;
  }

  const coinsPerMillisecond = coinsPerSecond / 1000;
  const earnedCoins = elapsedTime * coinsPerMillisecond;
  const earnedSeeds = elapsedTime * (seedsPerSecond / 1000);
  const earnedTwigs = elapsedTime * (twigsPerSecond / 1000);

  gameState.coins += earnedCoins;
  gameState.seeds += earnedSeeds;
  gameState.twigs += earnedTwigs;
  if (gameState.seeds > gameState.seedMax) {
    gameState.seeds = gameState.seedMax;
  }
  gameState.lastCoinUpdate = currentTime;
  saveGameState(gameState);
  return true;
}

function getIncomeTickLength(gameState) {
  const coinsPerSecond = getCoinsPerSecond(gameState);

  if (coinsPerSecond <= 0) {
    return 1000;
  }

  return BASE_TICK_MS;
}

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
