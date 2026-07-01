import type { Clue } from "@/types/content";

// ==========================================
// ALL CLUES
// isArtifact = true for the five Act 3 inventory items
// isKeyClue = true for clues required at boss or act transition
// ==========================================
export const CLUES: Clue[] = [

  // ==========================================
  // ACT 1 — CODE FRAGMENTS
  // Four fragments collected across outdoor rooms.
  // Mads (boss) gives the fifth — but that's handled as boss reward.
  // Combined at The Front Door to enter Act 2.
  // ==========================================
  {
    id: "fragment-driveway",
    chapterId: "act-1",
    title: "Code Fragment — Driveway",
    description:
      "A piece of tape stuck to the underside of the car boot lid. Written in permanent marker: a single digit. **3**",
    icon: "🔢",
    flavor: "Someone hid it where only someone looking for it would find it.",
    isKeyClue: true,
    da: {
      title: "Kodefragment — Indkørslen",
      description: "Et stykke tape klistret under bagklappens indeside. Skrevet med permanent markør: ét ciffer. **3**",
      flavor: "Nogen gemte det der, hvor kun nogen der ledte efter det ville finde det.",
    },
  },
  {
    id: "fragment-terrace",
    chapterId: "act-1",
    title: "Code Fragment — Terrace",
    description:
      "Scratched into the underside of the terrace railing, near the third post from the left: **7**",
    icon: "🔢",
    flavor: "The railing has more history than you thought.",
    isKeyClue: true,
    da: {
      title: "Kodefragment — Terrassen",
      description: "Ridset ind i undersiden af terrasse-gelænderet, ved den tredje stolpe fra venstre: **7**",
      flavor: "Gelænderet har mere historie end du troede.",
    },
  },
  {
    id: "fragment-garden",
    chapterId: "act-1",
    title: "Code Fragment — Garden",
    description:
      "Tucked inside the hollow of the old oak tree near the back fence. A folded scrap of paper: **1**",
    icon: "🔢",
    flavor: "The garden keeps secrets better than anyone.",
    isKeyClue: true,
    da: {
      title: "Kodefragment — Haven",
      description: "Gemt i hulheden af den gamle egetræ ved baghegnet. Et foldet stykke papir: **1**",
      flavor: "Haven holder hemmeligheder bedre end nogen.",
    },
  },
  {
    id: "fragment-shed",
    chapterId: "act-1",
    title: "Code Fragment — Shed",
    description:
      "Taped to the back of the shed door, behind the hinges. Almost invisible unless you're actually looking. **9**",
    icon: "🔢",
    flavor: "Hidden in plain sight, like everything else in this shed.",
    isKeyClue: true,
    da: {
      title: "Kodefragment — Skuret",
      description: "Klistret på bagsiden af skurets dør, bag hængserne. Næsten usynlig medmindre du leder. **9**",
      flavor: "Gemt i åbenlys syne, ligesom alt andet i dette skur.",
    },
  },
  {
    id: "fragment-mads",
    chapterId: "act-1",
    title: "Code Fragment — Mads",
    description:
      "Mads pulls his phone out of his jacket — finally — and shows you his notes app. One item: **4**. \"That's it,\" he says. \"That's the last one.\"",
    icon: "🔢",
    flavor: "He had it all along. Of course he did.",
    isKeyClue: true,
    da: {
      title: "Kodefragment — Mads",
      description: "Mads trækker sin telefon op af jakken — endelig — og viser dig hans noter. Ét punkt: **4**. \"Det er det,\" siger han. \"Det er det sidste.\"",
      flavor: "Han havde det hele tiden. Selvfølgelig havde han det.",
    },
  },

  // ==========================================
  // ACT 1 — THE SHED ATMOSPHERE (wrong note)
  // Not a code fragment. The first seed of wrongness.
  // ==========================================
  {
    id: "shed-date-list",
    chapterId: "act-1",
    title: "The Date List",
    description:
      "Pinned to the inside wall of the shed — laminated, with actual push pins — a handwritten list of dates. All crossed out except the last one.\n\n~~July 19th 2010~~\n~~July 11th 2011~~\n~~July 23rd 2012~~\n~~July 15th 2013~~\n~~July 14th 2014~~\n~~July 20th 2015~~\n~~July 18th 2016~~\n~~July 10th 2017~~\n~~July 16th 2018~~\n~~July 22nd 2019~~\n~~July 13th 2020~~\n~~July 19th 2021~~\n~~July 11th 2022~~\n~~July 17th 2023~~\n~~July 15th 2024~~\n~~July 21st 2025~~\n\n**[Today's date — rendered dynamically]**\n\nEvery date falls in late July. All are crossed out except this one.",
    icon: "📋",
    flavor: "Someone has been keeping track. Every year. They always cross the date out.",
    isKeyClue: false,
    da: {
      title: "Datolisten",
      description: "Fastgjort til indervæggen i skuret — lamineret, med rigtige tegnestifter — en håndskrevet liste af datoer. Alle overstreget undtagen den sidste.\n\n~~19. juli 2010~~\n~~11. juli 2011~~\n~~23. juli 2012~~\n~~15. juli 2013~~\n~~14. juli 2014~~\n~~20. juli 2015~~\n~~18. juli 2016~~\n~~10. juli 2017~~\n~~16. juli 2018~~\n~~22. juli 2019~~\n~~13. juli 2020~~\n~~19. juli 2021~~\n~~11. juli 2022~~\n~~17. juli 2023~~\n~~15. juli 2024~~\n~~21. juli 2025~~\n\n**[Dagens dato — renderet dynamisk]**\n\nHver dato falder i slutningen af juli. Alle er overstreget undtagen denne.",
      flavor: "Nogen har holdt styr på det. Hvert år. De overstreger altid datoen.",
    },
  },

  // ==========================================
  // ACT 2 — BEDROOM WORDS (for living room puzzle)
  // ==========================================
  {
    id: "word-owed",
    chapterId: "act-2",
    title: "The Double Room Note",
    description:
      "A note on the bedside table. Mid-sentence. Never finished.\n\n*\"We owed it to each other. We owed it to the house. I know we said we'd come back and finish what we—\"*\n\nThe clue word: **owed**",
    icon: "📝",
    flavor: "Warm and human. But carries weight.",
    isKeyClue: true,
    da: {
      title: "Dobbeltværelsets Seddel",
      description: "En seddel på natbordet. Midt i en sætning. Aldrig afsluttet.\n\n*\"Vi skyldte det hinanden. Vi skyldte det huset. Jeg ved vi sagde vi ville komme tilbage og afslutte hvad vi—\"*\n\nNøgleordet: **skyldte**",
      flavor: "Varm og menneskelig. Men bærer vægt.",
    },
  },
  {
    id: "word-borrowed",
    chapterId: "act-2",
    title: "The Single Room Note",
    description:
      "A note found in the single room. It starts as observation. It ends as an existential crisis.\n\n*\"This is not even my house... Borrowed it is... Not even my bed... Borrowed... This... life... borrowed?\"*\n\nThe clue word: **borrowed**",
    icon: "📝",
    flavor: "You can't tell which parts were deliberate.",
    isKeyClue: true,
    da: {
      title: "Enkeltværelsets Seddel",
      description: "En seddel fundet i enkeltværelset. Den starter som observation. Den ender som eksistentiel krise.\n\n*\"Det er ikke engang mit hus... Lånt er det... Ikke engang min seng... Lånt... Dette... liv... lånt?\"*\n\nNøgleordet: **lånt**",
      flavor: "Du kan ikke se hvilke dele der var bevidste.",
    },
  },
  {
    id: "word-taken",
    chapterId: "act-2",
    title: "The Bunk Room Note",
    description:
      "Written on the underside of the top bunk mattress. Two sentences. One word.\n\n*\"It was ______. It is always ______.\"*\n\nYour word to act out: **taken** — you may not say it or write it. In the living room, act it out in silence until your team guesses.",
    icon: "📝",
    flavor: "This person wrote exactly what was needed and nothing more.",
    isKeyClue: true,
    da: {
      title: "Køjestueens Seddel",
      description: "Skrevet på undersiden af den øverste køje-madras. To sætninger. Ét ord.\n\n*\"Det blev ______. Det bliver altid ______.\"*\n\nDit ord der skal fremvises: **taget** — du må ikke sige det eller skrive det. I stuen skal du fremvise det i tavshed indtil holdet gætter.",
      flavor: "Denne person skrev præcis hvad der var nødvendigt og intet mere.",
    },
  },

  // ==========================================
  // ACT 2 — RADIO FRAGMENTS (atmospheric)
  // One per room, building to the dining room revelation
  // ==========================================
  {
    id: "radio-fragment-living",
    chapterId: "act-2",
    title: "Radio Fragment — Living Room",
    description:
      "Through the crackling static, a fragment: *\"...the last one...\"*\n\nThen nothing.",
    icon: "📻",
    flavor: "The radio in the dining room is always audible from here.",
    isKeyClue: false,
  },
  {
    id: "radio-fragment-kitchen",
    chapterId: "act-2",
    title: "Radio Fragment — Kitchen",
    description:
      "A burst of clearer static: *\"...will always be...\"*\n\nThen white noise.",
    icon: "📻",
    flavor: "Still from the dining room. Getting closer to something.",
    isKeyClue: false,
  },
  {
    id: "radio-fragment-activity",
    chapterId: "act-2",
    title: "Radio Fragment — Activity Room",
    description:
      "One clear phrase before the static swallows it: *\"...the one to finish it.\"*",
    icon: "📻",
    flavor: "Three fragments. One message. You need to fix the radio.",
    isKeyClue: false,
  },

  // ==========================================
  // ACT 3 — ARTIFACTS
  // Five inventory items. isArtifact: true.
  // Collected by completing rooms. Required to unlock subsequent rooms.
  // ==========================================
  {
    id: "artifact-flashlight",
    chapterId: "act-3",
    title: "The Flashlight",
    description:
      "A handheld torch from the utility corner. Works. The batteries are warm — someone used this recently.",
    icon: "🔦",
    flavor: "The darkness becomes navigable. Just.",
    isKeyClue: true,
    isArtifact: true,
    da: {
      title: "Lommelygten",
      description: "En håndholdt lommelygte fra redskabshjørnet. Virker. Batterierne er varme — nogen brugte den for nylig.",
      flavor: "Mørket bliver overkommeligt. Næsten.",
    },
  },
  {
    id: "artifact-fuse",
    chapterId: "act-3",
    title: "The Fuse",
    description:
      "A glass-tube fuse from the fuse box. Burnt out — but you know what to swap it with. Restores partial power to one circuit.",
    icon: "⚡",
    flavor: "One light. That's enough.",
    isKeyClue: true,
    isArtifact: true,
    da: {
      title: "Sikringen",
      description: "En glasrørssikring fra sikringsskabet. Brændt ud — men du ved hvad du skal bytte den med. Genopretter delvis strøm til ét kredsløb.",
      flavor: "Ét lys. Det er nok.",
    },
  },
  {
    id: "artifact-wrench",
    chapterId: "act-3",
    title: "The Wrench",
    description:
      "Found in the kitchen drawer once the power came back. The handle is worn — this wrench has done a lot of work in this house.",
    icon: "🔧",
    flavor: "The right tool. Finally.",
    isKeyClue: true,
    isArtifact: true,
    da: {
      title: "Skruenøglen",
      description: "Fundet i køkkenskuffen da strømmen kom tilbage. Håndtaget er slidt — denne skruenøgle har lavet meget arbejde i dette hus.",
      flavor: "Det rigtige værktøj. Endelig.",
    },
  },
  {
    id: "artifact-candle",
    chapterId: "act-3",
    title: "The Candle",
    description:
      "A half-burned taper candle from the conservatory, with a box of matches. The wax is a deep red. Someone brought this specifically.",
    icon: "🕯️",
    flavor: "The flame makes the walls look different.",
    isKeyClue: true,
    isArtifact: true,
    da: {
      title: "Lysestagen",
      description: "Et halvt brændt stearinlys fra vinterhaven, med en tændstikæske. Voksen er dyb rød. Nogen bragte dette specifikt.",
      flavor: "Flammen får væggene til at se anderledes ud.",
    },
  },
  {
    id: "artifact-final-note",
    chapterId: "act-3",
    title: "The Note from the Shed",
    description:
      "Found inside the shed, on the floor under the date list. A handwritten note — signed with names that are almost, but not quite, your names.\n\n*\"We came. We stayed. We failed... This time.. Finish it... Every last drop.\"*\n\n*[Signed with anagrammed player names — rendered dynamically]*",
    icon: "📄",
    flavor: "The handwriting is familiar in a way you cannot explain.",
    isKeyClue: true,
    isArtifact: true,
    da: {
      title: "Sedlen fra Skuret",
      description: "Fundet inde i skuret, på gulvet under datolisten. En håndskrevet seddel — underskrevet med navne der er næsten, men ikke helt, jeres navne.\n\n*\"Vi kom. Vi blev. Vi fejlede... Denne gang.. Afslut det... Til allersidste dråbe.\"*\n\n*[Underskrevet med anagrammerede spillernavne — renderet dynamisk]*",
      flavor: "Håndskriften er bekendt på en måde du ikke kan forklare.",
    },
  },

  // ==========================================
  // ACT 3 — THE SEALED WALL
  // Revealed by candle. Three lines written at different times.
  // ==========================================
  {
    id: "sealed-wall-writing",
    chapterId: "act-3",
    title: "The Writing on the Sealed Wall",
    description:
      "The candle held close to the sealed wall surface reveals writing — faint but deliberate. Three lines, written at different times, in different hands.\n\n*July 19th 2010*\n\n*\"We locked it so we'd have to come back.\"*\n\n*\"If you found this, you already know. You just haven't admitted it yet.\"*",
    icon: "🕯️",
    flavor: "The oldest date. The first visit. They sealed themselves out.",
    isKeyClue: true,
    da: {
      title: "Teksten på Den Forseglet Væg",
      description: "Lyset holdt tæt til den forseglede vægflade afslører skrift — svag men bevidst. Tre linjer, skrevet på forskellige tidspunkter, i forskellige hænder.\n\n*19. juli 2010*\n\n*\"Vi låste det så vi måtte komme tilbage.\"*\n\n*\"Hvis du fandt dette, ved du allerede. Du har bare ikke indrømmet det endnu.\"*",
      flavor: "Den ældste dato. Det første besøg. De forseglede sig selv ude.",
    },
  },
];

export function getClue(id: string): Clue | undefined {
  return CLUES.find((c) => c.id === id);
}

export function getCluesByChapter(chapterId: string): Clue[] {
  return CLUES.filter((c) => c.chapterId === chapterId);
}

export function getArtifacts(): Clue[] {
  return CLUES.filter((c) => c.isArtifact === true);
}
