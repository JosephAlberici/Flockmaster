// Species-specific tech trees live separately from birds.js and upgrades.js so
// bird identity data stays lightweight while per-species progression remains
// easy to scan and extend habitat by habitat.
//
// Each bird now has an explicit editable tree entry below so species upgrades
// can gradually diverge from the shared placeholder scaffold without fighting
// a runtime generator.
const SPECIES_UPGRADE_LIBRARY = {
  crow: [
    {
      id: "crowTier1A",
      name: "Pickpocket 1",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          crow: 1
        }
      },
      description: "The American Crow now has the ability pickpocket!"
    },
    {
      id: "crowTier2A",
      name: "Handyman 1",
      order: 2,
      tier: 2,
      parents: [
        "crowTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          crow: 5
        }
      },
      description: "Obtaining a crow with a seed ticket refunds the ticket."
    },
    {
      id: "crowTier2B",
      name: "Pickpocket 2",
      order: 3,
      tier: 2,
      parents: [
        "crowTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          crow: 3
        }
      },
      description: "Improves rewards obtained via the Pickpocket ability."
    },
    {
      id: "crowTier3A",
      name: "Handyman 2",
      order: 4,
      tier: 3,
      parents: [
        "crowTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          crow: 5
        }
      },
      description: "Catching a crow with seed bait refunds the used seeds."
    },
    {
      id: "crowTier3B",
      name: "Ooh Shiny 1",
      order: 5,
      tier: 3,
      parents: [
        "crowTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          crow: 5
        }
      },
      description: "Doubles coin rewards from Pickpocket."
    },
    {
      id: "crowTier3C",
      name: "Pickpocket 3",
      order: 6,
      tier: 3,
      parents: [
        "crowTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          crow: 5
        }
      },
      description: "Improves rewards obtained via the Pickpocket ability."
    },
    {
      id: "crowTier4A",
      name: "Irridescence",
      order: 7,
      tier: 4,
      parents: [
        "crowTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          crow: 7
        }
      },
      description: "Catching a crow rewards 5 scrap."
    },
    {
      id: "crowTier4B",
      name: "Ooh Shiny 2",
      order: 8,
      tier: 4,
      parents: [
        "crowTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          crow: 7
        }
      },
      description: "Doubles coin rewards from Pickpocket again (4x total boost)."
    },
    {
      id: "crowFinalA",
      name: "Mastermind",
      order: 11,
      finalTier: true,
      parents: [
        "crowTier4A",
        "crowTier4B",
        "crowTier4C",
        "crowTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          crow: 10
        }
      },
      description: "Improves odds of catching legendary birds (+1% Legendary, -1% Common)."
    }
  ],
  pigeon: [
    {
      id: "pigeonTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 1
        }
      },
      description: "Starting point for the Rock Pigeon tree. Placeholder node for early progression."
    },
    {
      id: "pigeonTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "pigeonTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 2
        }
      },
      description: "Left branch placeholder for the Rock Pigeon tree."
    },
    {
      id: "pigeonTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "pigeonTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 2
        }
      },
      description: "Right branch placeholder for the Rock Pigeon tree."
    },
    {
      id: "pigeonTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "pigeonTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Rock Pigeon tree."
    },
    {
      id: "pigeonTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "pigeonTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Rock Pigeon tree."
    },
    {
      id: "pigeonTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "pigeonTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Rock Pigeon tree."
    },
    {
      id: "pigeonTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "pigeonTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 4
        }
      },
      description: "Upper fourth-tier placeholder for Rock Pigeon."
    },
    {
      id: "pigeonTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "pigeonTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Rock Pigeon."
    },
    {
      id: "pigeonTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "pigeonTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Rock Pigeon."
    },
    {
      id: "pigeonTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "pigeonTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 4
        }
      },
      description: "Lower fourth-tier placeholder for Rock Pigeon."
    },
    {
      id: "pigeonFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "pigeonTier4A",
        "pigeonTier4B",
        "pigeonTier4C",
        "pigeonTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          pigeon: 6
        }
      },
      description: "Final placeholder node for Rock Pigeon that depends on the full branch network."
    }
  ],
  kestrel: [
    {
      id: "kestrelTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 1
        }
      },
      description: "Starting point for the American Kestrel tree. Placeholder node for early progression."
    },
    {
      id: "kestrelTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "kestrelTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 2
        }
      },
      description: "Left branch placeholder for the American Kestrel tree."
    },
    {
      id: "kestrelTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "kestrelTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 2
        }
      },
      description: "Right branch placeholder for the American Kestrel tree."
    },
    {
      id: "kestrelTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "kestrelTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the American Kestrel tree."
    },
    {
      id: "kestrelTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "kestrelTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the American Kestrel tree."
    },
    {
      id: "kestrelTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "kestrelTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the American Kestrel tree."
    },
    {
      id: "kestrelTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "kestrelTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 4
        }
      },
      description: "Upper fourth-tier placeholder for American Kestrel."
    },
    {
      id: "kestrelTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "kestrelTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for American Kestrel."
    },
    {
      id: "kestrelTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "kestrelTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for American Kestrel."
    },
    {
      id: "kestrelTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "kestrelTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 4
        }
      },
      description: "Lower fourth-tier placeholder for American Kestrel."
    },
    {
      id: "kestrelFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "kestrelTier4A",
        "kestrelTier4B",
        "kestrelTier4C",
        "kestrelTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          kestrel: 6
        }
      },
      description: "Final placeholder node for American Kestrel that depends on the full branch network."
    }
  ],
  bluejay: [
    {
      id: "bluejayTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 1
        }
      },
      description: "Starting point for the Blue Jay tree. Placeholder node for early progression."
    },
    {
      id: "bluejayTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "bluejayTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 2
        }
      },
      description: "Left branch placeholder for the Blue Jay tree."
    },
    {
      id: "bluejayTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "bluejayTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 2
        }
      },
      description: "Right branch placeholder for the Blue Jay tree."
    },
    {
      id: "bluejayTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "bluejayTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Blue Jay tree."
    },
    {
      id: "bluejayTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "bluejayTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Blue Jay tree."
    },
    {
      id: "bluejayTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "bluejayTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Blue Jay tree."
    },
    {
      id: "bluejayTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "bluejayTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 4
        }
      },
      description: "Upper fourth-tier placeholder for Blue Jay."
    },
    {
      id: "bluejayTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "bluejayTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Blue Jay."
    },
    {
      id: "bluejayTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "bluejayTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Blue Jay."
    },
    {
      id: "bluejayTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "bluejayTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 4
        }
      },
      description: "Lower fourth-tier placeholder for Blue Jay."
    },
    {
      id: "bluejayFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "bluejayTier4A",
        "bluejayTier4B",
        "bluejayTier4C",
        "bluejayTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          bluejay: 6
        }
      },
      description: "Final placeholder node for Blue Jay that depends on the full branch network."
    }
  ],
  mourningdove: [
    {
      id: "mourningdoveTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 1
        }
      },
      description: "Starting point for the Mourning Dove tree. Placeholder node for early progression."
    },
    {
      id: "mourningdoveTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "mourningdoveTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 2
        }
      },
      description: "Left branch placeholder for the Mourning Dove tree."
    },
    {
      id: "mourningdoveTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "mourningdoveTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 2
        }
      },
      description: "Right branch placeholder for the Mourning Dove tree."
    },
    {
      id: "mourningdoveTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "mourningdoveTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Mourning Dove tree."
    },
    {
      id: "mourningdoveTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "mourningdoveTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Mourning Dove tree."
    },
    {
      id: "mourningdoveTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "mourningdoveTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Mourning Dove tree."
    },
    {
      id: "mourningdoveTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "mourningdoveTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 4
        }
      },
      description: "Upper fourth-tier placeholder for Mourning Dove."
    },
    {
      id: "mourningdoveTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "mourningdoveTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Mourning Dove."
    },
    {
      id: "mourningdoveTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "mourningdoveTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Mourning Dove."
    },
    {
      id: "mourningdoveTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "mourningdoveTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 4
        }
      },
      description: "Lower fourth-tier placeholder for Mourning Dove."
    },
    {
      id: "mourningdoveFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "mourningdoveTier4A",
        "mourningdoveTier4B",
        "mourningdoveTier4C",
        "mourningdoveTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          mourningdove: 6
        }
      },
      description: "Final placeholder node for Mourning Dove that depends on the full branch network."
    }
  ],
  pileatedwoodpecker: [
    {
      id: "pileatedwoodpeckerTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 1
        }
      },
      description: "Starting point for the Pileated Woodpecker tree. Placeholder node for early progression."
    },
    {
      id: "pileatedwoodpeckerTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "pileatedwoodpeckerTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 2
        }
      },
      description: "Left branch placeholder for the Pileated Woodpecker tree."
    },
    {
      id: "pileatedwoodpeckerTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "pileatedwoodpeckerTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 2
        }
      },
      description: "Right branch placeholder for the Pileated Woodpecker tree."
    },
    {
      id: "pileatedwoodpeckerTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "pileatedwoodpeckerTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Pileated Woodpecker tree."
    },
    {
      id: "pileatedwoodpeckerTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "pileatedwoodpeckerTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Pileated Woodpecker tree."
    },
    {
      id: "pileatedwoodpeckerTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "pileatedwoodpeckerTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Pileated Woodpecker tree."
    },
    {
      id: "pileatedwoodpeckerTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "pileatedwoodpeckerTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 4
        }
      },
      description: "Upper fourth-tier placeholder for Pileated Woodpecker."
    },
    {
      id: "pileatedwoodpeckerTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "pileatedwoodpeckerTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Pileated Woodpecker."
    },
    {
      id: "pileatedwoodpeckerTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "pileatedwoodpeckerTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Pileated Woodpecker."
    },
    {
      id: "pileatedwoodpeckerTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "pileatedwoodpeckerTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 4
        }
      },
      description: "Lower fourth-tier placeholder for Pileated Woodpecker."
    },
    {
      id: "pileatedwoodpeckerFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "pileatedwoodpeckerTier4A",
        "pileatedwoodpeckerTier4B",
        "pileatedwoodpeckerTier4C",
        "pileatedwoodpeckerTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          pileatedwoodpecker: 6
        }
      },
      description: "Final placeholder node for Pileated Woodpecker that depends on the full branch network."
    }
  ],
  cardinal: [
    {
      id: "cardinalTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 1
        }
      },
      description: "Starting point for the Northern Cardinal tree. Placeholder node for early progression."
    },
    {
      id: "cardinalTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "cardinalTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 2
        }
      },
      description: "Left branch placeholder for the Northern Cardinal tree."
    },
    {
      id: "cardinalTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "cardinalTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 2
        }
      },
      description: "Right branch placeholder for the Northern Cardinal tree."
    },
    {
      id: "cardinalTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "cardinalTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Northern Cardinal tree."
    },
    {
      id: "cardinalTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "cardinalTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Northern Cardinal tree."
    },
    {
      id: "cardinalTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "cardinalTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Northern Cardinal tree."
    },
    {
      id: "cardinalTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "cardinalTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 4
        }
      },
      description: "Upper fourth-tier placeholder for Northern Cardinal."
    },
    {
      id: "cardinalTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "cardinalTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Northern Cardinal."
    },
    {
      id: "cardinalTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "cardinalTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Northern Cardinal."
    },
    {
      id: "cardinalTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "cardinalTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 4
        }
      },
      description: "Lower fourth-tier placeholder for Northern Cardinal."
    },
    {
      id: "cardinalFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "cardinalTier4A",
        "cardinalTier4B",
        "cardinalTier4C",
        "cardinalTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          cardinal: 6
        }
      },
      description: "Final placeholder node for Northern Cardinal that depends on the full branch network."
    }
  ],
  nuthatch: [
    {
      id: "nuthatchTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 1
        }
      },
      description: "Starting point for the White-Breasted Nuthatch tree. Placeholder node for early progression."
    },
    {
      id: "nuthatchTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "nuthatchTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 2
        }
      },
      description: "Left branch placeholder for the White-Breasted Nuthatch tree."
    },
    {
      id: "nuthatchTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "nuthatchTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 2
        }
      },
      description: "Right branch placeholder for the White-Breasted Nuthatch tree."
    },
    {
      id: "nuthatchTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "nuthatchTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the White-Breasted Nuthatch tree."
    },
    {
      id: "nuthatchTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "nuthatchTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the White-Breasted Nuthatch tree."
    },
    {
      id: "nuthatchTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "nuthatchTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the White-Breasted Nuthatch tree."
    },
    {
      id: "nuthatchTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "nuthatchTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 4
        }
      },
      description: "Upper fourth-tier placeholder for White-Breasted Nuthatch."
    },
    {
      id: "nuthatchTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "nuthatchTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for White-Breasted Nuthatch."
    },
    {
      id: "nuthatchTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "nuthatchTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for White-Breasted Nuthatch."
    },
    {
      id: "nuthatchTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "nuthatchTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 4
        }
      },
      description: "Lower fourth-tier placeholder for White-Breasted Nuthatch."
    },
    {
      id: "nuthatchFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "nuthatchTier4A",
        "nuthatchTier4B",
        "nuthatchTier4C",
        "nuthatchTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          nuthatch: 6
        }
      },
      description: "Final placeholder node for White-Breasted Nuthatch that depends on the full branch network."
    }
  ],
  screechowl: [
    {
      id: "screechowlTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 1
        }
      },
      description: "Starting point for the Eastern Screech Owl tree. Placeholder node for early progression."
    },
    {
      id: "screechowlTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "screechowlTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 2
        }
      },
      description: "Left branch placeholder for the Eastern Screech Owl tree."
    },
    {
      id: "screechowlTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "screechowlTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 2
        }
      },
      description: "Right branch placeholder for the Eastern Screech Owl tree."
    },
    {
      id: "screechowlTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "screechowlTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Eastern Screech Owl tree."
    },
    {
      id: "screechowlTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "screechowlTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Eastern Screech Owl tree."
    },
    {
      id: "screechowlTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "screechowlTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Eastern Screech Owl tree."
    },
    {
      id: "screechowlTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "screechowlTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 4
        }
      },
      description: "Upper fourth-tier placeholder for Eastern Screech Owl."
    },
    {
      id: "screechowlTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "screechowlTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Eastern Screech Owl."
    },
    {
      id: "screechowlTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "screechowlTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Eastern Screech Owl."
    },
    {
      id: "screechowlTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "screechowlTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 4
        }
      },
      description: "Lower fourth-tier placeholder for Eastern Screech Owl."
    },
    {
      id: "screechowlFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "screechowlTier4A",
        "screechowlTier4B",
        "screechowlTier4C",
        "screechowlTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          screechowl: 6
        }
      },
      description: "Final placeholder node for Eastern Screech Owl that depends on the full branch network."
    }
  ],
  nighthawk: [
    {
      id: "nighthawkTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 1
        }
      },
      description: "Starting point for the Common Nighthawk tree. Placeholder node for early progression."
    },
    {
      id: "nighthawkTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "nighthawkTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 2
        }
      },
      description: "Left branch placeholder for the Common Nighthawk tree."
    },
    {
      id: "nighthawkTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "nighthawkTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 2
        }
      },
      description: "Right branch placeholder for the Common Nighthawk tree."
    },
    {
      id: "nighthawkTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "nighthawkTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Common Nighthawk tree."
    },
    {
      id: "nighthawkTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "nighthawkTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Common Nighthawk tree."
    },
    {
      id: "nighthawkTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "nighthawkTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Common Nighthawk tree."
    },
    {
      id: "nighthawkTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "nighthawkTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 4
        }
      },
      description: "Upper fourth-tier placeholder for Common Nighthawk."
    },
    {
      id: "nighthawkTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "nighthawkTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Common Nighthawk."
    },
    {
      id: "nighthawkTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "nighthawkTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Common Nighthawk."
    },
    {
      id: "nighthawkTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "nighthawkTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 4
        }
      },
      description: "Lower fourth-tier placeholder for Common Nighthawk."
    },
    {
      id: "nighthawkFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "nighthawkTier4A",
        "nighthawkTier4B",
        "nighthawkTier4C",
        "nighthawkTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          nighthawk: 6
        }
      },
      description: "Final placeholder node for Common Nighthawk that depends on the full branch network."
    }
  ],
  shrike: [
    {
      id: "shrikeTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          shrike: 1
        }
      },
      description: "Starting point for the Loggerhead Shrike tree. Placeholder node for early progression."
    },
    {
      id: "shrikeTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "shrikeTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          shrike: 2
        }
      },
      description: "Left branch placeholder for the Loggerhead Shrike tree."
    },
    {
      id: "shrikeTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "shrikeTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          shrike: 2
        }
      },
      description: "Right branch placeholder for the Loggerhead Shrike tree."
    },
    {
      id: "shrikeTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "shrikeTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          shrike: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Loggerhead Shrike tree."
    },
    {
      id: "shrikeTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "shrikeTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          shrike: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Loggerhead Shrike tree."
    },
    {
      id: "shrikeTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "shrikeTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          shrike: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Loggerhead Shrike tree."
    },
    {
      id: "shrikeTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "shrikeTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          shrike: 4
        }
      },
      description: "Upper fourth-tier placeholder for Loggerhead Shrike."
    },
    {
      id: "shrikeTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "shrikeTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          shrike: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Loggerhead Shrike."
    },
    {
      id: "shrikeTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "shrikeTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          shrike: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Loggerhead Shrike."
    },
    {
      id: "shrikeTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "shrikeTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          shrike: 4
        }
      },
      description: "Lower fourth-tier placeholder for Loggerhead Shrike."
    },
    {
      id: "shrikeFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "shrikeTier4A",
        "shrikeTier4B",
        "shrikeTier4C",
        "shrikeTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          shrike: 6
        }
      },
      description: "Final placeholder node for Loggerhead Shrike that depends on the full branch network."
    }
  ],
  cowbird: [
    {
      id: "cowbirdTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 1
        }
      },
      description: "Starting point for the Brown-Headed Cowbird tree. Placeholder node for early progression."
    },
    {
      id: "cowbirdTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "cowbirdTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 2
        }
      },
      description: "Left branch placeholder for the Brown-Headed Cowbird tree."
    },
    {
      id: "cowbirdTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "cowbirdTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 2
        }
      },
      description: "Right branch placeholder for the Brown-Headed Cowbird tree."
    },
    {
      id: "cowbirdTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "cowbirdTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Brown-Headed Cowbird tree."
    },
    {
      id: "cowbirdTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "cowbirdTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Brown-Headed Cowbird tree."
    },
    {
      id: "cowbirdTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "cowbirdTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Brown-Headed Cowbird tree."
    },
    {
      id: "cowbirdTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "cowbirdTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 4
        }
      },
      description: "Upper fourth-tier placeholder for Brown-Headed Cowbird."
    },
    {
      id: "cowbirdTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "cowbirdTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Brown-Headed Cowbird."
    },
    {
      id: "cowbirdTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "cowbirdTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Brown-Headed Cowbird."
    },
    {
      id: "cowbirdTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "cowbirdTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 4
        }
      },
      description: "Lower fourth-tier placeholder for Brown-Headed Cowbird."
    },
    {
      id: "cowbirdFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "cowbirdTier4A",
        "cowbirdTier4B",
        "cowbirdTier4C",
        "cowbirdTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          cowbird: 6
        }
      },
      description: "Final placeholder node for Brown-Headed Cowbird that depends on the full branch network."
    }
  ],
  redTailedHawk: [
    {
      id: "redTailedHawkTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 1
        }
      },
      description: "Starting point for the Red-Tailed Hawk tree. Placeholder node for early progression."
    },
    {
      id: "redTailedHawkTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "redTailedHawkTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 2
        }
      },
      description: "Left branch placeholder for the Red-Tailed Hawk tree."
    },
    {
      id: "redTailedHawkTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "redTailedHawkTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 2
        }
      },
      description: "Right branch placeholder for the Red-Tailed Hawk tree."
    },
    {
      id: "redTailedHawkTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "redTailedHawkTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Red-Tailed Hawk tree."
    },
    {
      id: "redTailedHawkTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "redTailedHawkTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Red-Tailed Hawk tree."
    },
    {
      id: "redTailedHawkTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "redTailedHawkTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Red-Tailed Hawk tree."
    },
    {
      id: "redTailedHawkTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "redTailedHawkTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 4
        }
      },
      description: "Upper fourth-tier placeholder for Red-Tailed Hawk."
    },
    {
      id: "redTailedHawkTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "redTailedHawkTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Red-Tailed Hawk."
    },
    {
      id: "redTailedHawkTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "redTailedHawkTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Red-Tailed Hawk."
    },
    {
      id: "redTailedHawkTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "redTailedHawkTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 4
        }
      },
      description: "Lower fourth-tier placeholder for Red-Tailed Hawk."
    },
    {
      id: "redTailedHawkFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "redTailedHawkTier4A",
        "redTailedHawkTier4B",
        "redTailedHawkTier4C",
        "redTailedHawkTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          redTailedHawk: 6
        }
      },
      description: "Final placeholder node for Red-Tailed Hawk that depends on the full branch network."
    }
  ],
  mallard: [
    {
      id: "mallardTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          mallard: 1
        }
      },
      description: "Starting point for the Mallard tree. Placeholder node for early progression."
    },
    {
      id: "mallardTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "mallardTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          mallard: 2
        }
      },
      description: "Left branch placeholder for the Mallard tree."
    },
    {
      id: "mallardTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "mallardTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          mallard: 2
        }
      },
      description: "Right branch placeholder for the Mallard tree."
    },
    {
      id: "mallardTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "mallardTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          mallard: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Mallard tree."
    },
    {
      id: "mallardTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "mallardTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          mallard: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Mallard tree."
    },
    {
      id: "mallardTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "mallardTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          mallard: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Mallard tree."
    },
    {
      id: "mallardTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "mallardTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          mallard: 4
        }
      },
      description: "Upper fourth-tier placeholder for Mallard."
    },
    {
      id: "mallardTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "mallardTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          mallard: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Mallard."
    },
    {
      id: "mallardTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "mallardTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          mallard: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Mallard."
    },
    {
      id: "mallardTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "mallardTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          mallard: 4
        }
      },
      description: "Lower fourth-tier placeholder for Mallard."
    },
    {
      id: "mallardFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "mallardTier4A",
        "mallardTier4B",
        "mallardTier4C",
        "mallardTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          mallard: 6
        }
      },
      description: "Final placeholder node for Mallard that depends on the full branch network."
    }
  ],
  goose: [
    {
      id: "gooseTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          goose: 1
        }
      },
      description: "Starting point for the Canada Goose tree. Placeholder node for early progression."
    },
    {
      id: "gooseTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "gooseTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          goose: 2
        }
      },
      description: "Left branch placeholder for the Canada Goose tree."
    },
    {
      id: "gooseTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "gooseTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          goose: 2
        }
      },
      description: "Right branch placeholder for the Canada Goose tree."
    },
    {
      id: "gooseTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "gooseTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          goose: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Canada Goose tree."
    },
    {
      id: "gooseTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "gooseTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          goose: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Canada Goose tree."
    },
    {
      id: "gooseTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "gooseTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          goose: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Canada Goose tree."
    },
    {
      id: "gooseTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "gooseTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          goose: 4
        }
      },
      description: "Upper fourth-tier placeholder for Canada Goose."
    },
    {
      id: "gooseTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "gooseTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          goose: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Canada Goose."
    },
    {
      id: "gooseTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "gooseTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          goose: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Canada Goose."
    },
    {
      id: "gooseTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "gooseTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          goose: 4
        }
      },
      description: "Lower fourth-tier placeholder for Canada Goose."
    },
    {
      id: "gooseFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "gooseTier4A",
        "gooseTier4B",
        "gooseTier4C",
        "gooseTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          goose: 6
        }
      },
      description: "Final placeholder node for Canada Goose that depends on the full branch network."
    }
  ],
  sandpiper: [
    {
      id: "sandpiperTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 1
        }
      },
      description: "Starting point for the Spotted Sandpiper tree. Placeholder node for early progression."
    },
    {
      id: "sandpiperTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "sandpiperTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 2
        }
      },
      description: "Left branch placeholder for the Spotted Sandpiper tree."
    },
    {
      id: "sandpiperTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "sandpiperTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 2
        }
      },
      description: "Right branch placeholder for the Spotted Sandpiper tree."
    },
    {
      id: "sandpiperTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "sandpiperTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Spotted Sandpiper tree."
    },
    {
      id: "sandpiperTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "sandpiperTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Spotted Sandpiper tree."
    },
    {
      id: "sandpiperTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "sandpiperTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Spotted Sandpiper tree."
    },
    {
      id: "sandpiperTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "sandpiperTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 4
        }
      },
      description: "Upper fourth-tier placeholder for Spotted Sandpiper."
    },
    {
      id: "sandpiperTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "sandpiperTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Spotted Sandpiper."
    },
    {
      id: "sandpiperTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "sandpiperTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Spotted Sandpiper."
    },
    {
      id: "sandpiperTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "sandpiperTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 4
        }
      },
      description: "Lower fourth-tier placeholder for Spotted Sandpiper."
    },
    {
      id: "sandpiperFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "sandpiperTier4A",
        "sandpiperTier4B",
        "sandpiperTier4C",
        "sandpiperTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          sandpiper: 6
        }
      },
      description: "Final placeholder node for Spotted Sandpiper that depends on the full branch network."
    }
  ],
  nightheron: [
    {
      id: "nightheronTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 1
        }
      },
      description: "Starting point for the Black-Crowned Night Heron tree. Placeholder node for early progression."
    },
    {
      id: "nightheronTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "nightheronTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 2
        }
      },
      description: "Left branch placeholder for the Black-Crowned Night Heron tree."
    },
    {
      id: "nightheronTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "nightheronTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 2
        }
      },
      description: "Right branch placeholder for the Black-Crowned Night Heron tree."
    },
    {
      id: "nightheronTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "nightheronTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Black-Crowned Night Heron tree."
    },
    {
      id: "nightheronTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "nightheronTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Black-Crowned Night Heron tree."
    },
    {
      id: "nightheronTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "nightheronTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Black-Crowned Night Heron tree."
    },
    {
      id: "nightheronTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "nightheronTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 4
        }
      },
      description: "Upper fourth-tier placeholder for Black-Crowned Night Heron."
    },
    {
      id: "nightheronTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "nightheronTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Black-Crowned Night Heron."
    },
    {
      id: "nightheronTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "nightheronTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Black-Crowned Night Heron."
    },
    {
      id: "nightheronTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "nightheronTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 4
        }
      },
      description: "Lower fourth-tier placeholder for Black-Crowned Night Heron."
    },
    {
      id: "nightheronFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "nightheronTier4A",
        "nightheronTier4B",
        "nightheronTier4C",
        "nightheronTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          nightheron: 6
        }
      },
      description: "Final placeholder node for Black-Crowned Night Heron that depends on the full branch network."
    }
  ],
  greenheron: [
    {
      id: "greenheronTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 1
        }
      },
      description: "Starting point for the Green Heron tree. Placeholder node for early progression."
    },
    {
      id: "greenheronTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "greenheronTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 2
        }
      },
      description: "Left branch placeholder for the Green Heron tree."
    },
    {
      id: "greenheronTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "greenheronTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 2
        }
      },
      description: "Right branch placeholder for the Green Heron tree."
    },
    {
      id: "greenheronTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "greenheronTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Green Heron tree."
    },
    {
      id: "greenheronTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "greenheronTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Green Heron tree."
    },
    {
      id: "greenheronTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "greenheronTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Green Heron tree."
    },
    {
      id: "greenheronTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "greenheronTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 4
        }
      },
      description: "Upper fourth-tier placeholder for Green Heron."
    },
    {
      id: "greenheronTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "greenheronTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Green Heron."
    },
    {
      id: "greenheronTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "greenheronTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Green Heron."
    },
    {
      id: "greenheronTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "greenheronTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 4
        }
      },
      description: "Lower fourth-tier placeholder for Green Heron."
    },
    {
      id: "greenheronFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "greenheronTier4A",
        "greenheronTier4B",
        "greenheronTier4C",
        "greenheronTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          greenheron: 6
        }
      },
      description: "Final placeholder node for Green Heron that depends on the full branch network."
    }
  ],
  muteswan: [
    {
      id: "muteswanTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 1
        }
      },
      description: "Starting point for the Mute Swan tree. Placeholder node for early progression."
    },
    {
      id: "muteswanTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "muteswanTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 2
        }
      },
      description: "Left branch placeholder for the Mute Swan tree."
    },
    {
      id: "muteswanTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "muteswanTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 2
        }
      },
      description: "Right branch placeholder for the Mute Swan tree."
    },
    {
      id: "muteswanTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "muteswanTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Mute Swan tree."
    },
    {
      id: "muteswanTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "muteswanTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Mute Swan tree."
    },
    {
      id: "muteswanTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "muteswanTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Mute Swan tree."
    },
    {
      id: "muteswanTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "muteswanTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 4
        }
      },
      description: "Upper fourth-tier placeholder for Mute Swan."
    },
    {
      id: "muteswanTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "muteswanTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Mute Swan."
    },
    {
      id: "muteswanTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "muteswanTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Mute Swan."
    },
    {
      id: "muteswanTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "muteswanTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 4
        }
      },
      description: "Lower fourth-tier placeholder for Mute Swan."
    },
    {
      id: "muteswanFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "muteswanTier4A",
        "muteswanTier4B",
        "muteswanTier4C",
        "muteswanTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          muteswan: 6
        }
      },
      description: "Final placeholder node for Mute Swan that depends on the full branch network."
    }
  ],
  killdeer: [
    {
      id: "killdeerTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 1
        }
      },
      description: "Starting point for the Killdeer tree. Placeholder node for early progression."
    },
    {
      id: "killdeerTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "killdeerTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 2
        }
      },
      description: "Left branch placeholder for the Killdeer tree."
    },
    {
      id: "killdeerTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "killdeerTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 2
        }
      },
      description: "Right branch placeholder for the Killdeer tree."
    },
    {
      id: "killdeerTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "killdeerTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Killdeer tree."
    },
    {
      id: "killdeerTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "killdeerTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Killdeer tree."
    },
    {
      id: "killdeerTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "killdeerTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Killdeer tree."
    },
    {
      id: "killdeerTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "killdeerTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 4
        }
      },
      description: "Upper fourth-tier placeholder for Killdeer."
    },
    {
      id: "killdeerTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "killdeerTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Killdeer."
    },
    {
      id: "killdeerTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "killdeerTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Killdeer."
    },
    {
      id: "killdeerTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "killdeerTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 4
        }
      },
      description: "Lower fourth-tier placeholder for Killdeer."
    },
    {
      id: "killdeerFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "killdeerTier4A",
        "killdeerTier4B",
        "killdeerTier4C",
        "killdeerTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          killdeer: 6
        }
      },
      description: "Final placeholder node for Killdeer that depends on the full branch network."
    }
  ],
  osprey: [
    {
      id: "ospreyTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          osprey: 1
        }
      },
      description: "Starting point for the Osprey tree. Placeholder node for early progression."
    },
    {
      id: "ospreyTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "ospreyTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          osprey: 2
        }
      },
      description: "Left branch placeholder for the Osprey tree."
    },
    {
      id: "ospreyTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "ospreyTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          osprey: 2
        }
      },
      description: "Right branch placeholder for the Osprey tree."
    },
    {
      id: "ospreyTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "ospreyTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          osprey: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Osprey tree."
    },
    {
      id: "ospreyTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "ospreyTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          osprey: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Osprey tree."
    },
    {
      id: "ospreyTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "ospreyTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          osprey: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Osprey tree."
    },
    {
      id: "ospreyTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "ospreyTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          osprey: 4
        }
      },
      description: "Upper fourth-tier placeholder for Osprey."
    },
    {
      id: "ospreyTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "ospreyTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          osprey: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Osprey."
    },
    {
      id: "ospreyTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "ospreyTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          osprey: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Osprey."
    },
    {
      id: "ospreyTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "ospreyTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          osprey: 4
        }
      },
      description: "Lower fourth-tier placeholder for Osprey."
    },
    {
      id: "ospreyFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "ospreyTier4A",
        "ospreyTier4B",
        "ospreyTier4C",
        "ospreyTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          osprey: 6
        }
      },
      description: "Final placeholder node for Osprey that depends on the full branch network."
    }
  ],
  coot: [
    {
      id: "cootTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          coot: 1
        }
      },
      description: "Starting point for the American Coot tree. Placeholder node for early progression."
    },
    {
      id: "cootTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "cootTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          coot: 2
        }
      },
      description: "Left branch placeholder for the American Coot tree."
    },
    {
      id: "cootTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "cootTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          coot: 2
        }
      },
      description: "Right branch placeholder for the American Coot tree."
    },
    {
      id: "cootTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "cootTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          coot: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the American Coot tree."
    },
    {
      id: "cootTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "cootTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          coot: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the American Coot tree."
    },
    {
      id: "cootTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "cootTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          coot: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the American Coot tree."
    },
    {
      id: "cootTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "cootTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          coot: 4
        }
      },
      description: "Upper fourth-tier placeholder for American Coot."
    },
    {
      id: "cootTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "cootTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          coot: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for American Coot."
    },
    {
      id: "cootTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "cootTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          coot: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for American Coot."
    },
    {
      id: "cootTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "cootTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          coot: 4
        }
      },
      description: "Lower fourth-tier placeholder for American Coot."
    },
    {
      id: "cootFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "cootTier4A",
        "cootTier4B",
        "cootTier4C",
        "cootTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          coot: 6
        }
      },
      description: "Final placeholder node for American Coot that depends on the full branch network."
    }
  ],
  kingfisher: [
    {
      id: "kingfisherTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 1
        }
      },
      description: "Starting point for the Belted Kingfisher tree. Placeholder node for early progression."
    },
    {
      id: "kingfisherTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "kingfisherTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 2
        }
      },
      description: "Left branch placeholder for the Belted Kingfisher tree."
    },
    {
      id: "kingfisherTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "kingfisherTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 2
        }
      },
      description: "Right branch placeholder for the Belted Kingfisher tree."
    },
    {
      id: "kingfisherTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "kingfisherTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Belted Kingfisher tree."
    },
    {
      id: "kingfisherTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "kingfisherTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Belted Kingfisher tree."
    },
    {
      id: "kingfisherTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "kingfisherTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Belted Kingfisher tree."
    },
    {
      id: "kingfisherTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "kingfisherTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 4
        }
      },
      description: "Upper fourth-tier placeholder for Belted Kingfisher."
    },
    {
      id: "kingfisherTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "kingfisherTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Belted Kingfisher."
    },
    {
      id: "kingfisherTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "kingfisherTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Belted Kingfisher."
    },
    {
      id: "kingfisherTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "kingfisherTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 4
        }
      },
      description: "Lower fourth-tier placeholder for Belted Kingfisher."
    },
    {
      id: "kingfisherFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "kingfisherTier4A",
        "kingfisherTier4B",
        "kingfisherTier4C",
        "kingfisherTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          kingfisher: 6
        }
      },
      description: "Final placeholder node for Belted Kingfisher that depends on the full branch network."
    }
  ],
  cormorant: [
    {
      id: "cormorantTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 1
        }
      },
      description: "Starting point for the Double-Breasted Cormorant tree. Placeholder node for early progression."
    },
    {
      id: "cormorantTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "cormorantTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 2
        }
      },
      description: "Left branch placeholder for the Double-Breasted Cormorant tree."
    },
    {
      id: "cormorantTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "cormorantTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 2
        }
      },
      description: "Right branch placeholder for the Double-Breasted Cormorant tree."
    },
    {
      id: "cormorantTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "cormorantTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Double-Breasted Cormorant tree."
    },
    {
      id: "cormorantTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "cormorantTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Double-Breasted Cormorant tree."
    },
    {
      id: "cormorantTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "cormorantTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Double-Breasted Cormorant tree."
    },
    {
      id: "cormorantTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "cormorantTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 4
        }
      },
      description: "Upper fourth-tier placeholder for Double-Breasted Cormorant."
    },
    {
      id: "cormorantTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "cormorantTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Double-Breasted Cormorant."
    },
    {
      id: "cormorantTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "cormorantTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Double-Breasted Cormorant."
    },
    {
      id: "cormorantTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "cormorantTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 4
        }
      },
      description: "Lower fourth-tier placeholder for Double-Breasted Cormorant."
    },
    {
      id: "cormorantFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "cormorantTier4A",
        "cormorantTier4B",
        "cormorantTier4C",
        "cormorantTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          cormorant: 6
        }
      },
      description: "Final placeholder node for Double-Breasted Cormorant that depends on the full branch network."
    }
  ],
  avocet: [
    {
      id: "avocetTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          avocet: 1
        }
      },
      description: "Starting point for the American Avocet tree. Placeholder node for early progression."
    },
    {
      id: "avocetTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "avocetTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          avocet: 2
        }
      },
      description: "Left branch placeholder for the American Avocet tree."
    },
    {
      id: "avocetTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "avocetTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          avocet: 2
        }
      },
      description: "Right branch placeholder for the American Avocet tree."
    },
    {
      id: "avocetTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "avocetTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          avocet: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the American Avocet tree."
    },
    {
      id: "avocetTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "avocetTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          avocet: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the American Avocet tree."
    },
    {
      id: "avocetTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "avocetTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          avocet: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the American Avocet tree."
    },
    {
      id: "avocetTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "avocetTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          avocet: 4
        }
      },
      description: "Upper fourth-tier placeholder for American Avocet."
    },
    {
      id: "avocetTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "avocetTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          avocet: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for American Avocet."
    },
    {
      id: "avocetTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "avocetTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          avocet: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for American Avocet."
    },
    {
      id: "avocetTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "avocetTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          avocet: 4
        }
      },
      description: "Lower fourth-tier placeholder for American Avocet."
    },
    {
      id: "avocetFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "avocetTier4A",
        "avocetTier4B",
        "avocetTier4C",
        "avocetTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          avocet: 6
        }
      },
      description: "Final placeholder node for American Avocet that depends on the full branch network."
    }
  ],
  harrier: [
    {
      id: "harrierTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          harrier: 1
        }
      },
      description: "Starting point for the Northern Harrier tree. Placeholder node for early progression."
    },
    {
      id: "harrierTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "harrierTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          harrier: 2
        }
      },
      description: "Left branch placeholder for the Northern Harrier tree."
    },
    {
      id: "harrierTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "harrierTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          harrier: 2
        }
      },
      description: "Right branch placeholder for the Northern Harrier tree."
    },
    {
      id: "harrierTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "harrierTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          harrier: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Northern Harrier tree."
    },
    {
      id: "harrierTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "harrierTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          harrier: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Northern Harrier tree."
    },
    {
      id: "harrierTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "harrierTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          harrier: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Northern Harrier tree."
    },
    {
      id: "harrierTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "harrierTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          harrier: 4
        }
      },
      description: "Upper fourth-tier placeholder for Northern Harrier."
    },
    {
      id: "harrierTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "harrierTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          harrier: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Northern Harrier."
    },
    {
      id: "harrierTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "harrierTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          harrier: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Northern Harrier."
    },
    {
      id: "harrierTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "harrierTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          harrier: 4
        }
      },
      description: "Lower fourth-tier placeholder for Northern Harrier."
    },
    {
      id: "harrierFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "harrierTier4A",
        "harrierTier4B",
        "harrierTier4C",
        "harrierTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          harrier: 6
        }
      },
      description: "Final placeholder node for Northern Harrier that depends on the full branch network."
    }
  ],
  grebe: [
    {
      id: "grebeTier1A",
      name: "Tier 1 Node",
      order: 1,
      tier: 1,
      parents: [],
      oneTime: true,
      costs: {
        birds: {
          grebe: 1
        }
      },
      description: "Starting point for the Pied-billed Grebe tree. Placeholder node for early progression."
    },
    {
      id: "grebeTier2A",
      name: "Tier 2 Left",
      order: 2,
      tier: 2,
      parents: [
        "grebeTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          grebe: 2
        }
      },
      description: "Left branch placeholder for the Pied-billed Grebe tree."
    },
    {
      id: "grebeTier2B",
      name: "Tier 2 Right",
      order: 3,
      tier: 2,
      parents: [
        "grebeTier1A"
      ],
      oneTime: true,
      costs: {
        birds: {
          grebe: 2
        }
      },
      description: "Right branch placeholder for the Pied-billed Grebe tree."
    },
    {
      id: "grebeTier3A",
      name: "Tier 3 Left",
      order: 4,
      tier: 3,
      parents: [
        "grebeTier2A"
      ],
      oneTime: true,
      costs: {
        birds: {
          grebe: 3
        }
      },
      description: "Third-tier placeholder extending the upper branch of the Pied-billed Grebe tree."
    },
    {
      id: "grebeTier3B",
      name: "Tier 3 Center",
      order: 5,
      tier: 3,
      parents: [
        "grebeTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          grebe: 3
        }
      },
      description: "Third-tier placeholder extending the center branch of the Pied-billed Grebe tree."
    },
    {
      id: "grebeTier3C",
      name: "Tier 3 Split",
      order: 6,
      tier: 3,
      parents: [
        "grebeTier2B"
      ],
      oneTime: true,
      costs: {
        birds: {
          grebe: 3
        }
      },
      description: "Third-tier placeholder created by splitting the lower tier-two branch of the Pied-billed Grebe tree."
    },
    {
      id: "grebeTier4A",
      name: "Tier 4 Upper",
      order: 7,
      tier: 4,
      parents: [
        "grebeTier3A"
      ],
      oneTime: true,
      costs: {
        birds: {
          grebe: 4
        }
      },
      description: "Upper fourth-tier placeholder for Pied-billed Grebe."
    },
    {
      id: "grebeTier4B",
      name: "Tier 4 Mid-Left",
      order: 8,
      tier: 4,
      parents: [
        "grebeTier3B"
      ],
      oneTime: true,
      costs: {
        birds: {
          grebe: 4
        }
      },
      description: "Mid-left fourth-tier placeholder for Pied-billed Grebe."
    },
    {
      id: "grebeTier4C",
      name: "Tier 4 Mid-Right",
      order: 9,
      tier: 4,
      parents: [
        "grebeTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          grebe: 4
        }
      },
      description: "Mid-right fourth-tier placeholder for Pied-billed Grebe."
    },
    {
      id: "grebeTier4D",
      name: "Tier 4 Lower",
      order: 10,
      tier: 4,
      parents: [
        "grebeTier3C"
      ],
      oneTime: true,
      costs: {
        birds: {
          grebe: 4
        }
      },
      description: "Lower fourth-tier placeholder for Pied-billed Grebe."
    },
    {
      id: "grebeFinalA",
      name: "Final Node",
      order: 11,
      finalTier: true,
      parents: [
        "grebeTier4A",
        "grebeTier4B",
        "grebeTier4C",
        "grebeTier4D"
      ],
      oneTime: true,
      costs: {
        birds: {
          grebe: 6
        }
      },
      description: "Final placeholder node for Pied-billed Grebe that depends on the full branch network."
    }
  ]
};

const SPECIES_POPULATION_UPGRADE_LIBRARY = {
  crow: ["murderParty"],
  mourningdove: ["turtleWake", "seedDispersal"]
};

function getSpeciesPopulationUpgradeDefinitionsForBird(birdId) {
  const upgradeIds = SPECIES_POPULATION_UPGRADE_LIBRARY[birdId] || [];

  return upgradeIds
    .map(function (upgradeId) {
      return getUpgradeDefinition(upgradeId);
    })
    .filter(Boolean)
    .sort(function (leftUpgrade, rightUpgrade) {
      return (leftUpgrade.order || 0) - (rightUpgrade.order || 0);
    });
}
