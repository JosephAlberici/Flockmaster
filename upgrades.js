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
    costs: { coins: 20000 },
    description: "Increases maximum seeds to 100,000",
    deriveOwned(gameState) {
      return gameState.seedMax >= 100000;
    },
    onPurchase(gameState) {
      gameState.seedMax = Math.max(gameState.seedMax, 100000);
    }
  },
  seedVault: {
    id: "seedVault",
    name: "Seed Vault",
    page: "birdCatching",
    section: "storage",
    order: 3,
    oneTime: true,
    costs: { coins: 250000 },
    description: "Increases maximum seeds to 1,000,000",
    deriveOwned(gameState) {
      return gameState.seedMax >= 1000000;
    },
    onPurchase(gameState) {
      gameState.seedMax = Math.max(gameState.seedMax, 1000000);
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
    oneTime: false,
    costs: { seeds: 1000000 },
    description: "Resets seed bait cost to 50k seeds",
    onPurchase(gameState) {
      gameState.trapLoadCost = 50000;
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
    description: "Resets grub bait cost to 100 grubs",
    onPurchase(gameState) {
      gameState.trapGrubLoadCost = 100;
    }
  },
  grubBreeding: {
    id: "grubBreeding",
    name: "Grub Breeding",
    page: "birdCatching",
    section: "trapCostGrubs",
    order: 2,
    oneTime: false,
    costs: { grubs: 100000 },
    description: "Resets grub bait cost to 5k grubs",
    onPurchase(gameState) {
      gameState.trapGrubLoadCost = 5000;
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
    costs: { coins: 500 },
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
  seedDispersal: {
    id: "seedDispersal",
    legacyPurchasedKey: "seedDispersalPurchased",
    name: "Seed Dispersal",
    page: "aviary",
    section: "resourceGeneration",
    order: 1,
    oneTime: true,
    costs: { birds: { mourningdove: 2 } },
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
    costs: { birds: { crow: 3 } },
    description: "Doubles visitors per day generated by crows",
    modifyVisitorsPerDay(visitorRate, context) {
      if (context.bird.id === "crow") {
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
    costs: { birds: { mourningdove: 5 } },
    description: "Mourning Doves start generating 2.4 twigs per minute",
    modifyTwigRatePerMinute(twigRate, context) {
      if (context.bird.id === "mourningdove") {
        return twigRate + 2.4;
      }

      return twigRate;
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
    description: "Adds +20 coins per visitor",
    modifyCoinsPerVisitorRate(coinsPerVisitorRate) {
      return coinsPerVisitorRate + 20;
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
    costs: { hardwood: 100, coins: 10000 },
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
    costs: { coins: 25000 },
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
