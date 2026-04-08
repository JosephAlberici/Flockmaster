// Central ability catalog. Shared abilities can define reusable handlers here.
const ABILITIES = {
  dimorphic: {
    name: "Dimorphic",
    description: "Visitors per day from this species doubles after acquiring both a male and a female.",

    // Double visitor output once both visual variants have been collected.
    modifyVisitorsPerDay(currentVisitorsPerDay, context) {
      const variantCounts = context.bird.variantCounts || {};

      if ((variantCounts.male || 0) > 0 && (variantCounts.female || 0) > 0) {
        return currentVisitorsPerDay * 2;
      }

      return currentVisitorsPerDay;
    }
  },
  treePeck: {
    name: "Tree Peck",
    description: "Lowers seed bait cost by 20% of its current value per individual.",

    // Reduce the seed bait cost once for each bird carrying this ability.
    modifyTrapSeedCost(currentCost, context) {
      return currentCost * Math.pow(0.8, context.totalIndividuals);
    }
  }
};
