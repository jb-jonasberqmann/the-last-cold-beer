import type { Room } from "@/types/content";

// ==========================================
// ALL ROOMS — Three-act structure
// ==========================================

export const ROOMS: Room[] = [

  // ==========================================
  // ACT 1 — THE ARRIVAL
  // Outside. Late afternoon. Golden hour.
  // ==========================================

  {
    id: "driveway",
    chapterId: "act-1",
    title: "The Driveway",
    type: "mystery_room",
    look: {
      icon: "🚗",
      theme: "outdoor-warm",
      atmosphere:
        "Gravel crunching under wheels. Someone's already unloading bags before the engine's off. The house is right there — weathered white paint, large garden, terrace visible around the side. The front door has a key box. Mads has the code. Mads isn't here.",
      backgroundStyle: "outdoor-golden",
      colorFrom: "from-amber-900",
      colorTo: "to-stone-900",
    },
    description:
      "Cars parked. Bags on the gravel. The house is right there. But the front door has a key box with a code — and Mads, who always holds the key, isn't answering his phone. Start exploring while you wait.",
    lockedDescription: "The starting point. Cars, gravel, the house.",
    unlockCost: 0,
    unlockRequires: [],
    questIds: ["driveway-arrival-a", "driveway-arrival-b", "driveway-mads-call"],
    rewardClueIds: ["fragment-driveway-a", "fragment-driveway-b"],
    isOptional: false,
    order: 1,
    da: {
      title: "Indkørslen",
      description: "Biler parkeret. Tasker på grusen. Huset er lige derover. Men hoveddøren har en nøgleboks med en kode — og Mads, der altid har nøglen, svarer ikke sin telefon.",
      lockedDescription: "Startpunktet. Biler, grus, huset.",
      atmosphere: "Grus knaser under hjulene. Nogen er allerede ved at pakke ud inden motoren er slukket. Huset er lige der — forvitret hvid maling, stor have, terrasse synlig rundt om siden.",
    },
  },

  {
    id: "terrace",
    chapterId: "act-1",
    title: "The Terrace",
    type: "mystery_room",
    look: {
      icon: "🌲",
      theme: "outdoor-warm",
      atmosphere:
        "A new wooden deck along the front of the house. You can see straight through the glass into the living room — the furniture, the shelves, the radio on the shelf in the dining room beyond. The door is right there. Locked. The key box glows faintly.",
      backgroundStyle: "outdoor-golden",
      colorFrom: "from-amber-800",
      colorTo: "to-stone-800",
    },
    description:
      "The terrace runs along the front of the house. New wood — bright, unstained. You can see inside through the glass doors but cannot enter. There's a shelf visible on the other side of the glass — worth a closer look.",
    lockedDescription: "The terrace. Explore the driveway first.",
    unlockCost: 0,
    unlockRequires: ["driveway"],
    questIds: ["terrace-shelf-a", "terrace-shelf-b", "terrace-view"],
    rewardClueIds: ["fragment-terrace-a", "fragment-terrace-b"],
    isOptional: false,
    order: 2,
    da: {
      title: "Terrassen",
      description: "Terrassen løber langs forsiden af huset. Nyt træ — lyst, ubehandlet. Du kan se ind gennem glasdørene men kan ikke komme ind. Der er en hylde synlig på den anden side af glasset — værd at kigge nærmere på.",
      lockedDescription: "Terrassen. Udforsk indkørslen først.",
      atmosphere: "En ny trædæk langs forsiden af huset. Du kan se direkte ind i stuen — møblerne, hylderne, radioen på hylden i spisestuen bagved.",
    },
  },

  {
    id: "garden",
    chapterId: "act-1",
    title: "The Garden",
    type: "mystery_room",
    look: {
      icon: "🌿",
      theme: "outdoor-wild",
      atmosphere:
        "1,250 square metres of fenced coastal garden. Wild grass, a few old fruit trees, the shed at the back. The wind comes off the water. Something is carved into the old oak — worth reading closely.",
      backgroundStyle: "outdoor-green",
      colorFrom: "from-green-900",
      colorTo: "to-stone-900",
    },
    description:
      "Large fenced garden, natural and breezy. The old oak near the back fence looks like it's been used for something more than once. Worth a closer look at the bark.",
    lockedDescription: "The garden. Finish the terrace first.",
    unlockCost: 1,
    unlockRequires: ["terrace"],
    questIds: ["garden-search", "garden-oak-riddle-a", "garden-oak-riddle-b"],
    rewardClueIds: ["fragment-garden-a", "fragment-garden-b"],
    isOptional: false,
    order: 3,
    da: {
      title: "Haven",
      description: "Stor indhegnet have, naturlig og blæsende. Den gamle egetræ ved baghegnet ser ud til at have været brugt til mere end én ting. Værd at kigge nærmere på barken.",
      lockedDescription: "Haven. Afslut indkørslen først.",
      atmosphere: "1.250 kvadratmeter indhegnet kystgård. Vildgræs, et par gamle frugttræer, skuret bagerst.",
    },
  },

  {
    id: "shed",
    chapterId: "act-1",
    title: "The Shed",
    type: "mystery_room",
    look: {
      icon: "🔧",
      theme: "rust-dark",
      atmosphere:
        "Weathered outbuilding at the back of the garden. Tools, grill equipment, a broken chair. And on the inside wall, pinned with actual push-pins and laminated in plastic: a list. You should look at the list.",
      backgroundStyle: "rustic-shed",
      colorFrom: "from-stone-900",
      colorTo: "to-amber-950",
    },
    description:
      "The shed hasn't been properly tidied since the house was built. Look at what's pinned to the wall. Someone has been keeping track of something.",
    lockedDescription: "The shed. Explore the garden first.",
    unlockCost: 1,
    unlockRequires: ["garden"],
    questIds: ["shed-date-list-quest"],
    rewardClueIds: ["fragment-shed", "shed-date-list"],
    isOptional: false,
    order: 4,
    da: {
      title: "Skuret",
      description: "Forvitret udestue bagerst i haven. Se hvad der er fastgjort til væggen.",
      lockedDescription: "Skuret. Udforsk haven først.",
      atmosphere: "Forvitret udestue bagerst i haven. Værktøj, grilludstyr, en ødelagt stol. Og på indervæggen, fastgjort med rigtige tegnestifter og lamineret i plast: en liste.",
    },
  },

  {
    id: "petanque-court",
    chapterId: "act-1",
    title: "The Pétanque Court",
    type: "mystery_room",
    look: {
      icon: "🎳",
      theme: "outdoor-wild",
      atmosphere:
        "A strip of packed gravel between two wooden boards. A set of metal balls in a canvas bag, one of them missing. The bag has a tag on it — handwritten, slightly water-damaged.",
      backgroundStyle: "outdoor-gravel",
      colorFrom: "from-stone-800",
      colorTo: "to-green-950",
    },
    description:
      "An optional detour. The pétanque court is off to one side of the garden. The metal balls are all here — except one. The canvas bag has a tag that might be interesting.",
    lockedDescription: "The pétanque court. Visible from the garden.",
    unlockCost: 0,
    unlockRequires: ["garden"],
    questIds: ["petanque-missing-ball", "petanque-social"],
    rewardClueIds: [],
    isOptional: true,
    order: 3,
    da: {
      title: "Pétanquebanen",
      description: "En valgfri omvej. Pétanquebanen er lidt til siden af haven.",
      lockedDescription: "Pétanquebanen. Synlig fra haven.",
      atmosphere: "Et stykke pakket grus mellem to træplanker. Et sæt metalbolte i en lærredspose, en af dem mangler.",
    },
  },

  {
    id: "front-door",
    chapterId: "act-1",
    title: "The Front Door",
    type: "mystery_room",
    look: {
      icon: "🚪",
      theme: "outdoor-warm",
      atmosphere:
        "The key box is mounted to the right of the door. Four digits. The house waits. You have all four fragments now. Enter the code.",
      backgroundStyle: "outdoor-golden",
      colorFrom: "from-amber-950",
      colorTo: "to-stone-950",
    },
    description:
      "The front door, at last. The key box requires a four-digit code. Your team has collected all the fragments — from the driveway, the terrace, the garden, and the shed. Combine them in the right order and enter.",
    lockedDescription: "The front door. Help Mads unload first — he's blocking the way.",
    unlockCost: 0,
    unlockRequires: ["shed"],
    unlockRequiresArtifacts: ["mads-unloaded"],
    questIds: ["front-door-keybox"],
    rewardClueIds: [],
    isOptional: false,
    order: 6,
    da: {
      title: "Hoveddøren",
      description: "Hoveddøren, endelig. Nøgleboksen kræver en firecifret kode. Jeres hold har samlet alle fragmenterne.",
      lockedDescription: "Hoveddøren. Hjælp Mads med at losse først — han blokerer vejen.",
      atmosphere: "Nøgleboksen er monteret til højre for døren. Fire cifre. Huset venter.",
    },
  },

  {
    id: "carport",
    chapterId: "act-1",
    title: "The Carport",
    type: "mystery_room",
    look: {
      icon: "🚙",
      theme: "outdoor-warm",
      atmosphere:
        "Covered concrete, oil stains, a workbench with old tools. A tarp folded in the corner, weighed down with a loose brick. And on the back wall, low down near the floor: two chalk arrows. One pointing down. One pointing right. Someone drew these deliberately.",
      backgroundStyle: "outdoor-golden",
      colorFrom: "from-stone-800",
      colorTo: "to-amber-950",
    },
    description:
      "An optional detour. The covered parking bay at the side of the house — empty now, but not untouched. Someone has been here. There are chalk marks on the wall that weren't made by accident. If you figure out what they mean, it might give you an edge later.",
    lockedDescription: "The carport. An optional side route from the garden.",
    unlockCost: 0,
    unlockRequires: ["garden"],
    questIds: ["carport-chalk"],
    rewardClueIds: [],
    isOptional: true,
    order: 7,
    da: {
      title: "Carporten",
      description: "En valgfri omvej. Den overdækkede parkeringsplads ved siden af huset — tom nu, men ikke urørt. Nogen har været her.",
      lockedDescription: "Carporten. En valgfri sidevej fra haven.",
      atmosphere: "Dækket beton, olieindfarvet, et arbejdsbord med gammelt værktøj. Et presenning foldet i hjørnet, holdt nede af en løs mursten. Og på bagevæggen, lavt nede ved gulvet: to kridt-pile.",
    },
  },

  // ==========================================
  // ACT 2 — SETTLING IN
  // Inside. Evening. Warm lamplight.
  // ==========================================

  {
    id: "double-room",
    chapterId: "act-2",
    title: "The Double Room",
    type: "mystery_room",
    isSingleOccupancy: true,
    look: {
      icon: "🛏️",
      theme: "cabin-warm",
      atmosphere:
        "A double bed, a half-packed bag open on the floor, something still plugged into the wall that nobody unpacked. The bedside lamp is on — someone left it that way. A note is on the bedside table. It ends mid-sentence.",
      backgroundStyle: "warm-wood",
      colorFrom: "from-amber-900",
      colorTo: "to-stone-900",
    },
    description:
      "The first bedroom. A couple stayed here. They left in a hurry — didn't mean to leave anything behind. One player enters alone. The room locks for teammates once claimed.",
    lockedDescription: "The double room. One player at a time.",
    unlockCost: 0,
    unlockRequires: [],
    questIds: ["double-room-explore", "double-room-note-a", "double-room-note-b"],
    rewardClueIds: ["word-owed", "word-promised"],
    isOptional: false,
    order: 1,
    da: {
      title: "Dobbeltværelset",
      description: "Det første soveværelse. Et par boede her. De forlod det hurtigt — mente ikke at efterlade noget. Én spiller træder ind alene.",
      lockedDescription: "Dobbeltværelset. Én ad gangen.",
      atmosphere: "En dobbeltseng, en halvt pakket taske åben på gulvet, noget stadig tilsluttet i væggen som ingen pakkede ud.",
    },
  },

  {
    id: "single-room",
    chapterId: "act-2",
    title: "The Single Room",
    type: "mystery_room",
    isSingleOccupancy: true,
    look: {
      icon: "🛌",
      theme: "cabin-cool",
      atmosphere:
        "A single bed, neatly made on one side, the pillow indented. Some things placed with intention. Others dropped mid-action. The note on the desk started as an observation and ended as something else.",
      backgroundStyle: "cool-pine",
      colorFrom: "from-stone-900",
      colorTo: "to-slate-900",
    },
    description:
      "The single room. One person stayed here — alone, deliberately. They started calm and ended somewhere else entirely. One player enters alone. The room locks for teammates once claimed.",
    lockedDescription: "The single room. One player at a time.",
    unlockCost: 0,
    unlockRequires: [],
    questIds: ["single-room-explore", "single-room-note-a", "single-room-note-b"],
    rewardClueIds: ["word-borrowed", "word-broken"],
    isOptional: false,
    order: 2,
    da: {
      title: "Enkeltværelset",
      description: "Enkeltværelset. Én person boede her — alene, bevidst. De startede roligt og endte et helt andet sted.",
      lockedDescription: "Enkeltværelset. Én ad gangen.",
      atmosphere: "En enkelt seng, pænt redt på den ene side, puden nedsunket. Nogle ting placeret med intention. Andre droppet midt i en handling.",
    },
  },

  {
    id: "bunk-room",
    chapterId: "act-2",
    title: "The Bunk Room",
    type: "mystery_room",
    isSingleOccupancy: true,
    look: {
      icon: "🪜",
      theme: "cabin-dark",
      atmosphere:
        "A bunk bed, pine frame, slightly creaky. The top bunk is unmade — the bottom bunk has been slept in. Look up from the bottom bunk. Look at the underside of the mattress above you.",
      backgroundStyle: "dark-pine",
      colorFrom: "from-stone-950",
      colorTo: "to-slate-950",
    },
    description:
      "The bunk room. Someone who knew exactly what they were doing stayed here. The note is not on the desk. The note is on the underside of the top bunk mattress. You have to lie down to read it. One player enters alone.",
    lockedDescription: "The bunk room. One player at a time.",
    unlockCost: 0,
    unlockRequires: [],
    questIds: ["bunk-room-explore", "bunk-room-note-a", "bunk-room-note-b"],
    rewardClueIds: ["word-taken", "word-buried"],
    isOptional: false,
    order: 3,
    da: {
      title: "Køjestuen",
      description: "Køjestuen. Nogen der vidste præcis hvad de lavede boede her. Sedlen er ikke på skrivebordet. Sedlen er på undersiden af den øverste køje-madras.",
      lockedDescription: "Køjestuen. Én ad gangen.",
      atmosphere: "En køjeseng, fyrretræsramme, lidt knirkende. Den øverste køje er ikke redt — den nederste er sovet i.",
    },
  },

  {
    id: "living-room",
    chapterId: "act-2",
    title: "The Living Room",
    type: "mystery_room",
    look: {
      icon: "🛋️",
      theme: "cabin-warm",
      atmosphere:
        "The warmest room. Wood-burning stove, not lit but still warm. A shelf of mismatched paperbacks. The radio in the dining room is audible from here — low, crackling. You can almost hear words in the static.",
      backgroundStyle: "warm-living",
      colorFrom: "from-amber-900",
      colorTo: "to-orange-950",
    },
    description:
      "All three bedroom players reconvene here. The room shows three blank spaces. Each of you holds one word. Together you complete the sentence. The Bunk Room player cannot type — they must communicate by other means.",
    lockedDescription: "The living room. All three bedrooms must be completed first.",
    unlockCost: 0,
    unlockRequires: ["double-room", "single-room", "bunk-room"],
    questIds: ["living-room-sentence-a", "living-room-sentence-b"],
    rewardClueIds: [],
    isOptional: false,
    order: 4,
    da: {
      title: "Stuen",
      description: "Alle tre soveværelsers spillere samles her. Rummet viser tre tomme felter. Hver af jer har ét ord. Sammen fuldfører I sætningen.",
      lockedDescription: "Stuen. Alle tre soveværelser skal afsluttes først.",
      atmosphere: "Det varmeste rum. Brændeovn, ikke tændt men stadig varm. En hylde med blandede paperbacks. Radioen i spisestuen er hørlig herfra — lav, knatrende.",
    },
  },

  {
    id: "sunroom",
    chapterId: "act-2",
    title: "The Sunroom",
    type: "mystery_room",
    look: {
      icon: "🪟",
      theme: "outdoor-cool",
      atmosphere:
        "Off the living room. Glass on three sides. The plants are doing fine — better than expected, actually, for a house that's supposedly been empty. The first place you notice the wind has picked up.",
      backgroundStyle: "glass-room",
      colorFrom: "from-stone-800",
      colorTo: "to-green-950",
    },
    description:
      "A conservatory off the living room. Glass walls, a few hardy plants. Slightly cooler than the rest of the house — the wind is audible here. Optional investigation.",
    lockedDescription: "The sunroom. Finish the living room first.",
    unlockCost: 0,
    unlockRequires: ["living-room"],
    questIds: ["sunroom-plants", "sunroom-wind", "sunroom-sunblind"],
    rewardClueIds: ["sunroom-blind-mark"],
    isOptional: true,
    order: 5,
    da: {
      title: "Vinterhaven",
      description: "En vinterhave ved stuen. Glasvægge, et par hårdføre planter. Lidt køligere end resten af huset.",
      lockedDescription: "Vinterhaven. Afslut stuen først.",
      atmosphere: "Ud fra stuen. Glas på tre sider. Planterne har det fint — bedre end forventet.",
    },
  },

  {
    id: "dining-room",
    chapterId: "act-2",
    title: "The Dining Room",
    type: "mystery_room",
    look: {
      icon: "🕯️",
      theme: "cabin-warm",
      atmosphere:
        "A long pine table, eight chairs. Candles in holders. And the sound — the static you've heard all evening is louder in here than anywhere else in the house. It's coming from the shelf. Something up there is glowing faint green.",
      backgroundStyle: "warm-dining",
      colorFrom: "from-amber-950",
      colorTo: "to-stone-900",
    },
    description:
      "The dining room. The long pine table, the candles — and that sound, louder than anywhere else. Something in this room has been trying to get your attention all evening. Find out what it is.",
    lockedDescription: "The dining room. Explore the rest of the house first.",
    unlockCost: 0,
    unlockRequires: ["living-room", "kitchen-act2"],
    questIds: ["dining-room-static", "dining-room-source"],
    rewardClueIds: [],
    isOptional: false,
    order: 7,
    da: {
      title: "Spisestuen",
      description: "Spisestuen. Det lange fyrretræsbord, stearinlysene — og den lyd, højere end noget andet sted. Noget i dette rum har forsøgt at få jeres opmærksomhed hele aftenen. Find ud af hvad det er.",
      lockedDescription: "Spisestuen. Udforsk resten af huset først.",
      atmosphere: "Et langt fyrretræsbord, otte stole. Stearinlys i lysestager. Og lyden — statikken er højere herinde end noget andet sted i huset. Den kommer fra hylden. Noget deroppe gløder svagt grønt.",
    },
  },

  {
    id: "kitchen-act2",
    chapterId: "act-2",
    title: "The Kitchen",
    type: "mystery_room",
    look: {
      icon: "🍳",
      theme: "cabin-warm",
      atmosphere:
        "Functional, lived-in. Someone made coffee this morning — or someone always makes coffee the morning after arriving, regardless of who was last here. The static from the dining room is audible. Something in the kitchen explains one of the fragments.",
      backgroundStyle: "warm-kitchen",
      colorFrom: "from-amber-900",
      colorTo: "to-stone-900",
    },
    description:
      "The kitchen. Pots hung, knives in the block, fridge humming. The radio is audible from here. A fragment of the signal is clearer in this room — something about the acoustics amplifies it.",
    lockedDescription: "The kitchen. Explore the living room first.",
    unlockCost: 0,
    unlockRequires: ["living-room"],
    questIds: ["kitchen-act2-explore", "kitchen-act2-fragment-a", "kitchen-act2-fragment-b"],
    rewardClueIds: ["radio-fragment-kitchen"],
    isOptional: false,
    order: 6,
    da: {
      title: "Køkkenet",
      description: "Køkkenet. Potter hængt op, knive i blokken, køleskab summende. Radioen er hørlig herfra.",
      lockedDescription: "Køkkenet. Udforsk stuen først.",
      atmosphere: "Funktionelt, beboet. Nogen lavede kaffe i morges — eller nogen laver altid kaffe morgenen efter ankomsten.",
    },
  },

  {
    id: "the-toilet",
    chapterId: "act-2",
    title: "The Toilet",
    type: "mystery_room",
    look: {
      icon: "🚽",
      theme: "cabin-warm",
      atmosphere:
        "Small, functional, and — somehow — within earshot of the dining room radio. Someone has been leaving notes taped up in here all night, same handwriting as everywhere else in the house.",
      backgroundStyle: "warm-kitchen",
      colorFrom: "from-stone-800",
      colorTo: "to-stone-950",
    },
    description:
      "The toilet, off the kitchen. Small room, but the radio reaches even here. One more fragment of the signal, and a note that has nothing to do with the radio and everything to do with the roll being almost empty.",
    lockedDescription: "The toilet. Explore the kitchen first.",
    unlockCost: 0,
    unlockRequires: ["kitchen-act2"],
    questIds: ["toilet-last-a", "toilet-last-b"],
    rewardClueIds: ["radio-fragment-toilet"],
    isOptional: false,
    order: 6.5,
    da: {
      title: "Toilettet",
      description: "Toilettet, ved køkkenet. Lille rum, men radioen når selv herind. Endnu et fragment af signalet, og en seddel der intet har med radioen at gøre og alt med at rullen næsten er tom.",
      lockedDescription: "Toilettet. Udforsk køkkenet først.",
      atmosphere: "Lille og funktionelt, og — på en eller anden måde — inden for hørevidde af spisestuens radio.",
    },
  },

  {
    id: "activity-room",
    chapterId: "act-2",
    title: "The Activity Room",
    type: "mystery_room",
    look: {
      icon: "🏓",
      theme: "cabin-warm",
      atmosphere:
        "Table tennis, darts, foosball, mini billiards. The fun room. The one everyone ends up in before bed. Tonight it has one more thing going on — a fragment of the radio signal is clearest here.",
      backgroundStyle: "warm-games",
      colorFrom: "from-stone-800",
      colorTo: "to-amber-900",
    },
    description:
      "The activity room. Games, equipment, and — most relevantly — the acoustic sweet spot for the dining room radio. Something here holds the final fragment you've been hearing.",
    lockedDescription: "The activity room. Explore the kitchen first.",
    unlockCost: 0,
    unlockRequires: ["kitchen-act2"],
    questIds: ["activity-room-fragment-a", "activity-room-fragment-b", "activity-room-social"],
    rewardClueIds: ["radio-fragment-activity"],
    isOptional: false,
    order: 8,
    da: {
      title: "Aktivitetsrummet",
      description: "Aktivitetsrummet. Spil, udstyr, og — mest relevant — det akustiske sweet spot for spisestruerens radio.",
      lockedDescription: "Aktivitetsrummet. Udforsk køkkenet først.",
      atmosphere: "Bordtennis, dart, fodboldspil, mini biljard. Sjovets rum.",
    },
  },

  {
    id: "darts-board",
    chapterId: "act-2",
    title: "The Darts Board",
    type: "mystery_room",
    look: {
      icon: "🎯",
      theme: "cabin-warm",
      atmosphere:
        "A proper bristle board, mounted at regulation height. The previous game is still scored on the chalkboard beside it. Three players. One winning. One missing.",
      backgroundStyle: "warm-games",
      colorFrom: "from-stone-900",
      colorTo: "to-amber-950",
    },
    description:
      "A side investigation off the activity room. A proper darts board with a previous game still chalked up. Figure out who the missing player was.",
    lockedDescription: "The darts board. Off the activity room.",
    unlockCost: 0,
    unlockRequires: ["activity-room"],
    questIds: ["darts-missing-player", "darts-social"],
    rewardClueIds: [],
    isOptional: true,
    order: 9,
    da: {
      title: "Dartskiven",
      description: "En sideundersøgelse ved aktivitetsrummet. En ordenlig dartskive med et tidligere spil stadig kridtet op.",
      lockedDescription: "Dartskiven. Fra aktivitetsrummet.",
      atmosphere: "En ordenlig borstelskive, monteret i reguleringshøjde. Det forrige spil er stadig scoret på kridttavlen.",
    },
  },

  {
    id: "foosball-table",
    chapterId: "act-2",
    title: "The Foosball Table",
    type: "mystery_room",
    look: {
      icon: "⚽",
      theme: "cabin-warm",
      atmosphere:
        "A proper foosball table, the handles worn smooth with use. One of the goalie rods is slightly bent. The ball is inside — someone closed the table with the ball still in it.",
      backgroundStyle: "warm-games",
      colorFrom: "from-green-950",
      colorTo: "to-stone-900",
    },
    description:
      "A side investigation. The foosball table has a slight mechanical quirk — and a ball sealed inside it. Figure out why.",
    lockedDescription: "The foosball table. Off the activity room.",
    unlockCost: 0,
    unlockRequires: ["activity-room"],
    questIds: ["foosball-bent-rod", "foosball-social"],
    rewardClueIds: [],
    isOptional: true,
    order: 10,
    da: {
      title: "Fodboldbordet",
      description: "En sideundersøgelse. Fodboldbordet har en lille mekanisk egenhed — og en bold forseglet inde i det.",
      lockedDescription: "Fodboldbordet. Fra aktivitetsrummet.",
      atmosphere: "Et ordenligt fodboldsbord, håndtagene slidt glatte af brug.",
    },
  },

  // ==========================================
  // ACT 3 — THE LATE NIGHT
  // Full property. Darkness. Things that were funny are not funny.
  // ==========================================

  {
    id: "dining-room-dark",
    chapterId: "act-3",
    title: "The Dining Room",
    type: "mystery_room",
    look: {
      icon: "🌑",
      theme: "dark",
      atmosphere:
        "Dark. The radio is silent. You are exactly where you were when the lights went out. The long pine table is still here. The radio on the shelf is still. The house feels different in the dark.",
      backgroundStyle: "dark-room",
      colorFrom: "from-stone-950",
      colorTo: "to-zinc-950",
    },
    description:
      "The house is dark. The radio defeated itself. You are starting here — in the room where everything changed. Find a way to see.",
    lockedDescription: "The dining room. This is where Act 3 begins.",
    unlockCost: 0,
    unlockRequires: [],
    questIds: ["dark-dining-orient"],
    rewardClueIds: [],
    isOptional: false,
    order: 1,
    da: {
      title: "Spisestuen",
      description: "Huset er mørkt. Radioen besejrede sig selv. Du starter her — i rummet hvor alt ændrede sig.",
      lockedDescription: "Spisestuen. Her begynder Akt 3.",
      atmosphere: "Mørkt. Radioen er stille. Du er præcis der hvor du var da lysene gik ud.",
    },
  },

  {
    id: "utility-corner",
    chapterId: "act-3",
    title: "The Utility Corner",
    type: "mystery_room",
    look: {
      icon: "🔦",
      theme: "dark",
      atmosphere:
        "A recess off the dining room you hadn't noticed before. Hooks on the wall. A coat you don't recognise. A basket of things that belong to the house, not to any visitor. Including a flashlight.",
      backgroundStyle: "dark-utility",
      colorFrom: "from-zinc-950",
      colorTo: "to-stone-950",
    },
    description:
      "A utility corner off the dining room — unlit, barely noticed in Act 2. In the dark it's the first place worth checking. There is a flashlight here.",
    lockedDescription: "A recess in the dark. Investigate the dining room first.",
    unlockCost: 0,
    unlockRequires: ["dining-room-dark"],
    questIds: ["utility-find-flashlight"],
    rewardClueIds: ["artifact-flashlight"],
    isOptional: false,
    order: 2,
    da: {
      title: "Redskabshjørnet",
      description: "Et hjørne ved spisestuen du ikke had bemærket før. Kroge på væggen. Et tørklæde du ikke genkender. Og en lommelygte.",
      lockedDescription: "En fordybning i mørket. Undersøg spisestuen først.",
      atmosphere: "Et fremspring fra spisestuen du ikke hatte bemærket. Kroge på væggen. En kurv med ting der tilhører huset.",
    },
  },

  {
    id: "back-corridor",
    chapterId: "act-3",
    title: "The Back Corridor",
    type: "mystery_room",
    look: {
      icon: "🚪",
      theme: "dark",
      atmosphere:
        "With the flashlight, you can see it now — a corridor you walked past all evening. Under the stairs. Three doors you didn't try. One of them is very slightly ajar.",
      backgroundStyle: "dark-corridor",
      colorFrom: "from-stone-950",
      colorTo: "to-zinc-950",
    },
    description:
      "The back corridor, visible now with the flashlight. Under the stairs. Doors you didn't notice in Act 2. One is ajar — that's the fuse box.",
    lockedDescription: "The back corridor. You need the flashlight first.",
    unlockCost: 0,
    unlockRequires: ["utility-corner"],
    unlockRequiresArtifacts: ["artifact-flashlight"],
    questIds: ["corridor-explore", "corridor-door-check"],
    rewardClueIds: [],
    isOptional: false,
    order: 3,
    da: {
      title: "Bagkorridoren",
      description: "Bagkorridoren, synlig nu med lommelygten. Under trappen. Døre du ikke lagde mærke til i Akt 2.",
      lockedDescription: "Bagkorridoren. Du har brug for lommelygten først.",
      atmosphere: "Med lommelygten kan du nu se det — en korridor du gik forbi hele aftenen.",
    },
  },

  {
    id: "fuse-box",
    chapterId: "act-3",
    title: "The Fuse Box",
    type: "mystery_room",
    look: {
      icon: "⚡",
      theme: "dark",
      atmosphere:
        "A metal panel screwed into the wall. One breaker is tripped. One fuse is blown — the old glass-tube kind. If you had a replacement, you could restore partial power. Just enough.",
      backgroundStyle: "dark-metal",
      colorFrom: "from-zinc-950",
      colorTo: "to-slate-950",
    },
    description:
      "The fuse box. One blown fuse. Find the replacement and you can restore power to one circuit — enough to light one room.",
    lockedDescription: "The fuse box. Find it in the back corridor.",
    unlockCost: 0,
    unlockRequires: ["back-corridor"],
    questIds: ["fusebox-identify", "fusebox-repair"],
    rewardClueIds: ["artifact-fuse"],
    isOptional: false,
    order: 4,
    da: {
      title: "Sikringsskabet",
      description: "Et metalpanel skruet ind i væggen. Én sikring er sprunget — den gamle glasrørstype. Med en erstatning kan du gendanne delvis strøm.",
      lockedDescription: "Sikringsskabet. Find det i bagkorridoren.",
      atmosphere: "Et metalpanel skruet ind i væggen. Én afbryder er udløst. Én sikring er sprunget.",
    },
  },

  {
    id: "kitchen-dark",
    chapterId: "act-3",
    title: "The Kitchen",
    type: "mystery_room",
    look: {
      icon: "💡",
      theme: "dark",
      atmosphere:
        "With the fuse in place, one light in the kitchen flickers on. Not bright — just enough. The kitchen you cooked in earlier is the same kitchen, but different at night. The drawers hold different things now.",
      backgroundStyle: "dim-kitchen",
      colorFrom: "from-stone-950",
      colorTo: "to-amber-950",
    },
    description:
      "The kitchen, partially lit. The fuse gives you one working light. Look in the drawers — something useful was in here all along.",
    lockedDescription: "The kitchen. Restore partial power with the fuse first.",
    unlockCost: 0,
    unlockRequires: ["fuse-box"],
    unlockRequiresArtifacts: ["artifact-fuse"],
    questIds: ["dark-kitchen-drawer", "dark-kitchen-observe"],
    rewardClueIds: ["artifact-wrench"],
    isOptional: false,
    order: 5,
    da: {
      title: "Køkkenet",
      description: "Køkkenet, delvist oplyst. Sikringen giver dig ét arbejdende lys. Kig i skufferne.",
      lockedDescription: "Køkkenet. Gendan delvis strøm med sikringen først.",
      atmosphere: "Med sikringen på plads blinker ét lys i køkkenet. Ikke lyst — bare nok.",
    },
  },

  {
    id: "broken-window",
    chapterId: "act-3",
    title: "The Broken Window",
    type: "mystery_room",
    look: {
      icon: "💨",
      theme: "dark",
      atmosphere:
        "A window latch that rattles. You've been hearing it all night — thought it was the wind. It's the latch. With the wrench, you can fix it. The silence after is louder than the rattle ever was.",
      backgroundStyle: "dark-window",
      colorFrom: "from-stone-950",
      colorTo: "to-slate-950",
    },
    description:
      "A rattling window latch off the kitchen. A dead end — no artifact here — but the silence after you fix it is notable. The house sounds different.",
    lockedDescription: "A rattling window. You need the wrench first.",
    unlockCost: 0,
    unlockRequires: ["kitchen-dark"],
    unlockRequiresArtifacts: ["artifact-wrench"],
    questIds: ["window-fix", "window-silence"],
    rewardClueIds: [],
    isOptional: true,
    order: 6,
    da: {
      title: "Det Ødelagte Vindue",
      description: "En knatrende vindueshængsle ud fra køkkenet. En blindgyde — intet artefakt her — men stilheden efter du fikser det er bemærkelsesværdig.",
      lockedDescription: "Et knatrende vindue. Du har brug for skruenøglen først.",
      atmosphere: "En vindueshængsle der rasler. Du har hørt den hele natten.",
    },
  },

  {
    id: "door-nobody-tried",
    chapterId: "act-3",
    title: "The Door Nobody Tried",
    type: "mystery_room",
    look: {
      icon: "🚪",
      theme: "dark",
      atmosphere:
        "Old wood. No markings. You walked past it in Act 2 — it was just a door. In the dark, you try it. It opens. What's behind it is not a room.",
      backgroundStyle: "dark-old-door",
      colorFrom: "from-stone-950",
      colorTo: "to-zinc-950",
    },
    description:
      "The door nobody tried in Act 2. Now you try it. It opens. The entrance beyond is sealed — the old doorframe outline visible, the threshold walled up from the inside. A branch leads further in if you have a candle.",
    lockedDescription: "A door in the back corridor. Nothing special, until now.",
    unlockCost: 0,
    unlockRequires: ["back-corridor"],
    questIds: ["door-nobody-tried-open", "door-nobody-tried-examine"],
    rewardClueIds: [],
    isOptional: false,
    order: 7,
    da: {
      title: "Døren Ingen Prøvede",
      description: "Døren ingen prøvede i Akt 2. Nu prøver du den. Den åbner. Indgangen bagved er forseglet — den gamle dørrammekontur synlig, tærsklen muret til indefra.",
      lockedDescription: "En dør i bagkorridoren. Intet specielt, indtil nu.",
      atmosphere: "Gammelt træ. Ingen mærker. Du gik forbi den i Akt 2 — det var bare en dør.",
    },
  },

  {
    id: "meter-cupboard",
    chapterId: "act-3",
    title: "The Meter Cupboard",
    type: "mystery_room",
    look: {
      icon: "🔌",
      theme: "dark-outside",
      atmosphere:
        "Just outside the door nobody tried, a weathered cupboard where the house's real power comes in — heavier hardware than the fuse box inside, the kind that takes both hands to move on purpose. The main switch is down. Not tripped. Thrown.",
      backgroundStyle: "dark-outside-metal",
      colorFrom: "from-zinc-950",
      colorTo: "to-stone-950",
    },
    description:
      "Right outside the door nobody tried — the house's main power switch. Somebody was out here in the last few minutes. Whatever the fuse box fixed inside, this undoes.",
    lockedDescription: "Something out there cut the power for real this time. Open the door first.",
    unlockCost: 0,
    unlockRequires: ["door-nobody-tried"],
    questIds: ["meter-cupboard-switch", "meter-cupboard-candle-hint"],
    rewardClueIds: ["meter-cupboard-cut"],
    isOptional: false,
    order: 7.5,
    da: {
      title: "Målerskabet",
      description: "Lige uden for døren ingen prøvede — husets hovedafbryder. Nogen var herude for få minutter siden. Hvad end sikringsskabet reparerede indenfor, gør dette til intet.",
      lockedDescription: "Noget derude har afbrudt strømmen for alvor denne gang. Åbn døren først.",
      atmosphere: "Lige uden for døren ingen prøvede, et vejrbidt skab hvor husets rigtige strøm kommer ind. Hovedafbryderen er nede. Ikke udløst. Slået om.",
    },
  },

  {
    id: "sealed-wall",
    chapterId: "act-3",
    title: "The Sealed Wall",
    type: "mystery_room",
    look: {
      icon: "🕯️",
      theme: "dark",
      atmosphere:
        "The candle held close to the sealed surface reveals something. Writing. Three lines. Written at different times, in different hands. The oldest date matches the first entry on the shed list.",
      backgroundStyle: "dark-hidden",
      colorFrom: "from-stone-950",
      colorTo: "to-zinc-950",
    },
    description:
      "The sealed wall, visible through the door nobody tried. Not a room — a walled-up entrance. Hold the candle close. The heat reveals writing on the plaster.",
    lockedDescription: "Something behind the door. You need a candle to see it.",
    unlockCost: 0,
    unlockRequires: ["meter-cupboard"],
    unlockRequiresArtifacts: ["artifact-candle"],
    questIds: ["sealed-wall-read", "sealed-wall-understand"],
    rewardClueIds: ["sealed-wall-writing"],
    isOptional: false,
    order: 8,
    da: {
      title: "Den Forseglede Væg",
      description: "Den forseglede væg, synlig gennem døren ingen prøvede. Ikke et rum — en tilmuret indgang. Hold lyset tæt.",
      lockedDescription: "Noget bag døren. Du har brug for et stearinlys for at se det.",
      atmosphere: "Lyset holdt tæt til den forseglede flade afslører noget.",
    },
  },

  {
    id: "behind-the-shed",
    chapterId: "act-3",
    title: "Behind the Shed",
    type: "mystery_room",
    look: {
      icon: "🌑",
      theme: "dark-outside",
      atmosphere:
        "Back outside. The garden is completely dark. The shed is the same shed from Act 1. Behind it — a section of the garden you didn't explore. The darkness here is different from inside. It's total.",
      backgroundStyle: "dark-garden",
      colorFrom: "from-stone-950",
      colorTo: "to-green-950",
    },
    description:
      "Back outside, in the dark. Behind the shed is a section of the garden that wasn't on the Act 1 map. Peak eeriness of Act 3. Branches lead to the conservatory and back to the shed itself.",
    lockedDescription: "Behind the shed. You need to reach it through the corridor.",
    unlockCost: 0,
    unlockRequires: ["back-corridor"],
    questIds: ["behind-shed-explore", "behind-shed-dark"],
    rewardClueIds: [],
    isOptional: false,
    order: 9,
    da: {
      title: "Bag Skuret",
      description: "Tilbage udenfor, i mørket. Bag skuret er en del af haven der ikke var på Akt 1-kortet. Topspidsen af uhygge i Akt 3.",
      lockedDescription: "Bag skuret. Du skal nå det via korridoren.",
      atmosphere: "Tilbage udenfor. Haven er fuldstændig mørk. Skuret er det samme skur fra Akt 1.",
    },
  },

  {
    id: "conservatory",
    chapterId: "act-3",
    title: "The Conservatory",
    type: "mystery_room",
    look: {
      icon: "🌿",
      theme: "dark-outside",
      atmosphere:
        "A glass structure off the back of the garden, partially hidden by overgrowth. Cold in here, colder than outside. The wind is very audible. A candle stands in a holder on the windowsill — full, unlit. Someone left it.",
      backgroundStyle: "dark-glass",
      colorFrom: "from-green-950",
      colorTo: "to-stone-950",
    },
    description:
      "A conservatory off the garden behind the shed. Cold, glassy, wind-loud. On the windowsill: a full red candle with a matchbox. Someone placed it deliberately.",
    lockedDescription: "The conservatory. Go behind the shed first.",
    unlockCost: 0,
    unlockRequires: ["behind-the-shed"],
    questIds: ["conservatory-find-candle", "conservatory-cold"],
    rewardClueIds: ["artifact-candle"],
    isOptional: false,
    order: 10,
    da: {
      title: "Vinterhaven",
      description: "En glasstruktur fra baghaven, delvist skjult af vækst. Koldt herinde, koldere end udenfor. Et stearinlys på vindueskarmens lysestage — fuldt, uantændt.",
      lockedDescription: "Vinterhaven. Gå bag skuret først.",
      atmosphere: "En glasstruktur fra baghaven. Koldt, glasholdigt, vindlydende.",
    },
  },

  {
    id: "shed-dark",
    chapterId: "act-3",
    title: "The Shed",
    type: "mystery_room",
    look: {
      icon: "🔦",
      theme: "dark-outside",
      atmosphere:
        "The shed from Act 1. Same shed. The date list is still on the wall — all dates crossed out except tonight's. On the floor under it: a note. The handwriting is familiar in a way you cannot explain.",
      backgroundStyle: "dark-shed",
      colorFrom: "from-stone-950",
      colorTo: "to-amber-950",
    },
    description:
      "Back in the shed. The date list is still there. But now there's something on the floor underneath it that you didn't notice in Act 1 — or chose not to see. A note, signed with names that are almost yours.",
    lockedDescription: "The shed. Go behind it first.",
    unlockCost: 0,
    unlockRequires: ["behind-the-shed"],
    questIds: ["shed-dark-note", "shed-dark-date-list"],
    rewardClueIds: ["artifact-final-note"],
    isOptional: false,
    order: 11,
    da: {
      title: "Skuret",
      description: "Tilbage i skuret. Datolisten er stadig der. Men nu er der noget på gulvet under den som du ikke lagde mærke til i Akt 1.",
      lockedDescription: "Skuret. Gå bag det først.",
      atmosphere: "Skuret fra Akt 1. Samme skur. Datolisten er stadig på væggen.",
    },
  },

  {
    id: "living-room-boss",
    chapterId: "act-3",
    title: "The Living Room",
    type: "boss_room",
    look: {
      icon: "🛋️",
      theme: "dark",
      atmosphere:
        "The same room where you assembled the sentence. The stove is completely cold now. The radio is silent. The group is back together. It's time to face what the house has been trying to tell you.",
      backgroundStyle: "dark-living",
      colorFrom: "from-stone-950",
      colorTo: "to-zinc-950",
    },
    description:
      "The living room. The place where everything comes together. You need the final artifact before the boss will engage. Face YOURSELVES.",
    lockedDescription: "The living room. You need the final artifact from the shed.",
    unlockCost: 0,
    unlockRequires: ["shed-dark", "door-nobody-tried"],
    unlockRequiresArtifacts: ["artifact-final-note"],
    questIds: [],
    rewardClueIds: [],
    isOptional: false,
    order: 12,
    da: {
      title: "Stuen",
      description: "Stuen. Stedet hvor alt samles. Du har brug for det endelige artefakt inden bosset engagerer sig.",
      lockedDescription: "Stuen. Du har brug for det endelige artefakt fra skuret.",
      atmosphere: "Det samme rum hvor du samlede sætningen. Ovnen er fuldstændig kold nu. Radioen er stille.",
    },
  },
];

export function getRoom(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}

export function getRoomsByChapter(chapterId: string): Room[] {
  return ROOMS.filter((r) => r.chapterId === chapterId).sort((a, b) => a.order - b.order);
}
