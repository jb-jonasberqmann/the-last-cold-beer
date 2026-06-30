# THE LAST COLD BEER — Visual Design Brief
*For use with ChatGPT image generation / designer handoff*

---

## TECHNICAL SPECIFICATIONS

### Device & Screen
- **Platform:** Mobile web (PWA), primarily iOS Safari and Android Chrome
- **Target device:** iPhone 13/14/15 and equivalent Android — ~390px wide
- **Orientation:** Portrait only — vertical layout always
- **Safe areas:** Account for iOS notch/Dynamic Island top and home indicator bottom (approx. 44px top, 34px bottom)

### Room Background Composition Rule
**All room backgrounds must follow this strict composition:**
- **Upper 1/3 of the frame:** The primary visual subject — the room, space, or key object. This is where the eye goes. Compose the most important element here (a door, a window, the radio, the shed entrance, etc.)
- **Middle 1/3:** Transition zone — detail fades, atmosphere takes over
- **Lower 1/3:** Fades to near-black. This is where the quest sheet panel overlays. No important visual information should exist here — it will be covered.

Think of it like a cinema frame where the actor's face is always in the top third, and the bottom is shadow. The quest sheet slides up from below and lives in that dark zone.

This rule applies to **all** room backgrounds across all three acts.

### Asset Dimensions by Type

| Asset Type | Dimensions | Format | Notes |
|---|---|---|---|
| Room background | 1080 × 1920px | PNG or JPG | Full-screen vertical. Dark gradient overlay applied in-app at bottom 60%. |
| Map illustration (per act) | 800 × 1400px | PNG with alpha | Displayed inside a scrollable container ~380px wide. Nodes and paths must be legible at this size. |
| Boss portrait | 600 × 600px | PNG with alpha | Square crop, used in boss fight card. Dark/transparent background. |
| Artifact illustration | 400 × 400px | PNG with alpha | Small object on transparent background. Used as inventory icons and in quest cards. |
| Node icons (map) | 80 × 80px | PNG with alpha | Per-room icon used inside map nodes. Simple, legible at small size. |
| UI panels / overlays | Full width 390px | PNG with alpha OR SVG | Semi-transparent. Must have alpha background — overlaid on room backgrounds in-app. |

### Alpha Background Requirements
All of the following **must be delivered with transparent backgrounds (alpha channel)**:
- Boss portraits
- Artifact illustrations
- Node icons
- All UI panel elements (quest cards, info panels, status bars, buttons)
- Map illustration (the map sits over a background — the map canvas itself needs alpha around its edges)
- Any decorative overlays (torn paper edges, vignettes, frame elements)

Room backgrounds are the **only** assets that should be fully opaque (no alpha needed — they are the base layer).

### Colour & Overlay Notes
- The app applies its own dark gradient overlay on top of room backgrounds — designer does **not** need to bake this in
- UI panels in the app use `rgba(8,6,4,0.55)` with `backdrop-filter: blur(24px)` — assets overlaid on these should account for this dark, slightly blurred context
- All text rendering happens in-app — do not bake text into background assets

### File Delivery
- Name files clearly: `act1_room_driveway_bg.png`, `act2_boss_radio_portrait.png`, `artifact_flashlight.png` etc.
- Deliver at 2× resolution minimum (e.g. room backgrounds at 1080×1920 display but export at that resolution for Retina)
- SVG preferred for map illustrations if hand-illustrated style can be achieved — allows infinite scaling

---

## THE GAME

A mobile party game played in real-time at a real Danish summerhouse. Two teams race through the same story, exploring the same physical spaces, solving different puzzles. The game is played on phones — full-screen vertical layout. Think escape room meets drinking game meets Stranger Things.

The game unfolds across **3 acts** that take place over the course of one evening — arriving in daylight, settling in as night falls, and then the lights go out. The visual language must reflect this progression: warm and familiar → golden and cozy → dark and eerie.

---

## THE PROPERTY (real reference)

**Nørrestrand 48A, Hou, Hals, North Jutland, Denmark**
- Classic Danish summerhouse, built 1960, renovated 2021
- Red-brown horizontal timber cladding, low-pitched roof
- 124m² house on a 1,250m² fenced natural plot
- New wooden terrace (2021) with sun loungers
- Fenced garden with natural vegetation — grass, low shrubs, Danish coastal flora
- Tool shed / outbuilding in the garden
- Petanque court in the garden
- Carport beside the house
- Sunroom / conservatory attached to the house
- 450m from the sea — flat coastal Danish landscape, light wind, open sky

**Interior:**
- 1960s bones with modern touches
- 3 bedrooms: double room, single room, bunk room
- Living room with old analog radio
- Dining room
- Kitchen
- Activity room (table tennis, darts, foosball, mini billiards)
- 2 bathrooms
- Wood-burning stove in living room

---

## OVERALL VISUAL LANGUAGE

**Style:** Hand-illustrated, atmospheric, slightly worn. Think old travel posters crossed with a Nordic crime novel cover. Not cartoon, not realistic — somewhere between illustrated and painterly.

**UI feel:** Dark backgrounds always. Text in cream/amber. Serif font (Georgia or similar) throughout. The interface should feel like reading an old case file by candlelight.

**Map style:** Top-down illustrated map of the property. Nodes (rooms) are hand-drawn organic blob shapes connected by illustrated paths — like a treasure map or a hand-sketched floor plan. Nodes change appearance based on state: locked (faded), active (glowing), complete (darkened gold).

**Mood reference:** Stranger Things (seasons 1-2), Midsommar (lighting only, not horror), Nordic Noir, a cozy cabin that slowly stops being cozy.

---

## ACT 1 — "THE ARRIVAL"
*Time of day: Late afternoon, golden hour. Everything is warm and cheerful.*

### Visual Palette
- Warm amber and golden yellows
- Deep green grass and coastal vegetation
- Gravel grey for the driveway
- Warm wood tones for the terrace and house exterior
- One slightly wrong note — a shadow that's just a bit too dark, a door that's open when it shouldn't be

### Map Layout
A top-down view of the **outside** of the property. The house itself is visible but closed — you can see the front door, the terrace, the windows, but cannot enter. The map path winds through the outdoor spaces.

**Main spine (left to right or bottom to top):**
1. **The Driveway** — gravel, cars arriving, Mads notably absent. Show a car with doors open, bags half-unloaded. Sky visible.
2. **The Terrace** — new wooden deck, sun loungers, view of the locked front door through glass. Warm afternoon light.
3. **The Garden** — wide open natural plot, coastal grass, the fenced boundary visible. Feels big and open.
4. **The Shed** — small outbuilding, slightly weathered, door ajar. One detail inside is wrong — a note, something missing.
5. **The Front Door** — close-up of the front door. Key box mounted beside it. No key. Code unknown.

**Branch nodes (off main spine):**
- **The Petanque Court** — off the garden. Sandy pit, metal balls, afternoon light. Cheerful side quest.
- **The Carport** — off the driveway. Open-sided shelter, one car eventually pulls in. This is where Mads arrives.

### Boss: MADS
**Visual concept:** Not a monster — a person. A friend. Late, slightly chaotic, arms full of bags and beer cases. He should look warm and familiar and slightly ridiculous.
- Portrait style: illustrated character portrait, friendly face, windswept, holding a cooler in one arm and a duffel bag slipping off his shoulder
- HP bar should be styled as "Mads's stubbornness" or "Mads's load"
- Actions against him are acts of helping: each one visually shows a bag being moved, a case being carried
- When defeated: he's finally standing empty-handed, grinning, holding out his phone with the last code digit on screen

---

## ACT 2 — "SETTLING IN"
*Time of day: Evening. Inside the house. Warm artificial light, cozy but dimming.*

### Visual Palette
- Warm interior yellows and ambers — lamplight, not sunlight
- Wood paneling, 1960s furniture
- Cream walls with small personal details
- As the act progresses: light gets slightly cooler, slightly less reliable
- The radio: old analog, brown bakelite casing, glowing green dial — this should appear as a background element in multiple room illustrations

### Map Layout
The map now moves **inside the house**. This is a floor-plan style illustrated map — top-down or isometric — showing the interior layout.

**Three separate starting nodes at the top (the bedrooms):**
- **The Double Room** — warm, slightly dishevelled. A half-packed bag left open on the bed. Bedside lamp. Evidence of someone who left in a hurry. Feels like a hotel room someone checked out of unexpectedly.
- **The Single Room** — one small bed, one window, one bedside table. Some things placed deliberately, some dropped mid-action. A mix of intention and panic. Quieter and more unsettling than the double room.
- **The Bunk Room** — two bunks, nautical/cabin feel. The top bunk made, the bottom bunk revealing something on the underside of the mattress above. This room should have a slightly colder, more clinical light than the others.

**All three converge into:**
- **The Living Room** — the heart of the house. Wood-burning stove, sofa, the old radio on a shelf crackling. This is the warmest, most familiar room. But the radio is in the background of every illustration here, glowing faintly.

**Continuing spine:**
- **The Dining Room** — long table, mismatched chairs, the radio is HERE (its home room). Old analog radio on a sideboard, dial glowing green. The boss fight happens here.
- **The Kitchen** — 1960s bones, modern appliances. Functional and lived-in.
- **The Activity Room** — the fun room. Table tennis, darts board, foosball table, mini billiards. Should feel like a slightly chaotic games room.

**Branch nodes:**
- **The Sunroom / Conservatory** — off the living room. Glass walls, wicker furniture, the first place you notice wind. Slightly cooler light.
- **The Darts Board** — off the activity room. Close-up illustration, single focus.
- **The Foosball Table** — off the activity room. Close-up illustration, single focus.

### Boss: THE RADIO
**Visual concept:** The radio itself is the boss. Old, brown bakelite analog radio. Green glowing tuner dial. Static visible as visual noise around it.
- Boss portrait: a close-up illustration of the radio — dials, crackling speaker grille, the green tuner light
- HP bar styled as "Signal Strength" — starts at 0, builds as you fix it
- Actions are repair attempts: "Adjust the antenna", "Replace the fuse", "Tune the frequency", "Reconnect the wires"
- **Defeat moment:** The dial locks. The green light blazes. For one moment it broadcasts clearly. Then it overloads. The green light explodes white. Then — black.
- **Blackout transition:** Full screen goes black. A single line of text appears: *"The last one to take it... will always be the one to finish it."* Then Act 3 begins.

---

## ACT 3 — "THE LATE NIGHT"
*Time of day: Deep night. The house is dark. The property is transformed.*

### Visual Palette
- Near-total darkness — backgrounds are black with deep blue-grey shadows
- Light sources only: flashlight beam (warm amber cone), candle flame (orange flicker), phone screen (cold blue-white), single fuse-powered lamp (weak yellow)
- High contrast — almost everything is dark, light is precious and directional
- The same rooms from Acts 1 and 2 but redrawn in darkness — familiar shapes made unfamiliar
- Outside: cold blue night sky, stars, wind implied by movement in vegetation

### The Artifacts (visual items collected through the act)
Each artifact should be illustrated as a small object — found, worn, slightly wrong:
- **The Flashlight** — old, heavy, yellowed plastic. Warm amber beam.
- **The Wrench** — worn metal, grease-stained. Practical and slightly ominous.
- **The Candle** — half-melted, wax dripped on a saucer. Flame drawn mid-flicker.
- **The Fuse** — small, glass-bodied, ceramic ends. Looks fragile.
- **The Key from the Shed** — old, iron, clearly been here a long time. Unlocks a door nobody tried.

### Map Layout
The map is now a dark version of Acts 1 and 2 combined — the full property at night. Rooms from previous acts appear as dark outlines, some accessible, some not. New nodes appear that weren't on earlier maps.

**New / previously undiscovered locations:**
- **The Door Nobody Tried** — a door that was always visible in Act 2 but never interacted with. In Act 3 the flashlight beam falls on it for the first time. Old wood, no markings.
- **Behind the Shed** — a corner of the garden that wasn't on the Act 1 map. In daylight, unremarkable. At night, something is there.
- **The Fuse Box** — found with the flashlight. Utility corner of the house, possibly under stairs or in a back hall. Wires, switches, darkness.
- **The Broken Window** — a window with a banging latch. The wrench fixes it. The silence after is louder than the noise was.

### Boss: TBD (to be developed)
The final boss of Act 3 should take place in **The Living Room** — the group returns here in darkness, flashlights converging on the radio. The boss should represent the house itself — not a person, not a machine, but the accumulated weight of everything that's happened across all three acts.

**The Reveal:**
After the boss is defeated, the lights partially return. Everyone is in the living room. The radio is silent. And then the game reveals the culprit — the one who took the last cold beer. Random, inevitable, funny. They have to drink it. The house is satisfied.

---

## ROOM CARD VISUAL STYLE (individual room screens)

Each room is a **full-screen vertical illustration** with:
- Background: atmospheric illustration of the room/space (the main visual)
- Dark gradient overlay from bottom (60-70% opacity) to allow quest text to be readable
- Room title in serif font, top centre, small and elegant
- Quest sheet slides up from bottom — semi-transparent dark panel (55% opacity), blur behind it

**Per-act filter on all room illustrations:**
- Act 1: warm amber grade, slight vignette
- Act 2: evening yellow grade, slightly desaturated
- Act 3: near-black, high contrast, light source visible in frame

---

## NODE STATES ON MAP (colour reference for designer)

| State | Fill | Stroke | Meaning |
|-------|------|--------|---------|
| Locked | Dark brown, low opacity | Dim gold | Not yet accessible |
| Can Unlock | Warm gold | Green | Ready to enter, costs Offers |
| Active | Deep red | Bright red-orange | Currently here |
| Complete | Dark gold | Muted green | Finished |
| Optional/Branch | Dark teal | Teal-green | Side quest, not required |
| Secret | Dark blue | Cyan | Hidden branch |

---

## TYPOGRAPHY

- **Headings / Room titles:** Georgia serif, cream white, slight letter-spacing
- **Body / Quest text:** System sans-serif, stone/warm grey
- **Atmospheric flavour text:** Georgia italic, muted amber
- **Boss HP / game stats:** Monospace or Georgia bold, amber

---

## WHAT TO ASK CHATGPT TO GENERATE

For each act, request:
1. **A full map illustration** — top-down or slight isometric, hand-illustrated style, showing all nodes and paths for that act
2. **Individual room backgrounds** — full-screen vertical (9:16 ratio), atmospheric, with the correct lighting grade for that act
3. **Boss portraits** — illustrated character or object close-up, suitable for a portrait card
4. **Artifact illustrations** — small object illustrations on dark backgrounds

Suggested prompt prefix for ChatGPT:
*"Illustrate in a hand-drawn Nordic atmospheric style, warm but eerie, like a travel poster crossed with a Scandinavian crime novel. Dark backgrounds, serif typography feel, candlelit or golden-hour lighting. The setting is a real 1960s Danish summerhouse on the North Jutland coast."*

---

## UI ELEMENTS TO GENERATE (all with alpha backgrounds)

These are reusable interface components. All must be delivered as PNG with transparent backgrounds so the app can overlay them on room backgrounds.

### Quest Sheet Panel
- The bottom-sheet panel that slides up when a player is in a room
- Size: 390px wide, variable height (~60% of screen)
- Style: dark semi-transparent panel with slightly rough or torn top edge (like paper)
- Top edge should have a decorative torn-paper or worn-wood effect
- Background: dark brown/black at ~55% opacity with subtle texture — but delivered as a panel graphic, NOT a solid fill (the blur is applied in-app)
- Deliver as: a frame/border graphic with transparent interior — the app fills the interior

### Boss HP Bar
- Horizontal bar, full width (~340px usable), ~24px tall
- Has a "fill" layer and an "empty" layer — deliver both separately with alpha
- Style: worn metal or aged wood frame, amber/gold fill colour
- Should look like a gauge or old meter, not a game-y progress bar

### Offer/Currency Badge
- Small pill-shaped badge showing beer mug emoji + number
- Size: ~80×32px
- Style: dark amber, slightly worn, fits the overall aesthetic

### Clue Card
- The card shown when a clue is discovered or viewed in the Case File
- Size: 340×480px with alpha
- Style: aged paper or worn card, slight yellowing, torn edges — like an old evidence card
- Has space for: icon (top), title, description text, flavour text at bottom
- Deliver as frame only — text is overlaid in-app

### Map Node States (per state, per node type)
Deliver small blob/node graphics for each combination:
- Node types: main path, optional/branch, secret
- States: locked, can_unlock, active, complete, occupied (new — for bedrooms)
- Size: ~80×80px each, alpha background
- Style: hand-drawn organic shapes, colour per the node state table earlier in this document

### Artifact Inventory Slot
- Small square slot for showing collected artifacts
- Size: 64×64px with alpha
- Style: aged wood or dark metal frame, empty slot visible

### Physical Challenge Timer
- Circular or rectangular countdown display
- Large number display in centre
- Style: old clock face, worn brass, amber numerals
- Size: ~200×200px with alpha (circular) or 280×80px (rectangular bar)

### Case File Button (with pulse state)
- The button that opens the clue browser
- Size: ~120×44px with alpha
- Deliver two states: normal and glowing/pulsing (for when new clues arrive)
- Style: dark leather or worn book binding aesthetic

### Banner Notifications
- Full-width notification banners that drop from top of screen
- Size: 370×80px with alpha
- Style: aged parchment or dark wood panel with subtle border
- Used for: clue discoveries, toll paid notifications, physical challenge alerts

---

## DELIVERY CHECKLIST

**Per Act (×3):**
- [ ] Full map illustration (800×1400px, alpha)
- [ ] Room backgrounds for each room (1080×1920px, opaque)
- [ ] Boss portrait (600×600px, alpha)

**Artifacts (Act 3):**
- [ ] Flashlight (400×400px, alpha)
- [ ] Wrench (400×400px, alpha)
- [ ] Candle (400×400px, alpha)
- [ ] Fuse (400×400px, alpha)
- [ ] Shed object TBD (400×400px, alpha)

**UI Components (all with alpha):**
- [ ] Quest sheet panel frame
- [ ] HP bar (fill + empty layers)
- [ ] Offer badge
- [ ] Clue card frame
- [ ] Map node states (5 states × 3 types = 15 assets)
- [ ] Artifact inventory slot
- [ ] Physical challenge timer
- [ ] Case File button (normal + glowing)
- [ ] Banner notification frame
