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
      "One of you holds the camera. Gather the rest of your team in front of the house and take ONE photo of them — everyone, together, all in frame. The house will not accept anything less.",
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
      "One of you holds the camera. Gather the rest of your team in front of the house and take ONE photo of them — everyone, together, all in frame. The house will not accept anything less.",
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
    title: "Where is Mads?",
    description:
      "Mads has the code. Mads is not here. His phone is going to voicemail. How many times does someone need to call before everyone agrees to stop?",
    prompt:
      "Your team calls Mads. No answer. You call again. Still nothing. On which call does the group agree to stop waiting and start exploring? Enter the number.",
    order: 2,
    isRequired: false,
    hints: [
      { order: 1, offerCost: 1, text: "There is no wrong answer. This is about the group's collective patience." },
    ],
    answer: {
      correct: ["3", "three", "tre", "2", "two", "to", "4", "four", "fire", "5", "five", "fem"],
      normalized: true,
    },
    rewardText: "The decision is made. Explore now, deal with Mads later. He has the code fragment — but it can wait.",
    da: {
      title: "Hvor er Mads?",
      description: "Mads har koden. Mads er ikke her. Hans telefon går på voicemail.",
      prompt: "Jeres hold ringer til Mads. Intet svar. I ringer igen. Stadig ingenting. Ved hvilket opkald er gruppen enige om at stoppe med at vente og begynde at udforske?",
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
  {
    id: "terrace-view",
    roomId: "terrace",
    type: "social_challenge",
    title: "Through the Glass",
    description:
      "You can see inside through the glass doors. The living room, the shelf of paperbacks, the dining room beyond. Without entering, what's on the shelf to the right of the stove?",
    prompt:
      "Look through the terrace glass. Describe exactly what you can see on the shelf to the right of the stove — one player calls it out, others confirm.",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "Noted. The layout is familiar before you've even stepped inside.",
    da: {
      title: "Gennem Glasset",
      description: "Du kan se ind gennem glasdørene. Stuen, boghylden, spisestuen bagved.",
      prompt: "Kig gennem terrassens glas. Beskriv præcis hvad du kan se på hylden til højre for ovnen.",
    },
  },

  // --- GARDEN ---
  {
    id: "garden-search",
    roomId: "garden",
    type: "social_challenge",
    title: "Search the Garden",
    description:
      "1,250 square metres. Natural. Coastal. The group splits up to search. Someone will find the hollow in the old oak near the back fence.",
    prompt:
      "Split up and search the garden. One player goes to the old oak tree near the back fence and checks the hollow. Report what they find.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "The hollow itself is empty. But something is carved into the bark right beside it, worth reading closely.",
    da: {
      title: "Søg Haven",
      description: "1.250 kvadratmeter. Naturlig. Kystmæssig. Gruppen deler sig for at søge.",
      prompt: "Del op og søg haven. Én spiller går til den gamle egetræ ved baghegnet og tjekker hulheden.",
      rewardText: "Selve hulheden er tom. Men noget er ridset ind i barken lige ved siden af den, værd at læse nøje.",
    },
  },
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
    isRequired: false,
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
  {
    id: "petanque-social",
    roomId: "petanque-court",
    type: "social_challenge",
    title: "One Round",
    description: "Play one round of pétanque. Any rules. Any scoring. One round.",
    prompt: "Play a quick round of pétanque with whatever balls are available. First team to agree the round is done wins the bonus.",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "A round played. The evening has officially started.",
    da: {
      title: "En Runde",
      description: "Spil én runde pétanque. Hvilke som helst regler. Hvilken som helst scoring.",
    },
  },

  // --- CARPORT ---
  {
    id: "carport-chalk",
    roomId: "carport",
    type: "social_challenge",
    title: "The Chalk Arrows",
    description:
      "Two chalk arrows on the back wall of the carport, low down near the floor. One pointing down. One pointing right. They're careful — too deliberate to be accidental. No label, no date, no signature.",
    prompt:
      "The group must agree on what the arrows mean. Any interpretation — as long as everyone commits to the same one. The house accepts what you collectively decide.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "Agreed. Whatever the arrows meant, you'll recognize the moment when it arrives.",
    da: {
      title: "Kridit-pilene",
      description: "To kridt-pile på bagevæggen af carporten, lavt nede ved gulvet. Én peger ned. Én peger til højre. De er omhyggelige — for bevidste til at være tilfældige.",
      prompt: "Gruppen skal blive enige om hvad pilene betyder. Enhver fortolkning — bare alle er enige om den samme.",
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
    title: "Someone Was Here",
    description:
      "A couple stayed in this room. They left in a hurry. A half-packed bag, open on the floor. Something still plugged in that nobody unpacked. The bedside lamp on. What three specific details does the player notice?",
    prompt:
      "The player in the double room describes three specific details they notice. The rest of the team (listening) confirms each one makes sense.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "Three details noted. The room has a story. You just don't know it yet.",
    da: {
      title: "Nogen Var Her",
      description: "Et par boede i dette rum. De forlod det hurtigt.",
      prompt: "Spilleren i dobbeltværelset beskriver tre specifikke detaljer de lægger mærke til.",
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
    title: "Deliberate and Scattered",
    description:
      "Some things in this room were placed with care. Others were abandoned mid-action. The player inside identifies which is which.",
    prompt:
      "Name one thing in the single room that was clearly placed deliberately, and one thing that was clearly abandoned mid-action.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "The contrast is the story. Someone started this room with intention.",
    da: {
      title: "Bevidst og Spredt",
      description: "Nogle ting i dette rum blev placeret med omhu. Andre blev forladt midt i en handling.",
      prompt: "Navngiv én ting i enkeltværelset der tydeligvis blev placeret med vilje, og én ting der tydeligvis blev forladt midt i en handling.",
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
    title: "Top or Bottom",
    description:
      "The bunk bed. The top is unmade — the bottom has been slept in. The player enters and claims a bunk. Which one?",
    prompt:
      "The player in the bunk room chooses: top or bottom bunk. The choice matters — but not in the way you'd expect.",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "The note is on the underside of the top mattress. You need to be in the bottom to read it." },
    ],
    answer: {
      correct: ["bottom", "bottom bunk", "nedre", "nederste", "den nederste"],
      normalized: true,
    },
    rewardText: "Bottom bunk. Now look up.",
    failureText: "Think about where a note would be hidden in a bunk room.",
    da: {
      title: "Øverste eller Nederste",
      description: "Køjesengen. Den øverste er ikke redt — den nederste er sovet i.",
      prompt: "Spilleren i køjestuen vælger: øverste eller nederste køje. Valget betyder noget.",
      rewardText: "Nederste køje. Se nu op.",
      failureText: "Tænk over hvor en seddel ville være gemt i en køjesovereste.",
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
    isRequired: false,
    hints: [],
    answer: {
      correct: ["3", "4", "5", "6", "7", "8", "three", "four", "five", "six", "seven", "eight"],
      normalized: true,
    },
    rewardText: "Counted. They're healthy. The house hasn't been as empty as you thought.",
    da: {
      title: "Planterne",
      description: "Planterne i vinterhaven har det godt. Bedre end de burde for et hus der angiveligt har stået tomt.",
      prompt: "Hvor mange planter er der i vinterhaven? Tæl dem.",
    },
  },
  {
    id: "sunroom-wind",
    roomId: "sunroom",
    type: "social_challenge",
    title: "The Wind",
    description:
      "The sunroom is the first place in the house where you notice the wind has picked up. It's coming from the west. That matters for the tone of Act 3, though you don't know that yet.",
    prompt:
      "Stand in the sunroom and listen to the wind. One player describes what they hear. The description must include a direction.",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "The wind noted. It will be louder by midnight.",
    da: {
      title: "Vinden",
      description: "Vinterhaven er det første sted i huset hvor du lægger mærke til at vinden er taget til.",
      prompt: "Stå i vinterhaven og lyt til vinden. Én spiller beskriver hvad de hører.",
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
    title: "The Kitchen at Evening",
    description:
      "The kitchen in the evening light. Someone made coffee — the pot is still warm. The dishes are clean. The fridge is stocked.",
    prompt: "One player checks the fridge and reports what's in it. The group votes on one item that definitely shouldn't be there.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "The kitchen is accounted for. One item is noted as wrong.",
    da: {
      title: "Køkkenet Om Aftenen",
      description: "Køkkenet i aftenslyset. Nogen lavede kaffe — kanden er stadig varm.",
      prompt: "Én spiller tjekker køleskabet og rapporterer hvad der er i det. Gruppen stemmer om én genstand der bestemt ikke burde være der.",
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
  {
    id: "activity-room-social",
    roomId: "activity-room",
    type: "social_challenge",
    title: "One Game",
    description: "Before the radio. Before everything changes. Play one game — darts, foosball, billiards, table tennis. Any game.",
    prompt: "The group plays one quick game in the activity room. Agree on which one. The team that wins keeps their advantage into Act 3.",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "One game played. The evening has its peak before the drop.",
    da: {
      title: "Ét Spil",
      description: "Inden radioen. Inden alt ændrer sig. Spil ét spil.",
      prompt: "Gruppen spiller ét hurtigt spil i aktivitetsrummet. Bliv enige om hvilket.",
    },
  },

  // --- DARTS BOARD ---
  {
    id: "darts-missing-player",
    roomId: "darts-board",
    type: "social_challenge",
    title: "The Incomplete Game",
    description:
      "Three players scored on the chalkboard. Player 1: 301 → 0. Player 2: 301 → 84. Player 3: no scores after 301.",
    prompt:
      "Player 3 stopped scoring after writing 301. Two possibilities: they won without needing to score, or they left. The group must agree on which and say why.",
    order: 1,
    isRequired: false,
    hints: [],
    rewardText: "The conclusion is noted. Player 3 is part of the story now.",
    da: {
      title: "Det Ufuldstændige Spil",
      description: "Tre spillere scorede på kridttavlen. Spiller 3 stoppede med at score efter at have skrevet 301.",
      prompt: "To muligheder: de vandt uden at behøve score, eller de forlod. Gruppen skal blive enige om hvilken og sige hvorfor.",
    },
  },
  {
    id: "darts-social",
    roomId: "darts-board",
    type: "physical_challenge",
    title: "Finish the Game",
    description: "Player 2 was at 84 when the game stopped. Finish it. Get from 84 to 0.",
    prompt: "One player picks up the darts and finishes Player 2's game from 84. The others watch. No hints — just finish it.",
    order: 2,
    isRequired: false,
    hints: [],
    physicalChallenge: {
      timerSeconds: 120,
      startLabel: "Begin — finish from 84",
      activeEmoji: "🎯",
      bannerText: "Someone is at the darts board",
      completeLabel: "Game finished (or time's up)",
    },
    rewardText: "The game is finished. Player 2's score is cleared.",
    da: {
      title: "Afslut Spillet",
      description: "Spiller 2 var på 84 da spillet stoppede. Afslut det.",
      prompt: "Én spiller tager dartene og afslutter Spiller 2's spil fra 84.",
    },
  },

  // --- FOOSBALL TABLE ---
  {
    id: "foosball-bent-rod",
    roomId: "foosball-table",
    type: "puzzle",
    title: "The Bent Rod",
    description: "One of the goalie rods is slightly bent — not broken, just wrong. The ball is sealed inside the table, the goals covered by the goalies at a specific angle.",
    prompt: "The goalie rod is bent at approximately how many degrees off-straight? Examine it and estimate.",
    order: 1,
    isRequired: false,
    hints: [],
    answer: {
      correct: ["15", "20", "25", "10", "30", "fifteen", "twenty", "tyve", "femten", "tredive"],
      normalized: true,
    },
    rewardText: "The angle noted. The rod was bent deliberately — it keeps the goalies at exactly the angle needed to trap the ball.",
    da: {
      title: "Den Bøjede Stang",
      description: "Én af keeperstængerne er let bøjet — ikke knækket, bare forkert.",
      prompt: "Keeperstangen er bøjet med omtrent hvor mange grader fra ret? Undersøg den og estimer.",
    },
  },
  {
    id: "foosball-social",
    roomId: "foosball-table",
    type: "social_challenge",
    title: "One Half",
    description: "Play one half of foosball, 5 minutes, despite the bent rod. The bent goalie is a permanent disadvantage for whoever controls that side.",
    prompt: "Play a 5-minute half of foosball. The team controlling the bent-rod side plays with a permanent defensive disadvantage.",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "Half played. The foosball table has stories now.",
    da: {
      title: "En Halvleg",
      description: "Spil en halvleg fodboldspil, 5 minutter, trods den bøjede stang.",
      prompt: "Spil en 5-minutters halvleg fodboldspil.",
    },
  },

  // --- DINING ROOM (identify the boss) ---
  {
    id: "dining-room-static",
    roomId: "dining-room",
    type: "social_challenge",
    title: "Louder in Here",
    description:
      "The static you've been hearing all evening is louder in this room. Much louder. It isn't coming from the walls. It's coming from something IN here.",
    prompt:
      "Everyone quiet. One player closes their eyes and points to where the sound is coming from. The group confirms the direction: high or low? Corner or center? Follow it.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "The shelf. It's coming from the shelf.",
    da: {
      title: "Højere Herinde",
      description: "Statikken I har hørt hele aftenen er højere i dette rum. Meget højere. Den kommer ikke fra væggene. Den kommer fra noget HERINDE.",
      prompt: "Alle stille. Én spiller lukker øjnene og peger mod hvor lyden kommer fra. Gruppen bekræfter retningen: højt eller lavt? Hjørne eller midte? Følg den.",
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
    title: "Orient Yourselves",
    description:
      "The house is dark. You know this room — you were just here. Eyes adjusting. The radio shelf is to the right. The door to the corridor is ahead. Utility corner is to your left.",
    prompt:
      "Without using any light source, one player describes the layout of the dining room from memory. Get the radio shelf, the table, and the door to the corridor right.",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Radio shelf: right. Table: center. Corridor door: ahead. Utility corner: left." },
    ],
    rewardText: "Orientation confirmed. The utility corner is on your left. That's where to start.",
    da: {
      title: "Orienter Jer",
      description: "Huset er mørkt. I kender dette rum — I var netop her.",
      prompt: "Uden at bruge nogen lyskilde, beskriver én spiller layoutet af spisestuen fra hukommelsen.",
      rewardText: "Orientering bekræftet. Redskabshjørnet er til venstre. Der starter I.",
    },
  },

  // --- UTILITY CORNER ---
  {
    id: "utility-find-flashlight",
    roomId: "utility-corner",
    type: "puzzle",
    title: "Find the Flashlight",
    description:
      "A utility corner off the dining room. Hooks on the wall. A basket of house items — things that belong to the property, not to any visitor. One of them is a flashlight.",
    prompt:
      "In the basket of house items in the utility corner, you find: a measuring tape, a corkscrew, a flashlight, two birthday candles, and a first aid kit. What do you take?",
    order: 1,
    isRequired: true,
    hints: [],
    answer: {
      correct: ["flashlight", "torch", "lommelygte", "lygten", "the flashlight"],
      normalized: true,
    },
    rewardClueId: "artifact-flashlight",
    rewardText: "The flashlight. It works. The batteries are warm. Someone used this recently.",
    failureText: "Take the thing that lets you see.",
    da: {
      title: "Find Lommelygten",
      description: "Et redskabshjørnet ved spisestuen. Kroge på væggen. En kurv med hus-ting.",
      prompt: "I kurven med hus-ting i redskabshjørnet finder du: et målebånd, en proptrækker, en lommelygte, to fødselsdagslys og et førstehjælpssæt. Hvad tager du?",
      rewardText: "Lommelygten. Den virker. Batterierne er varme.",
      failureText: "Tag det der lader dig se.",
    },
  },

  // --- BACK CORRIDOR ---
  {
    id: "corridor-explore",
    roomId: "back-corridor",
    type: "social_challenge",
    title: "The Corridor",
    description:
      "The back corridor, visible now with the flashlight. You walked past this all evening. Under the stairs. Three doors — one slightly ajar.",
    prompt: "With the flashlight, sweep the corridor. One player describes what they see. The ajar door — what's behind it?",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "The ajar door is the fuse box. Now you know where it is.",
    da: {
      title: "Korridoren",
      description: "Bagkorridoren, synlig nu med lommelygten.",
      prompt: "Med lommelygten, sved korridoren. Én spiller beskriver hvad de ser.",
    },
  },
  {
    id: "corridor-door-check",
    roomId: "back-corridor",
    type: "social_challenge",
    title: "Three Doors",
    description: "Three doors. One ajar (the fuse box). One locked. One — the one nobody tried.",
    prompt:
      "Try all three doors. Report: which opens, which is locked, which is the ajar one. The door nobody tried — what does it look like?",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "Doors assessed. Two will matter. One already matters.",
    da: {
      title: "Tre Døre",
      description: "Tre døre. Én på klem (sikringsskabet). Én låst. Én — den ingen prøvede.",
      prompt: "Prøv alle tre døre. Rapporter: hvilken åbner, hvilken er låst, hvilken er den der er på klem.",
    },
  },

  // --- FUSE BOX ---
  {
    id: "fusebox-identify",
    roomId: "fuse-box",
    type: "puzzle",
    title: "Identify the Problem",
    description:
      "The fuse box panel. Multiple breakers. Most are fine. One is clearly tripped. One glass-tube fuse is blown — you can see the filament is gone.",
    prompt:
      "In the fuse box, you find one blown glass-tube fuse. What does a blown glass-tube fuse look like?",
    order: 1,
    isRequired: true,
    hints: [],
    answer: {
      correct: ["filament", "black", "burnt", "dark", "broken wire", "gone", "smoke", "dark inside", "charred",
                "filament er væk", "sort", "brændt"],
      normalized: true,
    },
    rewardText: "Identified. The filament is gone. There's a replacement inside the panel door.",
    da: {
      title: "Identificer Problemet",
      description: "Sikringsskabets panel. De fleste afbrydere er fine. Én glasrørssikring er sprunget.",
      prompt: "Hvad ser en sprunget glasrørssikring ud som?",
      rewardText: "Identificeret. Filamentet er væk. Der er en erstatning inden i paneldøren.",
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
  {
    id: "dark-kitchen-observe",
    roomId: "kitchen-dark",
    type: "social_challenge",
    title: "The Kitchen at Night",
    description: "The same kitchen from Act 2. Same room. Under one working light in the dark, what's different?",
    prompt: "One player looks around the kitchen. Name one thing that looks different at night versus in Act 2.",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "The kitchen is the same kitchen. It just means something different now.",
    da: {
      title: "Køkkenet Om Natten",
      description: "Det samme køkken fra Akt 2. Samme rum. Under ét arbejdende lys i mørket, hvad er anderledes?",
      prompt: "Én spiller kigger rundt i køkkenet. Navngiv én ting der ser anderledes ud om natten versus i Akt 2.",
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
    description:
      "You've walked past this door all evening. In the dark, you finally try it. The handle turns.",
    prompt: "One player tries the door. It opens. What does the player say when they see what's behind it?",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "The door opens. What's behind it is not a room.",
    da: {
      title: "Prøv Døren",
      description: "Du er gået forbi denne dør hele aftenen. I mørket prøver du den endelig.",
      prompt: "Én spiller prøver døren. Den åbner. Hvad siger spilleren da de ser hvad der er bag den?",
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
      correct: ["shed", "skuret", "date list", "datolisten", "the list", "listen", "act 1", "akt 1"],
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
    description:
      "Back outside. The garden is completely dark. Behind the shed — a section you didn't explore in Act 1. Something is here.",
    prompt:
      "One player goes behind the shed. Describe what they find. Two things are back here: the conservatory, and the shed itself approached from the other side.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "The conservatory is visible. The shed is behind you. Two things to investigate.",
    da: {
      title: "Ind i Mørket",
      description: "Tilbage udenfor. Haven er fuldstændig mørk. Bag skuret — en sektion du ikke udforskede i Akt 1.",
      prompt: "Én spiller går bag skuret. Beskriv hvad de finder.",
      rewardText: "Vinterhaven er synlig. Skuret er bag dig.",
    },
  },
  {
    id: "behind-shed-dark",
    roomId: "behind-the-shed",
    type: "puzzle",
    title: "How Far is Too Far",
    description: "The darkness behind the shed is different from any other darkness tonight. Why?",
    prompt: "What makes the darkness behind the shed feel different? One player answers. The others vote on whether the answer is real.",
    order: 2,
    isRequired: false,
    hints: [],
    answer: {
      correct: ["outside", "total", "no light", "open", "sky", "wind", "sound", "nature",
                "udenfor", "totalt", "intet lys", "åbent", "himmel", "vind", "lyd"],
      normalized: true,
    },
    rewardText: "Total darkness. No walls to bounce light off. Just the garden and the wind.",
    da: {
      title: "Hvor Langt er For Langt",
      description: "Mørket bag skuret er anderledes end noget andet mørke i aften.",
      prompt: "Hvad gør mørket bag skuret føles anderledes?",
    },
  },

  // --- CONSERVATORY ---
  {
    id: "conservatory-find-candle",
    roomId: "conservatory",
    type: "puzzle",
    title: "The Candle on the Windowsill",
    description:
      "Glass on three sides. Cold. The wind audible. On the windowsill — a full red candle in a holder, with a matchbox. Someone placed this deliberately.",
    prompt: "The candle is on the windowsill. The matchbox is beside it. What colour is the candle?",
    order: 1,
    isRequired: true,
    hints: [],
    answer: {
      correct: ["red", "rød", "dark red", "mørkerød", "crimson", "deep red"],
      normalized: true,
    },
    rewardClueId: "artifact-candle",
    rewardText: "Red. A deep red candle, full and unlit. Someone brought this specifically for something.",
    da: {
      title: "Stearinlyset på Vindueskarmens",
      description: "Glas på tre sider. Koldt. Vinden hørbar. På vindueskarmens — et fuldt rødt stearinlys i en lysestage.",
      prompt: "Stearinlyset er på vindueskarmens. Hvilken farve er stearinlyset?",
      rewardText: "Rødt. Et dybt rødt stearinlys, fuldt og uantændt.",
    },
  },
  {
    id: "conservatory-cold",
    roomId: "conservatory",
    type: "social_challenge",
    title: "Colder Than Outside",
    description: "The conservatory is colder than the garden. Glass walls, wind audible. Something about the temperature is wrong.",
    prompt: "One player stands in the conservatory for 30 seconds. Describe what the temperature feels like. Why would a glass room be colder than the open garden?",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "The temperature noted. The conservatory has been open to the wind longer than the house.",
    da: {
      title: "Koldere End Udenfor",
      description: "Vinterhaven er koldere end haven. Glasvægge, vind hørbar.",
      prompt: "Én spiller står i vinterhaven i 30 sekunder. Beskriv hvad temperaturen føles som.",
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
  {
    id: "shed-dark-date-list",
    roomId: "shed-dark",
    type: "social_challenge",
    title: "The Date List, Again",
    description: "The same date list from Act 1. It looks different now. Tonight's date is still uncrossed. Read it again.",
    prompt:
      "Look at the date list on the shed wall. Tonight's date is still the last entry — not crossed out. The group stands in the shed, in the dark. One player says what the list means now that they know about the sealed wall and the note.",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "The list means something different now. It always did.",
    da: {
      title: "Datolisten, Igen",
      description: "Den samme datoliste fra Akt 1. Den ser anderledes ud nu.",
      prompt: "Kig på datolisten på skurvæggen. Aftenens dato er stadig den sidste post — ikke overstreget. Én spiller siger hvad listen betyder nu.",
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
