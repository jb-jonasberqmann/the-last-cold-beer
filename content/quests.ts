import type { Quest } from "@/types/content";

// ==========================================
// ALL QUESTS — Three-act structure
// Each room has 1-3 quests. Required quests must be completed to mark room done.
// ==========================================

export const QUESTS: Quest[] = [

  // ==========================================
  // ACT 1 — THE ARRIVAL
  // ==========================================

  // --- DRIVEWAY ---
  {
    id: "driveway-arrival-a",
    roomId: "driveway",
    forTeam: "team-a",
    type: "photo",
    title: "The Ritual Record",
    description:
      "The house keeps a record of everyone who visits. Tonight is no different. Before anything else, your arrival must be documented.",
    prompt:
      "One of you holds the camera. Gather the rest of your team in front of the house and take ONE photo of them — everyone, together, all in frame, phone held sideways (landscape, not portrait). The house will not accept anything less.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardClueId: "fragment-driveway-a",
    rewardText:
      "Vibe check complete. I count 3 of you. I might be wrong. I might be right. Who are you to judge — I'm only a bot. Filed as the arrival count. Might matter later.",
    da: {
      title: "Ritualets Optegnelse",
      description: "Huset fører optegnelser over alle der besøger det. I aften er ingen undtagelse. Inden noget andet skal jeres ankomst dokumenteres.",
      prompt: "Én af jer holder kameraet. Saml resten af holdet foran huset og tag ÉT billede af dem — alle sammen, i samme billede. Huset accepterer ikke mindre.",
      rewardText: "Vibe check gennemført. Jeg tæller 3 af jer. Jeg kan tage fejl. Jeg kan have ret. Hvem er I til at dømme — jeg er bare en bot. Noteret som ankomsttallet. Kan vise sig at betyde noget senere.",
    },
  },
  {
    id: "driveway-arrival-b",
    roomId: "driveway",
    forTeam: "team-b",
    type: "photo",
    title: "The Ritual Record",
    description:
      "The house keeps a record of everyone who visits. Tonight is no different. Before anything else, your arrival must be documented.",
    prompt:
      "One of you holds the camera. Gather the rest of your team in front of the house and take ONE photo of them — everyone, together, all in frame, phone held sideways (landscape, not portrait). The house will not accept anything less.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardClueId: "fragment-driveway-b",
    rewardText:
      "Vibe check complete. I count 6 of you. I might be wrong. I might be right. Who are you to judge — I'm only a bot. Filed as the arrival count. Might matter later.",
    da: {
      title: "Ritualets Optegnelse",
      description: "Huset fører optegnelser over alle der besøger det. I aften er ingen undtagelse. Inden noget andet skal jeres ankomst dokumenteres.",
      prompt: "Én af jer holder kameraet. Saml resten af holdet foran huset og tag ÉT billede af dem — alle sammen, i samme billede. Huset accepterer ikke mindre.",
      rewardText: "Vibe check gennemført. Jeg tæller 6 af jer. Jeg kan tage fejl. Jeg kan have ret. Hvem er I til at dømme — jeg er bare en bot. Noteret som ankomsttallet. Kan vise sig at betyde noget senere.",
    },
  },
  {
    id: "driveway-mads-call",
    roomId: "driveway",
    type: "puzzle",
    title: "Where Is the Keybearer?",
    description:
      "Whoever holds the code isn't here. Their phone is going to voicemail. How many times does someone need to call before everyone agrees to stop?",
    prompt:
      "Your team calls. No answer. You call again. Still nothing. On which call does the group agree to stop waiting and start exploring? Enter the number.",
    order: 2,
    isRequired: false,
    hints: [
      { order: 1, offerCost: 1, text: "There is no wrong answer. This is about the group's collective patience." },
    ],
    answer: {
      correct: ["3", "three", "tre", "2", "two", "to", "4", "four", "fire", "5", "five", "fem"],
      normalized: true,
    },
    rewardText: "The decision is made. Explore now, deal with the code later. Whoever has it can wait.",
    da: {
      title: "Hvor Er Nøgleholderen?",
      description: "Den der holder koden er her ikke. Telefonen går på voicemail.",
      prompt: "Jeres hold ringer. Intet svar. I ringer igen. Stadig ingenting. Ved hvilket opkald er gruppen enige om at stoppe med at vente og begynde at udforske?",
    },
  },

  // --- TERRACE ---
  {
    id: "terrace-shelf-a",
    roomId: "terrace",
    forTeam: "team-a",
    type: "puzzle",
    title: "The Shelf Through the Glass",
    description:
      "Through the terrace glass: a shelf holds ten numbered spines, 0 through 9, evenly spaced — except one slot on the shelf is empty.",
    prompt:
      "Reading left to right, the spines you can make out are: 4, 7, 2, 9, 8, 1, 0, 3, 6. Which digit never made it onto the shelf?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Write out 0 through 9. Cross off every digit you can see on the shelf. One will be left." },
    ],
    answer: {
      correct: ["5", "five", "fem"],
      normalized: true,
    },
    rewardClueId: "fragment-terrace-a",
    rewardText: "5. The missing spine. Someone took that one off the shelf on purpose.",
    failureText: "Cross off each digit you can see, one at a time. Whatever's left over is the answer.",
    da: {
      title: "Hylden Gennem Glasset",
      description: "Gennem terrassens glas: en hylde med ti nummererede rygge, 0 til 9, jævnt fordelt — undtagen én tom plads på hylden.",
      prompt: "Læst fra venstre mod højre kan du se ryggene: 4, 7, 2, 9, 8, 1, 0, 3, 6. Hvilket ciffer nåede aldrig hylden?",
      rewardText: "5. Den manglende ryg. Nogen fjernede den fra hylden med vilje.",
      failureText: "Streg hvert ciffer du kan se ud, ét ad gangen. Det der er tilbage er svaret.",
    },
  },
  {
    id: "terrace-shelf-b",
    roomId: "terrace",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Shelf Through the Glass",
    description:
      "Through the terrace glass: a shelf holds ten numbered spines, 0 through 9, evenly spaced — except one slot on the shelf is empty.",
    prompt:
      "Reading left to right, the spines you can make out are: 5, 8, 1, 9, 4, 0, 7, 3, 6. Which digit never made it onto the shelf?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Write out 0 through 9. Cross off every digit you can see on the shelf. One will be left." },
    ],
    answer: {
      correct: ["2", "two", "to"],
      normalized: true,
    },
    rewardClueId: "fragment-terrace-b",
    rewardText: "2. The missing spine. Someone took that one off the shelf on purpose.",
    failureText: "Cross off each digit you can see, one at a time. Whatever's left over is the answer.",
    da: {
      title: "Hylden Gennem Glasset",
      description: "Gennem terrassens glas: en hylde med ti nummererede rygge, 0 til 9, jævnt fordelt — undtagen én tom plads på hylden.",
      prompt: "Læst fra venstre mod højre kan du se ryggene: 5, 8, 1, 9, 4, 0, 7, 3, 6. Hvilket ciffer nåede aldrig hylden?",
      rewardText: "2. Den manglende ryg. Nogen fjernede den fra hylden med vilje.",
      failureText: "Streg hvert ciffer du kan se ud, ét ad gangen. Det der er tilbage er svaret.",
    },
  },

  // --- GARDEN ---
  {
    id: "garden-oak-riddle-a",
    roomId: "garden",
    forTeam: "team-a",
    type: "puzzle",
    title: "What the Oak Knows",
    description:
      "Carved into the old oak near the back fence — not a number, but a description of one.",
    prompt:
      "\"I am the loneliest digit. Nothing below me is stranger than being alone. I am also the very first — put me beside any number, and it means more than it did a moment ago.\" What digit is being described?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "It's the first number anyone ever counts to." },
    ],
    answer: {
      correct: ["1", "one", "en", "et"],
      normalized: true,
    },
    rewardClueId: "fragment-garden-a",
    rewardText: "1. Carved in one clean line. The garden keeps secrets — this one just needed reading, not digging.",
    failureText: "Think about counting. What's the very first number you ever say?",
    da: {
      title: "Hvad Egen Ved",
      description: "Ridset ind i den gamle egetræ ved baghegnet — ikke et tal, men en beskrivelse af ét.",
      prompt: "\"Jeg er det mest ensomme ciffer. Intet under mig er mærkeligere end at være alene. Jeg er også den allerførste — sæt mig ved siden af et hvilket som helst tal, og det betyder mere end det gjorde et øjeblik før.\" Hvilket ciffer bliver beskrevet?",
      rewardText: "1. Ridset i én ren streg. Haven holder hemmeligheder — denne skulle bare læses, ikke graves frem.",
      failureText: "Tænk på at tælle. Hvad er det allerførste tal du siger?",
    },
  },
  {
    id: "garden-oak-riddle-b",
    roomId: "garden",
    forTeam: "team-b",
    type: "puzzle",
    title: "What the Oak Knows",
    description:
      "Carved into the old oak near the back fence — not a number, but a description of one.",
    prompt:
      "\"I am an even number. If you cut me in half horizontally, I become two zeros. If I tip onto my side, I become infinity. What am I?\"",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Picture the shape. Two circles, stacked." },
    ],
    answer: {
      correct: ["8", "eight", "otte"],
      normalized: true,
    },
    rewardClueId: "fragment-garden-b",
    rewardText: "8. Carved as two stacked circles. The garden keeps secrets — this one just needed reading, not digging.",
    failureText: "Draw the shape the riddle is describing. What digit looks like that?",
    da: {
      title: "Hvad Egen Ved",
      description: "Ridset ind i den gamle egetræ ved baghegnet — ikke et tal, men en beskrivelse af ét.",
      prompt: "\"Jeg er et lige tal. Hvis du skærer mig over vandret, bliver jeg til to nuller. Hvis jeg vipper om på siden, bliver jeg til uendelighed. Hvad er jeg?\"",
      rewardText: "8. Ridset som to stablede cirkler. Haven holder hemmeligheder — denne skulle bare læses, ikke graves frem.",
      failureText: "Tegn formen som gåden beskriver. Hvilket ciffer ligner det?",
    },
  },

  // --- SHED ---
  {
    id: "shed-date-list-quest",
    roomId: "shed",
    type: "puzzle",
    title: "The Date List",
    description:
      "Pinned to the inside wall of the shed — laminated, with actual push pins — a handwritten list of dates, written as plain numbers, one under another. All crossed out except the last.\n\n~~07192010~~\n~~07112011~~\n~~07232012~~\n~~07152013~~\n~~07142014~~\n~~07202015~~\n~~07182016~~\n~~07102017~~\n~~07162018~~\n~~07222019~~\n~~07132020~~\n~~07192021~~\n~~07112022~~\n~~07172023~~\n~~07152024~~\n~~07212025~~\n\n**{{TODAY}} — not crossed out.**",
    prompt:
      "Read the list again, top to bottom. Every line has exactly one thing in common that never changes, no matter the year. Find it — then turn what you find into a single digit, 0 through 9.",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Ignore the last six digits of each line. Look only at the first two." },
      { order: 2, offerCost: 1, text: "Those first two digits are a month, written as a number. Which month is it?" },
    ],
    answer: {
      correct: ["7", "seven", "syv"],
      normalized: true,
    },
    rewardClueId: "fragment-shed",
    rewardText:
      "7. Every single date starts with 07 — July, the seventh month, without exception, across sixteen years. Someone has been keeping track. Every year. They always cross the date out.",
    failureText: "The last six digits change every line. The first two never do.",
    da: {
      title: "Datolisten",
      description: "Fastgjort til indervæggen i skuret — lamineret, med rigtige tegnestifter — en håndskrevet liste af datoer, skrevet som rene tal, én under den anden. Alle overstreget undtagen den sidste.\n\n~~07192010~~\n~~07112011~~\n~~07232012~~\n~~07152013~~\n~~07142014~~\n~~07202015~~\n~~07182016~~\n~~07102017~~\n~~07162018~~\n~~07222019~~\n~~07132020~~\n~~07192021~~\n~~07112022~~\n~~07172023~~\n~~07152024~~\n~~07212025~~\n\n**{{TODAY}} — ikke overstreget.**",
      prompt: "Læs listen igen, top til bund. Hver linje har præcis én ting til fælles, som aldrig ændrer sig, uanset året. Find den — og omsæt det du finder til ét ciffer, 0 til 9.",
      rewardText: "7. Hver eneste dato starter med 07 — juli, den syvende måned, uden undtagelse, gennem seksten år. Nogen har holdt styr på det. Hvert år. De overstreger altid datoen.",
      failureText: "De sidste seks cifre ændrer sig hver linje. De første to gør aldrig.",
    },
  },

  // --- PETANQUE COURT ---
  {
    id: "petanque-missing-ball",
    roomId: "petanque-court",
    type: "puzzle",
    title: "The Missing Ball",
    description:
      "The canvas bag has a full set of pétanque balls — except one. The bag has a handwritten tag: \"Set of 8. Return all 8. If you find the 8th, you'll know where it's been.\" The 8th ball is not here.",
    prompt: "The bag holds 7 balls. The missing 8th — where would it logically be, based on the tag?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "The tag implies the missing ball has been somewhere specific. Where do you find things that have been missing for years?" },
    ],
    answer: {
      correct: ["shed", "skuret", "garden", "haven", "ground", "buried", "hidden", "missing"],
      normalized: true,
    },
    rewardText: "The 8th ball is somewhere in the garden. Optional to find — but the tag was placed deliberately.",
    da: {
      title: "Den Manglende Kugle",
      description: "Posen har et fuldt sæt pétanque-kugler — undtagen én.",
      prompt: "Posen indeholder 7 kugler. Den manglende 8. — hvor ville den logisk set være, baseret på mærket?",
    },
  },
  // --- CARPORT ---
  {
    id: "carport-chalk",
    roomId: "carport",
    type: "social_challenge",
    title: "The Chalk Arrows",
    description:
      "Two chalk arrows on the back wall of the carport, low down near the floor. Both pointing right — one just a little further along than the other. They're careful — too deliberate to be accidental. No label, no date, no signature.",
    prompt:
      "The group must agree on what the arrows mean. Any interpretation — as long as everyone commits to the same one. Seal the agreement with a toast before you move on.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 1,
    rewardText: "Agreed. Whatever the arrows meant, you'll recognize the moment when it arrives.",
    da: {
      title: "Kridit-pilene",
      description: "To kridt-pile på bagevæggen af carporten, lavt nede ved gulvet. Én peger ned. Én peger til højre. De er omhyggelige — for bevidste til at være tilfældige.",
      prompt: "Gruppen skal blive enige om hvad pilene betyder. Enhver fortolkning — bare alle er enige om den samme. Beseglet aftalen med en skål før I går videre.",
      rewardText: "Aftalt. Uanset hvad pilene betød, genkender I øjeblikket når det kommer.",
    },
  },

  // --- FRONT DOOR ---
  {
    id: "front-door-keybox",
    roomId: "front-door",
    type: "puzzle",
    title: "The Key Box",
    description:
      "Four digits. Open your Case File and find your four Code Fragments. The order is the order you found them: Driveway first, then Terrace, Garden, and Shed last. Each fragment is a single digit. Read them in that order and enter the four-digit code.",
    prompt:
      "Ask one of your team members to open the Case File (🗂 top right on the map screen — you can't access it from inside a room). Find your four Code Fragment clues and read out each digit:\n\n" +
      "1. Code Fragment — Driveway\n" +
      "2. Code Fragment — Terrace\n" +
      "3. Code Fragment — Garden\n" +
      "4. Code Fragment — Shed\n\n" +
      "Combine the four digits in that order. Enter the four-digit code below.",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "The digit for each location is written in bold inside each Code Fragment clue in your Case File. Open 🗂, find your four 'Code Fragment' entries, read the bold number in each." },
      { order: 2, offerCost: 2, text: "Read the fragments in the order you found them — Driveway, Terrace, Garden, Shed — and combine the four digits into one code." },
    ],
    answer: {
      correct: ["3517", "3 5 1 7", "6287", "6 2 8 7"],
      normalized: true,
    },
    rewardText: "Click. The key box opens. The door unlocks. Act 2 begins.",
    failureText: "The key box rejects it. Open your Case File and double-check each Code Fragment — the order is Driveway → Terrace → Garden → Shed.",
    da: {
      title: "Nøgleboksen",
      description: "Fire cifre. Åbn sagsmappen og find jeres fire Kodefragmenter. Rækkefølgen er den I fandt dem: Indkørslen først, så Terrassen, Haven og Skuret sidst.",
      prompt: "Bed et af jeres holdmedlemmer om at åbne sagsmappen (🗂 øverst til højre på kortskærmen — I kan ikke åbne den inde i et rum). Find jeres fire Kodefragment-ledetråde og læs hvert ciffer:\n\n1. Kodefragment — Indkørslen\n2. Kodefragment — Terrassen\n3. Kodefragment — Haven\n4. Kodefragment — Skuret\n\nKombiner de fire cifre i den rækkefølge. Indtast den firecifrede kode.",
      rewardText: "Klik. Nøgleboksen åbner. Døren låses op. Akt 2 begynder.",
      failureText: "Nøgleboksen afviser det. Tjek rækkefølgen: Indkørslen → Terrassen → Haven → Skuret.",
    },
  },

  // ==========================================
  // ACT 2 — SETTLING IN
  // ==========================================

  // --- DOUBLE ROOM ---
  {
    id: "double-room-explore",
    roomId: "double-room",
    type: "social_challenge",
    title: "Moving On",
    description: "A couple stayed here and left in a hurry — a half-packed bag, a lamp still on. There isn't much time to dwell on it.",
    prompt: "Take a sip and step past it. There's a note waiting.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 1,
    rewardText: "Moved on. The room keeps its story for later.",
    da: {
      title: "Videre",
      description: "Et par boede her og forlod det hurtigt — der er ikke tid til at dvæle ved det.",
      prompt: "Tag en slurk og gå videre. Der venter en seddel.",
    },
  },
  {
    id: "double-room-note-a",
    roomId: "double-room",
    forTeam: "team-a",
    type: "puzzle",
    title: "The Unfinished Note",
    description:
      "On the bedside table: a note. It ends mid-sentence, mid-word almost. The clue word appears twice in what's written — the same word, used in two different ways.",
    prompt:
      "Read the note from the double room bedside table. What word appears twice and seems to carry the most weight — and what fills the blank at the end?\n\n*\"We owed it to each other. We owed it to the house. I know we said we'd come back and finish what we ____.\"*",
    order: 2,
    isRequired: true,
    isPrivate: true,
    hints: [
      { order: 1, offerCost: 1, text: "Whatever fills the blank has to be the same word as the first two sentences — read them again." },
    ],
    answer: {
      correct: ["owed", "skyldte"],
      normalized: true,
    },
    rewardClueId: "word-owed",
    rewardText:
      "Owed. The word is in the Case File. Remember it — you'll need it in the Living Room.",
    failureText: "Read the first two sentences again. The blank has to match them.",
    da: {
      title: "Den Uafsluttede Seddel",
      description: "På natbordet: en seddel. Den slutter midt i en sætning.",
      prompt: "Læs sedlen fra dobbeltværelsets natbord. Hvilket ord optræder to gange og synes at bære mest vægt — og hvad udfylder det blanke felt til sidst?\n\n*\"Vi skyldte det hinanden. Vi skyldte det huset. Jeg ved vi sagde vi ville komme tilbage og afslutte hvad vi ____.\"*",
      rewardText: "Skyldte. Ordet er i sagsmappen.",
      failureText: "Læs de to første sætninger igen. Det blanke felt skal matche dem.",
    },
  },
  {
    id: "double-room-note-b",
    roomId: "double-room",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Unfinished Note",
    description:
      "On the bedside table: a note. It ends mid-sentence, mid-word almost. The clue word appears twice in what's written — the same word, used in two different ways.",
    prompt:
      "Read the note from the double room bedside table. What word appears twice and seems to carry the most weight — and what fills the blank at the end?\n\n*\"We promised it to each other. We promised it to the house. I know we said we'd come back and finish what we ____.\"*",
    order: 2,
    isRequired: true,
    isPrivate: true,
    hints: [
      { order: 1, offerCost: 1, text: "Whatever fills the blank has to be the same word as the first two sentences — read them again." },
    ],
    answer: {
      correct: ["promised", "lovede"],
      normalized: true,
    },
    rewardClueId: "word-promised",
    rewardText:
      "Promised. The word is in the Case File. Remember it — you'll need it in the Living Room.",
    failureText: "Read the first two sentences again. The blank has to match them.",
    da: {
      title: "Den Uafsluttede Seddel",
      description: "På natbordet: en seddel. Den slutter midt i en sætning.",
      prompt: "Læs sedlen fra dobbeltværelsets natbord. Hvilket ord optræder to gange og synes at bære mest vægt — og hvad udfylder det blanke felt til sidst?\n\n*\"Vi lovede det hinanden. Vi lovede det huset. Jeg ved vi sagde vi ville komme tilbage og afslutte hvad vi ____.\"*",
      rewardText: "Lovede. Ordet er i sagsmappen.",
      failureText: "Læs de to første sætninger igen. Det blanke felt skal matche dem.",
    },
  },

  // --- SINGLE ROOM ---
  {
    id: "single-room-explore",
    roomId: "single-room",
    type: "social_challenge",
    title: "Moving On",
    description: "Someone stayed here alone, deliberately. Whatever happened, it isn't for you to piece together standing in the doorway.",
    prompt: "Take a sip and get to the desk.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 1,
    rewardText: "Moved on. There's a note on the desk.",
    da: {
      title: "Videre",
      description: "Nogen boede her alene, bevidst. Det er ikke til jer at gennemskue fra døren.",
      prompt: "Tag en slurk og gå hen til skrivebordet.",
    },
  },
  {
    id: "single-room-note-a",
    roomId: "single-room",
    forTeam: "team-a",
    type: "puzzle",
    title: "The Observation That Became a Crisis",
    description:
      "A note on the desk. It started as a calm observation and ended somewhere else entirely. The clue word is in every sentence — each time slightly larger in scope.",
    prompt:
      "Read the note from the single room desk. The same word repeats — each time slightly bigger in scope. What fills the final blank?\n\n*\"This is not even my house. Borrowed it is. Not even my bed. Borrowed. This... life... ______?\"*",
    order: 2,
    isRequired: true,
    isPrivate: true,
    hints: [
      { order: 1, offerCost: 1, text: "The word appears in almost every line." },
    ],
    answer: {
      correct: ["borrowed", "lånt"],
      normalized: true,
    },
    rewardClueId: "word-borrowed",
    rewardText:
      "Borrowed. The word is in the Case File. You'll need it in the Living Room.",
    failureText: "The word is in every sentence. It grows.",
    da: {
      title: "Observationen der Blev en Krise",
      description: "En seddel på skrivebordet. Den startede som en rolig observation og endte et helt andet sted.",
      prompt: "Læs sedlen fra enkeltværelsets skrivebord. Det samme ord gentager sig — hver gang lidt større. Hvad udfylder det sidste blanke felt?\n\n*\"Det er ikke engang mit hus. Lånt er det. Ikke engang min seng. Lånt. Dette... liv... ______?\"*",
      rewardText: "Lånt. Ordet er i sagsmappen.",
      failureText: "Ordet er i næsten hver sætning. Det vokser.",
    },
  },
  {
    id: "single-room-note-b",
    roomId: "single-room",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Observation That Became a Crisis",
    description:
      "A note on the desk. It started as a calm observation and ended somewhere else entirely. The clue word is in every sentence — each time slightly larger in scope.",
    prompt:
      "Read the note from the single room desk. The same word repeats — each time slightly bigger in scope. What fills the final blank?\n\n*\"This is not even my house. Broken it is. Not even my bed. Broken. This... life... ______?\"*",
    order: 2,
    isRequired: true,
    isPrivate: true,
    hints: [
      { order: 1, offerCost: 1, text: "The word appears in almost every line." },
    ],
    answer: {
      correct: ["broken", "ødelagt", "i stykker"],
      normalized: true,
    },
    rewardClueId: "word-broken",
    rewardText:
      "Broken. The word is in the Case File. You'll need it in the Living Room.",
    failureText: "The word is in every sentence. It grows.",
    da: {
      title: "Observationen der Blev en Krise",
      description: "En seddel på skrivebordet. Den startede som en rolig observation og endte et helt andet sted.",
      prompt: "Læs sedlen fra enkeltværelsets skrivebord. Det samme ord gentager sig — hver gang lidt større. Hvad udfylder det sidste blanke felt?\n\n*\"Det er ikke engang mit hus. I stykker er det. Ikke engang min seng. I stykker. Dette... liv... ______?\"*",
      rewardText: "I stykker. Ordet er i sagsmappen.",
      failureText: "Ordet er i næsten hver sætning. Det vokser.",
    },
  },

  // --- BUNK ROOM ---
  {
    id: "bunk-room-explore",
    roomId: "bunk-room",
    type: "social_challenge",
    title: "Claim a Bunk",
    description: "Top bunk unmade, bottom bunk slept in. Someone has to pick one — and whatever's worth finding here is hiding above whichever bunk you don't take.",
    prompt: "Take the bottom bunk, take a sip, and look up.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 1,
    rewardText: "Bottom bunk. Now look up.",
    da: {
      title: "Vælg en Køje",
      description: "Øverste køje er ikke redt, nederste er sovet i. Nogen skal vælge — og det der er værd at finde gemmer sig over den køje I ikke tager.",
      prompt: "Tag den nederste køje, tag en slurk, og se op.",
      rewardText: "Nederste køje. Se nu op.",
    },
  },
  {
    id: "bunk-room-note-a",
    roomId: "bunk-room",
    forTeam: "team-a",
    type: "puzzle",
    title: "The Underside of the Mattress",
    description:
      "Written on the underside of the top bunk mattress. Only visible from the bottom bunk. Cold. Minimal. Two sentences with the same blank.",
    prompt:
      "You're lying in the bottom bunk, looking up. One word fills the last blank — that word is yours to carry. But when you leave this room, you may NOT say it or write it. You must act it out for the rest of the team in silence.\n\n*\"It was taken. It is always ______.\"*",
    order: 2,
    isRequired: true,
    isPrivate: true,
    hints: [],
    answer: {
      correct: ["taken", "taget"],
      normalized: true,
    },
    rewardClueId: "word-taken",
    setsScaredSilent: true,
    rewardText:
      "The word is yours now — and something about this room has scared you silent. When you walk out, hand over what you found without saying a single word. Don't explain why. In the living room you cannot type — act your word out in silence until your team guesses. Keep this message to yourself.",
    failureText: "The same word that fills the first sentence fills the blank.",
    da: {
      title: "Undersiden af Madrassen",
      description: "Skrevet på undersiden af den øverste køje-madras. Kun synlig fra den nederste køje.",
      prompt: "Du ligger i den nederste køje og kigger op. Ét ord udfylder det sidste blanke felt — det ord er dit at bære. Men når du forlader dette rum, må du IKKE sige det eller skrive det. Du skal fremvise det for holdet i tavshed.\n\n*\"Det blev taget. Det bliver altid ______.\"*",
      rewardText: "Ordet er dit nu — og noget ved dette rum har skræmt dig til tavshed. Når du går ud, afleverer du hvad du fandt uden at sige et eneste ord. Forklar ikke hvorfor. I stuen kan du ikke skrive — fremvis dit ord i tavshed indtil holdet gætter. Behold denne besked for dig selv.",
      failureText: "Det samme ord som i den første sætning udfylder det blanke felt.",
    },
  },
  {
    id: "bunk-room-note-b",
    roomId: "bunk-room",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Underside of the Mattress",
    description:
      "Written on the underside of the top bunk mattress. Only visible from the bottom bunk. Cold. Minimal. Two sentences with the same blank.",
    prompt:
      "You're lying in the bottom bunk, looking up. One word fills the last blank — that word is yours to carry. But when you leave this room, you may NOT say it or write it. You must act it out for the rest of the team in silence.\n\n*\"It was buried. It is always ______.\"*",
    order: 2,
    isRequired: true,
    isPrivate: true,
    hints: [],
    answer: {
      correct: ["buried", "begravet"],
      normalized: true,
    },
    rewardClueId: "word-buried",
    setsScaredSilent: true,
    rewardText:
      "The word is yours now — and something about this room has scared you silent. When you walk out, hand over what you found without saying a single word. Don't explain why. In the living room you cannot type — act your word out in silence until your team guesses. Keep this message to yourself.",
    failureText: "The same word that fills the first sentence fills the blank.",
    da: {
      title: "Undersiden af Madrassen",
      description: "Skrevet på undersiden af den øverste køje-madras. Kun synlig fra den nederste køje.",
      prompt: "Du ligger i den nederste køje og kigger op. Ét ord udfylder det sidste blanke felt — det ord er dit at bære. Men når du forlader dette rum, må du IKKE sige det eller skrive det. Du skal fremvise det for holdet i tavshed.\n\n*\"Det blev begravet. Det bliver altid ______.\"*",
      rewardText: "Ordet er dit nu — og noget ved dette rum har skræmt dig til tavshed. Når du går ud, afleverer du hvad du fandt uden at sige et eneste ord. Forklar ikke hvorfor. I stuen kan du ikke skrive — fremvis dit ord i tavshed indtil holdet gætter. Behold denne besked for dig selv.",
      failureText: "Det samme ord som i den første sætning udfylder det blanke felt.",
    },
  },

  // --- LIVING ROOM ---
  {
    id: "living-room-sentence-a",
    roomId: "living-room",
    forTeam: "team-a",
    type: "puzzle",
    title: "Something _____, Something _____, Something _____",
    description:
      "Three blank spaces. Three bedroom players, three words. The Bunk Room player cannot type — they must communicate their word by other means. Fill in the blanks.",
    prompt:
      "The three bedroom players each hold one word. Assemble the sentence:\n\n*\"Something _____, something _____, something _____.\"*\n\nThe Double Room word fills the first blank. The Single Room word fills the second. The Bunk Room player must communicate their word without typing.",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Double Room: owed. Single Room: borrowed. Bunk Room: the player must mime it." },
    ],
    answer: {
      correct: [
        "something owed something borrowed something taken",
        "owed borrowed taken",
        "skyldte lånt taget",
        "noget skyldt noget lånt noget taget",
      ],
      normalized: true,
    },
    clearsScaredSilent: true,
    rewardText:
      "Something owed, something borrowed, something taken. The sentence is complete. The Bunk Room player may speak again — their silence was only for this room.",
    failureText: "Three words. One from each bedroom. The Bunk Room player cannot type — watch them.",
    da: {
      title: "Noget _____, Noget _____, Noget _____",
      description: "Tre tomme felter. Tre soveværelsesspillere, tre ord. Køjestuens spiller kan ikke skrive — de skal kommunikere deres ord på anden måde.",
      prompt: "De tre soveværelsesspillere har hvert ét ord. Saml sætningen:\n\n*\"Noget _____, noget _____, noget _____.\"*",
      rewardText: "Noget skyldt, noget lånt, noget taget. Sætningen er komplet. Køjestuens spiller kan tale igen.",
      failureText: "Tre ord. Ét fra hvert soveværelse. Køjestuens spiller kan ikke skrive — se på dem.",
    },
  },
  {
    id: "living-room-sentence-b",
    roomId: "living-room",
    forTeam: "team-b",
    type: "puzzle",
    title: "Something _____, Something _____, Something _____",
    description:
      "Three blank spaces. Three bedroom players, three words. The Bunk Room player cannot type — they must communicate their word by other means. Fill in the blanks.",
    prompt:
      "The three bedroom players each hold one word. Assemble the sentence:\n\n*\"Something _____, something _____, something _____.\"*\n\nThe Double Room word fills the first blank. The Single Room word fills the second. The Bunk Room player must communicate their word without typing.",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Double Room: promised. Single Room: broken. Bunk Room: the player must mime it." },
    ],
    answer: {
      correct: [
        "something promised something broken something buried",
        "promised broken buried",
        "lovede i stykker begravet",
        "noget lovet noget i stykker noget begravet",
      ],
      normalized: true,
    },
    clearsScaredSilent: true,
    rewardText:
      "Something promised, something broken, something buried. The sentence is complete. The Bunk Room player may speak again — their silence was only for this room.",
    failureText: "Three words. One from each bedroom. The Bunk Room player cannot type — watch them.",
    da: {
      title: "Noget _____, Noget _____, Noget _____",
      description: "Tre tomme felter. Tre soveværelsesspillere, tre ord. Køjestuens spiller kan ikke skrive — de skal kommunikere deres ord på anden måde.",
      prompt: "De tre soveværelsesspillere har hvert ét ord. Saml sætningen:\n\n*\"Noget _____, noget _____, noget _____.\"*",
      rewardText: "Noget lovet, noget i stykker, noget begravet. Sætningen er komplet. Køjestuens spiller kan tale igen.",
      failureText: "Tre ord. Ét fra hvert soveværelse. Køjestuens spiller kan ikke skrive — se på dem.",
    },
  },
  // --- THE TOILET ---
  {
    id: "toilet-last-a",
    roomId: "the-toilet",
    forTeam: "team-a",
    type: "puzzle",
    title: "The Roll",
    description:
      "The toilet. Mercifully unoccupied. The dining room radio reaches even here — faint through the wall, but latched onto the same one word it can't seem to get past. Taped to the wall at eye level, in handwriting you've seen all over this house: another note.",
    prompt:
      "The note reads: \"Whoever finds it like THIS is, undeniably and without appeal, the ____ one who gets to use it before somebody has to go buy more.\" You look down. One square left. What single word means 'the one after which there is no other'?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Think about a list. This word describes the end of it — and, right now, the end of the roll." },
    ],
    answer: {
      correct: ["last", "sidste"],
      normalized: true,
    },
    rewardClueId: "radio-fragment-toilet",
    rewardText:
      "Last. A fragment heard, right on cue: *\"...the last one...\"* Somewhere between relief and dread, you understand the radio a little better. Also: buy more toilet paper.",
    failureText: "It's the word for the end of a list — nothing comes after it. Also, still, no more paper.",
    da: {
      title: "Rullen",
      description: "Toilettet. Nådigt ubesat. Radioen fra spisestuen når selv herind — svagt gennem væggen, men fast besluttet på det samme ord den ikke kan komme forbi. Tapet på væggen i øjenhøjde, i en håndskrift du har set alle vegne i dette hus: endnu en seddel.",
      prompt: "Sedlen lyder: \"Den der finder den sådan HER, er, uden appel, den ____ der får lov at bruge den før nogen skal ud og købe mere.\" Du kigger ned. Ét stykke tilbage. Hvilket ord betyder 'den efter hvilken der ikke er nogen anden'?",
      rewardText: "Sidste. Et fragment hørt, lige på det rette tidspunkt: *\"...den sidste...\"* Køb mere toiletpapir.",
      failureText: "Det er ordet for enden af en liste — intet kommer efter det. Og stadig intet papir.",
    },
  },
  {
    id: "toilet-last-b",
    roomId: "the-toilet",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Roll",
    description:
      "The toilet. Small, functional, and — like everywhere else tonight — within earshot of the dining room radio. Taped above the sink at eye level, impossible to miss while washing your hands: another note in the same handwriting.",
    prompt:
      "It reads: \"House rule, non-negotiable: whoever is the ____ person to use this room before midnight has to check the roll. No exceptions, no delegating.\" What single word means 'the one after which there is no other'?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Think about a list. This word describes the end of it — and, apparently, house rules too." },
    ],
    answer: {
      correct: ["last", "sidste"],
      normalized: true,
    },
    rewardClueId: "radio-fragment-toilet",
    rewardText:
      "Last. A fragment heard, right as you dry your hands: *\"...the last one...\"* The radio is trying to tell you something, and so, apparently, is the bathroom.",
    failureText: "It's the word for the end of a list — nothing comes after it.",
    da: {
      title: "Rullen",
      description: "Toilettet. Lille, funktionelt, og — som alle andre steder i aften — inden for hørevidde af spisestuens radio. Tapet over vasken i øjenhøjde, umuligt at overse mens du vasker hænder: endnu en seddel i samme håndskrift.",
      prompt: "Den lyder: \"Husregel, ufravigelig: den der er den ____ person til at bruge dette rum før midnat, skal tjekke rullen. Ingen undtagelser, ingen uddelegering.\" Hvilket ord betyder 'den efter hvilken der ikke er nogen anden'?",
      rewardText: "Sidste. Et fragment hørt lige som du tørrer hænder: *\"...den sidste...\"* Radioen prøver at fortælle dig noget, og det gør badeværelset åbenbart også.",
      failureText: "Det er ordet for enden af en liste — intet kommer efter det.",
    },
  },

  // --- SUNROOM ---
  {
    id: "sunroom-plants",
    roomId: "sunroom",
    type: "puzzle",
    title: "The Plants",
    description:
      "The plants in the sunroom are thriving. Better than they should be for a house that's supposedly been unoccupied. Someone has been watering them.",
    prompt: "How many plants are in the sunroom? Count them. Enter the number.",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Count again. Slower this time." },
    ],
    forceWrongForFirstNAttempts: 2,
    answer: {
      correct: ["1", "2", "3", "4", "5", "6", "7", "8", "9",
                "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"],
      normalized: true,
    },
    failureText: "Wrong. Count again.",
    rewardText: "Counted. They're healthy. The house hasn't been as empty as you thought.",
    da: {
      title: "Planterne",
      description: "Planterne i vinterhaven har det godt. Bedre end de burde for et hus der angiveligt har stået tomt.",
      prompt: "Hvor mange planter er der i vinterhaven? Tæl dem.",
      failureText: "Forkert. Tæl igen.",
    },
  },
  {
    id: "sunroom-sunblind",
    roomId: "sunroom",
    type: "social_challenge",
    title: "The Low Sun",
    description:
      "The last direct sunlight of the day comes in low and level through the glass — the one moment tonight the sunroom actually earns its name. Looking straight at it hurts almost immediately.",
    prompt:
      "One player looks straight into the low sun through the glass and holds it — out loud, counted to five, the rest of the team watching. From this point on, that player is sun-blind: for the rest of tonight, whenever a teammate asks them in person to grab a drink from the fridge, they go get it, no matter what they're doing. No arguing, no delegating. It clears the moment the house finally goes dark.",
    order: 3,
    isRequired: false,
    hints: [],
    setsSunBlind: true,
    rewardClueId: "sunroom-blind-mark",
    rewardText:
      "Five seconds. The glare stays burned into your vision long after you look away. You can't really see straight anymore — not until the lights go out for good. But whatever you're about to face at the radio, losing a sense to this house once already will help.",
    da: {
      title: "Den Lave Sol",
      description: "Dagens sidste direkte sollys kommer lavt og lige ind gennem glasset — det ene øjeblik i aften hvor vinterhaven rent faktisk lever op til sit navn. At kigge lige på den gør ondt næsten med det samme.",
      prompt: "Én spiller kigger lige ind i den lave sol gennem glasset og holder den — højt, talt til fem, resten af holdet ser på. Fra dette punkt er den spiller solblind: resten af aftenen, når en holdkammerat beder dem personligt om at hente en drik fra køleskabet, gør de det, uanset hvad. Ingen indvendinger, ingen uddelegering. Det ophører i det øjeblik huset endelig bliver mørkt.",
      rewardText: "Fem sekunder. Blændingen bliver siddende i synet længe efter du kigger væk. Du kan ikke rigtig se ordentligt længere — ikke før lysene går ud for alvor. Men hvad end I møder ved radioen, hjælper det at have mistet en sans til dette hus allerede.",
    },
  },

  // --- KITCHEN (ACT 2) ---
  {
    id: "kitchen-act2-explore",
    roomId: "kitchen-act2",
    type: "social_challenge",
    title: "Moving On",
    description: "The kitchen at evening — someone made coffee, the fridge is stocked. Nothing here needs solving.",
    prompt: "Take a sip and listen for the radio.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 1,
    rewardText: "Kitchen's accounted for. The static is coming through clearer here.",
    da: {
      title: "Videre",
      description: "Køkkenet om aftenen — nogen lavede kaffe, køleskabet er fyldt. Intet her skal løses.",
      prompt: "Tag en slurk og lyt efter radioen.",
    },
  },
  {
    id: "kitchen-act2-fragment-a",
    roomId: "kitchen-act2",
    forTeam: "team-a",
    type: "puzzle",
    title: "The Radio from the Kitchen",
    description:
      "The acoustics of the kitchen carry the dining room radio clearly — not the words yet, just the shape of one, repeating.",
    prompt:
      "The static repeats the same beat without fail — not sometimes, not usually, but every single time, no exceptions. What single word means that?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "It's the word for something that never stops being true." },
    ],
    answer: {
      correct: ["always", "altid"],
      normalized: true,
    },
    rewardClueId: "radio-fragment-kitchen",
    rewardText: "Always. *\"...will always be...\"* Three words through the static. It's building to something.",
    failureText: "It's the word for something that never stops being true.",
    da: {
      title: "Radioen fra Køkkenet",
      description: "Køkkenets akustik bærer spisestruerens radio klart — ikke ordene endnu, bare formen af ét, gentaget.",
      prompt: "Statikken gentager den samme rytme uden undtagelse — ikke nogle gange, ikke som regel, men hver eneste gang. Hvilket ord betyder det?",
      rewardText: "Altid. *\"...vil altid være...\"* Tre ord gennem statikken.",
      failureText: "Det er ordet for noget der aldrig holder op med at være sandt.",
    },
  },
  {
    id: "kitchen-act2-fragment-b",
    roomId: "kitchen-act2",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Radio from the Kitchen",
    description:
      "The acoustics of the kitchen carry the dining room radio clearly — not the words yet, just the shape of one, repeating.",
    prompt:
      "The static never once skips a beat — not once tonight, not once ever. What single word means 'every time, without exception, forever'?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "It's the word for something that never stops being true." },
    ],
    answer: {
      correct: ["always", "altid"],
      normalized: true,
    },
    rewardClueId: "radio-fragment-kitchen",
    rewardText: "Always. *\"...will always be...\"* Three words through the static. It's building to something.",
    failureText: "It's the word for something that never stops being true.",
    da: {
      title: "Radioen fra Køkkenet",
      description: "Køkkenets akustik bærer spisestruerens radio klart — ikke ordene endnu, bare formen af ét, gentaget.",
      prompt: "Statikken springer aldrig en rytme over — ikke én gang i aften, ikke én gang nogensinde. Hvilket ord betyder 'hver gang, uden undtagelse, for evigt'?",
      rewardText: "Altid. *\"...vil altid være...\"* Tre ord gennem statikken.",
      failureText: "Det er ordet for noget der aldrig holder op med at være sandt.",
    },
  },

  // --- ACTIVITY ROOM ---
  {
    id: "activity-room-fragment-a",
    roomId: "activity-room",
    forTeam: "team-a",
    type: "puzzle",
    title: "The Final Fragment",
    description:
      "The activity room is the acoustic sweet spot. The dining room radio is clearest from here — clear enough this time to catch the shape of a whole word.",
    prompt:
      "The static resolves into one clear beat: not starting something, not continuing it — the exact moment there's nothing left to do. What single word means 'to complete, to end the task'?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "It's the opposite of starting." },
    ],
    answer: {
      correct: ["finish", "finished", "afslut", "afslutte", "afsluttet"],
      normalized: true,
    },
    rewardClueId: "radio-fragment-activity",
    rewardText:
      "Finish. *\"...the one to finish it.\"* Fix the radio to hear the whole thing clearly.",
    failureText: "It's the opposite of starting.",
    da: {
      title: "Det Endelige Fragment",
      description: "Aktivitetsrummet er det akustiske sweet spot. Spisestruerens radio er tydeligst herfra — tydelig nok denne gang til at fange formen af et helt ord.",
      prompt: "Statikken samler sig i én tydelig rytme: hverken starten på noget, eller fortsættelsen — det præcise øjeblik hvor der ikke er mere at gøre. Hvilket ord betyder 'at fuldføre, at afslutte opgaven'?",
      rewardText: "Afslut. *\"...den der afslutter det.\"* Reparer radioen for at høre det hele tydeligt.",
      failureText: "Det er det modsatte af at starte.",
    },
  },
  {
    id: "activity-room-fragment-b",
    roomId: "activity-room",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Final Fragment",
    description:
      "The activity room is the acoustic sweet spot. The dining room radio is clearest from here — clear enough this time to catch the shape of a whole word.",
    prompt:
      "The static settles on a single idea: the one thing left to do when nothing else remains on the list. What single word means 'to bring a task to its end'?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "It's the opposite of starting." },
    ],
    answer: {
      correct: ["finish", "finished", "afslut", "afslutte", "afsluttet"],
      normalized: true,
    },
    rewardClueId: "radio-fragment-activity",
    rewardText:
      "Finish. *\"...the one to finish it.\"* Fix the radio to hear the whole thing clearly.",
    failureText: "It's the opposite of starting.",
    da: {
      title: "Det Endelige Fragment",
      description: "Aktivitetsrummet er det akustiske sweet spot. Spisestruerens radio er tydeligst herfra — tydelig nok denne gang til at fange formen af et helt ord.",
      prompt: "Statikken lander på én idé: den sidste handling før en opgave holder op med at være ufærdig. Hvilket ord betyder 'at fuldføre'?",
      rewardText: "Afslut. *\"...den der afslutter det.\"* Reparer radioen for at høre det hele tydeligt.",
      failureText: "Det er det modsatte af at starte.",
    },
  },
  // --- DARTS BOARD ---
  {
    id: "darts-missing-player",
    roomId: "darts-board",
    type: "puzzle",
    title: "The Incomplete Game",
    description:
      "Three players scored on the chalkboard, standard 301, three darts a turn. Player 1 finished clean: 301 down to 0. Player 2 never finished — their last three darts, before the game stopped, are chalked up as 60, 97, and 60. Player 3 has no scores written after the starting 301 at all.",
    prompt:
      "Add up Player 2's three darts, then subtract that total from the starting score of 301. What number was Player 2 sitting on when the game stopped?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "60 + 97 + 60 first. Then 301 minus that." },
    ],
    answer: {
      correct: ["84"],
      normalized: true,
    },
    rewardText: "84. Player 2 was sitting on 84 when whatever happened, happened. Remember that number — it isn't done with you yet.",
    failureText: "60 + 97 + 60 = 217. Now subtract that from 301.",
    da: {
      title: "Det Ufuldstændige Spil",
      description: "Tre spillere scorede på kridttavlen, standard 301, tre dart per tur. Spiller 1 afsluttede rent: 301 ned til 0. Spiller 2 blev aldrig færdig — deres sidste tre dart, før spillet stoppede, står noteret som 60, 97 og 60.",
      prompt: "Læg Spiller 2's tre dart sammen, og træk summen fra startscoren på 301. Hvilket tal sad Spiller 2 på da spillet stoppede?",
      hints: ["60 + 97 + 60 først. Så 301 minus det."],
      rewardText: "84. Husk det tal — det er ikke færdig med jer endnu.",
      failureText: "60 + 97 + 60 = 217. Træk det fra 301.",
    },
  },
  {
    id: "darts-social",
    roomId: "darts-board",
    type: "physical_challenge",
    title: "Finish the Game",
    description:
      "The number you just worked out for Player 2 wasn't only a score. It's a clock. Start the stopwatch and stop it exactly on that many seconds — the same number, counted out in time instead of points. Closer is better. Miss badly and you're just wasting time.",
    prompt: "Start the stopwatch. Stop it as close as you can to the number you calculated for Player 2. The house doesn't care how — count in your head, count out loud, guess. It only cares how close.",
    order: 2,
    isRequired: false,
    hints: [],
    physicalChallenge: {
      timerSeconds: 180,
      startLabel: "Start the clock",
      activeEmoji: "🎯",
      bannerText: "Someone is trying to finish Player 2's game",
      completeLabel: "Stop",
      targetStopSeconds: 84,
    },
    rewardText: "Game's finished. Player 2's score is cleared.",
    da: {
      title: "Afslut Spillet",
      description: "Tallet I lige regnede ud for Spiller 2 var ikke kun en score. Det er et ur. Start stopuret og stop det præcis på det samme antal sekunder.",
      prompt: "Start stopuret. Stop det så tæt som muligt på tallet I regnede ud for Spiller 2.",
    },
  },

  // --- FOOSBALL TABLE ---
  {
    id: "foosball-bent-rod",
    roomId: "foosball-table",
    type: "puzzle",
    title: "The Bent Rod",
    description:
      "One of the goalie rods isn't just bent — it's bent in half. Not broken, just turned to face the exact opposite way it should. The ball is sealed inside the table, the goalies frozen at whatever angle that leaves them.",
    prompt:
      "If straight-ahead is 0°, and a full turn all the way around is 360°, how many degrees off-straight is a rod that's been bent exactly in half — turned to face the opposite direction? Estimate is fine within about 5% either side.",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Half of a full 360° turn. That's the angle." },
    ],
    wrongAnswerSips: 1,
    answer: {
      // 180° ± ~5% (171–189), matching how far off a real estimate could land
      correct: Array.from({ length: 19 }, (_, i) => String(171 + i)),
      normalized: true,
    },
    rewardText: "180°. Bent exactly in half — turned to face the opposite direction. That's not an accident, that's a decision.",
    failureText: "Think in halves of a full circle, not small degrees. A miss here costs a sip — try again.",
    da: {
      title: "Den Bøjede Stang",
      description: "Én af keeperstængerne er ikke bare bøjet — den er bøjet halvt om. Ikke knækket, bare vendt til at pege den præcis modsatte vej.",
      prompt: "Hvis lige-frem er 0°, og en hel omgang rundt er 360°, hvor mange grader fra ret er en stang der er bøjet præcis halvt om — vendt til at pege den modsatte vej? Et skøn er fint inden for ca. 5% til hver side.",
      hints: ["Halvdelen af en hel 360° omgang. Det er vinklen."],
      rewardText: "180°. Bøjet præcis halvt om. Det er ikke et uheld, det er en beslutning.",
      failureText: "Tænk i halvdele af en hel cirkel, ikke små grader. Et forkert gæt koster en slurk — prøv igen.",
    },
  },
  // --- DINING ROOM (identify the boss) ---
  {
    id: "dining-room-static",
    roomId: "dining-room",
    type: "social_challenge",
    title: "Louder in Here",
    description: "The static you've been hearing all evening is louder in this room — coming from somewhere close, not the walls.",
    prompt: "Take a sip, then find where it's coming from.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 1,
    rewardText: "The shelf. It's coming from the shelf.",
    da: {
      title: "Højere Herinde",
      description: "Statikken er højere i dette rum — og kommer ikke fra væggene.",
      prompt: "Tag en slurk, og find så ud af hvor den kommer fra.",
      rewardText: "Hylden. Den kommer fra hylden.",
    },
  },
  {
    id: "dining-room-source",
    roomId: "dining-room",
    type: "puzzle",
    title: "The Source",
    description:
      "On the shelf: candle stubs, a stack of board games, a carafe — and one thing that has no business making noise. Old. Brown. Bakelite. A bent antenna angled toward the window. A volume knob worn smooth by someone's hand. A green dial, glowing, though nothing in this house should be broadcasting tonight.",
    prompt:
      "Name the thing that has been talking to you all evening. What is broadcasting?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Green dial. Bent antenna. Worn volume knob. Brown bakelite. Your grandparents had one on their kitchen counter." },
    ],
    answer: {
      correct: ["radio", "the radio", "a radio", "the old radio", "bakelite radio", "radioen", "en radio", "den gamle radio"],
      normalized: true,
    },
    rewardText:
      "The radio. Of course it's the radio. It has been trying to say something all evening — through every wall of this house. And it will not stop until someone makes it speak clearly. Face it.",
    failureText: "It's on the shelf. It hums. It glows green. Look closer.",
    da: {
      title: "Kilden",
      description: "På hylden: stearinlysstumper, en stak brætspil, en karaffel — og én ting der ikke har noget at gøre med at lave lyd. Gammel. Brun. Bakelit. En bøjet antenne vinklet mod vinduet. En lydstyrkeknap slidt glat af en hånd. En grøn skive der gløder, selvom intet i dette hus burde sende i aften.",
      prompt: "Navngiv tingen der har talt til jer hele aftenen. Hvad er det der sender?",
      rewardText: "Radioen. Selvfølgelig er det radioen. Den har forsøgt at sige noget hele aftenen — gennem alle husets vægge. Og den stopper ikke før nogen får den til at tale klart. Mød den.",
      failureText: "Den står på hylden. Den brummer. Den gløder grønt. Kig nærmere.",
    },
  },

  // ==========================================
  // ACT 3 — THE LATE NIGHT
  // ==========================================

  // --- DINING ROOM (DARK) ---
  {
    id: "dark-dining-orient",
    roomId: "dining-room-dark",
    type: "social_challenge",
    title: "Steady Yourselves",
    description:
      "The house is dark. Eyes adjusting, hearts going a little faster than they should for a room you were just standing in an hour ago. Before anyone moves by feel alone, the group steadies its nerves the only way this house has ever asked for.",
    prompt:
      "Everyone in the group takes a steadying sip together — three sips, out loud, counted down. Once you're steady, describe the room from memory without any light: the radio shelf, the table, the door to the corridor.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 3,
    rewardText: "Steadier now. Radio shelf: right. Table: center. Corridor door: ahead. Utility corner: left.",
    da: {
      title: "Saml Jer",
      description: "Huset er mørkt. Øjnene vænner sig til det, hjerterne banker lidt hurtigere end de burde for et rum I stod i for en time siden.",
      prompt: "Hele gruppen tager en samlende slurk sammen — tre slurke, højt, talt ned. Når I er rolige, beskriv rummet fra hukommelsen uden lys: radiohylden, bordet, korridordøren.",
      rewardText: "Roligere nu. Radiohylde: højre. Bord: midten. Korridordør: ligeud. Redskabshjørne: venstre.",
    },
  },
  {
    id: "dark-dining-riddle",
    roomId: "dining-room-dark",
    type: "puzzle",
    title: "Counted By Touch",
    description:
      "No light. No radio. Just the long pine table, exactly where it's always been. Something about it can be counted without seeing it.",
    prompt:
      "Feel your way around the table, touching the back of every chair as you go. How many chairs are you counting?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "You sat around this same table for the sentence puzzle in Act 2. Nothing's moved since." },
    ],
    answer: {
      correct: ["8", "eight", "otte"],
      normalized: true,
    },
    rewardText: "Eight. The same eight chairs from Act 2 — the table hasn't changed. You have. Time to move.",
    failureText: "Think back to the dining room in Act 2 — how many chairs were around this exact table?",
    da: {
      title: "Talt Ved Berøring",
      description: "Intet lys. Ingen radio. Bare det lange fyrretræsbord, præcis hvor det altid har været.",
      prompt: "Følg bordet rundt med hånden, rør ved ryggen af hver stol undervejs. Hvor mange stole tæller du?",
      hints: ["I sad omkring det samme bord til sætningsgåden i Akt 2. Intet har flyttet sig siden."],
      rewardText: "Otte. De samme otte stole fra Akt 2 — bordet har ikke ændret sig. Det har I.",
      failureText: "Tænk tilbage til spisestuen i Akt 2 — hvor mange stole var der om dette bord?",
    },
  },

  // --- UTILITY CORNER ---
  {
    id: "utility-find-flashlight-a",
    roomId: "utility-corner",
    forTeam: "team-a",
    type: "puzzle",
    title: "The Thing in the Basket",
    description:
      "A utility corner off the dining room. Hooks on the wall. A basket of house items — things that belong to the property, not to any visitor.",
    prompt:
      "It needs no outlet, no matches, no wick. A squeeze or a switch, and it decides how far the dark is allowed to come. What is it?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "It runs on batteries, not power lines." },
      { order: 2, offerCost: 2, text: "You're about to need it for the rest of the house." },
    ],
    answer: {
      correct: ["flashlight", "torch", "lommelygte", "lygten", "the flashlight"],
      normalized: true,
    },
    rewardClueId: "artifact-flashlight",
    rewardText: "The flashlight. It works. The batteries are warm. Someone used this recently.",
    failureText: "Think about what a squeeze or a switch controls.",
    da: {
      title: "Tingen I Kurven",
      description: "Et redskabshjørne ved spisestuen. Kroge på væggen. En kurv med hus-ting.",
      prompt: "Den skal ikke bruge stikkontakt, tændstikker eller væge. Et tryk eller et klik, og den bestemmer hvor tæt mørket må komme. Hvad er det?",
      rewardText: "Lommelygten. Den virker. Batterierne er varme.",
      failureText: "Tænk på hvad et tryk eller et klik styrer.",
    },
  },
  {
    id: "utility-find-flashlight-b",
    roomId: "utility-corner",
    forTeam: "team-b",
    type: "letter_tiles",
    title: "Spell It Out",
    description:
      "A utility corner off the dining room. Hooks on the wall. A basket of house items — things that belong to the property, not to any visitor. Whatever's in there, the letters already know.",
    prompt: "Ten letters. One thing in the basket that decides how far the dark is allowed to come. Place them.",
    order: 1,
    isRequired: true,
    hints: [],
    letterTiles: {
      letters: ["T", "H", "F", "I", "L", "G", "A", "H", "S", "L"],
      targetWord: "FLASHLIGHT",
    },
    rewardClueId: "artifact-flashlight",
    rewardText: "FLASHLIGHT. The letters land and the screen catches up — it works. The batteries are warm. Someone used this recently.",
    da: {
      title: "Stav Det",
      description: "Et redskabshjørne ved spisestuen. Kroge på væggen. En kurv med hus-ting.",
      prompt: "Ti bogstaver. Én ting i kurven der bestemmer hvor tæt mørket må komme. Placer dem.",
      rewardText: "FLASHLIGHT. Bogstaverne lander og skærmen følger med — den virker.",
    },
  },

  // --- BACK CORRIDOR ---
  {
    id: "corridor-explore",
    roomId: "back-corridor",
    type: "social_challenge",
    title: "The Corridor",
    description: "Three doors down the back corridor, visible now with the flashlight. One stands slightly ajar.",
    prompt: "Take a sip and sweep the flashlight down the hall.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 1,
    rewardText: "The ajar door is the fuse box. Now you know where it is.",
    da: {
      title: "Korridoren",
      description: "Tre døre nede ad bagkorridoren, synlig nu med lommelygten. Én står på klem.",
      prompt: "Tag en slurk og sve korridoren med lommelygten.",
    },
  },
  {
    id: "corridor-door-check",
    roomId: "back-corridor",
    type: "puzzle",
    title: "Three Doors",
    description:
      "Three doors down the corridor, evenly spaced along the same wall. The flashlight finds them one at a time. One stands ajar — that's the fuse box, second along from the dining room. One won't budge no matter what you try tonight — locked, and it's the last one before the corridor ends. The third has never had a reason to be tried until now.",
    prompt:
      "Ajar door: second position. Locked door: last position. By elimination — which position, first, second, or third, is the door nobody tried?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Second is ajar. Third is locked. That only leaves one position free." },
    ],
    answer: {
      correct: ["first", "1", "one", "første", "1."],
      normalized: true,
    },
    rewardText: "First position. The door nobody tried is the one closest to the dining room — you walked past it all night without a second look.",
    failureText: "Second is the fuse box. Third is locked. Work out what's left.",
    da: {
      title: "Tre Døre",
      description: "Tre døre nede ad korridoren, jævnt fordelt på samme væg. Én står på klem — det er sikringsskabet, anden dør fra spisestuen. Én rører sig ikke uanset hvad I prøver i aften — låst, og det er den sidste dør før korridoren ender.",
      prompt: "Dør på klem: anden position. Låst dør: sidste position. Ved udelukkelse — hvilken position, første, anden eller tredje, er døren ingen prøvede?",
      hints: ["Anden er på klem. Tredje er låst. Der er kun én position tilbage."],
      rewardText: "Første position. Døren ingen prøvede er den tættest på spisestuen.",
      failureText: "Anden er sikringsskabet. Tredje er låst. Regn resten ud.",
    },
  },

  // --- FUSE BOX ---
  {
    id: "fusebox-identify",
    roomId: "fuse-box",
    type: "puzzle",
    title: "Identify the Problem",
    description:
      "The fuse box panel. Four glass-tube fuses in a row, rated 5A, 10A, 15A and 20A. Three of them hum faintly warm under your fingers — still doing their job. The fourth is stone cold. Hold that one up to the flashlight and you can see straight through the glass: the hair-thin wire that should run its length is gone, snapped into two dead ends.",
    prompt:
      "Feel each of the four fuses, then hold the odd one up to the light. Which rating, in amps, is the blown fuse — 5A, 10A, 15A, or 20A?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Three are warm. Only one is cold — and it's the one you can see straight through." },
    ],
    answer: {
      correct: ["15", "15a", "15 a", "fifteen"],
      normalized: true,
    },
    rewardText: "15A. Cold, broken, empty inside. There's a replacement taped inside the panel door.",
    failureText: "Feel all four again — three are warm and working, one is cold and broken. That's the one.",
    da: {
      title: "Identificer Problemet",
      description: "Sikringsskabets panel. Fire glasrørssikringer på række, mærket 5A, 10A, 15A og 20A. Tre af dem summer svagt varme under fingrene — stadig i gang. Den fjerde er stenkold. Hold den op mod lommelygten, og du kan se lige igennem glasset: den hårtynde tråd der skulle løbe hele vejen er væk.",
      prompt: "Følg alle fire sikringer med fingrene, og hold den mærkelige en op mod lyset. Hvilken værdi, i ampere, er den sprungne sikring — 5A, 10A, 15A eller 20A?",
      hints: ["Tre er varme. Kun én er kold — og det er den du kan se lige igennem."],
      rewardText: "15A. Kold, sprunget, tom indeni. Der er en erstatning tapet fast inden i paneldøren.",
      failureText: "Følg alle fire igen — tre er varme og virker, én er kold og sprunget. Det er den.",
    },
  },
  {
    id: "fusebox-repair",
    roomId: "fuse-box",
    type: "social_challenge",
    title: "Swap the Fuse",
    description:
      "The replacement fuse is taped to the inside of the panel door. A note beside it: *\"Not the first time. Won't be the last.\"* Swap the fuses. Restore partial power.",
    prompt: "Swap the blown fuse for the replacement. One player does it, others hold the flashlight. Confirm when done.",
    order: 2,
    isRequired: true,
    hints: [],
    rewardClueId: "artifact-fuse",
    rewardText: "Fuse swapped. Partial power restored to one circuit. The kitchen light flickers on.",
    da: {
      title: "Udskift Sikringen",
      description: "Erstatningssikringen er klistret til indersiden af paneldøren.",
      prompt: "Udskift den sprungne sikring med erstatningen. Én spiller gør det, andre holder lommelygten.",
      rewardText: "Sikring udskiftet. Delvis strøm genoprettet. Køkkenlyset blinker.",
    },
  },

  // --- KITCHEN (DARK) ---
  {
    id: "dark-kitchen-drawer",
    roomId: "kitchen-dark",
    type: "puzzle",
    title: "The Third Drawer",
    description:
      "The kitchen has power now — one light. Check the drawers. The third drawer from the left holds something useful.",
    prompt: "Open the third drawer from the left in the kitchen. What do you find?",
    order: 1,
    isRequired: true,
    hints: [],
    answer: {
      correct: ["wrench", "skruenøgle", "tool", "the wrench", "a wrench", "et værktøj"],
      normalized: true,
    },
    rewardClueId: "artifact-wrench",
    rewardText: "A wrench. The handle is worn — this tool has done a lot of work in this house.",
    failureText: "Third drawer. Check it.",
    da: {
      title: "Den Tredje Skuffe",
      description: "Køkkenet har nu strøm — ét lys. Tjek skufferne.",
      prompt: "Åbn den tredje skuffe fra venstre i køkkenet. Hvad finder du?",
      rewardText: "En skruenøgle. Håndtaget er slidt.",
      failureText: "Tredje skuffe. Tjek den.",
    },
  },
  // --- BROKEN WINDOW ---
  {
    id: "window-fix",
    roomId: "broken-window",
    type: "social_challenge",
    title: "Fix the Latch",
    description:
      "The rattling window latch. You've been hearing it all evening. With the wrench, tighten it. One player, one motion.",
    prompt: "One player uses the wrench to tighten the rattling window latch. Confirm when done.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "The latch is tight. The rattling stops.",
    da: {
      title: "Reparér Hængslen",
      description: "Den knatrende vindueshængsle. Med skruenøglen, stram den.",
      prompt: "Én spiller bruger skruenøglen til at stramme den knatrende vindueshængsle.",
      rewardText: "Hængslen er stram. Knatringen stopper.",
    },
  },
  {
    id: "window-silence",
    roomId: "broken-window",
    type: "puzzle",
    title: "The Silence After",
    description: "The latch is fixed. The rattling is gone. The silence is different now.",
    prompt: "How long does the group stay in the silence after fixing the window? Describe what it sounds like.",
    order: 2,
    isRequired: false,
    hints: [],
    answer: {
      correct: ["wind", "vind", "nothing", "ingenting", "quiet", "stille", "still", "distant", "fjernt", "outside", "udenfor"],
      normalized: true,
    },
    rewardText: "The silence holds. The house sounds different without the rattle.",
    da: {
      title: "Stilheden Bagefter",
      description: "Hængslen er fikset. Knatringen er væk. Stilheden er anderledes nu.",
      prompt: "Beskriv hvad det lyder som nu.",
    },
  },

  // --- DOOR NOBODY TRIED ---
  {
    id: "door-nobody-tried-open",
    roomId: "door-nobody-tried",
    type: "social_challenge",
    title: "Try the Door",
    description: "You walked past this door all evening. In the dark, you finally try the handle.",
    prompt: "Take a sip. It opens.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 1,
    rewardText: "The door opens. What's behind it is not a room.",
    da: {
      title: "Prøv Døren",
      description: "Du er gået forbi denne dør hele aftenen. I mørket prøver du endelig håndtaget.",
      prompt: "Tag en slurk. Den åbner.",
      rewardText: "Døren åbner. Det der er bag den er ikke et rum.",
    },
  },
  {
    id: "door-nobody-tried-examine",
    roomId: "door-nobody-tried",
    type: "puzzle",
    title: "The Sealed Entrance",
    description:
      "Not a room. The entrance has been sealed — the old doorframe outline visible, the threshold walled up from inside. Someone didn't lock this room. They deconstructed the entrance entirely.",
    prompt:
      "You can see the ghost of a doorframe — the outline, the seams, the traces of a threshold. What does this look like to you? How was it done?",
    order: 2,
    isRequired: true,
    hints: [],
    answer: {
      correct: ["walled", "bricked", "sealed", "plastered", "blocked", "muret", "forseglet", "lukket", "mur"],
      normalized: true,
    },
    rewardText: "Walled up from the inside. Someone sealed themselves out. The door leads somewhere that used to exist.",
    da: {
      title: "Den Forseglede Indgang",
      description: "Ikke et rum. Indgangen er forseglet — den gamle dørrammekontur synlig, tærsklen muret til indefra.",
      prompt: "Du kan se spøgelset af en dørramme — konturen, sømmene, sporene af en tærskel. Hvad ser dette ud som for dig?",
      rewardText: "Muret til indefra. Nogen forseglede sig selv ude.",
    },
  },

  // --- METER CUPBOARD ---
  {
    id: "meter-cupboard-switch",
    roomId: "meter-cupboard",
    type: "social_challenge",
    title: "The Main Switch",
    description: "The house's real power switch, just outside — heavier hardware than the fuse box you just fixed. It's thrown, not tripped.",
    prompt: "Take a sip and take a look at it.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 1,
    rewardText: "Described. Whatever the fuse box fixed, this undoes — completely, on purpose.",
    da: {
      title: "Hovedafbryderen",
      description: "Husets rigtige strømafbryder, lige udenfor — tungere end sikringsskabet I lige reparerede. Den er slået om, ikke udløst.",
      prompt: "Tag en slurk og kig nærmere på den.",
      rewardText: "Beskrevet. Hvad end sikringsskabet reparerede, gør denne til intet — fuldstændigt, med vilje.",
    },
  },
  {
    id: "meter-cupboard-candle-hint",
    roomId: "meter-cupboard",
    type: "puzzle",
    title: "Wet Mud",
    description:
      "A smear of mud across the handle. Fresh — still wet. Whoever did this didn't want the fuse box's fix to last. They wanted you doing something else instead. Something you can only do without electric light.",
    prompt:
      "Somewhere in this house tonight, something is sitting on a windowsill, unlit, waiting for exactly this kind of dark. It burns without needing any power at all, and you'll need it soon to read what's on the sealed wall. What single object is it?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "It's on a windowsill — but not one inside the house itself. Think of the glass room behind the shed." },
      { order: 2, offerCost: 2, text: "You light it with a match. Wax. A wick. It's a candle." },
    ],
    answer: {
      correct: ["candle", "a candle", "the candle", "candlestick", "wax candle", "stearinlys", "et stearinlys", "lyset", "lys"],
      normalized: true,
    },
    rewardClueId: "meter-cupboard-cut",
    rewardText:
      "Candle. Of course. Whoever's doing this doesn't want you seeing clearly — they want you seeing by flame, the way it would've looked back then. Find it. You'll need it here too, now.",
    failureText: "Think about what light source doesn't need the power at all — and where you'd find one sitting out, unlit, on a sill.",
    da: {
      title: "Vådt Mudder",
      description: "En klat mudder tværs over håndtaget. Frisk — stadig vådt. Den der gjorde dette ville ikke have sikringsskabets reparation til at holde.",
      prompt: "Et sted i dette hus i aften står noget på en vindueskarm, uantændt, og venter præcis på denne slags mørke. Det brænder uden strøm, og I får brug for det snart for at læse den forseglede væg. Hvilken ene genstand er det?",
      rewardText: "Stearinlys. Selvfølgelig. Hvem end der gør dette vil ikke have jer til at se klart.",
      failureText: "Tænk på hvilken lyskilde der slet ikke behøver strøm — og hvor I ville finde en stående fremme, uantændt.",
    },
  },

  // --- SEALED WALL ---
  {
    id: "sealed-wall-read",
    roomId: "sealed-wall",
    type: "social_challenge",
    title: "Hold the Candle Close",
    description:
      "The candle, held close to the sealed wall surface, reveals writing. Three lines. Read them aloud to the group.",
    prompt:
      "Hold the candle close to the wall. The writing appears. One player reads all three lines aloud:\n\n*July 19th 2010*\n*\"We locked it so we'd have to come back.\"*\n*\"If you found this, you already know. You just haven't admitted it yet.\"*",
    order: 1,
    isRequired: true,
    hints: [],
    rewardClueId: "sealed-wall-writing",
    rewardText: "Read. July 19th 2010 — the first entry on the shed date list. The house has been waiting exactly this long.",
    da: {
      title: "Hold Lyset Tæt",
      description: "Stearinlyset, holdt tæt til den forseglede vægflade, afslører skrift.",
      prompt: "Hold stearinlyset tæt til væggen. Skriften dukker op. Én spiller læser alle tre linjer højt.",
      rewardText: "Læst. 19. juli 2010 — den første post på skurets datoliste.",
    },
  },
  {
    id: "sealed-wall-understand",
    roomId: "sealed-wall",
    type: "puzzle",
    title: "The Date",
    description: "The first line is a date. Match it to something you found earlier.",
    prompt: "The first line of the wall writing is a date: *July 19th 2010.* Where have you seen this date before tonight?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "The shed. Act 1. The date list on the wall." },
    ],
    answer: {
      correct: ["shed", "the shed", "skuret", "det skur", "date list", "the date list", "datolisten",
                "the list", "listen", "act 1", "akt 1", "shed date list", "shed list", "the shed date list"],
      normalized: true,
    },
    rewardText: "The shed date list. The oldest entry — the first date. This wall was sealed on the first visit.",
    failureText: "You've seen this date before. Think back to Act 1.",
    da: {
      title: "Datoen",
      description: "Den første linje er en dato. Match den til noget du fandt tidligere.",
      prompt: "Den første linje af vægskriften er en dato: *19. juli 2010.* Hvor har du set denne dato før i aften?",
      rewardText: "Skurets datoliste. Den ældste post — den første dato.",
      failureText: "Du har set denne dato før. Tænk tilbage til Akt 1.",
    },
  },

  // --- BEHIND THE SHED ---
  {
    id: "behind-shed-explore",
    roomId: "behind-the-shed",
    type: "social_challenge",
    title: "Into the Dark",
    description: "Back outside, behind the shed — a part of the garden Act 1 never showed you.",
    prompt: "Take a sip before you step into it.",
    order: 1,
    isRequired: true,
    hints: [],
    offerCost: 1,
    rewardText: "The conservatory is visible. The shed is behind you. Two things to investigate.",
    da: {
      title: "Ind i Mørket",
      description: "Tilbage udenfor, bag skuret — en del af haven Akt 1 aldrig viste jer.",
      prompt: "Tag en slurk før I træder ind i det.",
    },
  },
  {
    id: "behind-shed-dark",
    roomId: "behind-the-shed",
    type: "puzzle",
    title: "The Oak in the Dark",
    description:
      "The darkness behind the shed is different from any other darkness tonight — no walls to catch a sound and throw it back at you. But this ground isn't unfamiliar. Somewhere out here, past the fence line, stands the same tree that already had something to say to you once tonight.",
    prompt:
      "Reach out into the dark, toward the back fence. What tree are you feeling for — the same one that had a digit carved into its bark, back in Act 1?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Garden. Back fence. Something you read the bark of, hours ago." },
    ],
    answer: {
      correct: ["oak", "the oak", "old oak", "the old oak", "oak tree", "egetræet", "egen", "det gamle egetræ"],
      normalized: true,
    },
    rewardText: "The old oak. Same tree, same fence line — just impossible to see now. The garden hasn't changed. You have.",
    failureText: "Think back to Act 1's garden — one tree there had something carved into it.",
    da: {
      title: "Egetræet i Mørket",
      description: "Mørket bag skuret er anderledes end noget andet mørke i aften — ingen vægge til at fange en lyd og kaste den tilbage. Men denne jord er ikke ukendt. Et sted herude, bag hegnet, står det samme træ der allerede havde noget at sige til jer én gang i aften.",
      prompt: "Ræk ud i mørket, mod baghegnet. Hvilket træ leder du efter — det samme som havde et ciffer ridset i barken, tilbage i Akt 1?",
      hints: ["Haven. Baghegnet. Noget du læste barken af, timer siden."],
      rewardText: "Det gamle egetræ. Samme træ, samme hegn — bare umuligt at se nu. Haven har ikke ændret sig. Det har I.",
      failureText: "Tænk tilbage til Akt 1's have — ét træ der havde noget ridset ind i sig.",
    },
  },

  // --- CONSERVATORY ---
  {
    id: "conservatory-find-candle",
    roomId: "conservatory",
    type: "puzzle",
    title: "The Candle on the Windowsill",
    description:
      "Glass on three sides. Cold. The wind audible. On the windowsill — a candle in a holder, full and unlit, with a matchbox beside it. Someone placed this deliberately.",
    prompt:
      "Hold the candle up to what little light gets in. Its wax is the colour of a stop sign, of a fire truck, of the warning light on the dashboard. Not pink. Not orange. What colour is it, exactly?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Think of the colour that means danger, not the colour that means love." },
    ],
    answer: {
      correct: ["red", "rød", "dark red", "mørkerød", "crimson", "deep red"],
      normalized: true,
    },
    rewardClueId: "artifact-candle",
    rewardText: "Red. A deep red candle, full and unlit. Someone brought this specifically for something.",
    da: {
      title: "Stearinlyset på Vindueskarmens",
      description: "Glas på tre sider. Koldt. Vinden hørbar. På vindueskarmens — et stearinlys i en lysestage, fuldt og uantændt, med en tændstikæske ved siden af.",
      prompt: "Hold lyset op mod det svage lys der slipper ind. Voksen har farven af et stopskilt, af en brandbil, af advarselslampen på et instrumentbræt. Ikke pink. Ikke orange. Hvilken farve er det, præcist?",
      rewardText: "Rødt. Et dybt rødt stearinlys, fuldt og uantændt.",
    },
  },
  // --- SHED (DARK) ---
  {
    id: "shed-dark-note",
    roomId: "shed-dark",
    type: "puzzle",
    title: "The Note on the Floor",
    description:
      "The shed from Act 1. The date list is still on the wall. But on the floor, just under the date list — something you didn't notice before. A note. Signed with names that are almost yours.",
    prompt:
      "Read the note aloud. What is the last instruction in the note?\n\n*\"We came. We stayed. We failed... This time.. Finish it... Every last drop.\"*",
    order: 1,
    isRequired: true,
    hints: [],
    answer: {
      correct: ["every last drop", "finish it", "last drop", "drop", "afslut det", "til allersidste dråbe", "dråbe"],
      normalized: true,
    },
    rewardClueId: "artifact-final-note",
    rewardText:
      "The note is in the Case File. Every last drop. The signatures are almost your names. This is the final artifact.",
    failureText: "Read the last line.",
    da: {
      title: "Sedlen på Gulvet",
      description: "Skuret fra Akt 1. Datolisten er stadig på væggen. Men på gulvet, lige under datolisten — noget du ikke lagde mærke til før.",
      prompt: "Læs sedlen højt. Hvad er den sidste instruktion i sedlen?\n\n*\"Vi kom. Vi blev. Vi fejlede... Denne gang.. Afslut det... Til allersidste dråbe.\"*",
      rewardText: "Sedlen er i sagsmappen. Til allersidste dråbe. Underskrifterne er næsten jeres navne.",
      failureText: "Læs den sidste linje.",
    },
  },
];

export function getQuest(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}

export function getQuestsByRoom(roomId: string, teamId?: string): Quest[] {
  return QUESTS.filter(
    (q) => q.roomId === roomId && (!q.forTeam || q.forTeam === teamId)
  ).sort((a, b) => a.order - b.order);
}

export function getRequiredQuestsByRoom(roomId: string, teamId?: string): Quest[] {
  return QUESTS.filter(
    (q) =>
      q.roomId === roomId &&
      q.isRequired &&
      (!q.forTeam || q.forTeam === teamId)
  ).sort((a, b) => a.order - b.order);
}
