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
    id: "driveway-arrival",
    roomId: "driveway",
    type: "social_challenge",
    title: "Arrival Protocol",
    description:
      "Everyone's here. Someone has to call it. Name the three things that feel different about this summerhouse versus last year.",
    prompt:
      "One player lists three things that feel different about this year's trip versus previous trips. The group votes on whether they count. All three must be accepted.",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "Arrival registered. The house takes note of who notices things.",
    da: {
      title: "Ankomst-protokol",
      description: "Alle er her. Nogen skal nævne det. Navngiv de tre ting der føles anderledes ved dette sommerhus versus sidste år.",
      prompt: "Én spiller nævner tre ting der føles anderledes ved dette år versus tidligere ture. Gruppen stemmer.",
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
    id: "terrace-railing",
    roomId: "terrace",
    type: "puzzle",
    title: "The Railing",
    description:
      "Check the underside of the terrace railing — specifically near the third post from the left. People carve things in railings when they want them found later but not immediately.",
    prompt:
      "You find a digit scratched into the underside of the railing near the third post. What is it?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Run your hand along the underside of the railing." },
      { order: 2, offerCost: 1, text: "Third post from the left. Underside. A single digit." },
    ],
    answer: {
      correct: ["7", "seven", "syv"],
      normalized: true,
    },
    rewardClueId: "fragment-terrace",
    rewardText: "7. Scratched into the wood with something sharp. Someone was here before you.",
    failureText: "Look again. It's there.",
    da: {
      title: "Gelænderet",
      description: "Tjek undersiden af terrasse-gelænderet — specifikt ved den tredje stolpe fra venstre.",
      prompt: "Du finder et ciffer ridset ind i undersiden af gelænderet ved den tredje stolpe. Hvad er det?",
      rewardText: "7. Ridset ind i træet med noget skarpt. Nogen var her før dig.",
      failureText: "Kig igen. Det er der.",
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
    rewardText: "The hollow yields something. The garden has been used as a hiding spot before.",
    da: {
      title: "Søg Haven",
      description: "1.250 kvadratmeter. Naturlig. Kystmæssig. Gruppen deler sig for at søge.",
      prompt: "Del op og søg haven. Én spiller går til den gamle egetræ ved baghegnet og tjekker hulheden.",
    },
  },
  {
    id: "garden-oak-hollow",
    roomId: "garden",
    type: "puzzle",
    title: "The Oak Tree Hollow",
    description:
      "The old oak near the back fence has a hollow at about waist height. Inside: a folded scrap of paper. What digit is on it?",
    prompt: "Open the folded paper from the oak hollow. What number is written on it?",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "The hollow is at about waist height. The paper is folded twice." },
    ],
    answer: {
      correct: ["1", "one", "en", "et"],
      normalized: true,
    },
    rewardClueId: "fragment-garden",
    rewardText: "1. Folded and waiting in the hollow. The garden keeps secrets.",
    failureText: "The paper has exactly one thing on it.",
    da: {
      title: "Egetræets Hulhed",
      description: "Den gamle egetræ ved baghegnet har en hulhed i hoftehøjde. Indeni: et foldet stykke papir. Hvilket ciffer er på det?",
      prompt: "Åbn det foldede papir fra egetræets hulhed. Hvilken nummer er skrevet på det?",
      rewardText: "1. Foldet og ventende i hulheden.",
      failureText: "Papiret har præcis én ting på sig.",
    },
  },

  // --- SHED ---
  {
    id: "shed-door-search",
    roomId: "shed",
    type: "puzzle",
    title: "Behind the Door",
    description:
      "The shed door opens with a shove. Something is taped to the back of it, behind the hinges — almost invisible unless you pull the door all the way open and look at the back.",
    prompt:
      "Pull the shed door all the way open and check the back of it, behind the hinges. What digit is written on the tape there?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "The tape is on the back of the door, not the front. Behind the hinges." },
    ],
    answer: {
      correct: ["9", "nine", "ni"],
      normalized: true,
    },
    rewardClueId: "fragment-shed",
    rewardText: "9. On tape, on the back of the door. Placed where you'd only find it if you were really looking.",
    failureText: "The number is on the tape. Behind the hinges.",
    da: {
      title: "Bag Døren",
      description: "Skurets dør åbner med et skub. Noget er klistret på bagsiden af den, bag hængserne.",
      prompt: "Træk skurets dør helt åben og tjek bagsiden af den, bag hængserne. Hvilket ciffer er skrevet på tapen der?",
      rewardText: "9. På tape, på bagsiden af døren.",
      failureText: "Nummeret er på tapen. Bag hængserne.",
    },
  },
  {
    id: "shed-date-list-quest",
    roomId: "shed",
    type: "social_challenge",
    title: "The Date List",
    description:
      "On the inside wall of the shed, laminated and pinned: a list of dates. All crossed out except one. Read it. Talk about it. What does the group make of it?",
    prompt:
      "Read the date list on the shed wall as a group. What do you notice? One player must say something about it out loud — funny, uneasy, confused, whatever. The group votes on whether their observation counts.",
    order: 2,
    isRequired: true,
    hints: [],
    rewardClueId: "shed-date-list",
    rewardText: "The list is in the Case File. It seemed easy to explain in Act 1. It will not seem easy later.",
    da: {
      title: "Datolisten",
      description: "På indervæggen i skuret, lamineret og fastgjort: en liste af datoer. Alle overstreget undtagen én.",
      prompt: "Læs datolisten på skurvæggen som gruppe. Hvad lægger I mærke til? Én spiller skal sige noget om det højt.",
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

  // --- FRONT DOOR ---
  {
    id: "front-door-keybox",
    roomId: "front-door",
    type: "puzzle",
    title: "The Key Box",
    description:
      "Five digits. You have five fragments — from the driveway, the terrace, the garden, the shed, and Mads. The order matters: each fragment was found in a specific location. The code reads in the order the fragments were discovered — starting at the driveway.",
    prompt:
      "Combine the five fragments in the order they were found:\n1. Driveway fragment\n2. Terrace fragment\n3. Garden fragment\n4. Shed fragment\n5. Mads's fragment\n\nWhat is the five-digit code?",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Check your Case File. All five fragments are there." },
      { order: 2, offerCost: 2, text: "Driveway: 3. Terrace: 7. Garden: 1. Shed: 9. Mads: 4." },
    ],
    answer: {
      correct: ["37194", "3 7 1 9 4"],
      normalized: true,
    },
    rewardText: "Click. The key box opens. The door unlocks. Act 2 begins.",
    failureText: "The key box rejects it. Check the order — did you find all five fragments?",
    da: {
      title: "Nøgleboksen",
      description: "Fem cifre. I har fem fragmenter — fra indkørslen, terrassen, haven, skuret og Mads.",
      prompt: "Kombiner de fem fragmenter i den rækkefølge de blev fundet:\n1. Indkørselsfragment\n2. Terrassefragment\n3. Havefragment\n4. Skurfragment\n5. Mads' fragment\n\nHvad er den femsifrede kode?",
      rewardText: "Klik. Nøgleboksen åbner. Døren låses op. Akt 2 begynder.",
      failureText: "Nøgleboksen afviser det. Tjek rækkefølgen.",
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
    id: "double-room-note",
    roomId: "double-room",
    type: "puzzle",
    title: "The Unfinished Note",
    description:
      "On the bedside table: a note. It ends mid-sentence, mid-word almost. The clue word appears twice in what's written — the same word, used in two different ways.",
    prompt:
      "Read the note from the double room bedside table. What word appears twice and seems to carry the most weight?\n\n*\"We owed it to each other. We owed it to the house. I know we said we'd come back and finish what we—\"*",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "The word appears in the first two sentences." },
    ],
    answer: {
      correct: ["owed", "skyldte"],
      normalized: true,
    },
    rewardClueId: "word-owed",
    rewardText:
      "Owed. The word is in the Case File. Remember it — you'll need it in the Living Room.",
    failureText: "Read the first two sentences again.",
    da: {
      title: "Den Uafsluttede Seddel",
      description: "På natbordet: en seddel. Den slutter midt i en sætning.",
      prompt: "Læs sedlen fra dobbeltværelsets natbord. Hvilket ord optræder to gange og synes at bære mest vægt?\n\n*\"Vi skyldte det hinanden. Vi skyldte det huset. Jeg ved vi sagde vi ville komme tilbage og afslutte hvad vi—\"*",
      rewardText: "Skyldte. Ordet er i sagsmappen.",
      failureText: "Læs de to første sætninger igen.",
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
    id: "single-room-note",
    roomId: "single-room",
    type: "puzzle",
    title: "The Observation That Became a Crisis",
    description:
      "A note on the desk. It started as a calm observation and ended somewhere else entirely. The clue word is in every sentence — each time slightly larger in scope.",
    prompt:
      "Read the note from the single room desk. What is the word that escalates through the note — from house to bed to something much larger?\n\n*\"This is not even my house... Borrowed it is... Not even my bed... Borrowed... This... life... borrowed?\"*",
    order: 2,
    isRequired: true,
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
      prompt: "Læs sedlen fra enkeltværelsets skrivebord. Hvad er det ord der eskalerer gennem sedlen?\n\n*\"Det er ikke engang mit hus... Lånt er det... Ikke engang min seng... Lånt... Dette... liv... lånt?\"*",
      rewardText: "Lånt. Ordet er i sagsmappen.",
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
    id: "bunk-room-note",
    roomId: "bunk-room",
    type: "puzzle",
    title: "The Underside of the Mattress",
    description:
      "Written on the underside of the top bunk mattress. Only visible if you're lying in the bottom bunk looking up. Cold. Minimal. Three sentences.",
    prompt:
      "You're lying in the bottom bunk, looking up. What is the final word of the note — the word that locks the sentence?\n\n*\"It was taken. It is always taken. The room where everyone gathers holds the rest.\"*",
    order: 2,
    isRequired: true,
    hints: [],
    answer: {
      correct: ["taken", "taget"],
      normalized: true,
    },
    rewardClueId: "word-taken",
    setsScaredSilent: true,
    rewardText:
      "Taken. The word is in the Case File. The note affects you — you are too unsettled to speak in the next room. You will communicate by other means.",
    failureText: "Read the final sentence.",
    da: {
      title: "Undersiden af Madrassen",
      description: "Skrevet på undersiden af den øverste køje-madras. Kun synlig hvis du ligger i den nederste køje og kigger op.",
      prompt: "Du ligger i den nederste køje og kigger op. Hvad er det endelige ord i sedlen?\n\n*\"Det blev taget. Det bliver altid taget. Rummet hvor alle samles indeholder resten.\"*",
      rewardText: "Taget. Ordet er i sagsmappen. Sedlen påvirker dig — du er for urolig til at tale i det næste rum.",
      failureText: "Læs den endelige sætning.",
    },
  },

  // --- LIVING ROOM ---
  {
    id: "living-room-sentence",
    roomId: "living-room",
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
    id: "living-room-radio",
    roomId: "living-room",
    type: "social_challenge",
    title: "The Static",
    description:
      "From the living room, you can hear the radio in the dining room. The static is low but constant. Try to make out the words.",
    prompt: "Listen to the radio static from the living room. What words can you almost hear? One player guesses — others confirm or deny.",
    order: 2,
    isRequired: false,
    hints: [],
    rewardClueId: "radio-fragment-living",
    rewardText: "A fragment heard: *\"...the last one...\"* The radio is trying to tell you something.",
    da: {
      title: "Statikken",
      description: "Fra stuen kan du høre radioen i spisestuen. Statikken er lav men konstant.",
      prompt: "Lyt til radioens statik fra stuen. Hvilke ord kan du næsten høre?",
      rewardText: "Et fragment hørt: *\"...den sidste...\"*",
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
    id: "kitchen-act2-fragment",
    roomId: "kitchen-act2",
    type: "puzzle",
    title: "The Radio from the Kitchen",
    description:
      "The acoustics of the kitchen carry the dining room radio clearly. A burst of words through the static — three of them distinctly audible.",
    prompt:
      "The radio crackles from the dining room. What three words can you make out?\n\n(Hint: these are the middle words of the broadcast line you'll hear fully in the dining room.)",
    order: 2,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Listen for: *\"...will always be...\"*" },
    ],
    answer: {
      correct: ["will always be", "always be", "will always", "vil altid være", "altid være"],
      normalized: true,
    },
    rewardClueId: "radio-fragment-kitchen",
    rewardText: "*\"...will always be...\"* Three words through the static. It's building to something.",
    failureText: "Listen again. Three words. Middle of a sentence.",
    da: {
      title: "Radioen fra Køkkenet",
      description: "Køkkenets akustik bærer spisestruerens radio klart.",
      prompt: "Radioen knatrer fra spisestuen. Hvilke tre ord kan du høre tydeligt?",
      rewardText: "*\"...vil altid være...\"* Tre ord gennem statikken.",
    },
  },

  // --- ACTIVITY ROOM ---
  {
    id: "activity-room-fragment",
    roomId: "activity-room",
    type: "puzzle",
    title: "The Final Fragment",
    description:
      "The activity room is the acoustic sweet spot. The dining room radio is clearest from here. A full phrase comes through.",
    prompt:
      "The static clears briefly. What is the final phrase you hear from the dining room radio?\n\n(Complete the broadcast line from the fragments you've already found.)",
    order: 1,
    isRequired: true,
    hints: [
      { order: 1, offerCost: 1, text: "Living room: *'...the last one...'*  Kitchen: *'...will always be...'*  Activity room: ?" },
      { order: 2, offerCost: 1, text: "The final phrase: *'...the one to finish it.'*" },
    ],
    answer: {
      correct: ["the one to finish it", "one to finish it", "to finish it", "den der afslutter det", "afslutter det"],
      normalized: true,
    },
    rewardClueId: "radio-fragment-activity",
    rewardText:
      "*\"...the one to finish it.\"* The three fragments assembled: *\"The last one... will always be... the one to finish it.\"* Fix the radio to hear it clearly.",
    failureText: "The three fragments point to a conclusion. What is it?",
    da: {
      title: "Det Endelige Fragment",
      description: "Aktivitetsrummet er det akustiske sweet spot. Spisestruerens radio er tydeligst herfra.",
      prompt: "Statikken klarer sig kortvarigt. Hvad er den endelige sætning du hører fra spisestruerens radio?",
      rewardText: "*\"...den der afslutter det.\"* De tre fragmenter samlet.",
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

export function getQuestsByRoom(roomId: string): Quest[] {
  return QUESTS.filter((q) => q.roomId === roomId).sort((a, b) => a.order - b.order);
}

export function getRequiredQuestsByRoom(roomId: string, teamId?: string): Quest[] {
  return QUESTS.filter(
    (q) =>
      q.roomId === roomId &&
      q.isRequired &&
      (!q.forTeam || q.forTeam === teamId)
  ).sort((a, b) => a.order - b.order);
}
