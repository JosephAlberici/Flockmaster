// Central ability catalog
// Each key is an ability id that birds can reference in birds.js.
// The metadata here is used for UI text, and optional handler functions are called by game.js when that ability matters.
const ABILITIES = {
  baitfisher: {
    name: "Baitfisher",
    description: "Increase fish per voyage by 1 per individual with the ability",

    modifyFishPerVoyage(dockyardFishPerVoyage, context){
      return dockyardFishPerVoyage + context.totalIndividuals;
    }
  },
  globalist: {
    name: "Globalist",
    description: "Awards 1 Seed Bait Ticket per individual whenever a new habitat is constructed",

    modifyHabitatConstructionSeedBaitTickets(currentSeedBaitTickets, context) {
      return currentSeedBaitTickets + context.totalIndividuals;
    }
  },
  dimorphic: {
    name: "Dimorphic",
    description: "Visitors per day from this species doubles after acquiring both a male and a female",

    // Double visitor output once both visual variants have been collected.
    modifyVisitorsPerDay(currentVisitorsPerDay, context) {
      const variantCounts = context.bird.variantCounts || {};

      if ((variantCounts.male || 0) > 0 && (variantCounts.female || 0) > 0) {
        return currentVisitorsPerDay * 2;
      }

      return currentVisitorsPerDay;
    }
  },
  mascot: {
    name: "Mascot",
    description: "Increases coins per visitor by 100 per mascot species acquired",

    // Reward broad flock variety rather than raw mascot headcount.
    modifyCoinsPerVisitorRate(currentCoinsPerVisitorRate, context) {
      return currentCoinsPerVisitorRate + (context.totalSpecies * 100);
    }
  },
  mudSweeper: {
    name: "Mud Sweeper",
    description: "Adds a 1% chance per individual to crit on grub hunting clicks",

    modifyGrubHuntCritChance(currentCritChance, context) {
      return currentCritChance + (context.totalIndividuals * 0.01);
    },

    modifyGrubHuntCritMultiplier(currentCritMultiplier, context) {
      if (context.totalIndividuals <= 0) {
        return currentCritMultiplier;
      }

      return Math.max(currentCritMultiplier, 5);
    }
  },
  nocturnal: {
    name: "Nocturnal",
    description: "Increases max offline duration by 10 minutes per individual, up to 24 hours",

    // Extend the passive-income time cap before the global 24-hour clamp is applied.
    modifyMaxOfflineDurationMs(currentMaxOfflineDurationMs, context) {
      return currentMaxOfflineDurationMs + (context.totalIndividuals * 10 * 60 * 1000);
    }
  },
  parasite: {
    // Parasite drives target-selection UI and copied-stat resolution, so it stays
    // as dedicated metadata instead of pretending to be a simple numeric modifier.
    name: "Parasite",
    description: "Can inherit the current stats of a target species from the same habitat. Starts limited to Common targets"
  },
  pickpocket: {
    name: "Pickpocket",
    description: "Once per day, receive a random reward per species with this ability in your flock"
  },
  predator: {
    name: "Predator",
    description: "Improves catch rate when using seed bait by 2% per individual with the ability up to a maximum of 10%",
    baseMaxBonus: 0.1,
    upgradeBonusStep: 0.05,

    // Use the shared predator cap logic in game.js, but let the ability own the
    // catch-rate hook so it fits the same modifier pipeline as other abilities.
    modifyCatchRate(currentCatchRate, context) {
      return currentCatchRate + getPredatorCatchRateBonus(context.gameState, context.baitType);
    }
  },
  overseer: {
    // Overseer powers assignment/automation systems on specific pages, so it also
    // stays metadata-driven rather than joining the global modifier hooks.
    name: "Overseer",
    description: "Can supervise and automate timed processes (sawmill, harbor)"
  },
  deepSeaDiver: {
    name: "Deep Sea Diver",
    description: "Increases Harbor treasure chance by 1% per individual",

    modifyVoyageTreasureChance(currentTreasureChance, context) {
      return currentTreasureChance + (context.totalIndividuals * 0.01);
    }
  },
  spearfishing: {
    name: "Spearfishing",
    description: "Gives a 1% chance per individual to double fish returned from a Harbor voyage",

    modifyVoyageFishDoubleChance(currentDoubleChance, context) {
      return currentDoubleChance + (context.totalIndividuals * 0.01);
    }
  },
  treePeck: {
    name: "Tree Peck",
    description: "Lowers seed bait cost by 20% of its current value per individual",

    // Reduce the seed bait cost once for each bird carrying this ability.
    modifyTrapSeedCost(currentCost, context) {
      return currentCost * Math.pow(0.8, context.totalIndividuals);
    }
  },
  prizedFalconry: {
    name: "Prized Falconry",
    description: "Can be fed 10 Rock Ptarmigans in the Aviary to receive 1 feeder mouse"
  }
};
