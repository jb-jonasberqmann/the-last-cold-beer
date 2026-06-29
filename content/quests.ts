import type { Quest } from "@/types/content";

// ==========================================
// CHAPTER 1 QUESTS
// Each room has 2+ quests. Required quests must be completed to mark room done.
// Offer costs are meaningful — minimum 1 Offer per hint, 2–3 for unlocks.
// ==========================================

export const QUESTS: Quest[] = [
  // ==========================================
  // THE KITCHEN — 3 quests per team
  // ==========================================
  {
    id: "kitchen-inspection",
    forTeam: "team-a",
    roomId: "kitchen",
    type: "puzzle",
    title: "The First Inspection",
    description:
      "You walk into the kitchen. The lights flicker once. Everything looks normal — except the fridge is humming louder than it should. On the counter, someone left a sticky note. It says: \"Count what belongs. Ignore what clearly came from another fridge.\"",
    prompt:
      "There are 11 magnets on the fridge. 3 are shaped like beer bottles. 2 are shaped like tiny pineapples. The rest are letters. The sticky note says: \"Count what belongs. Ignore what clearly came from another fridge.\" The pineapples look aggressively tropical for a Scandinavian cabin. How many magnets belong?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Look for the magnets that feel like they belong to a different story.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "You are removing outsiders from the total, not choosing one category.",
      },
    ],
    answer: {
      correct: ["9", "nine", "ni"],
      normalized: true,
    },
    rewardClueId: "clue-kitchen-calendar",
    rewardText:
      "9 magnets belong. As you count them, your eye drifts to the wall calendar. Something's marked. Something old.",
    failureText: "The magnets stare back at you. Pineapples have no place in this cabin.",
    da: {
      title: "Den Første Inspektion",
      description:
        "Du går ind i køkkenet. Lyset blinker én gang. Alt ser normalt ud — bortset fra at køleskabet summer højere end det burde. På disken har nogen efterladt en klæbrig lap. Den siger: \"Tæl hvad der hører til. Ignorer hvad der tydeligvis kom fra et andet køleskab.\"",
      prompt:
        "Der er 11 magneter på køleskabet. 3 er formet som ølflasker. 2 er formet som små ananas. Resten er bogstaver. Den klæbrige lap siger: \"Tæl hvad der hører til. Ignorer hvad der tydeligvis kom fra et andet køleskab.\" Ananasserne ser aggressivt tropiske ud til en skandinavisk hytte. Hvor mange magneter hører til?",
      hints: [
        "Led efter magneterne der føles som om de hører til i en anden fortælling.",
        "Du fjerner fremmedelementer fra totalen — ikke vælger én kategori.",
      ],
      rewardText:
        "9 magneter hører til. Mens du tæller dem, får øjet fat på vægkalenderen. Noget er markeret. Noget gammelt.",
      failureText: "Magneterne stirrer tilbage på dig. Ananas hører ikke hjemme i denne hytte.",
    },
  },
  {
    id: "kitchen-fridge-unlock",
    forTeam: "team-a",
    roomId: "kitchen",
    type: "unlock",
    title: "Open the Fridge",
    description:
      "The fridge stands before you. Cold air seeps under the door. You can hear it — the faint, distant hum of something impossibly chilled. Pay the toll and open it.",
    prompt: "The fridge won't open itself. Pay the ritual cost to investigate.",
    order: 2,
    isRequired: true,
    offerCost: 2,
    hints: [],
    rewardText:
      "The door swings open. Cold air rushes out. There it is — one single beer, alone in the center, covered in condensation. A note is taped to it.",
    da: {
      title: "Åbn Køleskabet",
      description:
        "Køleskabet står foran dig. Kold luft siver under lågen. Du kan mærke det — den svage, fjerne summen af noget umuligt koldt. Betal tolden og åbn det.",
      prompt: "Køleskabet åbner sig ikke selv. Betal den rituelle pris for at undersøge det.",
      rewardText:
        "Lågen svinger åben. Kold luft strømmer ud. Der er det — én enkelt øl, alene i midten, dækket af kondens. En seddel er klistret til den.",
    },
  },
  {
    id: "kitchen-social",
    forTeam: "team-a",
    roomId: "kitchen",
    type: "social_challenge",
    title: "The Cabin Welcome Toast",
    description:
      "Every good cabin trip starts the same way. Someone has to give the welcome toast. It must reference at least one person who is NOT present, end with a countdown, and contain the word \"fridge\".",
    prompt:
      "One team member gives a welcome toast. The other team judges if it meets the requirements. Judge by group vote. If the toast is accepted, earn the bonus.",
    order: 3,
    isRequired: false,
    hints: [],
    rewardText: "A worthy toast. The cabin acknowledges your arrival.",
    failureText: "The cabin is unmoved. Try harder next time.",
    da: {
      title: "Hyttens Velkomstskål",
      description:
        "Enhver god hyttetur starter på samme måde. Nogen skal give velkomstskålen. Den skal referere til mindst én person der IKKE er til stede, slutte med en nedtælling, og indeholde ordet \"køleskab\".",
      prompt:
        "Ét holdmedlem giver en velkomstskål. Det andet hold bedømmer om den opfylder kravene. Bedøm ved gruppeafstemning. Godkendes skålen: tjen bonussen.",
      rewardText: "En værdig skål. Hytten anerkender jeres ankomst.",
      failureText: "Hytten er uberørt. Prøv hårdere næste gang.",
    },
  },

  {
    id: "b-kitchen-inspection",
    roomId: "kitchen",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Wrong Word on the Fridge",
    description:
      "Your team enters the kitchen. The letter magnets on the fridge have been rearranged. Someone clearly had a theory. Or a message. Or both.",
    prompt:
      "The letter magnets on the fridge are arranged like this:\nR  A  L  T  U  I\nSomeone has tried to spell something while clearly standing too close to the fridge.\nRearrange the letters into the word that best describes what this whole situation is starting to feel like.",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "The letters form one word connected to repeated traditions.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "Look for a word that begins with R and explains why this feels planned.",
      },
    ],
    answer: {
      correct: ["ritual", "RITUAL", "Ritual"],
      normalized: true,
    },
    rewardClueId: "clue-kitchen-calendar",
    rewardText:
      "RITUAL. Not random at all. This is a ritual, not a random missing beer. Something has been planned here.",
    failureText: "The magnets are all there. Six letters. One word. Try rearranging.",
    da: {
      title: "Det Forkerte Ord på Køleskabet",
      description:
        "Jeres hold træder ind i køkkenet. Bogstavmagneterne på køleskabet er omrodet. Nogen har tydeligvis haft en teori. Eller en besked. Eller begge.",
      prompt:
        "Bogstavmagneterne på køleskabet er arrangeret sådan:\nR  A  L  T  U  I\nNogen har forsøgt at stave noget mens de tydeligvis stod for tæt på køleskabet.\nOmarrangér bogstaverne til det ord der bedst beskriver hvad hele denne situation begynder at føles som.",
      hints: [
        "Bogstaverne danner ét ord forbundet med gentagne traditioner.",
        "Led efter et ord der begynder med R og forklarer hvorfor dette føles planlagt.",
      ],
      rewardText:
        "RITUAL. Slet ikke tilfældigt. Dette er et ritual, ikke en tilfældig forsvunden øl. Noget har været planlagt her.",
      failureText: "Magneterne er alle der. Seks bogstaver. Et ord. Prøv at omarrangere.",
    },
  },
  {
    id: "b-kitchen-fridge-unlock",
    roomId: "kitchen",
    forTeam: "team-b",
    type: "unlock",
    title: "Approach the Fridge",
    description:
      "The fridge is humming at an unusual frequency. Your team can feel it before you touch the handle. Whatever is in there has been waiting. Pay the toll and open it.",
    prompt: "Pay the ritual cost to investigate the fridge.",
    order: 2,
    isRequired: true,
    offerCost: 2,
    hints: [],
    rewardText:
      "The door opens. Cold rushes out. One beer. Alone in the center. A note taped to it with tape so old it's almost transparent.",
    da: {
      title: "Nærm Dig Køleskabet",
      description:
        "Køleskabet summer med en usædvanlig frekvens. Jeres hold kan mærke det inden I rører håndtaget. Hvad end der er derinde har ventet. Betal tolden og åbn det.",
      prompt: "Betal den rituelle pris for at undersøge køleskabet.",
      rewardText:
        "Lågen åbner. Kulde strømmer ud. Én øl. Alene i midten. En seddel klistret til den med tape så gammelt at det næsten er gennemsigtigt.",
    },
  },
  {
    id: "b-kitchen-social",
    roomId: "kitchen",
    forTeam: "team-b",
    type: "social_challenge",
    title: "The Cabin Confession",
    description:
      "Your team must collectively confess one thing that happened on a previous cabin trip that was never officially acknowledged. The confession must be delivered by one person standing, using the phrase \"we never spoke of it\" at least once.",
    prompt:
      "One member delivers the Cabin Confession. Group votes on whether it is genuine, specific, and appropriately dramatic. If approved: bonus earned.",
    order: 3,
    isRequired: false,
    hints: [],
    rewardText: "The cabin has heard. The cabin remembers. The unspoken is now spoken.",
    da: {
      title: "Hytteskriftemålet",
      description:
        "Jeres hold skal samlet bekende én ting der skete på en tidligere hyttetur, som aldrig officielt er blevet anerkendt. Bekendelsen skal fremføres af én person stående, med sætningen \"vi talte aldrig om det\" mindst én gang.",
      prompt:
        "Ét holdmedlem fremfører Hytteskriftemålet. Gruppen stemmer om det er ægte, specifikt og tilpas dramatisk. Godkendes det: bonus optjent.",
      rewardText: "Hytten har hørt det. Hytten husker. Det usagte er nu sagt.",
    },
  },

  // ==========================================
  // THE FRIDGE — 3 quests per team
  // ==========================================
  {
    id: "fridge-read-note",
    forTeam: "team-a",
    roomId: "fridge",
    type: "puzzle",
    title: "The Last One Standing",
    description:
      "Inside the fridge is exactly one beer. A note taped to it says something about a group that was supposed to show up together.",
    prompt:
      "Inside the fridge is exactly one beer.\nA note taped to it says:\n\"I was supposed to arrive with five others. Only four made it through the door. Now everyone is pretending this was planned.\"\nHow many beers were originally promised?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "The note describes a group that should have arrived together.",
      },
      {
        order: 2,
        offerCost: 3,
        text: "\"One beer plus five others\" is the important phrase.",
      },
    ],
    answer: {
      correct: ["6", "six", "seks"],
      normalized: true,
    },
    rewardClueId: "clue-fridge-note",
    rewardText: "Six beers were promised. One survived. Promised beer count: 6.",
    failureText:
      "The note says nothing more. The beer remains cold. The fridge hums, unimpressed.",
    da: {
      title: "Den Sidste Tilbageværende",
      description:
        "Inde i køleskabet er præcis én øl. En seddel klistret til den siger noget om en gruppe der skulle være ankommet sammen.",
      prompt:
        "Inde i køleskabet er præcis én øl.\nEn seddel klistret til den siger:\n\"Jeg skulle være ankommet med fem andre. Kun fire kom igennem døren. Nu lader alle som om dette var planlagt.\"\nHvor mange øl var der oprindeligt lovet?",
      hints: [
        "Sedlen beskriver en gruppe der skulle være ankommet sammen.",
        "\"Én øl plus fem andre\" er den vigtige sætning.",
      ],
      rewardText: "Seks øl var lovet. Én overlevede. Lovet ølantal: 6.",
      failureText: "Sedlen siger intet mere. Øl'en forbliver kold. Køleskabet summer, uimponeret.",
    },
  },
  {
    id: "fridge-cold-investigation",
    forTeam: "team-a",
    roomId: "fridge",
    type: "puzzle",
    title: "The Impossible Cold",
    description:
      "The fridge temperature dial is turned to its maximum. This beer has been cold for a very, very long time. The condensation ring under the beer perfectly matches a ring stain you noticed elsewhere in the cabin.",
    prompt:
      "The condensation ring under the beer perfectly matches the ring stain you noticed elsewhere in the cabin. Where was that ring stain?",
    order: 2,
    isRequired: false,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "You need to visit another room to confirm this. Check somewhere people usually put drinks.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "The coffee table. There's a ring stain on the coffee table that matches perfectly.",
      },
    ],
    answer: {
      correct: ["coffee table", "coffee-table", "the coffee table", "table", "sofabordet", "sofabord"],
      normalized: true,
    },
    rewardClueId: "clue-cold-timestamp",
    rewardText:
      "The measurements match. This beer traveled. It's been waiting for exactly the right time.",
    failureText:
      "You're not sure. The beer says nothing. The fridge hums louder.",
    da: {
      title: "Den Umulige Kulde",
      description:
        "Køleskabets temperaturknap er drejet til maksimum. Denne øl har været kold i meget, meget lang tid. Kondensationsringen under øl'en passer præcist til en ringplet du har bemærket andetsteds i hytten.",
      prompt:
        "Kondensationsringen under øl'en passer præcist til en ringplet du har bemærket andetsteds i hytten. Hvor var den ringplet?",
      hints: [
        "Du skal besøge et andet rum for at bekræfte dette. Tjek et sted folk normalt sætter drikkevarer.",
        "Sofabordet. Der er en ringplet på sofabordet der passer præcist.",
      ],
      rewardText:
        "Målingerne stemmer overens. Denne øl har rejst. Den har ventet til præcis det rette tidspunkt.",
      failureText: "Du er ikke sikker. Øl'en siger intet. Køleskabet summer højere.",
    },
  },
  {
    id: "fridge-temperature-dial",
    forTeam: "team-a",
    roomId: "fridge",
    type: "choice",
    title: "The Dial Decision",
    description:
      "The fridge dial is turned all the way to maximum cold. The fridge hums like it is trying to win an argument. If you leave it, the beer stays exactly as the ritual intended.",
    prompt: "What does your team do with the temperature dial?",
    order: 3,
    isRequired: false,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Ask whether your job is to fix the fridge or investigate it.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "Changing the setting may destroy the meaning of the setting.",
      },
    ],
    choices: [
      {
        id: "dial-leave",
        label: "Leave it",
        description: "Respect the ritual. The cold is intentional.",
        isCorrect: true,
        consequence:
          "Wise. The ritual respects those who respect the ritual. The cold was intentional.",
      },
      {
        id: "dial-turn-down",
        label: "Turn it down",
        description: "Practical. Slightly boring.",
        isCorrect: false,
        offerCost: 1,
        consequence:
          "The ritual is disappointed. Pay 1 Offer in acknowledgment of your pragmatism.",
      },
      {
        id: "dial-turn-up",
        label: "Turn it up",
        description: "Maximum cold for maximum ritual.",
        isCorrect: false,
        offerCost: 2,
        consequence:
          "The fridge makes a worrying noise. Pay 2 Offer for your hubris.",
      },
    ],
    rewardText: "The cold was intentional.",
    da: {
      title: "Knap-Beslutningen",
      description:
        "Køleskabsknappen er drejet til maksimum kulde. Køleskabet summer som om det forsøger at vinde en diskussion. Lader du den stå, forbliver øl'en præcis som ritualet tiltænkte.",
      prompt: "Hvad gør jeres hold med temperaturknappen?",
      choices: {
        "dial-leave": {
          label: "Lad den stå",
          description: "Respektér ritualet. Kulden er bevidst.",
          consequence: "Klogt. Ritualet respekterer dem, der respekterer ritualet. Kulden var bevidst.",
        },
        "dial-turn-down": {
          label: "Drej den ned",
          description: "Praktisk. Lidt kedeligt.",
          consequence: "Ritualet er skuffet. Betal 1 Offer som anerkendelse af din pragmatisme.",
        },
        "dial-turn-up": {
          label: "Drej den højere",
          description: "Maksimal kulde til maksimalt ritual.",
          consequence: "Køleskabet laver en bekymrende lyd. Betal 2 Offer for din hovmod.",
        },
      },
      rewardText: "Kulden var bevidst.",
    },
  },

  {
    id: "b-fridge-read-note",
    roomId: "fridge",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Frozen Evidence",
    description:
      "Inside the fridge is a sealed plastic bag. Inside the bag is not food. It is thin, folded, and has faded numbers on it.",
    prompt:
      "Inside the fridge is a sealed plastic bag.\nInside the bag is not food. It is thin, folded, and has faded numbers on it.\nA note says:\n\"Kept cold because people forget what they owe.\"\nWhat is inside the bag?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "The clue is about proving payment, not preserving food.",
      },
      {
        order: 2,
        offerCost: 3,
        text: "The faded numbers are probably prices or totals.",
      },
    ],
    answer: {
      correct: ["receipt", "a receipt", "the receipt", "kvittering", "en kvittering"],
      normalized: true,
    },
    rewardClueId: "clue-fridge-note",
    rewardText: "A receipt. Kept cold because people forget what they owe. Receipts are evidence.",
    failureText: "The bag holds its secret. Think about what has faded numbers and proves payment.",
    da: {
      title: "Det Frosne Bevis",
      description:
        "Inde i køleskabet er en forseglet plastikpose. Inde i posen er der ikke mad. Den er tynd, foldet, og har blegnede tal på sig.",
      prompt:
        "Inde i køleskabet er en forseglet plastikpose.\nInde i posen er der ikke mad. Den er tynd, foldet, og har blegnede tal på sig.\nEn seddel siger:\n\"Holdt koldt fordi folk glemmer hvad de skylder.\"\nHvad er inde i posen?",
      hints: [
        "Sporet handler om at bevise betaling, ikke om at bevare mad.",
        "De blegnede tal er sandsynligvis priser eller totaler.",
      ],
      rewardText: "En kvittering. Holdt kold fordi folk glemmer hvad de skylder. Kvitteringer er bevismateriale.",
      failureText: "Posen holder på sin hemmelighed. Tænk på hvad der har blegnede tal og beviser betaling.",
    },
  },
  {
    id: "b-fridge-cold-investigation",
    roomId: "fridge",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Temperature Log",
    description:
      "A temperature log is taped inside the fridge door — handwritten dates and temperatures. Someone was tracking this carefully.",
    prompt:
      "A temperature log is taped inside the fridge door:\n−5, −7, −8, −10, −14°C\nWhat is the average temperature, rounded to the nearest whole number?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Treat the minus signs as part of the numbers.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "The result should still be below zero after you divide.",
      },
    ],
    answer: {
      correct: ["-9", "minus 9", "-9°c", "-9 degrees", "minus ni", "-9 grader"],
      normalized: true,
    },
    rewardClueId: "clue-cold-timestamp",
    rewardText: "Average fridge temperature: −9. The log has meaning — and one date is circled.",
    failureText: "The numbers stare at you. Add them all up, then divide by 5. Watch your signs.",
    da: {
      title: "Temperaturloggen",
      description:
        "En temperaturlog er klistret til indersiden af køleskabslågen — håndskrevne datoer og temperaturer. Nogen fulgte nøje med i dette.",
      prompt:
        "En temperaturlog er klistret til indersiden af køleskabslågen:\n−5, −7, −8, −10, −14°C\nHvad er gennemsnitstemperaturen, afrundet til nærmeste hele tal?",
      hints: [
        "Behandl minustegnene som en del af tallene.",
        "Resultatet bør stadig være under nul efter du dividerer.",
      ],
      rewardText: "Gennemsnitstemperatur: −9. Loggen har en betydning — og én dato er ringet ind.",
      failureText: "Tallene stirrer på dig. Læg dem alle op, divider med 5. Hold øje med fortegnene.",
    },
  },
  {
    id: "b-fridge-temperature-dial",
    roomId: "fridge",
    forTeam: "team-b",
    type: "choice",
    title: "The Dial — Your Call",
    description:
      "The dial is at maximum. The beer is ice-cold. Your team has a decision: is this dedication to the ritual, evidence of someone hiding something, or simple carelessness?",
    prompt: "What is your team's verdict on the fridge temperature?",
    order: 3,
    isRequired: false,
    hints: [],
    choices: [
      {
        id: "b-dial-evidence",
        label: "Evidence — someone needed this cold for a reason",
        description: "The coldest setting was deliberate. Something needed preserving.",
        isCorrect: true,
        consequence:
          "Your instinct is sharp. Something needed to be kept cold that isn't just a beer. The ritual acknowledges your suspicion.",
      },
      {
        id: "b-dial-careless",
        label: "Careless — someone just forgot to turn it down",
        description: "The simplest explanation.",
        isCorrect: false,
        offerCost: 1,
        consequence: "Too simple. Pay 1 Offer for underestimating the ritual.",
      },
      {
        id: "b-dial-dedication",
        label: "Pure dedication — the coldest beer deserves the coldest setting",
        description: "Maximum respect for the Last Cold Beer.",
        isCorrect: false,
        consequence:
          "Admirable, but you've missed the clue underneath. Try again after more investigation.",
      },
    ],
    rewardText: "The cabin approves of your suspicious mind.",
    da: {
      title: "Knappen — Dit Valg",
      description:
        "Knappen er på maksimum. Øl'en er iskold. Jeres hold har en beslutning: er dette hengivenhed til ritualet, bevis for at nogen skjuler noget, eller simpel sjuskethed?",
      prompt: "Hvad er jeres holds konklusion om køleskabstemperaturen?",
      choices: {
        "b-dial-evidence": {
          label: "Bevis — nogen havde brug for kulden af en grund",
          description: "Det koldeste trin var bevidst. Noget havde brug for at blive bevaret.",
          consequence: "Din instinkt er skarp. Noget skulle holdes koldt der ikke bare er en øl. Ritualet anerkender din mistanke.",
        },
        "b-dial-careless": {
          label: "Sjuskethed — nogen glemte at dreje den ned",
          description: "Den simpleste forklaring.",
          consequence: "For simpelt. Betal 1 Offer for at undervurdere ritualet.",
        },
        "b-dial-dedication": {
          label: "Ren hengivenhed — den koldeste øl fortjener det koldeste trin",
          description: "Maksimal respekt for Den Sidste Kolde Øl.",
          consequence: "Beundringværdigt, men du har overset sporet nedenunder. Prøv igen efter mere efterforskning.",
        },
      },
      rewardText: "Hytten godkender dit mistænksomme sind.",
    },
  },

  // ==========================================
  // THE COFFEE TABLE — Secret Room
  // ==========================================
  {
    id: "coffee-table-ring",
    forTeam: "team-a",
    roomId: "coffee-table",
    type: "puzzle",
    title: "The Fresh Ring",
    description:
      "The coffee table is covered in old drink rings. But one ring is different from all the others.",
    prompt:
      "The coffee table is covered in old drink rings.\nOne ring is different:\n— cleaner\n— colder to the touch\n— sharper edges\n— exactly the size of the beer bottle\n\nWhere was the beer before it went into the fridge?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Compare the fresh mark to the object you already found.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "A ring stain tells you where something rested.",
      },
    ],
    answer: {
      correct: ["coffee table", "the coffee table", "table", "sofabordet", "sofabord", "bordet"],
      normalized: true,
    },
    rewardClueId: "clue-coffee-table-ring",
    rewardText:
      "The beer was placed on the coffee table before it went into the fridge. The ring confirms it.",
    failureText: "The ring says nothing. Try a different approach.",
    da: {
      title: "Den Friske Ring",
      description:
        "Sofabordet er dækket af gamle drikkepletter. Men én ring er anderledes end alle de andre.",
      prompt:
        "Sofabordet er dækket af gamle drikkepletter.\nÉn ring er anderledes:\n— renere\n— koldere at røre ved\n— skarpere kanter\n— præcis størrelsen på ølflasken\n\nHvor var øl'en inden den gik i køleskabet?",
      hints: [
        "Sammenlign den friske plet med den genstand du allerede har fundet.",
        "En ringplet fortæller dig hvor noget har hvilet.",
      ],
      rewardText:
        "Øl'en stod på sofabordet inden den gik i køleskabet. Ringen bekræfter det.",
      failureText: "Ringen siger intet. Prøv en anden tilgang.",
    },
  },
  {
    id: "coffee-table-coaster",
    forTeam: "team-a",
    roomId: "coffee-table",
    type: "puzzle",
    title: "Under the Damp Coaster",
    description:
      "You lift the damp coaster. There is a message written on a card underneath it.",
    prompt:
      "Under the damp coaster is a message:\n\"The last one went outside to cool off.\"\n\nWhere should your team search next?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "\"Outside\" narrows the search more than \"cool.\"",
      },
      {
        order: 2,
        offerCost: 2,
        text: "Choose the outdoor part of the cabin, not the forest itself.",
      },
    ],
    answer: {
      correct: ["terrace", "the terrace", "terrassen", "terrasse"],
      normalized: true,
    },
    rewardClueId: "clue-terrace-direction",
    rewardText: "The terrace matters. Head outside.",
    failureText: "The message is pointing somewhere specific. Where does a cabin open to the outside?",
    da: {
      title: "Under den Fugtige Brik",
      description:
        "Du løfter den fugtige brik. Der er en besked skrevet på et kort underneath.",
      prompt:
        "Under den fugtige brik er en besked:\n\"Den sidste gik udenfor for at køle af.\"\n\nHvor skal jeres hold søge næste gang?",
      hints: [
        "\"Udenfor\" indsnævrer søgningen mere end \"køle\".",
        "Vælg den udendørs del af hytten, ikke skoven selv.",
      ],
      rewardText: "Terrassen er vigtig. Gå udenfor.",
      failureText: "Beskeden peger et bestemt sted hen. Hvor åbner en hytte sig udendørs?",
    },
  },
  {
    id: "coffee-table-social",
    forTeam: "team-a",
    roomId: "coffee-table",
    type: "social_challenge",
    title: "The Cabin Oath",
    description:
      "The coffee table has clearly seen a lot of cabin trips. It deserves respect. One team member must ceremonially apologize to the coffee table for all past damage done to it, in a formal tone, for at least 20 seconds.",
    prompt:
      "One team member performs a formal apology to the coffee table. Duration: at least 20 seconds. Tone: formal, sincere, slightly absurd. Judged by group applause.",
    order: 3,
    isRequired: false,
    hints: [],
    rewardText: "The table seems satisfied. Or at least, it stops judging you.",
    da: {
      title: "Hytteeden",
      description:
        "Sofabordet har tydeligvis set mange hytteture. Det fortjener respekt. Ét holdmedlem skal ceremonielt undskylde til sofabordet for al tidligere skade, i en formel tone, i mindst 20 sekunder.",
      prompt:
        "Ét holdmedlem fremfører en formel undskyldning til sofabordet. Varighed: mindst 20 sekunder. Tone: formel, oprigtig, let absurd. Bedømt af gruppeklap.",
      rewardText: "Bordet virker tilfreds. Eller ihvertfald holder det op med at dømme jer.",
    },
  },

  {
    id: "b-coffee-table-ring",
    roomId: "coffee-table",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Coaster Line",
    description:
      "Four coasters sit in a row on the coffee table. Someone arranged them deliberately. A note is underneath the candle.",
    prompt:
      "Four coasters sit in a row.\nTheir symbols are:\nBeer — Pineapple — Beer — Lock\n\nA note underneath the candle says:\n\"Only cabin things count.\"\n\nAfter ignoring the coaster that does not belong, what position is the lock?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Think back to the kitchen. One type of object already felt out of place.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "Count the lock only after removing the symbol that does not fit the cabin.",
      },
    ],
    answer: {
      correct: ["3", "three", "tre", "third", "tredje"],
      normalized: true,
    },
    rewardClueId: "clue-coaster-position",
    rewardText: "Lock position: 3. The pineapple doesn't belong. Remove it, and the lock sits third.",
    failureText: "Read the note again. Which coaster symbol doesn't belong in a cabin?",
    da: {
      title: "Brikkerækken",
      description:
        "Fire brikker sidder på række på sofabordet. Nogen har arrangeret dem bevidst. Et kort er under lyset.",
      prompt:
        "Fire brikker sidder på række.\nDeres symboler er:\nØl — Ananas — Øl — Lås\n\nEt kort under lyset siger:\n\"Kun hytteting tæller.\"\n\nEfter at have ignoreret den brik der ikke hører til, hvad er låsens position?",
      hints: [
        "Tænk tilbage på køkkenet. Én type genstand føltes allerede malplaceret.",
        "Tæl låsen kun efter du har fjernet symbolet der ikke passer til hytten.",
      ],
      rewardText: "Låsens position: 3. Ananassen hører ikke til. Fjern den, og låsen er nr. tre.",
      failureText: "Læs sedlen igen. Hvilket brikkesymbol hører ikke hjemme i en hytte?",
    },
  },
  {
    id: "b-coffee-table-coaster",
    roomId: "coffee-table",
    forTeam: "team-b",
    type: "choice",
    title: "The Table Scratch",
    description:
      "Scratched lightly into the table surface is a note someone left. Below it, another hand added a second line.",
    prompt:
      "Scratched lightly into the table is:\nCOLD = NOT HERE\nUnder it, someone added:\n\"Too warm for the final hiding place.\"\n\nWas the coffee table the final hiding place?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "The scratch says where the beer did not stay.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "Think of the table as one stop on the route.",
      },
    ],
    choices: [
      {
        id: "table-no",
        label: "No",
        description: "The table was a waypoint, not the destination.",
        isCorrect: true,
        consequence: "Correct. The coffee table was only temporary. The beer moved on from here.",
      },
      {
        id: "table-yes",
        label: "Yes",
        description: "The beer was left here on purpose.",
        isCorrect: false,
        offerCost: 1,
        consequence: "The scratch says otherwise. COLD = NOT HERE. Pay 1 Offer and look again.",
      },
      {
        id: "table-maybe",
        label: "Maybe",
        description: "It's unclear from the evidence.",
        isCorrect: false,
        consequence: "The scratch is clear. Inspect again — the evidence is right in front of you.",
      },
    ],
    rewardText: "The coffee table was only temporary.",
    da: {
      title: "Bordridsen",
      description:
        "Ridset let ind i bordet er en note nogen efterlod. Under den har en anden hånd tilføjet en anden linje.",
      prompt:
        "Ridset let ind i bordet er:\nKOLD = IKKE HER\nUnder det har nogen tilføjet:\n\"For varmt til det endelige gemmested.\"\n\nVar sofabordet det endelige gemmested?",
      hints: [
        "Ridsen siger hvor øl'en ikke forblev.",
        "Tænk på bordet som ét stop på ruten.",
      ],
      choices: {
        "table-no": {
          label: "Nej",
          description: "Bordet var et mellemstop, ikke destinationen.",
          consequence: "Korrekt. Sofabordet var kun midlertidigt. Øl'en bevægede sig herfra.",
        },
        "table-yes": {
          label: "Ja",
          description: "Øl'en blev efterladt her med vilje.",
          consequence: "Ridsen siger noget andet. KOLD = IKKE HER. Betal 1 Offer og se igen.",
        },
        "table-maybe": {
          label: "Måske",
          description: "Det er uklart ud fra beviserne.",
          consequence: "Ridsen er klar. Undersøg igen — beviset er lige foran dig.",
        },
      },
      rewardText: "Sofabordet var kun midlertidigt.",
    },
  },
  {
    id: "b-coffee-table-social",
    roomId: "coffee-table",
    forTeam: "team-b",
    type: "social_challenge",
    title: "The Table Treaty",
    description:
      "The coffee table has witnessed every argument this group has ever had over a cabin trip. Your team must negotiate and announce a new cabin rule — one that would have prevented at least one real argument. It must be specific, enforceable, and slightly absurd.",
    prompt:
      "One team member proposes a new cabin rule. The full group votes on whether it is specific, enforceable, and funny enough to honor. Approved = bonus earned.",
    order: 3,
    isRequired: false,
    hints: [],
    rewardText: "The new rule is added to the unofficial cabin constitution.",
    da: {
      title: "Bordtraktaten",
      description:
        "Sofabordet har overværet enhver skænderi dette hold har haft på en hyttetur. Jeres hold skal forhandle og annoncere en ny hytteregel — en der ville have forhindret mindst én rigtig diskussion. Den skal være specifik, håndhævbar og lidt absurd.",
      prompt:
        "Ét holdmedlem foreslår en ny hytteregel. Hele gruppen stemmer om den er specifik, håndhævbar og sjov nok til at honorere. Godkendt = bonus optjent.",
      rewardText: "Den nye regel tilføjes den uofficielle hytteforfatning.",
    },
  },

  // ==========================================
  // THE TERRACE — 2 quests per team
  // ==========================================
  {
    id: "terrace-countdown",
    forTeam: "team-a",
    roomId: "terrace",
    type: "puzzle",
    title: "The Countdown",
    description:
      "Carved into the terrace railing is a sequence of numbers. Someone did this deliberately. The final number is circled twice.",
    prompt:
      "Carved into the terrace railing:\n6 → 5 → 4 → 3 → 2 → 1\nThe final number is circled twice.\nUnderneath it says:\n\"Everyone swears they will not take the last one.\"\n\nWhat does the circled number represent?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "The sequence counts something that disappears during the evening.",
      },
      {
        order: 2,
        offerCost: 3,
        text: "The phrase \"the last one\" is not about a person.",
      },
    ],
    answer: {
      correct: ["last beer", "the last beer", "beer", "final beer", "sidste øl", "den sidste øl", "øl"],
      normalized: true,
    },
    rewardClueId: "clue-terrace-countdown",
    rewardText:
      "The countdown is about the last beer. It began at 6 — and ended at the one left behind.",
    failureText:
      "The railing gives nothing away. Think about what the group was counting down from the beginning.",
    da: {
      title: "Nedtællingen",
      description:
        "Ridset ind i terrasse-gelænderet er en sekvens af tal. Nogen gjorde dette bevidst. Det sidste tal er ringet ind to gange.",
      prompt:
        "Ridset ind i terrasse-gelænderet:\n6 → 5 → 4 → 3 → 2 → 1\nDet sidste tal er ringet ind to gange.\nUnder det står:\n\"Alle sværger at de ikke vil tage den sidste.\"\n\nHvad repræsenterer det indringede tal?",
      hints: [
        "Sekvensen tæller noget der forsvinder i løbet af aftenen.",
        "Sætningen \"den sidste\" handler ikke om en person.",
      ],
      rewardText:
        "Nedtællingen handler om den sidste øl. Den begyndte ved 6 — og endte med den der blev efterladt.",
      failureText:
        "Gelænderet røber ingenting. Tænk på hvad gruppen talte ned fra begyndelsen.",
    },
  },
  {
    id: "terrace-railing-carving",
    forTeam: "team-a",
    roomId: "terrace",
    type: "puzzle",
    title: "First Here",
    description:
      "Four sets of initials are carved into the terrace railing. They are not the same depth. One set is older, deeper, and slightly more dramatic than the rest.",
    prompt:
      "Four sets of initials are carved into the terrace railing:\nMS  EK  JB  LA\nBelow them, someone has scratched:\n\"First here. Last accused.\"\n\nOne set of initials is older, deeper, and slightly more dramatic than the rest.\nWho started the ritual? Write the initials.",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "You are not looking for alphabetical order. You are looking for the carving that looks oldest.",
      },
      {
        order: 2,
        offerCost: 3,
        text: "Depth and age matter more than where the initials appear in the list.",
      },
    ],
    answer: {
      correct: ["JB", "J.B.", "jb", "j.b."],
      normalized: true,
    },
    rewardClueId: "clue-terrace-inscription",
    rewardText:
      "Founder initials: JB. The name everyone knew but no one had said out loud yet. Now it's in the case file.",
    failureText:
      "The terrace offers no confirmation. Think harder — or pay for the certainty.",
    da: {
      title: "Første Her",
      description:
        "Fire sæt initialer er ridset ind i terrasse-gelænderet. De har ikke samme dybde. Et sæt er ældre, dybere, og lidt mere dramatisk end resten.",
      prompt:
        "Fire sæt initialer er ridset ind i terrasse-gelænderet:\nMS  EK  JB  LA\nUnder dem har nogen ridset:\n\"Første her. Sidst anklaget.\"\n\nEt sæt initialer er ældre, dybere, og lidt mere dramatisk end resten.\nHvem startede ritualet? Skriv initialerne.",
      hints: [
        "Du leder ikke efter alfabetisk rækkefølge. Du leder efter ristningen der ser ældst ud.",
        "Dybde og alder tæller mere end hvor initialerne optræder på listen.",
      ],
      rewardText:
        "Grundlæggerens initialer: JB. Navnet alle kendte men ingen havde sagt højt endnu. Nu er det i sagsmappen.",
      failureText:
        "Terrassen giver ingen bekræftelse. Tænk hårdere — eller betal for sikkerheden.",
    },
  },

  {
    id: "b-terrace-railing-carving",
    roomId: "terrace",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Founder's Name",
    description:
      "A scratched note on the railing raises a question the group has probably avoided. It is time to answer it properly.",
    prompt:
      "A scratched note on the railing says:\n\"The one who started it never used initials here. Eight letters. Two of them the same. Ask the group who that could be.\"\n\nWhat last name should your team enter?",
    order: 1,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "You are looking for a surname, not initials.",
      },
      {
        order: 2,
        offerCost: 3,
        text: "The name has 8 letters, and the repeated letter is at the end.",
      },
    ],
    answer: {
      correct: ["Bergmann", "bergmann", "BERGMANN"],
      normalized: true,
    },
    rewardClueId: "clue-terrace-inscription",
    rewardText: "Founder surname: Bergmann. The name at the origin of all of this.",
    failureText: "The terrace gives nothing away. Think — or pay.",
    da: {
      title: "Grundlæggerens Navn",
      description:
        "En ridset note på gelænderet rejser et spørgsmål gruppen sandsynligvis har undgået. Det er tid til at besvare det ordentligt.",
      prompt:
        "En ridset note på gelænderet siger:\n\"Den der startede det brugte aldrig initialer her. Otte bogstaver. To af dem ens. Spørg gruppen hvem det kunne være.\"\n\nHvilket efternavn skal jeres hold indtaste?",
      hints: [
        "Du leder efter et efternavn, ikke initialer.",
        "Navnet har 8 bogstaver, og det gentagne bogstav er til sidst.",
      ],
      rewardText: "Grundlæggerens efternavn: Bergmann. Navnet ved oprindelsen af alt dette.",
      failureText: "Terrassen røber ingenting. Tænk — eller betal.",
    },
  },
  {
    id: "b-terrace-countdown",
    roomId: "terrace",
    forTeam: "team-b",
    type: "choice",
    title: "The Four Cuts",
    description:
      "Around the railing are four carved marks. Something about them is inconsistent in a way that matters.",
    prompt:
      "Around the railing are four carved marks.\nThey are not the same depth. They are not the same angle. They do not look like one person made them.\n\nWho carved the railing?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 2,
        text: "Different pressure can mean different hands.",
      },
      {
        order: 2,
        offerCost: 3,
        text: "Focus on the inconsistency between the marks, not the message itself.",
      },
    ],
    choices: [
      {
        id: "b-carved-together",
        label: "Four people",
        description: "Each person carved their own initials as a pact.",
        isCorrect: true,
        consequence:
          "Exactly. Different depths, slightly different styles — four hands, one ritual. There were four original carvers.",
      },
      {
        id: "b-carved-one",
        label: "One person",
        description: "One hand, one moment of commitment, signing for the others.",
        isCorrect: false,
        consequence:
          "Close, but the variations in carving depth suggest multiple hands. Not quite.",
      },
      {
        id: "b-carved-later",
        label: "A professional",
        description: "Someone was hired to make it look deliberate.",
        isCorrect: false,
        offerCost: 1,
        consequence:
          "No. The weathering and inconsistency confirm amateur hands. Pay 1 Offer for the detour.",
      },
    ],
    rewardText: "There were four original carvers. Four people. One pact.",
    rewardClueId: "clue-terrace-carvers",
    da: {
      title: "De Fire Snit",
      description:
        "Rundt om gelænderet er fire ristede mærker. Noget ved dem er inkonsistent på en måde der er vigtig.",
      prompt:
        "Rundt om gelænderet er fire ristede mærker.\nDe har ikke samme dybde. De har ikke samme vinkel. De ligner ikke noget én person lavede.\n\nHvem ristede gelænderet?",
      hints: [
        "Forskelligt tryk kan betyde forskellige hænder.",
        "Fokusér på inkonsistensen mellem mærkerne, ikke selve budskabet.",
      ],
      choices: {
        "b-carved-together": {
          label: "Fire mennesker",
          description: "Hver person ristede sine egne initialer som en pagt.",
          consequence: "Præcis. Forskellig dybde, lidt forskellige stilarter — fire hænder, ét ritual. Der var fire originale ristere.",
        },
        "b-carved-one": {
          label: "Én person",
          description: "Én hånd, ét øjeblik af engagement, underskrev for de andre.",
          consequence: "Tæt på, men variationerne i ristningsdybde tyder på flere hænder. Ikke helt.",
        },
        "b-carved-later": {
          label: "En professionel",
          description: "Nogen blev hyret til at få det til at se bevidst ud.",
          consequence: "Nej. Forvitringen og inkonsistensen bekræfter amatørhænder. Betal 1 Offer for omvejen.",
        },
      },
      rewardText: "Der var fire originale ristere. Fire mennesker. Én pagt.",
    },
  },

  // ==========================================
  // THE SHED — 3 quests + 1 new per team
  // ==========================================
  {
    id: "shed-unlock",
    forTeam: "team-a",
    roomId: "shed",
    type: "unlock",
    title: "Force the Shed Door",
    description:
      "The shed door is stuck — not locked, just swollen from the damp. It needs a firm push. Or, more accurately, it needs someone to decide to commit to pushing it.",
    prompt:
      "Pay the ritual cost to investigate the shed. This represents someone actually going and dealing with the door.",
    order: 1,
    isRequired: true,
    offerCost: 1,
    hints: [],
    rewardText:
      "The door gives. Inside: the usual cabin junk — old tools, a broken chair, a laminated inventory sheet pinned to the wall. The sheet gets your attention immediately.",
    da: {
      title: "Tving Skurdøren",
      description:
        "Skurdøren sidder fast — ikke låst, bare hævet af fugt. Den kræver et fast skub. Eller mere præcist: den kræver at nogen beslutter sig for at forpligte sig til at skubbe.",
      prompt:
        "Betal den rituelle pris for at undersøge skuret. Det repræsenterer nogen der faktisk går ud og tager sig af døren.",
      rewardText:
        "Døren giver efter. Indenfor: det sædvanlige hytteskrot — gamle redskaber, en ødelagt stol, et lamineret inventarark fastgjort til væggen. Arket fanger straks din opmærksomhed.",
    },
  },
  {
    id: "shed-inventory",
    forTeam: "team-a",
    roomId: "shed",
    type: "puzzle",
    title: "The Missing Inventory Line",
    description:
      "The laminated inventory sheet has numbered rows. Most rows are readable, but one has been damaged.",
    prompt:
      "The laminated inventory sheet has numbered rows.\nMost rows are readable:\n1 — Axe\n2 — Lantern\n3 — Matches\n4 — Rope\n5 — Broken chair\n6 — Emergency mugs\n7 — [water damage]\n8 — Firewood crate\n9 — Extension cord\n\nA note at the bottom says:\n\"The locked thing is listed between the mugs and the firewood.\"\n\nWhat item number belongs to the locked cooler?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Do not read the damaged word. Use the position of the damaged row.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "The note tells you what sits between item 6 and item 8.",
      },
    ],
    answer: {
      correct: ["7", "seven", "syv"],
      normalized: true,
    },
    rewardClueId: "clue-shed-inventory",
    rewardText:
      "The locked cooler is Item 7. Listed between mugs and firewood — right where the water damage is.",
    failureText: "You squint at the inventory. Use the note at the bottom — it tells you the position.",
    da: {
      title: "Den Manglende Inventarlinje",
      description:
        "Det laminerede inventarark har nummererede rækker. De fleste rækker er læsbare, men én er beskadiget.",
      prompt:
        "Det laminerede inventarark har nummererede rækker.\nDe fleste rækker er læsbare:\n1 — Økse\n2 — Lygte\n3 — Tændstikker\n4 — Reb\n5 — Ødelagt stol\n6 — Nødkrus\n7 — [vandskadet]\n8 — Brændekasse\n9 — Forlængerledning\n\nEn note nederst siger:\n\"Den låste ting er oplistet mellem krusene og brændet.\"\n\nHvilket genstands-nummer tilhører den låste køler?",
      hints: [
        "Læs ikke det beskadigede ord. Brug placeringen af den beskadigede række.",
        "Noten fortæller dig hvad der sidder mellem genstand 6 og genstand 8.",
      ],
      rewardText:
        "Den låste køler er Genstand 7. Oplistet mellem krusene og brændet — præcis der hvor vandskaden er.",
      failureText: "Du kniper øjnene ved inventaret. Brug noten nederst — den fortæller dig positionen.",
    },
  },
  {
    id: "shed-order-rule",
    forTeam: "team-a",
    roomId: "shed",
    type: "puzzle",
    title: "The Order Rule",
    description:
      "At the bottom of the inventory sheet, below the note about the cooler, someone left one more line — in different handwriting.",
    prompt:
      "At the bottom of the inventory sheet, someone wrote:\n\"Do not add the numbers. Do not multiply them. The first thing lost comes before the thing that keeps it.\"\n\nWhich operation should your team use later?",
    order: 3,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "The note is warning you against math.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "This is about placing clues beside each other, not calculating them.",
      },
    ],
    answer: {
      correct: ["order", "sequence", "arrange", "rækkefølge", "arrangere", "orden"],
      normalized: true,
    },
    rewardClueId: "clue-shed-order-rule",
    rewardText: "Use order, not math. Place the clues side by side in the right sequence.",
    failureText: "The note tells you what NOT to do. What's left is what you should do.",
    da: {
      title: "Ordensreglen",
      description:
        "Nederst på inventararket, under noten om køleren, har nogen efterladt endnu en linje — i en anden håndskrift.",
      prompt:
        "Nederst på inventararket har nogen skrevet:\n\"Addér ikke tallene. Multiplicér dem ikke. Den første ting der gik tabt kommer før den ting der holder den.\"\n\nHvilken operation skal jeres hold bruge senere?",
      hints: [
        "Noten advarer dig mod matematik.",
        "Dette handler om at placere spor ved siden af hinanden, ikke om at beregne dem.",
      ],
      rewardText: "Brug rækkefølge, ikke matematik. Placer sporene side om side i den rigtige rækkefølge.",
      failureText: "Noten fortæller dig hvad du IKKE skal gøre. Det der er tilbage er hvad du skal gøre.",
    },
  },
  {
    id: "shed-dedication",
    forTeam: "team-a",
    roomId: "shed",
    type: "social_challenge",
    title: "The Shed Offering",
    description:
      "The shed contains a broken garden chair, a rusted trowel, one empty beer can from last year (vintage!), and what appears to be a paint roller used once and never cleaned. This junk deserves an inventory poem.",
    prompt:
      "One team member must recite an original poem (at least 4 lines) dedicated to the contents of the shed. Rhyming optional. Sincerity mandatory. The group votes on whether it honors the shed.",
    order: 4,
    isRequired: false,
    hints: [],
    rewardText:
      "The shed is honored. Somewhere, the spirit of the uncleaned paint roller rests easier.",
    da: {
      title: "Skurofferingen",
      description:
        "Skuret indeholder en ødelagt havestol, en rusten gravespade, én tom ølboks fra i fjor (vintage!), og hvad der ser ud som en malingsrulle brugt én gang og aldrig rengjort. Dette skrot fortjener et hylstdigtem.",
      prompt:
        "Ét holdmedlem skal recitere et originaldigtem (mindst 4 linjer) dedikeret til skurets indhold. Rim er valgfrit. Oprigtighed er obligatorisk. Gruppen stemmer om det ærer skuret.",
      rewardText: "Skuret er æreret. Et sted hviler malerullens ånd lidt lettere.",
    },
  },

  {
    id: "b-shed-unlock",
    roomId: "shed",
    forTeam: "team-b",
    type: "unlock",
    title: "Open the Shed",
    description:
      "The shed door is swollen from damp. It needs force — not brains, just commitment. Your team decides who goes and deals with it.",
    prompt: "Pay the ritual cost to enter the shed.",
    order: 1,
    isRequired: true,
    offerCost: 1,
    hints: [],
    rewardText:
      "The door gives. Inside: tools, junk, and pinned to the wall — an inventory sheet in a laminate sleeve.",
    da: {
      title: "Åbn Skuret",
      description:
        "Skurets dør er opsvulmet af fugt. Det kræver kraft — ikke hjerner, bare vilje. Jeres hold beslutter hvem der tager sig af det.",
      prompt: "Betal ritualomkostningen for at komme ind i skuret.",
      rewardText:
        "Døren giver efter. Indeni: værktøj, skrammel, og fastgjort til væggen — et inventarark i en laminathylster.",
    },
  },
  {
    id: "b-shed-inventory",
    roomId: "shed",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Duplicate Item",
    description:
      "The shed inventory has 10 lines. Someone was clearly frustrated when they wrote it.",
    prompt:
      "The shed inventory has 10 lines.\nTwo entries are crossed out so hard that someone must have been annoyed:\n— \"Cooler\"\n— \"Cooler, but colder\"\n\nA note beside the list says:\n\"Do not count bad bookkeeping.\"\n\nHow many valid lines remain?",
    order: 2,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Crossed-out lines should not survive the count.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "Start with the full list, then remove only the entries the inventory rejects.",
      },
    ],
    answer: {
      correct: ["8", "eight", "otte"],
      normalized: true,
    },
    rewardClueId: "clue-b-shed-inventory",
    rewardText: "Valid inventory count: 8. Two crossed out, eight remain.",
    failureText: "Simple arithmetic. How many lines survive when you remove the crossed-out ones?",
    da: {
      title: "Den Duplikerede Genstand",
      description:
        "Skurets inventar har 10 linjer. Nogen var tydeligvis frustreret da de skrev det.",
      prompt:
        "Skurets inventar har 10 linjer.\nTo poster er streget over så hårdt at nogen må have været irriteret:\n— \"Køler\"\n— \"Køler, men koldere\"\n\nEn note ved siden af listen siger:\n\"Tæl ikke dårlig bogføring.\"\n\nHvor mange gyldige linjer er tilbage?",
      hints: [
        "Overstrøgne linjer bør ikke overleve optællingen.",
        "Start med den fulde liste, og fjern derefter kun de poster inventaret afviser.",
      ],
      rewardText: "Gyldigt inventarantal: 8. To overstreget, otte tilbage.",
      failureText: "Simpel regning. Hvor mange linjer overlever når du fjerner de overstrøgne?",
    },
  },
  {
    id: "b-shed-torn-timestamp",
    roomId: "shed",
    forTeam: "team-b",
    type: "puzzle",
    title: "The Torn Timestamp",
    description:
      "Behind the inventory sheet is a torn receipt. Only part of the timestamp survived.",
    prompt:
      "Behind the inventory sheet is a torn receipt.\nThe timestamp is damaged:\n          :\nOnly the colon remains. The digits are gone.\n\nA note beside it says:\n\"The hour came from the railing. The minutes came from the list.\"\n\nWhat kind of answer are you trying to restore?",
    order: 3,
    isRequired: true,
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Look at the shape of the missing clue.",
      },
      {
        order: 2,
        offerCost: 2,
        text: "The colon is more important than the numbers right now.",
      },
    ],
    answer: {
      correct: ["time", "timestamp", "tid", "tidsstempel", "klokkeslæt"],
      normalized: true,
    },
    rewardClueId: "clue-shed-torn-timestamp",
    rewardText: "The final clue should be formatted as a time. The colon separates hours from minutes.",
    failureText: "What format has a colon in the middle? What does HH:MM look like?",
    da: {
      title: "Den Iturevne Tidsstempel",
      description:
        "Bag inventararket er en iturevet kvittering. Kun en del af tidsstemplet overlevede.",
      prompt:
        "Bag inventararket er en iturevet kvittering.\nTidsstemplet er beskadiget:\n          :\nKun kolonen er tilbage. Cifrene er væk.\n\nEn note ved siden af siger:\n\"Timen kom fra gelænderet. Minutterne kom fra listen.\"\n\nHvilken slags svar forsøger du at gendanne?",
      hints: [
        "Se på formen af det manglende spor.",
        "Kolonen er vigtigere end tallene lige nu.",
      ],
      rewardText: "Det endelige spor skal formateres som et klokkeslæt. Kolonen adskiller timer fra minutter.",
      failureText: "Hvilket format har en kolon i midten? Hvad ligner TT:MM?",
    },
  },
  {
    id: "b-shed-dedication",
    roomId: "shed",
    forTeam: "team-b",
    type: "social_challenge",
    title: "The Shed Eulogy",
    description:
      "The shed is dying slowly. The broken chair, the rusted tools, the paint roller hardened into a monument to forgotten projects. Your team must deliver a proper eulogy for ONE specific item in the shed. Not the shed itself — one item. At least 5 sentences. With genuine emotion.",
    prompt:
      "One member delivers a eulogy for a shed item of their choice. Minimum 5 sentences. The group decides by applause if it achieves genuine emotion. Success = bonus.",
    order: 4,
    isRequired: false,
    hints: [],
    rewardText: "The item is remembered. The shed trembles slightly. Or it's just the wind.",
    da: {
      title: "Skurets Gravtale",
      description:
        "Skuret dør langsomt. Den ødelagte stol, det rustne værktøj, malerrullen der er hærdet til et monument over glemte projekter. Jeres hold skal holde en ordentlig gravtale for ÉN specifik genstand i skuret. Ikke selve skuret — én genstand. Mindst 5 sætninger. Med ægte følelse.",
      prompt:
        "Ét holdmedlem holder en gravtale for en skuret-genstand efter eget valg. Minimum 5 sætninger. Gruppen beslutter ved applaus om det opnår ægte følelse. Succes = bonus.",
      rewardText: "Genstanden huskes. Skuret skælver en smule. Eller det er bare vinden.",
    },
  },
  // ==========================================
  // TOOLBOX — optional side quest (branch off fridge)
  // No forTeam — both teams can do it independently
  // ==========================================
  {
    id: "toolbox-missing-item",
    roomId: "toolbox",
    type: "puzzle",
    title: "The Missing Tools",
    description:
      "The toolbox has six labeled compartments: HAMMER, SCREWDRIVER, WRENCH, SAW, DRILL, LEVEL. Four are occupied. Two are empty — but the tape outlines show exactly what was there. A note says: 'The missing tools are the answer. Count them.' How many compartments are empty?",
    prompt:
      "Six compartments. Four tools. Two empty outlines. The note says count the missing ones. What is the number?",
    order: 1,
    isRequired: true,
    answer: { correct: ["2", "two"] },
    hints: [
      {
        order: 1,
        offerCost: 1,
        text: "Six total slots. Four have tools. Subtract.",
      },
    ],
    rewardText: "Correct. Two tools missing. The toolbox gives up its secret: someone borrowed them and never returned them. A classic cabin crime.",
    failureText: "Count again. Six compartments, four occupied.",
  },
  {
    id: "toolbox-social",
    roomId: "toolbox",
    type: "social_challenge",
    title: "The Blame Round",
    description:
      "Somebody took the missing tools and never returned them. The group must name the most likely culprit — someone present or someone who has visited the cabin before. Deliver the verdict with a full sentence of reasoning. The group votes.",
    prompt:
      "Name the tool thief. One sentence. The group votes by applause on whether the accusation feels fair.",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "The accused has been named. Whether guilty or not — the cabin knows.",
    failureText: "No consensus reached. The tools remain unclaimed.",
  },

  // ==========================================
  // HAMMOCK — optional side quest (branch off terrace)
  // No forTeam — both teams can do it independently
  // ==========================================
  {
    id: "hammock-observation",
    roomId: "hammock",
    type: "social_challenge",
    title: "The Hammock Report",
    description:
      "One person must physically go sit in the hammock for 60 seconds — alone — and return with a single specific observation about the cabin or the people in it that they could only have noticed from that angle. The group decides if the observation is genuinely new information.",
    prompt:
      "Send one team member to the hammock. They sit for 60 seconds, return, and deliver one observation. The group votes: new information, or did we already know that?",
    order: 1,
    isRequired: true,
    hints: [],
    rewardText: "New perspective confirmed. The hammock has been sat in properly. The cabin rewards genuine idleness.",
    failureText: "The group has heard this before. The hammock demands more.",
  },
  {
    id: "hammock-social",
    roomId: "hammock",
    type: "social_challenge",
    title: "The Hammock Verdict",
    description:
      "The hammock is tied tighter on one side — evidence that someone heavier always sits there. The group must vote on who has the most gravitational pull in the friend group. Not weight — influence. The one who always ends up setting the plan. Name them.",
    prompt:
      "Group vote: who is the hammock anchor? Name one person, one sentence of justification. Unanimous vote required.",
    order: 2,
    isRequired: false,
    hints: [],
    rewardText: "The anchor is named. The hammock approves.",
    failureText: "The group is split. The hammock is disappointed.",
  },
];

export function getQuest(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}

export function getQuestsByRoom(roomId: string, teamId?: "team-a" | "team-b"): Quest[] {
  return QUESTS
    .filter((q) => q.roomId === roomId && (!q.forTeam || !teamId || q.forTeam === teamId))
    .sort((a, b) => a.order - b.order);
}

export function getRequiredQuestsByRoom(roomId: string, teamId?: "team-a" | "team-b"): Quest[] {
  return getQuestsByRoom(roomId, teamId).filter((q) => q.isRequired);
}
