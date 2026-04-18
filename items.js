// Central item catalog
// Items live here so inventory UI and game logic can share one source of truth.
const ITEM_LIBRARY = [
  {
    id: "seedbaitticket",
    name: "Seed Bait Ticket",
    image: "/Resources/Misc%20Images/ticketSeed.png",
    startingCount: 5,
    description: "Loads the trap with seed bait for 1 ticket instead of spending seeds"
  },
  {
    id: "voyageticket",
    name: "Voyage Ticket",
    image: "/Resources/Misc%20Images/voyageTicket.png",
    startingCount: 0,
    description: "Instantly finishes the current Harbor voyage"
  },
  {
    id: "coinhourticket",
    name: "1 Hour Coin Ticket",
    image: "/Resources/Misc%20Images/ticketCoin1.png",
    startingCount: 0,
    description: "Grants 1 hour of coins at your current production rate",
    inventoryUsable: true
  }
];
