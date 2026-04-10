// Central ability catalog
// Each key is an ability id that birds can reference in birds.js.
// The metadata here is used for UI text, and optional handler functions are called by game.js when that ability matters.
const ABILITIES = {
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
  nocturnal: {
    name: "Nocturnal",
    description: "Increases max offline duration by 10 minutes per individual, up to 24 hours"
  },
  parasite: {
    name: "Parasite",
    description: "Can inherit the current stats of a target species from the same habitat. Starts limited to Common targets"
  },
  predator: {
    name: "Predator",
    description: "Improves catch rate when using seed bait by 2% per individual. Max bonus starts at 10% and increases by 5% per Predator upgrade",
    baseMaxBonus: 0.1,
    upgradeBonusStep: 0.05
  },
  overseer: {
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
