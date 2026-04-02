# The Long Road

A browser-based fellowship adventure with LOTR vibes, animated pixel art, JRPG side-view combat, and AI-driven companion personalities you can actually talk to.

**[Play it →](https://jamiebenwell-glitch.github.io/dungeons-of-ethermoor/)**

## What it is

You lead a fellowship of five across six locations toward a final confrontation with Malachar the Undying. The journey is narrative-driven — story events with real choices, companion reactions, and relationships that develop based on how you play.

## The Fellowship

| | Name | Race & Role | Personality |
|---|---|---|---|
| 🟢 | **Aldric** | Human Ranger (you) | Your choices define who he is |
| 🟣 | **Miriel** | Elven Mage, 847 yrs | Quietly passionate, dry wit, occasionally condescending |
| 🟠 | **Brom** | Dwarf Warrior | Gruff, loud, enormous heart hidden under enormous complaints |
| 🔵 | **Seraphina** | Half-Elf Cleric | Warm and compassionate; carrying old guilt from the Dreadmoor |
| 🟡 | **Finn** | Halfling Rogue | Jokes at the worst moments; secretly the most perceptive of all |

Talk to any companion at any time — in the field or around the campfire. Each has their own history, opinions, fears, and things they'll only tell you when the relationship is high enough.

## The Journey

| Location | Vibe |
|---|---|
| Millhaven Village | Warm dawn, something wrong with the harvest |
| The Whisperwood | Ancient forest, glowing mushrooms, speaking trees |
| Frostpeak Pass | Snowstorm, mountain pass, an assassin in the night |
| The Sunken City | Drowned empire, purple sky, trapped ghosts |
| The Dreadmoor | Blood-red moon, dead trees, Seraphina's past |
| The Obsidian Citadel | Lava, lightning, the final battle |

## AI Companions

**Built-in personality engine** (no setup needed): topic detection maps your message to each companion's knowledge, speech patterns, and emotional state. Companions remember your conversation.

**Claude API mode** (optional): enter your Anthropic API key at the start for real generative AI responses. The game prompts each companion with their full backstory and current game context. Uses `claude-haiku` for speed. Your key stays in your browser's localStorage.

## Controls

| Key | Action |
|---|---|
| Arrow keys / WASD | Navigate menus, select targets |
| Enter / Space | Confirm |
| Escape | Back / close |
| 1 – 4 | Quick-chat with companions |
| Tab | Switch companion in chat |

## Combat

JRPG-style side view. Party on the left, enemies on the right. Each companion has a class ability and fights with their personality intact:
- **Miriel** casts AOE spells on groups; saves big spells for multiple targets
- **Brom** tanks and stuns; shields the weakest party member
- **Seraphina** heals anyone below 40% HP before attacking
- **Finn** picks off weakest enemies with Shadow Step finishes

## Tech

- Vanilla JS, no build step, no dependencies
- HTML5 Canvas with `Press Start 2P` pixel font
- All sprites drawn procedurally with animated frame cycling
- Each location background drawn frame-by-frame with layered canvas ops + particle system
- Companion AI: topic-aware personality engine with optional Claude API integration

Open `index.html` in any modern browser to play locally.
