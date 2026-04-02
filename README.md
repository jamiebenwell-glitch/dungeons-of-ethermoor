# Dungeons of Ethermoor

A single-player browser roguelike with pixel art visuals, D&D-style mechanics, and AI-driven NPC personalities.

## Play

Open `index.html` in any modern browser. No build step, no dependencies, no server required.

## Features

- **Procedural dungeons** — BSP-split rooms connected by hand-carved corridors, with FOV lighting and an explored-map system
- **D&D mechanics** — STR/DEX/CON/INT/WIS/CHA stats, attack rolls vs AC (including crits on natural 20), damage dice, and XP levelling
- **4 playable classes** — Warrior, Mage, Rogue, Cleric, each with unique stats, attacks, and class abilities
- **8 dungeon levels** — difficulty scales with monster HP, AC, and damage; boss fight on level 8
- **12 monster types** — Rats, Slimes, Goblins, Skeletons, Spiders, Zombies, Orcs, Ghosts, Dark Mages, Demons, Wraiths, a Young Dragon, and the Ethermoor Lich
- **8 NPC characters** — each with a distinct race, backstory, personality, and knowledge base that shapes their AI dialogue
- **Personality-driven dialogue** — type anything to an NPC and the engine detects topic (combat, lore, trade, healing, self, etc.) and responds in character
- **Shops & healing** — merchants sell items, Sister Miravel heals for gold
- **Inventory & equipment** — weapons and armour stack onto your stat bonuses; scrolls deal burst damage in combat
- **Pixel art sprites** — every tile, character, monster, and item is hand-defined as a 16×16 palette-indexed grid, rendered on canvas
- **Minimap** — top-right overlay showing explored tiles, NPCs (green), monsters in FOV (red), and your position

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow keys | Move / attack (bump into enemies) |
| E | Talk to adjacent NPC |
| G | Pick up item |
| I | Open inventory |
| > | Descend stairs |
| 1–4 | Use class ability |
| Enter | Confirm menu / send dialogue message |
| Escape | Close menu / exit dialogue |

In combat, navigate actions with W/S and confirm with Enter.  
In dialogue, type freely and press Enter to send. Press T to trade (merchants), H to heal (Sister Miravel).

## NPC Cast

| Name | Race | Role |
|------|------|------|
| Grizzlewick | Goblin | Nervous merchant who loves gold more than survival |
| Thornwick the Sage | Human | Absent-minded wizard researching the dungeon's anomaly |
| Sister Miravel | Human | World-weary cleric running a healing sanctuary |
| Korrath the Guardian | Dragonborn | Disgraced knight seeking redemption |
| Pip the Melodious | Halfling | Irrepressibly cheerful bard who speaks in rhyme |
| The Whisperer | Unknown | Cryptic entity that trades in secrets |
| Grak the Forgemaster | Half-Orc | Gruff blacksmith obsessed with fine metalwork |
| Luna the Alchemist | Elf | Enthusiastic, slightly unhinged potion brewer |

## Tech

- Vanilla JavaScript (ES5-compatible, no modules, no build step)
- HTML5 Canvas for all rendering
- Google Fonts (`Press Start 2P`) for the pixel typeface
- All sprites defined as 16×16 character grids mapped to a 32-colour palette and pre-rendered to off-screen canvases
- Dialogue engine uses topic detection + personality templates to generate contextual, in-character responses — no external API required

## Roadmap ideas

- GitHub Pages deployment for instant browser play
- Persistent high-score leaderboard (localStorage)
- More dungeon tilesets per depth tier
- Ranged combat and spell targeting
- Companion system (recruit an NPC)
- Optional Claude API integration for fully generative NPC responses
