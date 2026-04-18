// Central upgrade catalogue
// These objects define what upgrades exist and what they do. Page files can use
// the metadata for labels, sections, and costs, while game.js can scan the same
// catalogue for active modifier hooks.
const BIRD_CATCHING_UPGRADES = {
  basicBedding: {
    id: "basicBedding",
    legacyPurchasedKey: "basicBeddingPurchased",
    name: "Basic Bedding",
    page: "birdCatching",
    section: "bedding",
    order: 1,
    oneTime: true,
    costs: { twigs: 2000 },
    requirements: { commonIndividuals: 10 },
    description: "+5% Catch Rate",
    modifyCatchRate(catchRate) {
      return catchRate + 0.05;
    }
  },
  advancedBedding: {
    id: "advancedBedding",
    legacyPurchasedKey: "advancedBeddingPurchased",
    name: "Advanced Bedding",
    page: "birdCatching",
    section: "bedding",
    order: 2,
    oneTime: true,
    costs: { hardwood: 20 },
    requirements: { individuals: 60 },
    description: "-5% Common, +4% Uncommon, +1% Rare",
    modifyRarityWeights(rarityWeights) {
      return {
        ...rarityWeights,
        Common: rarityWeights.Common - 5,
        Uncommon: rarityWeights.Uncommon + 4,
        Rare: rarityWeights.Rare + 1
      };
    }
  },
  plushBedding: {
    id: "plushBedding",
    name: "Plush Bedding",
    page: "birdCatching",
    section: "bedding",
    order: 3,
    oneTime: true,
    costs: { feathers: 10 },
    requirements: { individuals: 120 },
    description: "+5% Catch Rate, -1% Common, +0.5% Epic, +0.5% Legendary",
    modifyCatchRate(catchRate) {
      return catchRate + 0.05;
    },
    modifyRarityWeights(rarityWeights) {
      return {
        ...rarityWeights,
        Common: rarityWeights.Common - 1,
        Epic: rarityWeights.Epic + 0.5,
        Legendary: rarityWeights.Legendary + 0.5
      };
    }
  },
  seedPouch: {
    id: "seedPouch",
    name: "Seed Pouch",
    page: "birdCatching",
    section: "storage",
    order: 1,
    oneTime: true,
    costs: { coins: 500 },
    description: "Increases maximum seeds to 25,000",
    deriveOwned(gameState) {
      return gameState.seedMax >= 25000;
    },
    onPurchase(gameState) {
      gameState.seedMax = Math.max(gameState.seedMax, 25000);
    }
  },
  seedBank: {
    id: "seedBank",
    name: "Seed Bank",
    page: "birdCatching",
    section: "storage",
    order: 2,
    oneTime: true,
    costs: { coins: 10000 },
    description: "Increases maximum seeds to 100,000",
    deriveOwned(gameState) {
      return gameState.seedMax >= 100000;
    },
    onPurchase(gameState) {
      gameState.seedMax = Math.max(gameState.seedMax, 100000);
    }
  }
};

const EARTHWORKS_UPGRADES = {
  constructGrubFarm: {
    id: "constructGrubFarm",
    name: "Construct Grub Farm",
    page: "earthworks",
    section: "construction",
    order: 1,
    oneTime: true,
    costs: { grubs: 500 },
    description: "Constructs the grub farm and unlocks passive grub conversion",
    deriveOwned(gameState) {
      return gameState.grubFarmUnlocked === true;
    },
    canPurchase(gameState) {
      return hasUpgrade(gameState, "pheromones");
    },
    onPurchase(gameState) {
      gameState.grubFarmUnlocked = true;
    }
  },
  constructSawmill: {
    id: "constructSawmill",
    name: "Construct Sawmill",
    page: "earthworks",
    section: "construction",
    order: 2,
    oneTime: true,
    costs: { twigs: 7500 },
    description: "Constructs the sawmill and unlocks twig processing",
    deriveOwned(gameState) {
      return gameState.sawmillConstructed === true;
    },
    onPurchase(gameState) {
      gameState.sawmillConstructed = true;
    }
  },
  pheromones: {
    id: "pheromones",
    legacyPurchasedKey: "pheromonesPurchased",
    name: "Pheromones",
    page: "earthworks",
    section: "grubsPerClick",
    order: 1,
    oneTime: true,
    costs: { coins: 500 },
    description: "Increases grubs per click by 2",
    onPurchase(gameState) {
      gameState.grubsPerClick += 2;
    }
  },
  stickyFingers: {
    id: "stickyFingers",
    name: "Sticky Fingers",
    page: "earthworks",
    section: "grubsPerClick",
    order: 2,
    oneTime: true,
    costs: { coins: 1500 },
    requirements: {
      dietIndividuals: {
        grubs: 10
      }
    },
    description: "Increases grubs per click by another 2",
    onPurchase(gameState) {
      gameState.grubsPerClick += 2;
    }
  },
  grubBarn: {
    id: "grubBarn",
    name: "Grub Barn",
    page: "earthworks",
    section: "grubStorage",
    order: 1,
    oneTime: true,
    costs: { hardwood: 50 },
    description: "Increases maximum grubs to 50k",
    deriveOwned(gameState) {
      return gameState.grubMax >= 50000;
    },
    onPurchase(gameState) {
      gameState.grubMax = Math.max(gameState.grubMax, 50000);
    }
  },
  birdPoweredBlades: {
    id: "birdPoweredBlades",
    name: "Birdpowered Blades",
    page: "earthworks",
    section: "processingTime",
    order: 1,
    oneTime: true,
    costs: { scrap: 5, coins: 8000 },
    requirements: { individuals: 100 },
    description: "Reduces sawmill processing time by 20%",
    canPurchase(gameState) {
      return hasUpgrade(gameState, "constructSawmill");
    },
    modifySawmillProcessingDurationMs(processingDurationMs) {
      return processingDurationMs * 0.8;
    }
  },
  oakLogs: {
    id: "oakLogs",
    name: "Oak Logs",
    page: "earthworks",
    section: "hardwoodYield",
    order: 1,
    oneTime: true,
    costs: { coins: 10000 },
    description: "Increases hardwood yield by 5",
    canPurchase(gameState) {
      return hasUpgrade(gameState, "constructSawmill");
    },
    modifySawmillHardwoodYield(hardwoodYield) {
      return hardwoodYield + 5;
    }
  },
  redwoodLogs: {
    id: "redwoodLogs",
    name: "Redwood Logs",
    page: "earthworks",
    section: "hardwoodYield",
    order: 2,
    oneTime: true,
    costs: { coins: 50000 },
    description: "Increases hardwood yield by another 5",
    canPurchase(gameState) {
      return hasUpgrade(gameState, "constructSawmill");
    },
    modifySawmillHardwoodYield(hardwoodYield) {
      return hardwoodYield + 5;
    }
  },
  twigCompactor: {
    id: "twigCompactor",
    name: "Twig Compactor",
    page: "earthworks",
    section: "processingCost",
    order: 1,
    oneTime: true,
    costs: { scrap: 10, coins: 5000 },
    description: "Reduces twig processing cost by 20%",
    canPurchase(gameState) {
      return hasUpgrade(gameState, "constructSawmill");
    },
    modifySawmillTwigProcessingCost(processingCost) {
      return processingCost * 0.8;
    }
  }
};

const AVIARY_UPGRADES = {
  newPlot: {
    id: "newPlot",
    legacyPurchasedKey: "newPlotPurchased",
    name: "New Plot",
    page: "aviary",
    section: "acreage",
    order: 1,
    oneTime: true,
    costs: { coins: 2000 },
    requirements: { species: 8 },
    description: "Increases number of trees you can own",
    modifyTreeMaxCount(maxTreeCount) {
      return maxTreeCount + 1;
    }
  },
  eminentDomain: {
    id: "eminentDomain",
    name: "Eminent Domain",
    page: "aviary",
    section: "acreage",
    order: 2,
    oneTime: true,
    costs: { coins: 100000 },
    requirements: { species: 16 },
    description: "Increases the maximum of every tree type by 1",
    modifyTreeMaxCount(maxTreeCount) {
      return maxTreeCount + 1;
    }
  },
  orangeSeeds: {
    id: "orangeSeeds",
    name: "Orange Seeds",
    page: "aviary",
    section: "seedShop",
    order: 1,
    oneTime: true,
    costs: { coins: 100000 },
    description: "Unlocks Orange Trees in the Sapling Shop",
    deriveOwned(gameState) {
      return Boolean(gameState.upgrades && gameState.upgrades.orangeSeeds === true);
    }
  },
  humblePark: {
    id: "humblePark",
    name: "Humble Park",
    page: "aviary",
    section: "fundraising",
    order: 1,
    oneTime: true,
    costs: {},
    requirements: { individuals: 25, visitorsPerDay: 50 },
    description: "Increases Federal Grant to 25 coins per minute",
    onPurchase(gameState) {
      gameState.federalGrantPerMinute = Math.max(gameState.federalGrantPerMinute, 25);
    }
  },
  burgeoningBirdscape: {
    id: "burgeoningBirdscape",
    name: "Burgeoning Birdscape",
    page: "aviary",
    section: "fundraising",
    order: 2,
    oneTime: true,
    costs: {},
    requirements: { individuals: 100, visitorsPerDay: 200 },
    description: "Increases Federal Grant by 25 coins per minute",
    onPurchase(gameState) {
      gameState.federalGrantPerMinute += 25;
    }
  },
  grandBirdapestHotel: {
    id: "grandBirdapestHotel",
    name: "Grand Birdapest Hotel",
    page: "aviary",
    section: "fundraising",
    order: 3,
    oneTime: true,
    costs: {},
    requirements: { individuals: 150, visitorsPerDay: 350 },
    description: "Increases Federal Grant by 50 coins per minute",
    onPurchase(gameState) {
      gameState.federalGrantPerMinute += 50;
    }
  },
  cafe: {
    id: "cafe",
    legacyPurchasedKey: "cafePurchased",
    name: "Café",
    page: "aviary",
    section: "amenities",
    order: 1,
    oneTime: true,
    costs: { twigs: 200 },
    requirements: { species: 5 },
    description: "Adds +50 coins per visitor",
    modifyCoinsPerVisitorRate(coinsPerVisitorRate) {
      return coinsPerVisitorRate + 50;
    }
  },
  ornithologyLab: {
    id: "ornithologyLab",
    name: "Ornithology Lab",
    page: "aviary",
    section: "amenities",
    order: 2,
    oneTime: true,
    costs: { hardwood: 10 },
    requirements: { species: 15 },
    description: "Adds +100 coins per visitor and +5 Federal Grant coins per minute",
    modifyCoinsPerVisitorRate(coinsPerVisitorRate) {
      return coinsPerVisitorRate + 100;
    },
    onPurchase(gameState) {
      gameState.federalGrantPerMinute += 5;
    }
  },
  cushionedSeating: {
    id: "cushionedSeating",
    name: "Cushioned Seating",
    page: "aviary",
    section: "amenities",
    order: 3,
    oneTime: true,
    costs: { feathers: 20 },
    requirements: { species: 20 },
    description: "Adds +100 coins per visitor and +10 visitors per day for each habitat you have",
    modifyCoinsPerVisitorRate(coinsPerVisitorRate) {
      return coinsPerVisitorRate + 100;
    },
    modifyTotalVisitorsPerDay(totalVisitorsPerDay, context) {
      const ownedHabitats = context && context.gameState && Array.isArray(context.gameState.ownedHabitats)
        ? context.gameState.ownedHabitats.length
        : 0;
      return totalVisitorsPerDay + (ownedHabitats * 10);
    }
  },
  basket: {
    id: "basket",
    legacyPurchasedKey: "basketPurchased",
    name: "Basket",
    page: "aviary",
    section: "treasury",
    order: 1,
    oneTime: true,
    costs: { twigs: 100 },
    description: "Increases maximum coins to 100k",
    onPurchase(gameState) {
      gameState.coinMax = 100000;
    }
  },
  depositBox: {
    id: "depositBox",
    legacyPurchasedKey: "depositBoxPurchased",
    name: "Deposit Box",
    page: "aviary",
    section: "treasury",
    order: 2,
    oneTime: true,
    costs: { hardwood: 10 },
    description: "Increases maximum coins to 1M",
    onPurchase(gameState) {
      gameState.coinMax = 1000000;
    }
  }
};

const DOCKYARD_UPGRADES = {
  constructHarbor: {
    id: "constructHarbor",
    name: "Construct Harbor",
    page: "dockyard",
    section: "harbor",
    order: 1,
    oneTime: true,
    costs: { hardwood: 40, coins: 10000 },
    description: "Unlocks Harbor voyages and grants 2 Voyage Tickets",
    onPurchase(gameState) {
      addItemCount(gameState, "voyageticket", 2);
      gameState.dockyardHarborGiftPending = true;
    }
  },
  constructLighthouse: {
    id: "constructLighthouse",
    name: "Construct Lighthouse",
    page: "dockyard",
    section: "harbor",
    order: 2,
    oneTime: true,
    costs: { scrap: 15, hardwood: 25 },
    description: "Access to new upgrades for voyages and reduces voyage duration by 5 minutes",
    canPurchase(gameState) {
      return hasUpgrade(gameState, "constructHarbor");
    },
    onPurchase(gameState) {
      gameState.dockyardVoyageDurationMs = Math.max(
        10 * 60 * 1000,
        gameState.dockyardVoyageDurationMs - (5 * 60 * 1000)
      );
    }
  },
  installBeacon: {
    id: "installBeacon",
    name: "Install Beacon",
    page: "dockyard",
    section: "harbor",
    order: 2.5,
    oneTime: true,
    costs: { coins: 25000 },
    description: "Reduces voyage duration by 10 minutes",
    canPurchase(gameState) {
      return hasUpgrade(gameState, "constructLighthouse");
    },
    onPurchase(gameState) {
      gameState.dockyardVoyageDurationMs = Math.max(
        10 * 60 * 1000,
        gameState.dockyardVoyageDurationMs - (10 * 60 * 1000)
      );
    }
  },
  dredger: {
    id: "dredger",
    name: "Dredger",
    page: "dockyard",
    section: "harbor",
    order: 3,
    oneTime: true,
    costs: { coins: 20000 },
    description: "Adds 5 scrap and 5% treasure chance to each voyage",
    canPurchase(gameState) {
      return hasUpgrade(gameState, "constructHarbor");
    },
    onPurchase(gameState) {
      gameState.dockyardScrapPerVoyage += 5;
      gameState.dockyardTreasureChance += 0.05;
    }
  },
  trawlNets: {
    id: "trawlNets",
    name: "Trawl Nets",
    page: "dockyard",
    section: "harbor",
    order: 4,
    oneTime: true,
    costs: { coins: 40000 },
    description: "Adds 10 fish to each voyage",
    canPurchase(gameState) {
      return hasUpgrade(gameState, "constructHarbor");
    },
    onPurchase(gameState) {
      gameState.dockyardFishPerVoyage += 10;
    }
  }
};

const UPGRADE_LIBRARY = {
  ...BIRD_CATCHING_UPGRADES,
  ...EARTHWORKS_UPGRADES,
  ...AVIARY_UPGRADES,
  ...DOCKYARD_UPGRADES
};
