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
  advancedBedding: {
    id: "advancedBedding",
    legacyPurchasedKey: "advancedBeddingPurchased",
    name: "Advanced Bedding",
    page: "birdCatching",
    section: "bedding",
    order: 2,
    oneTime: true,
    costs: { hardwood: 20 },
    requirements: { individuals: 25 },
    description: "+5% Catch Rate",
    modifyCatchRate(catchRate) {
      return catchRate + 0.05;
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
    description: "Increases maximum seeds to 10,000",
    deriveOwned(gameState) {
      return gameState.seedMax >= 10000;
    },
    onPurchase(gameState) {
      gameState.seedMax = Math.max(gameState.seedMax, 10000);
    }
  },
  seedBank: {
    id: "seedBank",
    name: "Seed Bank",
    page: "birdCatching",
    section: "storage",
    order: 2,
    oneTime: true,
    costs: { coins: 20000 },
    description: "Increases maximum seeds to 100,000",
    deriveOwned(gameState) {
      return gameState.seedMax >= 100000;
    },
    onPurchase(gameState) {
      gameState.seedMax = Math.max(gameState.seedMax, 100000);
    }
  },
  avianRepopulation: {
    id: "avianRepopulation",
    legacyPurchasedKey: "avianRepopulationPurchased",
    name: "Avian Repopulation",
    page: "birdCatching",
    section: "trapCostSeeds",
    order: 1,
    oneTime: true,
    costs: { seeds: 100000 },
    description: "Resets seed bait cost to 1k seeds",
    onPurchase(gameState) {
      gameState.trapLoadCost = 1000;
    }
  },
  wildlifeRestoration: {
    id: "wildlifeRestoration",
    legacyPurchasedKey: "wildlifeRestorationPurchased",
    name: "Wildlife Restoration",
    page: "birdCatching",
    section: "trapCostSeeds",
    order: 2,
    oneTime: true,
    costs: { seeds: 1000000 },
    description: "Resets seed bait cost to 10k seeds",
    onPurchase(gameState) {
      gameState.trapLoadCost = 10000;
    }
  },
  newSubstrate: {
    id: "newSubstrate",
    legacyPurchasedKey: "newSubstratePurchased",
    name: "New Substrate",
    page: "birdCatching",
    section: "trapCostGrubs",
    order: 1,
    oneTime: true,
    costs: { hardwood: 20 },
    description: "Resets grub bait cost to 20 grubs",
    onPurchase(gameState) {
      gameState.trapGrubLoadCost = 20;
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
    costs: { grubs: 1000 },
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
    costs: { twigs: 15000 },
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
    costs: { coins: 100000 },
    description: "Increases grubs per click by 2",
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
    description: "Increases maximum grubs to 100k",
    deriveOwned(gameState) {
      return gameState.grubMax >= 100000;
    },
    onPurchase(gameState) {
      gameState.grubMax = Math.max(gameState.grubMax, 100000);
    }
  },
  birdPoweredBlades: {
    id: "birdPoweredBlades",
    name: "Birdpowered Blades",
    page: "earthworks",
    section: "processingTime",
    order: 1,
    oneTime: true,
    costs: { scrap: 5, coins: 80000 },
    requirements: { individuals: 100 },
    description: "Reduces sawmill processing time by 20%",
    canPurchase(gameState) {
      return hasUpgrade(gameState, "constructSawmill");
    },
    modifySawmillProcessingDurationMs(processingDurationMs) {
      return processingDurationMs * 0.8;
    }
  },
  twigCompactor: {
    id: "twigCompactor",
    name: "Twig Compactor",
    page: "earthworks",
    section: "processingCost",
    order: 1,
    oneTime: true,
    costs: { scrap: 10, coins: 50000 },
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
  seedDispersal: {
    id: "seedDispersal",
    legacyPurchasedKey: "seedDispersalPurchased",
    name: "Seed Dispersal",
    page: "aviary",
    section: "resourceGeneration",
    order: 1,
    oneTime: true,
    requirements: { birds: { mourningdove: 2 } },
    description: "Grants a free Pear Tree and increases the Pear Tree max by 1",
    modifyTreeMaxCount(maxTreeCount, context) {
      if (context.treeKey === "pearTrees") {
        return maxTreeCount + 1;
      }

      return maxTreeCount;
    },
    onPurchase(gameState) {
      gameState.pearTrees += 1;
    }
  },
  murderParty: {
    id: "murderParty",
    legacyPurchasedKey: "murderPartyPurchased",
    name: "Murder Party",
    page: "aviary",
    section: "populationBonuses",
    order: 1,
    oneTime: true,
    requirements: { birds: { crow: 3 } },
    description: "Doubles visitors per day generated by crows",
    modifyVisitorsPerDay(visitorRate, context) {
      if (context.bird.id === "crow" && getBirdCountById(context.gameState, "crow") >= 3) {
        return visitorRate * 2;
      }

      return visitorRate;
    }
  },
  turtleWake: {
    id: "turtleWake",
    legacyPurchasedKey: "turtleWakePurchased",
    name: "Turtle Wake",
    page: "aviary",
    section: "populationBonuses",
    order: 2,
    oneTime: true,
    requirements: { birds: { mourningdove: 5 } },
    description: "Mourning Doves start generating 0.04 twigs per second",
    modifyTwigRatePerSecond(twigRate, context) {
      if (context.bird.id === "mourningdove" && getBirdCountById(context.gameState, "mourningdove") >= 5) {
        return twigRate + 0.04;
      }

      return twigRate;
    }
  },
  flockForestry: {
    id: "flockForestry",
    legacyPurchasedKey: "flockForestryPurchased",
    name: "Flock Forestry",
    page: "aviary",
    section: "resourceGeneration",
    order: 2,
    oneTime: true,
    costs: { coins: 50000 },
    requirements: { species: 7 },
    description: "Doubles seeds per second and twigs per second generated by birds",
    modifySeedRatePerSecond(seedRate) {
      return seedRate * 2;
    },
    modifyTwigRatePerSecond(twigRate) {
      return twigRate * 2;
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
    costs: { coins: 1000 },
    requirements: { species: 3 },
    description: "Adds +0.1 coins/sec for every visitor per day",
    modifyCoinsPerVisitorRate(coinsPerVisitorRate) {
      return coinsPerVisitorRate + 0.1;
    }
  },
  indoorGarden: {
    id: "indoorGarden",
    legacyPurchasedKey: "indoorGardenPurchased",
    name: "Indoor Garden",
    page: "aviary",
    section: "amenities",
    order: 2,
    oneTime: true,
    costs: { seeds: 10000 },
    requirements: { birds: { kestrel: 2 } },
    description: "Doubles twigs per second generated by kestrels",
    modifyTwigRatePerSecond(twigRate, context) {
      if (context.bird.id === "kestrel") {
        return twigRate * 2;
      }

      return twigRate;
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
  },
  simpleSafe: {
    id: "simpleSafe",
    name: "Simple Safe",
    page: "aviary",
    section: "treasury",
    order: 3,
    oneTime: true,
    costs: { scrap: 10 },
    description: "Increases maximum coins to 10M",
    deriveOwned(gameState) {
      return gameState.coinMax >= 10000000;
    },
    onPurchase(gameState) {
      gameState.coinMax = Math.max(gameState.coinMax, 10000000);
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
    costs: { hardwood: 100, coins: 200000 },
    description: "Unlocks Harbor voyages and grants 2 Voyage Tickets",
    onPurchase(gameState) {
      addItemCount(gameState, "voyageticket", 2);
      gameState.dockyardHarborGiftPending = true;
    }
  },
  dredger: {
    id: "dredger",
    name: "Dredger",
    page: "dockyard",
    section: "harbor",
    order: 2,
    oneTime: true,
    costs: { coins: 500000 },
    description: "Adds 5 scrap and 5% treasure chance to each voyage",
    canPurchase(gameState) {
      return hasUpgrade(gameState, "constructHarbor");
    },
    onPurchase(gameState) {
      gameState.dockyardScrapPerVoyage += 5;
      gameState.dockyardTreasureChance += 0.05;
    }
  }
};

const UPGRADE_LIBRARY = {
  ...BIRD_CATCHING_UPGRADES,
  ...EARTHWORKS_UPGRADES,
  ...AVIARY_UPGRADES,
  ...DOCKYARD_UPGRADES
};
