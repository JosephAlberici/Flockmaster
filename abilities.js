// Central ability catalog
// Each key is an ability id that birds can reference in birds.js.
// The metadata here is used for UI text, and optional handler functions are called by game.js when that ability matters.
const ABILITIES = {
  baitfisher: {
    name: "Baitfisher",
    description: "Increase fish per voyage (+1 per individual)",

    modifyFishPerVoyage(dockyardFishPerVoyage, context){
      return dockyardFishPerVoyage + context.totalIndividuals;
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
    description: "Increases coins per visitor (0.05 per mascot species acquired)",

    // Reward broad flock variety rather than raw mascot headcount.
    modifyCoinsPerVisitorRate(currentCoinsPerVisitorRate, context) {
      return currentCoinsPerVisitorRate + (context.totalSpecies * 0.05);
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
    description: "Can supervise the sawmill and trigger automatic twig processing when a threshold is met"
  },
  treePeck: {
    name: "Tree Peck",
    description: "Lowers seed bait cost by 20% of its current value per individual",

    // Reduce the seed bait cost once for each bird carrying this ability.
    modifyTrapSeedCost(currentCost, context) {
      return currentCost * Math.pow(0.8, context.totalIndividuals);
    }
  }
};
