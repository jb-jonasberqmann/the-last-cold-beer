import type { Boss } from "@/types/content";

export const BOSSES: Boss[] = [

  // ==========================================
  // ACT 1 BOSS — MADS
  // Not a monster. A friend. Late, chaotic, arms full.
  // HP label: "Unpacking"
  // ==========================================
  {
    id: "mads",
    chapterId: "act-1",
    title: "The Keybearer",
    subtitle: "Late. Unapologetic. Arms completely full.",
    description:
      "Mads arrives just as you're heading to the front door. Arms completely full — a cooler, a sleeping bag, two cases of beer, something wrapped in a garbage bag. He grins. He does not apologize. His phone was on silent. And now he — and everything he brought — is parked right in front of the door. Nobody gets inside until it's all unloaded.",
    icon: "🙋",
    look: {
      icon: "🙋",
      atmosphere:
        "Mads's car is blocking the path. The boot is open. Bags, towels, loose items — he needs help unloading. You have the code. You just can't get to the door while all of this is in the way.",
      colorFrom: "from-amber-800",
      colorTo: "to-stone-900",
      backgroundStyle: "outdoor-carport",
    },
    maxHp: 100,
    requiredRoomIds: ["shed"],
    counterAttacks: [
      {
        id: "defend",
        label: "Defensive Shuffle",
        description: "Mads pivots sideways and blocks the path with the cooler. Your next move only deals 75% damage.",
        weight: 3,
        effect: { type: "defend", defenseMultiplier: 0.75 },
      },
      {
        id: "attack",
        label: "Surprise Bag",
        description: "\"Oh — there's one more bag in the back.\" Mads hands it straight at you. Team drinks 1 sip.",
        weight: 3,
        effect: { type: "attack", teamOfferDamage: 1 },
      },
      {
        id: "heal",
        label: "Hidden Case",
        description: "\"Wait — I forgot. There's a full case of beer under the sleeping bag.\" Mads perks up visibly. He heals 20% HP.",
        weight: 1,
        effect: { type: "heal", healPercent: 0.20, isOnce: true },
      },
    ],
    phases: [
      {
        phase: 1,
        title: "The Unloading",
        description:
          "Nobody reaches the front door while Mads's arms are full. Help him get everything inside. Each action can only be done once — and Mads always has a response.",
        hpThreshold: 100,
        actions: [
          {
            id: "mads-cooler",
            label: "Carry the heavy cooler",
            description:
              "The cooler is enormous. Someone needs to grab the other handle. It goes in the utility corner.",
            type: "social",
            damage: 12,
            rewardText:
              "The cooler makes it inside. Mads's arms are slightly less full.",
            failureText: "It's too heavy for one person. Try again together.",
          },
          {
            id: "mads-beer",
            label: "Grab the beer cases",
            description:
              "Two cases of beer in the boot. Someone takes one, someone takes the other. Both get carried in.",
            type: "social",
            damage: 10,
            rewardText: "Beer inside. One fewer thing Mads is carrying.",
            failureText: "Leave no beer behind.",
          },
          {
            id: "mads-door",
            label: "Hold the door open",
            description:
              "The sleeping bag is awkward under his arm. Someone holds the door, someone guides him through the frame.",
            type: "social",
            damage: 8,
            rewardText: "Sleeping bag inside. Mads made it through the door.",
          },
          {
            id: "mads-phone-team-a",
            label: "Mads is missing something",
            description:
              "Mads stops mid-unload, suddenly distracted. He pats his pockets, checks the car, pats his pockets again. \"Hang on. I'm missing something. I'm not carrying another box until I find it.\"",
            type: "puzzle",
            damage: 22,
            puzzle: {
              prompt:
                "Mads checks every pocket. Jacket — empty. Jeans — empty. Car seat — nothing. Then he looks at you. \"Check the sun visor,\" he says. \"I always put them there and always forget.\" What do you find?",
              answer: ["sunglasses", "his sunglasses", "the sunglasses", "shades", "solbriller", "solbrillerne", "hans solbriller"],
            },
            hint: "Sun. Visor. What do you reach for when the evening sun hits the windscreen?",
            rewardText:
              "The sunglasses. In the sun visor. He had them the whole time. Mads puts them on, grins, and picks up the pace considerably.",
            failureText: "The car is messier than it looks. Try again.",
          },
          {
            id: "mads-phone-team-b",
            label: "Mads is missing something",
            description:
              "Mads stops mid-unload, suddenly distracted. He pats his pockets, checks the car, pats his pockets again. \"Hang on. I'm missing something. I'm not carrying another box until I find it.\"",
            type: "puzzle",
            damage: 22,
            puzzle: {
              prompt:
                "Mads freezes mid-carry. \"Wait — hang on. I wrote myself a note earlier, and now I can't tell you what it says, because I can't find the only place I wrote it down.\" He checks his jacket — no, his wallet's still there. Checks his jeans — no, keys are here too. \"It's not the cooler. It's not the sleeping bag either. Whatever it is, it's small enough that it's probably still in the car — I just haven't checked the right spot.\" What is he missing?",
              answer: ["phone", "his phone", "the phone", "mobile", "his mobile", "cell phone", "telefon", "hans telefon", "mobilen", "hans mobil"],
            },
            hint: "Small. Flat. The kind of thing you'd write a note on if you didn't have paper. Check the seat he wasn't sitting in.",
            rewardText:
              "His phone. Slid under the passenger seat when he braked turning in. That's why he never answered all evening — it's been on the floor of the car the whole time.",
            failureText: "Not that — he already ruled that one out himself.",
          },
          {
            id: "mads-offer-boost",
            label: "Bribe Mads",
            description: "Pay the ritual cost and he stops dragging his feet. One-time only — he won't be bought twice.",
            type: "offer_boost",
            damage: 25,
            offerCost: 2,
            rewardText: "Mads grins. Moves a little faster. 25 unpacking progress.",
          },
        ],
      },
    ],
    defeatText:
      "Mads is finally empty-handed. He grins and steps aside. \"The code? You went through the shed, right? Then you've already got everything.\" The path to the front door is clear. Combine all four fragments and open the key box.",
    victoryAdvantage:
      "The way is clear: head to the front door and enter the four-digit code.",
    da: {
      title: "The Keybearer",
      subtitle: "Forsinket. Uundskyldende. Armene fuldstændig fulde.",
      description:
        "Mads kører ind på carporten, døren åben inden motoren er slukket. Han bærer mere end det er fysisk rimeligt — en køler, en sovepose, to kasser øl, noget pakket ind i en skraldpose. Han griner. Han undskyldes ikke. Hans telefon var på lydløs. Og nu står han — og alt han har med — lige foran døren.",
      atmosphere:
        "Carporten. Mads' bil er skæv i parkeringspladsen. Bagagerummet er åbent. Indersiden af bilen er et kaos af tasker, håndklæder og løse genstande.",
      defeatText:
        "Mads er endelig tomhændet. Han griner og træder til side. \"Koden? I var i skuret, ikke? Så har I allerede det hele.\" Vejen til hoveddøren er fri.",
      victoryAdvantage:
        "Vejen er fri: gå til hoveddøren og indtast den firecifrede kode.",
      phases: [
        {
          phase: 1,
          title: "Losningen",
          description: "Ingen når hoveddøren mens Mads' arme er fulde. Hjælp ham med at få alt ind.",
          actions: [
            { id: "mads-cooler", label: "Bær den tunge køler", rewardText: "Køleren er inde. Mads' arme er lidt mere fri.", failureText: "Den er for tung til én person." },
            { id: "mads-beer", label: "Tag ølkasserne", rewardText: "Øl inde. Én ting færre Mads bærer." },
            { id: "mads-door", label: "Hold døren åben", rewardText: "Sovepose inde. Mads kom igennem døren." },
            { id: "mads-phone-team-a", label: "Mads mangler noget", puzzlePrompt: "Mads tjekker hver lomme. Jakke — tom. Jeans — tom. Bilsæde — intet. Så ser han på jer. \"Tjek solskærmen,\" siger han. \"Jeg lægger dem altid der og glemmer det altid.\" Hvad finder du?", hint: "Solskærm. Hvad rækker man ud efter når aftensolen rammer forruden?", rewardText: "Solbrillerne. I solskærmen. Han havde dem hele tiden. Mads tager dem på, griner, og sætter tempoet betydeligt op.", failureText: "Bilen er mere rodet end den ser ud." },
            { id: "mads-phone-team-b", label: "Mads mangler noget", puzzlePrompt: "Mads fryser midt i en tur. \"Vent — jeg skrev noget ned tidligere, og nu kan jeg ikke huske hvad, for det eneste sted det står, er det ene sted jeg ikke har fundet endnu.\" Han tjekker jakken — nej, tegnebogen er der stadig. Tjekker jeans — nej, nøglerne er her også. \"Det er ikke køleren. Det er heller ikke soveposen. Hvad end det er, er det lille nok til at det nok stadig er i bilen — jeg har bare ikke tjekket det rigtige sted.\" Hvad mangler han?", hint: "Lille. Fladt. Den slags man skriver en seddel på hvis man ikke har papir. Tjek sædet han ikke sad i.", rewardText: "Hans telefon. Gled ind under passagersædet da han bremsede hårdt op ind ad indkørslen. Derfor svarede han aldrig hele aftenen — den har ligget på bilens gulv hele tiden.", failureText: "Ikke den — det har han allerede afkrydset selv." },
            { id: "mads-offer-boost", label: "Bestik Mads", rewardText: "Mads griner. Bevæger sig lidt hurtigere. 25 fremskridt." },
          ],
        },
      ],
    },
  },

  // ==========================================
  // ACT 2 BOSS — THE RADIO
  // HP label: "Signal Strength"
  // Defeat is cinematic — triggers Act 2→3 transition
  // ==========================================
  {
    id: "the-radio",
    chapterId: "act-2",
    title: "The Radio",
    subtitle: "Old bakelite. Green dial. It has been trying to tell you something all evening.",
    description:
      "The old brown bakelite radio in the dining room. It has been crackling since you arrived. A green tuner dial. A fraying antenna. You've collected fragments of what it's been saying all evening — of all places, the toilet, plus the kitchen and the activity room. Now it's time to fix it and hear the broadcast clearly.",
    icon: "📻",
    look: {
      icon: "📻",
      atmosphere:
        "The dining room, evening. The long pine table, eight chairs, candles burning. On the shelf: the radio. The green dial glows faintly. The static is low but constant. The sound fills the room in a way that makes it hard to tell if it's coming from inside or outside your head.",
      colorFrom: "from-amber-950",
      colorTo: "to-stone-900",
      backgroundStyle: "warm-dining-radio",
    },
    maxHp: 240,
    requiredRoomIds: ["living-room", "the-toilet", "kitchen-act2", "activity-room", "dining-room"],
    counterAttacks: [
      {
        id: "defend",
        label: "Static Surge",
        description: "The static thickens into a wall of noise. Your next move only deals 75% damage.",
        weight: 3,
        effect: { type: "defend", defenseMultiplier: 0.75 },
      },
      {
        id: "attack",
        label: "Feedback Shriek",
        description: "The speaker screams — a burst of feedback that makes everyone flinch. Team drinks 1 sip.",
        weight: 3,
        effect: { type: "attack", teamOfferDamage: 1 },
      },
      {
        id: "heal",
        label: "Signal Drop",
        description: "The green light gutters. The signal collapses back into noise — everything you fixed slips. The radio regains 20% Signal Strength.",
        weight: 1,
        effect: { type: "heal", healPercent: 0.20, isOnce: true },
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Static",
        description: "The signal is barely there. You have all three fragments. Start restoring.",
        hpThreshold: 100,
        actions: [
          {
            id: "radio-antenna",
            label: "Adjust the antenna",
            description:
              "The antenna is bent at a wrong angle — not broken, just wrong. Someone has been at it. Straighten it. Try different positions. The static changes pitch when you're close.",
            type: "social",
            damage: 8,
            rewardText:
              "The antenna finds a position. The static thins slightly. Signal strength climbing. 8 HP restored.",
            failureText: "The static is unchanged. Try a different angle.",
          },
          {
            id: "radio-panel",
            label: "Open the back panel",
            description:
              "The back panel is held on by four tiny screws. Nobody's fingernails will do it. Somewhere in this house there is exactly one tool for this.",
            type: "puzzle",
            damage: 16,
            puzzle: {
              prompt:
                "The kitchen junk drawer rattles with odds and ends: rubber bands, birthday candles, a corkscrew, batteries — and the one thing that turns four tiny screws. What do you fetch?",
              answer: ["screwdriver", "a screwdriver", "the screwdriver", "skruetrækker", "en skruetrækker", "skruetrækkeren"],
            },
            hint: "Flat head. Lives in every junk drawer in the country.",
            rewardText:
              "The screwdriver. Four screws out, panel off. The radio's insides glow faintly — now you can actually work on it. 16 HP restored.",
            failureText: "Fingernails won't do it. Fetch the right tool.",
          },
          {
            id: "radio-fuse",
            label: "Replace the fuse",
            description:
              "Behind the back panel — a small fuse block with four slots, wired in parallel. Three are already fitted, each stamped with its rating. The fourth is empty. A note and a tin of loose spare fuses sit beside it.",
            type: "puzzle",
            damage: 22,
            puzzle: {
              prompt:
                "The note reads: \"Total draw: 500mA. Undershoot it and it blows again. Overshoot it and it won't fit.\" The three fitted fuses read 200mA, 150mA, and 100mA. What rating, in mA, does the last slot need?",
              answer: ["50", "50ma", "50 ma", "50mah"],
            },
            hint: "Add up the three fuses already fitted. The gap between that and 500 is your answer.",
            rewardText:
              "50mA. The last fuse clicks in — 200 + 150 + 100 + 50 = 500, exactly. The green dial brightens. Something is waking up in there. 22 HP restored.",
            failureText: "Add up the three fuses already fitted. The difference between that and 500mA is what's missing.",
          },
          {
            id: "radio-frequency",
            label: "Tune the frequency",
            description:
              "The dial clicks in small increments. You have three fragments of the broadcast from across the house. Try to find the frequency where all three resolve into one sentence.",
            type: "clue_check",
            damage: 28,
            requiredClueId: "radio-fragment-activity",
            rewardText:
              "The dial locks in. The green light blazes. Signal strength climbing. 28 HP restored.",
            failureText:
              "You need all three radio fragments first — from the toilet, the kitchen, and the activity room.",
          },
          {
            id: "radio-offer-boost",
            label: "Pour one out for the radio",
            description: "Pay the ritual cost. The radio responds to sincerity — this is one of the few moves that really hurts it.",
            type: "offer_boost",
            damage: 34,
            offerCost: 2,
            rewardText: "The static softens, then screams. 34 HP restored.",
          },
          {
            id: "radio-sunroom-bonus",
            label: "Already lost a sense tonight",
            description:
              "Whoever went sun-blind in the sunroom knows exactly what it feels like to lose a sense to this house. That familiarity hits automatically the moment you walk in.",
            type: "clue_check",
            damage: 14,
            requiredClueId: "sunroom-blind-mark",
            rewardText:
              "Losing your sight once already made this easier to face. Applied automatically. 14 HP restored.",
            failureText: "Nobody on your team went sun-blind in the sunroom.",
          },
        ],
      },
      {
        phase: 2,
        title: "Signal Locked",
        description: "The signal is almost clear. One final action and the radio will broadcast.",
        hpThreshold: 40,
        actions: [
          {
            id: "radio-speaker",
            label: "Clean the speaker grille",
            description:
              "The grille is dusty — years of it. A cloth, a gentle hand. The sound needs somewhere to go.",
            type: "social",
            damage: 10,
            rewardText:
              "The grille is clearer. 10 HP restored.",
            failureText: "The grille resists. Try harder.",
          },
          {
            id: "radio-wire",
            label: "Reconnect the loose wire",
            description:
              "There is one wire inside the back that is nearly disconnected. Someone pulled it most of the way out. Re-seat it.",
            type: "social",
            damage: 10,
            rewardText:
              "The wire clicks in a little further. 10 HP restored.",
          },
          {
            id: "radio-needle",
            label: "Free the stuck needle",
            description:
              "The dial glass is cracked, and the tuner needle catches on the crack — it can't reach the frequency it wants. Tilt the radio. Tap the glass. Gently. Let the needle swing free.",
            type: "social",
            damage: 9,
            rewardText:
              "One careful tap. The needle inches past the crack. 9 HP restored.",
            failureText: "Too hard and the glass gives way. Gently.",
          },
          {
            id: "radio-full-volume",
            label: "Turn the volume to full",
            description:
              "The signal is there — locked, waiting, under the last of the static. The volume knob is stiff with age. Turn it all the way. Let the house hear what the radio has been trying to say all evening.",
            type: "social",
            damage: 11,
            rewardText:
              "The knob turns a little further. 11 HP restored.",
            failureText: "The knob resists. Turn harder.",
          },
          {
            id: "radio-final-offer",
            label: "Grand Offering to the Signal",
            description: "Pay the maximum tribute. The radio will respond — this is the move that actually finishes it.",
            type: "offer_boost",
            damage: 42,
            offerCost: 4,
            rewardText: "The signal locks. The static peels away for good. 42 HP restored.",
          },
        ],
      },
    ],
    defeatText:
      "Signal locked in. Green light blazes.\n\nThe radio broadcasts clearly — one moment of absolute clarity.\n\n*\"The last one to take it... will always be the one to finish it.\"*\n\nA beat of silence.\n\nThe light overloads. White flash.\n\nThe house goes dark.\n\n*\"The house goes dark.\"*",
    victoryAdvantage:
      "Act 3 begins. The house is dark. You are in the dining room. Find a way to see.",
    da: {
      title: "Radioen",
      subtitle: "Gammel bakelit. Grøn skive. Den har forsøgt at fortælle dig noget hele aftenen.",
      description:
        "Den gamle brune bakelit-radio i spisestuen. Den har knatret siden I ankom.",
      atmosphere:
        "Spisestuen, aften. Det lange fyrretræsbord, otte stole, stearinlys. På hylden: radioen. Den grønne skive lyser svagt.",
      defeatText:
        "Signal låst. Grønt lys blusser op.\n\nRadioen sender klart — ét øjeblik af absolut klarhed.\n\n*\"Den sidste der tog det... vil altid være den der afslutter det.\"*\n\nEt slag af stilhed.\n\nLyset overlaster. Hvid flash.\n\nHuset bliver mørkt.\n\n*\"Huset bliver mørkt.\"*",
      victoryAdvantage:
        "Akt 3 begynder. Huset er mørkt. Du er i spisestuen. Find en måde at se på.",
      phases: [
        {
          phase: 1, title: "Statisk", description: "Signalet er næppe der. Start med at gendanne.",
          actions: [
            { id: "radio-antenna", label: "Juster antennen", rewardText: "Antennen finder en position. Signalstyrken stiger. 8 HP genoprettet.", failureText: "Statikken er uændret." },
            { id: "radio-panel", label: "Åbn bagpanelet", puzzlePrompt: "Køkkenets rodeskuffe rasler med løsdele: elastikker, fødselsdagslys, en proptrækker, batterier — og den ene ting der kan dreje fire bittesmå skruer. Hvad henter du?", hint: "Fladt hoved. Bor i enhver rodeskuffe i landet.", rewardText: "Skruetrækkeren. Fire skruer ude, panelet af. Radioens indre gløder svagt. 16 HP genoprettet.", failureText: "Negle duer ikke. Hent det rigtige værktøj." },
            { id: "radio-fuse", label: "Udskift sikringen", puzzlePrompt: "Sedlen lyder: \"Samlet belastning: 500mA. For lidt, og den springer igen. For meget, og den passer ikke.\" De tre monterede sikringer viser 200mA, 150mA og 100mA. Hvilken værdi, i mA, skal den sidste plads bruge?", hint: "Læg de tre monterede sikringer sammen. Forskellen op til 500 er dit svar.", rewardText: "50mA. Den sidste sikring klikker på plads — 200 + 150 + 100 + 50 = 500, præcis. Den grønne skive lyser op. 22 HP genoprettet.", failureText: "Læg de tre monterede sikringer sammen. Forskellen op til 500mA er hvad der mangler." },
            { id: "radio-frequency", label: "Stem frekvensen", rewardText: "Skiven låser. Det grønne lys blusser. 28 HP genoprettet.", failureText: "Du har brug for alle tre radiofragmenter først." },
            { id: "radio-offer-boost", label: "Hæld en ud til radioen", rewardText: "Statikken dæmpes, så skriger den. 34 HP genoprettet." },
            { id: "radio-sunroom-bonus", label: "Har allerede mistet en sans i aften", rewardText: "At have mistet synet én gang gjorde dette lettere at møde. Anvendt automatisk. 14 HP genoprettet.", failureText: "Ingen på jeres hold blev solblinde i vinterhaven." },
          ],
        },
        {
          phase: 2, title: "Signal Låst", description: "Signalet er næsten klart.",
          actions: [
            { id: "radio-speaker", label: "Rens højttalergitteret", rewardText: "Gitteret er lidt renere. 10 HP genoprettet.", failureText: "Gitteret modstår." },
            { id: "radio-wire", label: "Genopret det løse kabel", rewardText: "Kablet klikker lidt længere ind. 10 HP genoprettet." },
            { id: "radio-needle", label: "Befri den fastlåste nål", rewardText: "Ét forsigtigt slag. Nålen kravler forbi revnen. 9 HP genoprettet.", failureText: "For hårdt og glasset giver efter. Forsigtigt." },
            { id: "radio-full-volume", label: "Skru helt op for lyden", rewardText: "Knappen drejer lidt længere. 11 HP genoprettet.", failureText: "Knappen gør modstand. Drej hårdere." },
            { id: "radio-final-offer", label: "Stoffer til Signalet", rewardText: "Signalet låser. Statikken forsvinder for altid. 42 HP genoprettet." },
          ],
        },
      ],
    },
  },

  // ==========================================
  // ACT 3 BOSS — YOURSELVES
  // HP label: "Recognition"
  // 3 phases: Denial → Recognition → Acceptance
  // Defeat = culprit reveal
  // ==========================================
  {
    id: "yourselves",
    chapterId: "act-3",
    title: "YOURSELVES",
    subtitle: "The previous visitors. The ones who left all of this behind.",
    description:
      "The living room. The group is back together. The radio is silent. The stove is cold. Everything you found tonight — the bedroom notes, the date list, the sealed wall, the note in the shed signed with almost-your-names — points here. The boss fight is the house forcing a recognition. You are not fighting a monster. You are fighting your own denial.",
    icon: "👥",
    look: {
      icon: "👥",
      atmosphere:
        "The living room in darkness. The sofa, the shelf of paperbacks, the cold stove. The group stands in a circle. The note from the shed is on the table. The date list photo is on someone's phone. Everything is here. The house has been trying to tell you something all evening. Now it makes you listen.",
      colorFrom: "from-stone-950",
      colorTo: "to-zinc-950",
      backgroundStyle: "dark-living-boss",
    },
    maxHp: 300,
    requiredRoomIds: ["shed-dark", "door-nobody-tried"],
    // The finale boss — deliberately harder than Act 1/2: more counterattack
    // variety, a heal that can recur every time HP drops below 50% (not just
    // once), and wrong puzzle answers cost the team sips (punishWrongAnswers).
    // Given more HP than the Act 2 boss on purpose — this is the last fight.
    punishWrongAnswers: true,
    counterAttacks: [
      {
        id: "defend",
        label: "The House Deflects",
        description: "The accusation slides off. Nobody wants to be the one who admits it first. Your next move only deals 70% damage.",
        weight: 3,
        effect: { type: "defend", defenseMultiplier: 0.70 },
      },
      {
        id: "deflect-heavy",
        label: "Everyone Looks Away",
        description: "Nobody meets anyone's eyes. The silence itself becomes a kind of defense. Your next move only deals 60% damage.",
        weight: 2,
        effect: { type: "defend", defenseMultiplier: 0.60 },
      },
      {
        id: "attack",
        label: "The House Remembers",
        description: "A detail surfaces that nobody wants to sit with. Team drinks 1 sip.",
        weight: 3,
        effect: { type: "attack", teamOfferDamage: 1 },
      },
      {
        id: "attack-heavy",
        label: "Cold Judgment",
        description: "The house doesn't ask this time. It states it. Team drinks 2 sips.",
        weight: 2,
        effect: { type: "attack", teamOfferDamage: 2 },
      },
      {
        id: "heal",
        label: "The Denial Resurfaces",
        description: "\"This still isn't us.\" Someone says it and half the room believes it again. The house un-hears what you just admitted — Recognition climbs back up, hard.",
        weight: 2,
        effect: { type: "heal", healPercent: 0.28, isOnce: false },
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Denial",
        description:
          "*\"This can't be us.\"* — Actions establish uncomfortable familiarity. Things the group knows without knowing why.",
        hpThreshold: 100,
        actions: [
          {
            id: "yourselves-finish-sentence",
            label: "Finish the sentence",
            description:
              "The note from the Double Room trails off mid-sentence: *\"I know we said we'd come back and finish what we—\"*\n\nSomeone in the group speaks the ending aloud. Any ending. The house accepts it.",
            type: "social",
            damage: 10,
            rewardText:
              "Someone said it. The house registered it. Recognition creeping in. 10 HP.",
            failureText: "The sentence hangs unfinished. Someone must complete it.",
          },
          {
            id: "yourselves-layout",
            label: "You knew the layout",
            description:
              "Did anyone hesitate before any door tonight? Think back. The dining room, the corridor, the door nobody tried. Did you know where to look, without knowing why you knew?",
            type: "choice",
            damage: 25,
            choices: [
              {
                id: "yes-hesitated",
                label: "Yes — I hesitated",
                description: "You paused before a specific door. You already knew what was behind it.",
                isCorrect: true,
                consequence: "The house notes this. Both answers matter equally. Recognition climbs.",
              },
              {
                id: "no-first-time",
                label: "No — first time here",
                description: "You moved through the house fresh, as if seeing it for the first time.",
                isCorrect: true,
                consequence: "The house notes this too. Both answers register. That's the point.",
              },
            ],
            rewardText: "The house is listening. Your answer — either answer — matters. 25 HP.",
          },
          {
            id: "yourselves-shed-note-recall",
            label: "Describe the shed note without looking at it",
            description:
              "Your team found the shed date list in Act 1. Recall it from memory — every date on it was crossed out except one.",
            type: "puzzle",
            damage: 32,
            puzzle: {
              prompt:
                "Without looking at a photo or going back to check: every date on the shed's list was crossed out except one. Was the uncrossed date the very FIRST entry on the list, or the very LAST one?",
              answer: [
                "last", "the last", "last one", "the last one", "last entry", "last date",
                "sidste", "den sidste", "sidste en", "sidste dato",
              ],
            },
            hint: "The list runs oldest to newest. The one still uncrossed is the most recent — the bottom of the list.",
            rewardText:
              "The last one. Not the oldest, the newest. Tonight. The group remembers it without looking — you just knew. 32 HP.",
            failureText: "Think about which end of the list runs newest — oldest or most recent entries.",
          },
          {
            id: "yourselves-whos-missing-team-a",
            label: "The arrival scan counted you",
            description:
              "The Driveway photo, hours ago. The house's arrival scanner gave a number the moment the photo was taken. Nobody questioned it at the time.",
            type: "puzzle",
            damage: 28,
            puzzle: {
              prompt: "Without checking the Case File: what number did the arrival scanner give your team in the Driveway, back in Act 1?",
              answer: ["3", "three", "tre"],
            },
            hint: "It's in your Case File under Code Fragment — Driveway, if memory fails.",
            rewardText: "Three. That's what it said. Nobody in the group has ever recounted the photo to check. 28 HP.",
            failureText: "Check your memory of the Driveway fragment — the scanner gave an exact number.",
          },
          {
            id: "yourselves-whos-missing-team-b",
            label: "The arrival scan counted you",
            description:
              "The Driveway photo, hours ago. The house's arrival scanner gave a number the moment the photo was taken. Nobody questioned it at the time.",
            type: "puzzle",
            damage: 28,
            puzzle: {
              prompt: "Without checking the Case File: what number did the arrival scanner give your team in the Driveway, back in Act 1?",
              answer: ["6", "six", "seks"],
            },
            hint: "It's in your Case File under Code Fragment — Driveway, if memory fails.",
            rewardText: "Six. That's what it said. Nobody in the group has ever recounted the photo to check. 28 HP.",
            failureText: "Check your memory of the Driveway fragment — the scanner gave an exact number.",
          },
        ],
      },
      {
        phase: 2,
        title: "Recognition",
        description:
          "*\"We've done this before.\"* — Actions force specific acknowledgements. Details only the previous visitors would know.",
        hpThreshold: 60,
        actions: [
          {
            id: "yourselves-handwriting",
            label: "Whose handwriting is in the Double Room?",
            description:
              "The half-finished note in the Double Room. The group must name a player — whoever they think wrote it. The correct answer is the culprit. Any name is accepted. The tension is in the debate.",
            type: "social",
            damage: 12,
            rewardText:
              "A name is named. The house does not confirm or deny. But someone in the group feels it land. 12 HP.",
            failureText: "Someone must be named. The house requires it.",
          },
          {
            id: "yourselves-bunk-reads",
            label: "What did the Bunk Room know?",
            description:
              "The player who completed the bunk room reads the note aloud to the group. All of it. Their scared-silent status ended when the Living Room was cleared in Act 2 — they've been able to speak normally through all of Act 3.",
            type: "social",
            damage: 12,
            rewardText:
              "*\"It was taken. It is always taken. The room where everyone gathers holds the rest.\"* Read aloud. The group hears it with different weight now. 12 HP.",
            failureText: "The bunk room player must read the note aloud.",
          },
          {
            id: "yourselves-single-room-recall-team-a",
            label: "What did the Single Room give you?",
            description:
              "The note on the desk in the Single Room, back in Act 2. It ended in one word, growing bigger with every repeat. Recall it now, without checking the Case File.",
            type: "puzzle",
            damage: 30,
            puzzle: {
              prompt: "Without looking it up: what was the Single Room's word, back in Act 2?",
              answer: ["borrowed", "lånt"],
            },
            hint: "It's in your Case File under The Single Room Note, if memory fails.",
            rewardText: "Borrowed. Nothing in this house was ever really yours to begin with. 30 HP.",
            failureText: "Think back to the Single Room's note — the word grew bigger every time it repeated.",
          },
          {
            id: "yourselves-single-room-recall-team-b",
            label: "What did the Single Room give you?",
            description:
              "The note on the desk in the Single Room, back in Act 2. It ended in one word, growing bigger with every repeat. Recall it now, without checking the Case File.",
            type: "puzzle",
            damage: 30,
            puzzle: {
              prompt: "Without looking it up: what was the Single Room's word, back in Act 2?",
              answer: ["broken", "i stykker", "ødelagt"],
            },
            hint: "It's in your Case File under The Single Room Note, if memory fails.",
            rewardText: "Broken. It was always broken, long before tonight. 30 HP.",
            failureText: "Think back to the Single Room's note — the word grew bigger every time it repeated.",
          },
          {
            id: "yourselves-count-the-years",
            label: "Count the years",
            description:
              "The shed's laminated date list, back in Act 1. Sixteen years of entries, all crossed out but the last one — tonight's, still uncrossed.",
            type: "puzzle",
            damage: 34,
            puzzle: {
              prompt: "Not counting tonight: how many years of dates were already crossed out on the shed's list?",
              answer: ["16", "sixteen", "seksten"],
            },
            hint: "The list ran from 2010 to 2025 — every one of those years, crossed out.",
            rewardText: "Sixteen years. Every single one, crossed out — until tonight refused to be. 34 HP.",
            failureText: "2010 through 2025. Count the years — not counting tonight.",
          },
        ],
      },
      {
        phase: 3,
        title: "Acceptance",
        description:
          "*\"We are the ones who didn't finish.\"* — Actions are acts of completion.",
        hpThreshold: 20,
        actions: [
          {
            id: "yourselves-name-taken",
            label: "Name what was taken",
            description:
              "One thing was taken from this house. Not furniture. Not money. The one thing that required the house to keep its books open, to keep the date list running, to never cross tonight off. Name it.",
            type: "puzzle",
            damage: 45,
            puzzle: {
              prompt: "What was taken?\n\n(The radio said it. The note in the Double Room implies it. The game is named after it.)",
              answer: [
                "the last cold beer", "the beer", "last cold beer", "cold beer",
                "øl", "den kolde øl", "den sidste kolde øl", "beer",
              ],
            },
            hint: "The last. Cold. Beer.",
            rewardText:
              "Named. The house closes one ledger. One account remains open. 45 HP.",
            failureText: "The answer is in the name of the game.",
          },
          {
            id: "yourselves-radio-words",
            label: "Say the radio's words together",
            description:
              "The whole group types — or speaks aloud — the broadcast line. All of it. Together.",
            type: "puzzle",
            damage: 45,
            puzzle: {
              prompt:
                "Type the radio's broadcast — the exact words heard when the signal locked in Act 2.\n\n\"The last one to take it... will always be the one to finish it.\"",
              answer: [
                "the last one to take it will always be the one to finish it",
                "the last one to take it... will always be the one to finish it",
                "den sidste der tog det vil altid være den der afslutter det",
              ],
            },
            hint: "The radio said it in Act 2. You heard it before the house went dark.",
            rewardText:
              "The words spoken. All of them, together. The house receives this. 40 HP.",
            failureText: "Say exactly what the radio broadcast. All of it.",
          },
          {
            id: "yourselves-ready",
            label: "We're ready.",
            description:
              "The final action. No puzzle. No answer. One button. The house has made its case. The group has made their acknowledgement. Press it when you mean it.",
            type: "social",
            damage: 60,
            rewardText:
              "The partial light steadies.\n\n*(beat)*\n\n*\"You've been here before.\"*\n\n*(beat)*\n\n*\"All of you.\"*\n\n*(beat)*\n\n*\"Except one of you took something.\"*",
          },
        ],
      },
    ],
    defeatText:
      "The partial light steadies.\n\n*\"You've been here before.\"*\n\n*\"All of you.\"*\n\n*\"Except one of you took something.\"*\n\nThe culprit is revealed.",
    victoryAdvantage:
      "The game ends. The culprit is named. The last cold beer is in their hands.",
    da: {
      title: "JER SELV",
      subtitle: "De tidligere besøgere. Dem der efterlod alt dette.",
      description:
        "Stuen. Gruppen er samlet igen. Radioen er stille. Ovnen er kold. Alt hvad I fandt i aften peger her.",
      atmosphere:
        "Stuen i mørket. Sofaen, hylden med paperbacks, den kolde ovn. Gruppen står i en cirkel.",
      defeatText:
        "Det delvise lys stabiliserer sig.\n\n*\"I har været her før.\"*\n\n*\"Alle jer.\"*\n\n*\"Undtagen én af jer tog noget.\"*\n\nSkylden afsløres.",
      victoryAdvantage: "Spillet slutter. Den skyldige navngives. Den sidste kolde øl er i deres hænder.",
      phases: [
        {
          phase: 1, title: "Fornægtelse", description: "*\"Det kan ikke være os.\"*",
          actions: [
            { id: "yourselves-finish-sentence", label: "Afslut sætningen", rewardText: "Nogen sagde det. Huset registrerede det. 30 HP.", failureText: "Sætningen hænger uafsluttet." },
            { id: "yourselves-layout", label: "Du kendte plantegningen", rewardText: "Huset lytter. Dit svar — begge svar — betyder noget. 25 HP." },
            { id: "yourselves-shed-note-recall", label: "Beskriv skursedlen uden at se på den", hint: "Listen af datoer. Alle overstreget undtagen den sidste. Den sidste er i dag.", rewardText: "Gruppen husker. Uden at kigge på et foto. 30 HP.", failureText: "Hukommelsen er uklar." },
          ],
        },
        {
          phase: 2, title: "Genkendelse", description: "*\"Vi har gjort dette før.\"*",
          actions: [
            { id: "yourselves-handwriting", label: "Hvems håndskrift er i dobbeltværelset?", rewardText: "Et navn er navngivet. 35 HP.", failureText: "Nogen skal navngives." },
            { id: "yourselves-bunk-reads", label: "Hvad vidste køjestuen?", rewardText: "Læst højt. Gruppen hører det med anden vægt nu. 30 HP.", failureText: "Køjestuens spiller skal læse sedlen højt." },
            { id: "yourselves-stand-where-you-slept", label: "Stå hvor du sov", rewardText: "Huset så til. I bevægede jer igennem det som om I havde gjort det før. 25 HP." },
            { id: "yourselves-silence", label: "Sig ingenting i 45 sekunder", rewardText: "45 sekunders ingenting. Huset lagde mærke til det. 30 HP." },
          ],
        },
        {
          phase: 3, title: "Accept", description: "*\"Vi er dem der ikke afsluttede det.\"*",
          actions: [
            { id: "yourselves-name-taken", label: "Navngiv hvad der blev taget", hint: "Den sidste. Kolde. Øl.", rewardText: "Navngivet. 40 HP.", failureText: "Svaret er i spillets navn." },
            { id: "yourselves-radio-words", label: "Sig radioens ord sammen", hint: "Radioen sagde det i Akt 2.", rewardText: "Ordene sagt. Alle af dem, sammen. 40 HP.", failureText: "Sig præcis hvad radioen sendte." },
            { id: "yourselves-ready", label: "Vi er klar.", rewardText: "Det delvise lys stabiliserer sig.\n\n*(slag)*\n\n*\"I har været her før.\"*\n\n*(slag)*\n\n*\"Alle jer.\"*\n\n*(slag)*\n\n*\"Undtagen én af jer tog noget.\"*" },
          ],
        },
      ],
    },
  },
];

export function getBoss(id: string): Boss | undefined {
  return BOSSES.find((b) => b.id === id);
}

export function getBossByChapter(chapterId: string): Boss | undefined {
  return BOSSES.find((b) => b.chapterId === chapterId);
}
