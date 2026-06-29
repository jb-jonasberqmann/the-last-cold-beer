import type { Room } from "@/types/content";

// ==========================================
// ALL ROOMS — Chapter 1 fully implemented
// Chapters 2 & 3 are stubs
// ==========================================

export const ROOMS: Room[] = [
  // ==========================================
  // CHAPTER 1 ROOMS
  // ==========================================
  {
    id: "kitchen",
    chapterId: "chapter-1",
    title: "The Kitchen",
    type: "mystery_room",
    look: {
      icon: "🍳",
      theme: "cabin-warm",
      atmosphere:
        "Flour on the counter. A faint smell of old coffee. Eleven magnets on the fridge, two of which are pineapples. No one knows where the pineapples came from.",
      backgroundStyle: "warm-wood",
      colorFrom: "from-amber-900",
      colorTo: "to-amber-800",
    },
    description:
      "The kitchen is the first room you properly enter. Everything looks normal — except the fridge is humming louder than usual, and there's a sticky note on the counter that says \"Count the magnets. Subtract the ones that don't belong.\"",
    lockedDescription:
      "The kitchen. You haven't looked properly yet.",
    unlockCost: 0,
    unlockRequires: [],
    questIds: ["kitchen-inspection", "kitchen-fridge-unlock", "kitchen-social", "kitchen-cabin-toast"],
    rewardClueIds: ["clue-kitchen-calendar"],
    isOptional: false,
    order: 1,
    da: {
      title: "Køkkenet",
      description: "Køkkenet er det første rum du rigtigt træder ind i. Alt ser normalt ud — bortset fra at køleskabet summer højere end normalt, og der er en klæbrig lap på disken der siger \"Tæl magneterne. Træk dem fra, der ikke hører til.\"",
      lockedDescription: "Køkkenet. Du har ikke kigget ordenligt endnu.",
      atmosphere: "Mel på disken. En svag lugt af gammel kaffe. Elleve magneter på køleskabet, to af dem er ananas. Ingen ved hvor ananasserne kom fra.",
    },
  },
  {
    id: "fridge",
    chapterId: "chapter-1",
    title: "The Fridge",
    type: "mystery_room",
    look: {
      icon: "🧊",
      theme: "cold-blue",
      atmosphere:
        "Cold air spills out. One beer stands alone in the center, covered in condensation. A handwritten note is taped to it. The temperature dial is at maximum.",
      backgroundStyle: "frosted-metal",
      colorFrom: "from-blue-900",
      colorTo: "to-cyan-800",
    },
    description:
      "Inside the fridge: one single beer, isolated in the center shelf. A note is taped to it. The fridge has been set to maximum cold — far beyond what you'd need for a normal cabin weekend. This was intentional.",
    lockedDescription:
      "The fridge hums. You haven't opened it yet. Unlock the kitchen first.",
    unlockCost: 0,
    unlockRequires: ["kitchen"],
    questIds: ["fridge-read-note", "fridge-cold-investigation", "fridge-temperature-dial"],
    rewardClueIds: ["clue-fridge-note", "clue-cold-timestamp", "clue-fridge-temperature"],
    isOptional: false,
    order: 2,
    da: {
      title: "Køleskabet",
      description: "Inde i køleskabet: én enkelt øl, isoleret på midterhylden. En seddel er klistret til den. Køleskabet er indstillet på maksimum kulde — langt mere end du nogensinde ville behøve til en normal hyttetur. Det var med vilje.",
      lockedDescription: "Køleskabet summer. Du har ikke åbnet det endnu. Lås køkkenet op først.",
      atmosphere: "Kold luft siver ud. Én øl står alene i midten, dækket af kondens. En håndskrevet seddel er klistret til den. Temperaturknappen er på maksimum.",
    },
  },
  {
    id: "coffee-table",
    chapterId: "chapter-1",
    title: "The Coffee Table",
    type: "mystery_room",
    look: {
      icon: "☕",
      theme: "worn-wood",
      atmosphere:
        "Scuffed wood. Several ring stains from a hundred cabin trips. Under the third coaster: something that wasn't there before. Or was it always there?",
      backgroundStyle: "worn-wood",
      colorFrom: "from-stone-900",
      colorTo: "to-amber-900",
    },
    description:
      "The coffee table has seen things. Decades of cabin trips. Beer rings. Card games played too seriously. Somewhere under one of the coasters, something is hidden. And that ring stain — where have you seen that diameter before?",
    lockedDescription:
      "A coffee table. Nothing unusual from a distance. Pay to investigate.",
    unlockCost: 1,
    unlockRequires: ["kitchen"],
    questIds: ["coffee-table-ring", "coffee-table-coaster", "coffee-table-social"],
    rewardClueIds: ["clue-coffee-table-ring", "clue-coffee-table-coaster"],
    isOptional: true,
    isSecret: true,
    secretAdvantage: "boss_free_action",
    order: 3,
    da: {
      title: "Sofabordet",
      description: "Sofabordet har set ting. Årtiers hytteture. Ølringe. Kortspil taget for seriøst. Et sted under en af brikkerne gemmer der sig noget. Og den ringplet — hvor har du set den diameter før?",
      lockedDescription: "Et sofabord. Intet usædvanligt på afstand. Betal for at undersøge.",
      atmosphere: "Ridset træ. Adskillige ringpletter fra hundredevis af hytteture. Under den tredje brik: noget der ikke var der før. Eller var det altid der?",
    },
  },
  {
    id: "terrace",
    chapterId: "chapter-1",
    title: "The Terrace",
    type: "mystery_room",
    look: {
      icon: "🌲",
      theme: "forest-dark",
      atmosphere:
        "The terrace faces the trees. Cold air. A carved railing. Someone left a chair angled precisely toward the treeline — not randomly. Someone was watching something.",
      backgroundStyle: "pine-dark",
      colorFrom: "from-green-950",
      colorTo: "to-stone-900",
    },
    description:
      "The terrace overlooks the forest. It's cold out here. Check the railing — specifically the underside. Things get carved into railings when people want them found later but not immediately.",
    lockedDescription:
      "The terrace. Trees. Cold. You haven't investigated yet. Complete the fridge first.",
    unlockCost: 1,
    unlockRequires: ["fridge"],
    questIds: ["terrace-railing-carving", "terrace-countdown", "terrace-drink-mixer"],
    rewardClueIds: ["clue-terrace-inscription"],
    isOptional: false,
    order: 4,
    da: {
      title: "Terrassen",
      description: "Terrassen vender mod skoven. Det er koldt herude. Tjek gelænderet — specifikt undersiden. Ting ristes ind i gelændere når folk vil have dem fundet senere, men ikke med det samme.",
      lockedDescription: "Terrassen. Træer. Kulde. Du har ikke undersøgt endnu. Fuldfør køleskabet først.",
      atmosphere: "Terrassen vender mod træerne. Kold luft. Et ridset gelænder. Nogen efterlod en stol rettet præcist mod skovkanten — ikke tilfældigt. Nogen overvågede noget.",
    },
  },
  {
    id: "shed",
    chapterId: "chapter-1",
    title: "The Shed",
    type: "mystery_room",
    look: {
      icon: "🔧",
      theme: "rust-dark",
      atmosphere:
        "Damp wood. Rust smell. An old broken chair in the corner. And there, on the wall, laminated and pinned with actual push pins: an official-looking inventory sheet.",
      backgroundStyle: "rustic-shed",
      colorFrom: "from-stone-950",
      colorTo: "to-amber-950",
    },
    description:
      "The shed hasn't been properly cleaned since the cabin was built. Somewhere in here is the cabin's official inventory — yes, someone actually made one — and it includes an entry that explains why the cooler is locked.",
    lockedDescription:
      "The shed. Stuck door. Complete the terrace first.",
    unlockCost: 1,
    unlockRequires: ["terrace"],
    questIds: ["shed-unlock", "shed-inventory", "shed-dedication"],
    rewardClueIds: ["clue-shed-inventory"],
    isOptional: false,
    order: 5,
    da: {
      title: "Skuret",
      description: "Skuret er ikke ordenligt rengjort siden hytten blev bygget. Et sted herinde er hyttens officielle inventarliste — ja, nogen lavede faktisk en — og den indeholder en post der forklarer hvorfor køleren er låst.",
      lockedDescription: "Skuret. Stiv dør. Fuldfør terrassen først.",
      atmosphere: "Fugtigt træ. Rustlugt. En gammel ødelagt stol i hjørnet. Og der, på væggen, lamineret og fastgjort med rigtige tegnestifter: et officielt udseende inventarark.",
    },
  },

  // ==========================================
  // CHAPTER 1 SIDE QUESTS — optional branches
  // ==========================================
  {
    id: "toolbox",
    chapterId: "chapter-1",
    title: "The Toolbox",
    type: "mystery_room",
    look: {
      icon: "🔩",
      theme: "rust-dark",
      atmosphere:
        "A dented metal toolbox sits on the workbench, padlock busted open years ago. Inside: six compartments. Only four have anything in them. The other two have sticky tape outlines where something used to be.",
      backgroundStyle: "rustic-shed",
      colorFrom: "from-stone-900",
      colorTo: "to-zinc-900",
    },
    description:
      "A side investigation — one person can handle this alone while others push forward. The toolbox has a note taped to the lid: 'The missing tools are the answer.' Figure out what's missing.",
    lockedDescription:
      "The toolbox. Something is missing from it. Unlock the fridge first.",
    unlockCost: 0,
    unlockRequires: ["fridge"],
    questIds: ["toolbox-missing-item", "toolbox-social"],
    rewardClueIds: [],
    isOptional: true,
    order: 3,
  },
  {
    id: "hammock",
    chapterId: "chapter-1",
    title: "The Hammock Spot",
    type: "mystery_room",
    look: {
      icon: "🌿",
      theme: "forest-dark",
      atmosphere:
        "A hammock between two pines, visible from the terrace. One side has been tied tighter than the other — as if someone heavier always sat on that side. A bottle cap rests in the fabric.",
      backgroundStyle: "pine-dark",
      colorFrom: "from-green-950",
      colorTo: "to-teal-950",
    },
    description:
      "An optional detour — one person can investigate while the team advances. The hammock holds a clue about who really runs the cabin. Or maybe it\'s just a hammock. Investigate.',",
    lockedDescription:
      "The hammock. You can see it from the terrace. Unlock the terrace first.",
    unlockCost: 0,
    unlockRequires: ["terrace"],
    questIds: ["hammock-observation", "hammock-social"],
    rewardClueIds: [],
    isOptional: true,
    order: 4,
  },

  // ==========================================
  // CHAPTER 2 ROOMS (stubs — content TBD)
  // ==========================================
  {
    id: "old-group-chat",
    chapterId: "chapter-2",
    title: "The Old Group Chat",
    type: "mystery_room",
    look: {
      icon: "📱",
      theme: "digital-purple",
      atmosphere: "TODO: Chapter 2 atmosphere",
      backgroundStyle: "digital-screen",
      colorFrom: "from-purple-900",
      colorTo: "to-indigo-900",
    },
    description: "TODO: Chapter 2 room description",
    lockedDescription: "TODO",
    unlockCost: 0,
    unlockRequires: [],
    questIds: [],
    rewardClueIds: ["clue-group-chat-screenshot"],
    isOptional: false,
    order: 1,
  },
  {
    id: "garden-chair",
    chapterId: "chapter-2",
    title: "The Garden Chair",
    type: "mystery_room",
    look: {
      icon: "🪑",
      theme: "outdoor",
      atmosphere: "TODO",
      backgroundStyle: "outdoor-green",
      colorFrom: "from-green-900",
      colorTo: "to-stone-900",
    },
    description: "TODO: Chapter 2 room description",
    lockedDescription: "TODO",
    unlockCost: 1,
    unlockRequires: ["old-group-chat"],
    questIds: [],
    rewardClueIds: [],
    isOptional: false,
    order: 2,
  },
  {
    id: "store-receipt",
    chapterId: "chapter-2",
    title: "The Store Receipt",
    type: "mystery_room",
    look: {
      icon: "🧾",
      theme: "paper",
      atmosphere: "TODO",
      backgroundStyle: "paper-white",
      colorFrom: "from-amber-900",
      colorTo: "to-yellow-900",
    },
    description: "TODO: Chapter 2 room description",
    lockedDescription: "TODO",
    unlockCost: 1,
    unlockRequires: ["old-group-chat"],
    questIds: [],
    rewardClueIds: ["clue-receipt-discrepancy"],
    isOptional: false,
    order: 3,
  },
  {
    id: "false-alibi",
    chapterId: "chapter-2",
    title: "The False Alibi",
    type: "mystery_room",
    look: {
      icon: "🎭",
      theme: "mystery",
      atmosphere: "TODO",
      backgroundStyle: "dark-mystery",
      colorFrom: "from-purple-950",
      colorTo: "to-stone-900",
    },
    description: "TODO: Chapter 2 room description",
    lockedDescription: "TODO",
    unlockCost: 2,
    unlockRequires: ["garden-chair", "store-receipt"],
    questIds: [],
    rewardClueIds: [],
    isOptional: false,
    order: 4,
  },
  {
    id: "playlist-from-hell",
    chapterId: "chapter-2",
    title: "The Playlist from Hell",
    type: "mystery_room",
    look: {
      icon: "🎵",
      theme: "music-dark",
      atmosphere: "TODO",
      backgroundStyle: "music-dark",
      colorFrom: "from-red-950",
      colorTo: "to-purple-900",
    },
    description: "TODO: Chapter 2 room description",
    lockedDescription: "TODO",
    unlockCost: 2,
    unlockRequires: ["false-alibi"],
    questIds: [],
    rewardClueIds: [],
    isOptional: false,
    order: 5,
  },

  // ==========================================
  // CHAPTER 3 ROOMS (stubs — content TBD)
  // ==========================================
  {
    id: "rules-of-the-ritual",
    chapterId: "chapter-3",
    title: "The Rules of the Ritual",
    type: "mystery_room",
    look: {
      icon: "📜",
      theme: "ancient-parchment",
      atmosphere: "TODO",
      backgroundStyle: "parchment",
      colorFrom: "from-amber-950",
      colorTo: "to-yellow-900",
    },
    description: "TODO: Chapter 3 room description",
    lockedDescription: "TODO",
    unlockCost: 0,
    unlockRequires: [],
    questIds: [],
    rewardClueIds: [],
    isOptional: false,
    order: 1,
  },
  {
    id: "final-ballot",
    chapterId: "chapter-3",
    title: "The Final Ballot",
    type: "mystery_room",
    look: {
      icon: "🗳️",
      theme: "vote",
      atmosphere: "TODO",
      backgroundStyle: "ballot-box",
      colorFrom: "from-blue-950",
      colorTo: "to-indigo-900",
    },
    description: "TODO: Chapter 3 room description",
    lockedDescription: "TODO",
    unlockCost: 1,
    unlockRequires: ["rules-of-the-ritual"],
    questIds: [],
    rewardClueIds: ["clue-final-ballot"],
    isOptional: false,
    order: 2,
  },
  {
    id: "alphabet-of-caps",
    chapterId: "chapter-3",
    title: "The Alphabet of Caps",
    type: "mystery_room",
    look: {
      icon: "🔤",
      theme: "alphabet",
      atmosphere: "TODO",
      backgroundStyle: "chalk-board",
      colorFrom: "from-green-950",
      colorTo: "to-teal-900",
    },
    description: "TODO: Chapter 3 room description",
    lockedDescription: "TODO",
    unlockCost: 1,
    unlockRequires: ["rules-of-the-ritual"],
    questIds: [],
    rewardClueIds: ["clue-alphabet-key"],
    isOptional: false,
    order: 3,
  },
  {
    id: "missing-tradition",
    chapterId: "chapter-3",
    title: "The Missing Tradition",
    type: "mystery_room",
    look: {
      icon: "👻",
      theme: "haunted",
      atmosphere: "TODO",
      backgroundStyle: "ghost",
      colorFrom: "from-stone-950",
      colorTo: "to-gray-900",
    },
    description: "TODO: Chapter 3 room description",
    lockedDescription: "TODO",
    unlockCost: 2,
    unlockRequires: ["final-ballot", "alphabet-of-caps"],
    questIds: [],
    rewardClueIds: [],
    isOptional: false,
    order: 4,
  },
  {
    id: "nightstand-secret",
    chapterId: "chapter-3",
    title: "The Nightstand Secret",
    type: "mystery_room",
    look: {
      icon: "🌙",
      theme: "night",
      atmosphere: "TODO",
      backgroundStyle: "night-dark",
      colorFrom: "from-indigo-950",
      colorTo: "to-blue-950",
    },
    description: "TODO: Chapter 3 room description",
    lockedDescription: "TODO",
    unlockCost: 2,
    unlockRequires: ["missing-tradition"],
    questIds: [],
    rewardClueIds: [],
    isOptional: false,
    order: 5,
  },
];

export function getRoom(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}

export function getRoomsByChapter(chapterId: string): Room[] {
  return ROOMS.filter((r) => r.chapterId === chapterId).sort((a, b) => a.order - b.order);
}
