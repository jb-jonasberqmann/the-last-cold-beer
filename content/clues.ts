import type { Clue } from "@/types/content";

// ==========================================
// CHAPTER 1 CLUES — 8 total
// ==========================================
export const CLUES: Clue[] = [
  // --- Chapter 1 ---
  {
    id: "clue-fridge-note",
    chapterId: "chapter-1",
    title: "The Note",
    description:
      "A handwritten note on the beer. It reads: \"PROPERTY OF THE RITUAL. DO NOT OPEN BEFORE THE VERDICT. — The Committee.\" The handwriting is oddly neat. Someone planned this.",
    icon: "📝",
    flavor: "Someone brought a pen. Someone made a plan.",
    isKeyClue: true,
    da: {
      title: "Sedlen",
      description: "En håndskrevet seddel på øl'en. Den siger: \"RITUALET EJES AF KOMITEEN. MÅ IKKE ÅBNES FØR KENDELSEN. — Komiteen.\" Håndskriften er mærkværdigt pæn. Nogen planlagde dette.",
      flavor: "Nogen medbragte en pen. Nogen lavede en plan.",
    },
  },
  {
    id: "clue-cold-timestamp",
    chapterId: "chapter-1",
    title: "The Ice Formation",
    description:
      "The condensation pattern and ice crystal formation on the can suggests it has been in the fridge for at least 18 hours — meaning it was placed there before anyone arrived. Someone came early. Or never left.",
    icon: "🧊",
    flavor: "This beer has been waiting longer than anyone admits.",
    isKeyClue: false,
    da: {
      title: "Isformationen",
      description: "Kondensationsmønsteret og iskrystalformationen på dåsen tyder på, at den har stået i køleskabet i mindst 18 timer — det betyder, at den blev placeret der inden nogen ankom. Nogen kom tidligt. Eller gik aldrig.",
      flavor: "Denne øl har ventet længere end nogen tilstår.",
    },
  },
  {
    id: "clue-kitchen-calendar",
    chapterId: "chapter-1",
    title: "The Cabin Calendar",
    description:
      "A paper calendar on the kitchen wall. One date is circled in red: last year's cabin trip weekend. Next to it, someone has written a single word in tiny letters: \"UNPAID.\"",
    icon: "📅",
    flavor: "A debt not forgotten. A score not settled.",
    isKeyClue: true,
    da: {
      title: "Hyttekalenderen",
      description: "En papirkalender på køkkenvæggen. Én dato er ringet ind med rødt: det forrige hyttetures weekend. Ved siden af har nogen skrevet ét ord med bittesmå bogstaver: \"UBETALT.\"",
      flavor: "En gæld ikke glemt. En konto ikke gjort op.",
    },
  },
  {
    id: "clue-coffee-table-ring",
    chapterId: "chapter-1",
    title: "The Ring Mark",
    description:
      "A perfect ring stain on the coffee table. The diameter matches exactly one type of bottle. Next to it: a faint chalk outline that someone tried to rub away but didn't quite manage.",
    icon: "⭕",
    flavor: "Something was placed here deliberately. Someone marked the spot.",
    isKeyClue: false,
    da: {
      title: "Ringpletten",
      description: "En perfekt ringplet på sofabordet. Diameteren passer præcist til én type flaske. Ved siden af: en svag kritridning som nogen forsøgte at gnide væk men ikke helt formåede.",
      flavor: "Noget blev bevidst placeret her. Nogen markerede stedet.",
    },
  },
  {
    id: "clue-terrace-inscription",
    chapterId: "chapter-1",
    title: "The Terrace Note",
    description:
      "Taped to the back of the terrace chair, facing the treeline: a laminated slip of paper. \"5-4-3-2-1-0. The ritual completes at zero.\" Signed at the bottom with two initials: J.B.",
    icon: "🪵",
    flavor: "Someone left this knowing someone would eventually look. Someone knew they'd be back.",
    isKeyClue: true,
    da: {
      title: "Terrasse-Sedlen",
      description: "Fastgjort på bagsiden af terrassestolen der vender mod træerne: en lamineret seddel. \"5-4-3-2-1-0. Ritualet fuldendes ved nul.\" Underskrevet i bunden med to initialer: J.B.",
      flavor: "Nogen efterlod dette vel vidende at nogen til sidst ville kigge. Nogen vidste de ville vende tilbage.",
    },
  },
  {
    id: "clue-shed-inventory",
    chapterId: "chapter-1",
    title: "The Shed Inventory",
    description:
      "A laminated sheet on the shed wall: \"OFFICIAL CABIN INVENTORY — Last checked: last year's trip.\" Listing: Item 5: Garden Furniture. Item 6: Spare Key. Item 7: THE COOLER — STATUS: Locked. COMBINATION: ??? — Ask the one who broke the pact. Item 8: Mooring Rope. Item 9: Old Paint Box.",
    icon: "📋",
    flavor: "Whoever made this knew there would be a mystery. They were ready.",
    isKeyClue: true,
    da: {
      title: "Skurets Inventar",
      description: "Et lamineret ark fastgjort på skurets væg: \"OFFICIEL HYTTE-INVENTAR — Sidst tjekket: hyttetur i fjor.\" Listen: Genstand 5: Havemøbler. Genstand 6: Reservenøgle. Genstand 7: KØLEREN — STATUS: Låst. KOMBINATION: ??? — Spørg den der brød pagten. Genstand 8: Fortøjningsreb. Genstand 9: Gammel Maleboks.",
      flavor: "Den der lavede dette vidste der ville komme et mysterium. De var klar.",
    },
  },
  {
    id: "clue-fridge-temperature",
    chapterId: "chapter-1",
    title: "The Temperature Setting",
    description:
      "The fridge dial has been turned to its maximum setting — far colder than you'd ever need for normal groceries. Someone set it specifically for preservation. The beer was meant to stay perfect until the right moment.",
    icon: "🌡️",
    flavor: "Someone wanted this beer to be impossibly cold. They succeeded.",
    isKeyClue: false,
    da: {
      title: "Temperaturindstillingen",
      description: "Køleskabets knap er drejet til maksimum — langt koldere end du nogensinde ville bruge til normale madvarer. Nogen indstillede den specifikt til bevaring. Øl'en var tiltænkt at forblive perfekt til det rette øjeblik.",
      flavor: "Nogen ønskede denne øl umuligt kold. De lykkedes.",
    },
  },
  {
    id: "clue-coffee-table-coaster",
    chapterId: "chapter-1",
    title: "The Coaster Code",
    description:
      "Tucked under a coaster: a small card with five symbols drawn in ballpoint pen. Each symbol corresponds to a letter if you know the Cabin Alphabet — a made-up code from three trips ago that only your group uses.",
    icon: "🃏",
    flavor: "This was made by someone who has been here before. Many times.",
    isKeyClue: true,
    da: {
      title: "Brikkekoden",
      description: "Gemt under en brik: et lille kort med fem symboler tegnet med kuglepen. Hvert symbol svarer til et bogstav — hvis du kender Hyttealfabetet, den hjemmelavede kode jeres gruppe opfandt for tre ture siden.",
      flavor: "Dette er lavet af nogen der har været her før. Mange gange.",
    },
  },

  // --- Chapter 2 (stubs — content TBD) ---
  {
    id: "clue-group-chat-screenshot",
    chapterId: "chapter-2",
    title: "The Screenshot",
    description: "TODO: Chapter 2 clue content.",
    icon: "📱",
    flavor: "TODO",
    isKeyClue: true,
  },
  {
    id: "clue-receipt-discrepancy",
    chapterId: "chapter-2",
    title: "The Receipt",
    description: "TODO: Chapter 2 clue content.",
    icon: "🧾",
    flavor: "TODO",
    isKeyClue: false,
  },

  // --- Chapter 3 (stubs — content TBD) ---
  {
    id: "clue-final-ballot",
    chapterId: "chapter-3",
    title: "The Ballot",
    description: "TODO: Chapter 3 clue content.",
    icon: "🗳️",
    flavor: "TODO",
    isKeyClue: true,
  },
  {
    id: "clue-alphabet-key",
    chapterId: "chapter-3",
    title: "The Alphabet Key",
    description: "TODO: Chapter 3 clue content.",
    icon: "🔑",
    flavor: "TODO",
    isKeyClue: true,
  },
];

export function getClue(id: string): Clue | undefined {
  return CLUES.find((c) => c.id === id);
}

export function getCluesByChapter(chapterId: string): Clue[] {
  return CLUES.filter((c) => c.chapterId === chapterId);
}

export function getCluesByIds(ids: string[]): Clue[] {
  return ids.map((id) => CLUES.find((c) => c.id === id)).filter(Boolean) as Clue[];
}
