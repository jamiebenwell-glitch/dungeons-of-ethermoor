// ============================================================
// WORLD.JS — Locations, narrative events, enemy groups
// ============================================================

// ---- LOCATIONS ----
const LOCATIONS = [
  {
    id: 'millhaven',
    name: 'Millhaven Village',
    subtitle: 'Where the road begins',
    scene: 'millhaven',
    ambientType: 'ember',
    travelText: 'The fellowship departs Millhaven as dawn breaks, boots crunching on the frost-hardened road.',
    description: 'A sleepy village nestled between two hills. Smoke curls from chimneys and the smell of bread drifts from the bakery — but something is wrong. The harvest has failed, and dark shapes were seen on the road north.',
    events: ['ev_blight_field', 'ev_wounded_traveller', 'ev_old_map'],
    encounters: [
      { name: 'Goblin Scouts', enemies: ['goblin','goblin'], xp: 40, gold: [10,25] },
      { name: 'Warg Pack', enemies: ['warg','warg','goblin'], xp: 60, gold: [5,15] },
    ],
  },
  {
    id: 'whisperwood',
    name: 'The Whisperwood',
    subtitle: 'Ancient and aware',
    scene: 'whisperwood',
    ambientType: 'firefly',
    travelText: 'The trees close in overhead, their branches weaving a canopy so thick that noon feels like midnight. Somewhere ahead, something watches.',
    description: 'An old-growth forest older than the kingdoms of men. The trees are said to remember the First Age, and on quiet nights they speak to those who listen. The fellowship must pass through to reach the mountains.',
    events: ['ev_spirit_tree', 'ev_ambush', 'ev_hermit'],
    encounters: [
      { name: 'Orc Warband', enemies: ['orc','orc','goblin'], xp: 80, gold: [15,40] },
      { name: 'Wraith in the Dark', enemies: ['wraith'], xp: 70, gold: [20,50] },
    ],
  },
  {
    id: 'frostpeak',
    name: 'Frostpeak Pass',
    subtitle: 'The mountain does not forgive',
    scene: 'frostpeak',
    ambientType: 'snow',
    travelText: 'The wind cuts like a blade. Each step upward costs twice the effort. The fellowship pulls their cloaks tight and presses on.',
    description: 'A treacherous pass through the Greymoor Mountains. Avalanches are common, the paths are narrow, and in the upper reaches, creatures patrol that have no names in the southern tongues.',
    events: ['ev_avalanche', 'ev_betrayal_attempt', 'ev_shrine'],
    encounters: [
      { name: 'Orc Elite Guard', enemies: ['orc','orc','orc'], xp: 120, gold: [30,60] },
      { name: 'Dragon Knight', enemies: ['dragon_knight'], xp: 150, gold: [50,100] },
    ],
  },
  {
    id: 'sunken_city',
    name: 'The Sunken City',
    subtitle: 'Drowned in time',
    scene: 'sunken_city',
    ambientType: null,
    travelText: 'The valley below is flooded — an entire city swallowed by a centuries-old catastrophe. The towers still stand, half-submerged, glowing with forgotten magic.',
    description: 'Once the capital of a mighty empire, the city of Varanthos now lies half-drowned in a great lake. Its towers house powerful artifacts — and the dead who refuse to leave.',
    events: ['ev_ghost_bargain', 'ev_artifact', 'ev_flood_trap'],
    encounters: [
      { name: 'Wraith Sentinels', enemies: ['wraith','wraith'], xp: 160, gold: [40,80] },
      { name: 'Orc Raiders', enemies: ['orc','orc','orc','goblin'], xp: 140, gold: [35,70] },
    ],
  },
  {
    id: 'dreadmoor',
    name: 'The Dreadmoor',
    subtitle: 'Where hope comes to drown',
    scene: 'dreadmoor',
    ambientType: 'firefly',
    travelText: 'The ground becomes soft and uncertain. A red moon hangs permanently above the swamp, and the fog carries whispered voices.',
    description: 'A cursed swamp on the edge of the Dark Lord\'s domain. The water is black, the air is thick, and the dead walk here with purpose. Seraphina grows quiet — she has been here before.',
    events: ['ev_sera_past', 'ev_dark_offering', 'ev_will_o_wisp'],
    encounters: [
      { name: 'Troll of the Moor', enemies: ['troll'], xp: 200, gold: [60,120] },
      { name: 'Wraith Court', enemies: ['wraith','wraith','wraith'], xp: 220, gold: [50,100] },
    ],
  },
  {
    id: 'citadel',
    name: 'The Obsidian Citadel',
    subtitle: 'The end of the road',
    scene: 'citadel',
    ambientType: 'ash',
    travelText: 'The Citadel rises from a sea of lava. The gates are open — he is expecting you.',
    description: 'The fortress of Malachar the Undying. Black towers scrape a sky permanently lit by volcanic fire. Every stone was laid by enslaved hands. Every corridor is a trap. The Dark Scepter lies at its heart.',
    events: ['ev_final_choice', 'ev_dark_lord_speaks'],
    encounters: [
      { name: 'Gate Guardians', enemies: ['dragon_knight','dragon_knight'], xp: 280, gold: [80,160] },
      { name: 'Malachar the Undying', enemies: ['lich_lord'], xp: 999, gold: [200,500], isFinalBoss: true },
    ],
  },
];

// ---- NARRATIVE EVENTS ----
const EVENTS = {
  // -- Millhaven --
  ev_blight_field: {
    title: 'The Blighted Field',
    text: 'You pass through farmland where the crops have withered to black husks. A farmer kneels in the dirt, weeping. He looks up — his eyes carry something beyond despair.',
    choices: [
      {
        text: 'Give him your rations',
        outcome: 'The farmer weeps with gratitude. He presses a silver coin into your hand — all he had left. The fellowship moves on, hungrier but lighter in spirit.',
        effects: { gold: -10, morale: +15, rep: +1 },
        companionReactions: {
          seraphina: 'That was the right thing. His suffering was real.',
          brom: "Hmph. Soft-hearted, the lot of you. ...I gave him my spare bread. Don't look at me like that.",
          miriel: 'The blight is not natural. I sense dark magic in the soil. We must hurry.',
          finn: "My cousin's village got hit like this once. It... didn't end well. We should keep moving.",
        }
      },
      {
        text: 'Ask him what happened',
        outcome: 'He speaks of shadows moving at night, of livestock found dead with no marks, of a cold that lingers even in summer. The Dark Lord\'s reach has grown further than feared.',
        effects: { morale: +5, clue: 'blight_source' },
        companionReactions: {
          seraphina: "He's not lying. There's a spiritual corruption here I can feel.",
          miriel: 'As I feared. The necrotic seepage from the Citadel is spreading.',
          brom: 'Then we have more reason to crack that Citadel open. Let\'s get moving.',
          finn: "Dark Lord's reach is longer than the king's spies said. That's... not great.",
        }
      },
      {
        text: 'Press on — no time to stop',
        outcome: 'You leave the farmer behind. Seraphina glances back. No one speaks for a long time.',
        effects: { morale: -10, rep: -1 },
        companionReactions: {
          seraphina: "...We could have helped him. Even a little.",
          brom: "Eh. Hard choices. The road demands them.",
          miriel: "The outcome of the quest matters more than one man's grief. I believe that. Mostly.",
          finn: "Yeah. Yeah I'm not gonna think about that. Nope. Moving on.",
        }
      },
    ]
  },

  ev_wounded_traveller: {
    title: 'The Wounded Messenger',
    text: 'A royal courier lies wounded at a crossroads, an arrow in his shoulder. He clutches a sealed letter bearing the king\'s mark. "Please," he gasps, "it must reach the Grey Council."',
    choices: [
      {
        text: 'Heal him and take the letter north',
        outcome: 'Seraphina tends his wounds. He tells you the letter warns of a spy in the Council — someone is feeding the Dark Lord information. He doesn\'t know who.',
        effects: { morale: +10, clue: 'council_spy' },
        companionReactions: {
          seraphina: 'A spy in the Council. That explains how Malachar always seems one step ahead.',
          miriel: 'I have my suspicions. I have had them for some time.',
          brom: 'A spy? Point me at \'em. I\'ll sort it out the direct way.',
          finn: "Ooh, intrigue! ...Actually no, this is terrifying.",
        }
      },
      {
        text: 'Take the letter and leave him',
        outcome: 'You ride on. Brom looks deeply uncomfortable. The letter contains nothing you didn\'t already suspect — but perhaps it will reach someone who can act on it.',
        effects: { morale: -8, clue: 'council_spy', rep: -1 },
        companionReactions: {
          brom: "That didn't sit right with me. We left a good man to the road.",
          seraphina: "I could have healed him in minutes. We had the time.",
          miriel: "The information matters. The choice was... defensible.",
          finn: "No no no, we are NOT the 'abandon the wounded' fellowship. Absolutely not.",
        }
      },
    ]
  },

  ev_old_map: {
    title: 'The Cartographer\'s Gift',
    text: 'An ancient woman stops you at the village well. She seems to know exactly who you are and where you\'re going. She offers you a weathered map without a word of explanation.',
    choices: [
      {
        text: 'Accept the map gratefully',
        outcome: 'The map shows a hidden path through the mountains — two days shorter than the known route. Who was she? She is gone before you can ask.',
        effects: { morale: +5, gold: 0 },
        companionReactions: {
          miriel: "That woman was no ordinary villager. She knew us. She knew our path. Curious.",
          finn: "Did anyone else notice she didn't have a shadow? ...No? Just me?",
          seraphina: "I felt something holy about her. Perhaps we were guided here.",
          brom: "Less talking, more walking. We have a shortcut now.",
        }
      },
      {
        text: 'Refuse — could be a trap',
        outcome: 'The old woman smiles as if you\'ve said something amusing. She tucks the map away and shuffles off. Finn immediately regrets letting her go.',
        effects: { morale: -5 },
        companionReactions: {
          finn: "That was probably a really useful map. I'm just saying.",
          miriel: "Caution was warranted. Though I suspect that woman's intentions were... benign.",
          brom: "Smart. Never trust mysterious gifts from mysterious old women in mysterious villages.",
          seraphina: "I think we should have taken it.",
        }
      },
    ]
  },

  // -- Whisperwood --
  ev_spirit_tree: {
    title: 'The Speaking Tree',
    text: 'You rest at the base of a vast oak whose trunk is wider than a house. In the silence, you all hear it — a low voice, like the groan of timber in a storm, forming words. "Travellers. The wood remembers you. The wood has a question."',
    choices: [
      {
        text: 'Listen to the tree',
        outcome: 'The tree asks: "What do you protect?" Your answer shapes what it gives you — a carved wooden totem that hums with old magic.',
        effects: { morale: +20, gold: 0 },
        companionReactions: {
          miriel: "The Ent-kin. I have not heard their voice in three hundred years. This is extraordinary.",
          brom: "Trees don't talk. ...That tree just talked to me. I need a drink.",
          seraphina: "I said we protect the innocent. It seemed... pleased with that.",
          finn: "I told it I protect my pockets. It was not pleased. Miriel is judging me.",
        }
      },
      {
        text: 'Draw weapons — this is sorcery',
        outcome: 'The voice goes silent. The forest around you darkens. Miriel grabs your sword arm. "Do NOT attack a First Wood tree. Do you want to die?" The fellowship moves on quickly.',
        effects: { morale: -15 },
        companionReactions: {
          miriel: "Of all the reckless — that was a First Wood elder! Ten thousand years old!",
          seraphina: "It wasn't threatening us. You need to trust more.",
          brom: "Talking trees, I draw the line. I draw the line at talking trees.",
          finn: "Hero instincts: zero. Let's all agree to listen to Miriel on ancient woodland magic.",
        }
      },
    ]
  },

  ev_ambush: {
    title: 'Eyes in the Dark',
    text: 'Finn raises a fist — the signal to halt. He points to the undergrowth ahead. Shapes. Many of them. You\'ve walked into an orc ambush, and they haven\'t sprung it yet. You still have a moment to act.',
    choices: [
      {
        text: 'Spring the trap first — attack!',
        outcome: 'You charge before they\'re ready. The ambush collapses into a brawl. It works — barely.',
        effects: { combat: 'whisperwood_encounter' },
        companionReactions: {
          brom: "Now THAT is how you handle an ambush! Turn it around on them!",
          finn: "Brom, we almost died. — Brom: Worth it.",
          miriel: "Marginally less suicidal than waiting. I concede the choice was correct.",
        }
      },
      {
        text: 'Try to sneak past',
        outcome: 'Finn leads the group around the ambush through undergrowth. It takes an hour and everyone gets thoroughly scratched. But you avoid the fight.',
        effects: { morale: +10 },
        companionReactions: {
          finn: "And THAT is why you keep a rogue in the party. You're welcome.",
          brom: "I had them. We absolutely had them. ...Fine. This way was quieter.",
          seraphina: "Well done, Finn. Sometimes the best battle is the one you don't fight.",
          miriel: "Agreed. Conserve our strength for what lies ahead.",
        }
      },
    ]
  },

  ev_hermit: {
    title: 'The Hermit of the Wood',
    text: 'A firelight in the trees leads you to a clearing where an old man sits by a fire, as if he\'s been waiting. He knows your names. He knows your quest. He knows things about each of you that you\'ve never told anyone.',
    choices: [
      {
        text: 'Sit and listen',
        outcome: 'He speaks for an hour. Most of it is riddles, but some of it is painfully direct. "The one who does not believe they belong — they will matter most at the end." He gives you a vial of silver liquid.',
        effects: { morale: +15, gold: 0 },
        companionReactions: {
          finn: "...He looked at me when he said that. I think he looked at me.",
          seraphina: "He knew about the Dreadmoor. What I did there. He didn't judge me.",
          miriel: "He is Foreseen. A seer of the old school. Treat what he said as truth.",
          brom: "How does he know my father's axe-name? HOW DOES HE KNOW THAT?",
        }
      },
      {
        text: 'Demand answers directly',
        outcome: '"Demand?" He smiles. "You haven\'t the power to demand of me, child. But I respect your directness." He gives less, but what he gives is crystal clear: "One of you will not see the end. They have chosen this."',
        effects: { morale: -5 },
        companionReactions: {
          miriel: "He was testing you. And you passed, after a fashion. That warning — take it seriously.",
          seraphina: "One of us... I don't want to think about that.",
          brom: "Well. Cheerful fellow. Right, who's dying? I vote it's Finn.",
          finn: "BROM.",
        }
      },
    ]
  },

  // -- Frostpeak --
  ev_avalanche: {
    title: 'The White Death',
    text: 'A deep crack resonates through the mountain. Brom turns — a wall of white is coming down the slope above. Fast. There is no outrunning it.',
    choices: [
      {
        text: 'Miriel — do something!',
        outcome: 'Miriel throws up a shield ward. The avalanche parts around the fellowship like water around a stone. She collapses to her knees afterward, drained.',
        effects: { morale: +20 },
        companionReactions: {
          miriel: "I am... fine. Give me a moment. Just a moment.",
          seraphina: "That took everything she had. Let her rest. Now.",
          brom: "I'll be honest. I doubted you for a second there, Pointy-Ears. Never again.",
          finn: "I was THIS CLOSE to writing a very dramatic will.",
        }
      },
      {
        text: 'Run for the rock outcrop!',
        outcome: 'You sprint. Brom grabs Finn and runs. You make it — mostly. The edge of the avalanche catches Brom and pins his leg under a boulder for a terrifying moment before he wrenches free.',
        effects: { morale: +5 },
        companionReactions: {
          brom: "I'm fine! It's just a scratch. Three scratches. It's fine!",
          seraphina: "Sit DOWN, Brom. I need to look at that leg. Sit. Down.",
          finn: "He picked me up and RAN. I have never felt so carried in my life.",
          miriel: "Fortunate. Very fortunate. Let's not tempt fortune again today.",
        }
      },
    ]
  },

  ev_betrayal_attempt: {
    title: 'The Mountain Agent',
    text: 'Your camp is infiltrated at night. Finn catches an assassin standing over you with a poisoned blade. The assassin, cornered, says: "The Dark Lord knows your names. Your quest is known. Turn back now and you may live."',
    choices: [
      {
        text: 'Capture and question them',
        outcome: '"There is a spy who has been with you from the start," he gasps. Then Finn\'s knife handle connects with his temple and he\'s out. You camp with one eye open from now on.',
        effects: { morale: -10, clue: 'spy_in_party' },
        companionReactions: {
          finn: "A spy with us from the start. Right. Who do we trust?",
          miriel: "Everyone. We trust everyone, because suspicion will tear us apart before Malachar does.",
          brom: "Easy for you to say. You're the only one who could take us all out.",
          seraphina: "It was a trick to make us paranoid. I believe that. I have to believe that.",
        }
      },
      {
        text: 'Let them go with a warning',
        outcome: 'You let the assassin run. They stop at the tree line and look back: "You\'re more dangerous than he said." Then they\'re gone.',
        effects: { morale: +5, rep: +1 },
        companionReactions: {
          brom: "You let THEM GO? They'll just come back with more!",
          finn: "Bold move. Bold. Stupid. Bold. Brom\'s right.",
          miriel: "Compassion as strategy. It may serve us yet.",
          seraphina: "Sometimes mercy is the most powerful weapon we have.",
        }
      },
    ]
  },

  ev_shrine: {
    title: 'The Summit Shrine',
    text: 'At the highest point of the pass stands a shrine to an old god — abandoned for centuries, snow-covered, but somehow still tended. A single candle burns in the wind without flickering.',
    choices: [
      {
        text: 'Leave an offering',
        outcome: 'You leave what you can spare. The candle brightens. That night, the fellowship sleeps deeply for the first time in weeks. Everyone wakes feeling... fortified.',
        effects: { morale: +25, gold: -15 },
        companionReactions: {
          seraphina: "I felt that. Whatever is in that shrine — it's real, and it noticed us.",
          miriel: "The old gods diminish but do not die. It is wise to remember them.",
          brom: "I left my good-luck stone. Had it for thirty years. Felt right to leave it here.",
          finn: "I left a button. Best I had. The button is very nice.",
        }
      },
      {
        text: 'Take the candle — might be useful',
        outcome: 'Seraphina grabs your arm before you can. The look on her face stops you cold. You move on without touching anything.',
        effects: { morale: +5 },
        companionReactions: {
          seraphina: "Don't. Please. Some things need to stay where they are.",
          miriel: "A sacred flame burns without fuel. Do the mathematics.",
          brom: "Even I know better than that. And I once axed a temple by accident.",
          finn: "...By accident.",
        }
      },
    ]
  },

  // -- Sera's past --
  ev_sera_past: {
    title: 'What Seraphina Left Behind',
    text: 'In the Dreadmoor, Seraphina stops. She stares at a particular spot of black water, unmoving. When she finally speaks, her voice is flat: "I\'ve been here before. A long time ago. I failed someone here. Someone who trusted me."',
    choices: [
      {
        text: 'Stay with her. Ask what happened.',
        outcome: 'She tells you. It took a long time and a lot of silence, but she tells you. The fellowship listens without judgement. When she finishes, Brom puts his enormous hand on her shoulder and says nothing. It\'s the right thing.',
        effects: { morale: +30 },
        companionReactions: {
          brom: "That's enough, lass. You did what you could. That's all any of us can do.",
          miriel: "The healer who couldn\'t heal. The guilt shapes you still. It does not have to define you.",
          finn: "For the record — and I mean this — you're the best of us. All of us know it.",
          seraphina: "...Thank you. I didn't know I needed to say that out loud.",
        }
      },
      {
        text: 'Give her space. Press on.',
        outcome: 'She catches up in silence after a minute. Something in her eyes is different — older. She doesn\'t speak again for hours. But she keeps walking.',
        effects: { morale: -5 },
        companionReactions: {
          finn: "...Should we have stayed? I feel like we should have stayed.",
          miriel: "She will carry it. She always does. But she shouldn't have to do it alone.",
          brom: "Next time she looks like that — we stop. Agreed?",
        }
      },
    ]
  },

  // -- Final events --
  ev_dark_offering: {
    title: 'The Voice in the Fog',
    text: 'A voice fills the swamp — deep, resonant, everywhere and nowhere. "Fellowship. You carry courage I respect. Turn back. Swear fealty. I will spare your people, your homes, your lives." A long pause. "You have one minute."',
    choices: [
      {
        text: '"We\'d rather die." Press on.',
        outcome: 'The fog clears. The path ahead is straight and unobstructed. Was it a test? Miriel thinks so. "He respects strength," she says quietly. "He always has."',
        effects: { morale: +20 },
        companionReactions: {
          brom: "WELL SAID. That's what I\'m talking about right there.",
          miriel: "Correct answer. And it took him less than he hoped it would to get it.",
          seraphina: "Whatever happens at the end — we chose it together.",
          finn: "I was literally about to negotiate. I'm so glad you spoke first.",
        }
      },
      {
        text: 'Consider his terms...',
        outcome: 'The fog thickens. Brom\'s voice is very quiet: "...Are we actually talking about this right now?" The moment passes. You keep walking. But the doubt is planted.',
        effects: { morale: -20 },
        companionReactions: {
          brom: "Right. Okay. We are NOT swearing fealty to the Dark Lord. Hard no.",
          miriel: "That pause may have cost us more than we know. He is watching.",
          finn: "I will walk into that Citadel with you. Obviously. I just want that on record.",
          seraphina: "We're tired. We're scared. That's why he made the offer now. Don't let it work.",
        }
      },
    ]
  },

  ev_final_choice: {
    title: 'The Gates of the Citadel',
    text: 'You stand at the gates. They open — slowly, without touch. He is expecting you. Inside: the Dark Scepter, the source of all of this. Behind you: everything you\'re fighting for. The fellowship looks at you.',
    choices: [
      {
        text: '"Together. As we always have been."',
        outcome: 'You walk in. The fellowship walks in. Whatever happens in there — it\'s on your terms.',
        effects: { morale: +40 },
        companionReactions: {
          brom: "Hah. Thought you\'d never ask. After you, Boss.",
          finn: "Yep. Definitely doing this. Absolutely no regrets whatsoever. *whispers* I have some regrets.",
          miriel: "I have lived eight hundred years. I can think of no better way to spend the rest of it.",
          seraphina: "Let\'s end this.",
        }
      },
    ]
  },

  ev_dark_lord_speaks: {
    title: 'Malachar Speaks',
    text: 'His voice fills the throne room before you see him. "So. The fellowship that defied me. A ranger, a rogue, a dwarf, an elf, a healer. The forgotten, the scared, the stubborn, the ancient, the guilty. I chose my enemies poorly." A pause. "No. I chose perfectly. You are exactly what hope looks like." He steps from the shadow. "Disappointing."',
    choices: [
      {
        text: 'Fight.',
        outcome: 'The final battle begins.',
        effects: { combat: 'final_boss' },
        companionReactions: {
          brom: "For the road! FOR ALL OF IT!",
          miriel: "Shields up. Every ward I have. NOW.",
          finn: "I believe in us. I really genuinely actually believe in us.",
          seraphina: "Light of the Seven — be with us.",
        }
      },
    ]
  },

  ev_will_o_wisp: {
    title: "The Beckoning Light",
    text: "A pale blue light drifts through the swamp ahead, moving slowly, as if leading you somewhere. Will-o'-wisps have a dark reputation — but this one pulses in a strangely familiar rhythm.",
    choices: [
      {
        text: "Follow the light",
        outcome: "It leads you to a dry island in the swamp's heart, where an old chest sits half-buried. Inside: a cache of supplies and a letter from a previous fellowship, five years gone. They made it here. They didn't make it back.",
        effects: { morale: +5, gold: 40 },
        companionReactions: {
          miriel: "A previous attempt. The letter is dated five years ago. They were... thorough in their preparations.",
          finn: "They almost made it. That's encouraging! ...Sort of.",
          brom: "We'll finish what they started. To them.",
          seraphina: "To them. May they rest.",
        }
      },
      {
        text: "Ignore it — wisps lead you to your death",
        outcome: "You press on without it. Behind you, the light dims and vanishes. You move faster knowing it was watching.",
        effects: { morale: 0 },
        companionReactions: {
          finn: "Correct call. Wisps are classic 'die in a swamp' energy.",
          miriel: "Cautious. Perhaps overly so. But I cannot fault the reasoning.",
        }
      }
    ]
  },

  ev_ghost_bargain: {
    title: "The Ghost Who Remembers",
    text: "A transparent figure blocks your path in the flooded ruins — a soldier in ancient armour, still standing his post. His eyes focus on you with a clarity that death usually erases. 'Prove you deserve to pass,' he says. 'Answer truly: what would you sacrifice for your cause?'",
    choices: [
      {
        text: '"Everything. If it comes to that."',
        outcome: "He studies you for a long time. Then he steps aside. 'I believed that once,' he says. 'It is enough.' The path opens.",
        effects: { morale: +15 },
        companionReactions: {
          seraphina: "You meant that. I could tell you meant it.",
          miriel: "He was a sentinel-soul. Bound to this place until a worthy cause passed. We freed him.",
          brom: "Can't tell if that's noble or terrifying. Bit of both.",
          finn: "I would also sacrifice everything. For the record. I just wasn't asked.",
        }
      },
      {
        text: '"We don\'t answer riddles. Step aside."',
        outcome: "He vanishes — and so do the torches. You navigate the ruins in total darkness, Miriel's staff the only light. It takes twice as long and twice the nerves.",
        effects: { morale: -10 },
        companionReactions: {
          miriel: "You do realise that was the least efficient possible response?",
          finn: "Bravado: 10/10. Results: debatable.",
        }
      }
    ]
  },

  ev_artifact: {
    title: "The Vault of Varanthos",
    text: "Deep in the sunken city, behind a door sealed with magic that Miriel opens with visible excitement, lies a vault. Inside: dust, ruin, and one intact item — a circlet of pale metal that hums with trapped starlight.",
    choices: [
      {
        text: "Take the circlet",
        outcome: "Miriel identifies it immediately: an Elven focus-crown, a thousand years old. It thrums with power. 'This will considerably improve my capabilities,' she says with magnificent understatement.",
        effects: { morale: +10, gold: 0 },
        companionReactions: {
          miriel: "This is a Starweave Circlet. Forged in the Second Age. I thought they were all destroyed. *places it on head without asking* Yes. Yes, this will do.",
          brom: "She just put on a thousand-year-old magic crown without testing it first. This is fine.",
          finn: "In fairness she is an eight-hundred-year-old wizard so probably fine.",
          seraphina: "It suits you, Miriel. It really does.",
        }
      },
      {
        text: "Leave it — might be cursed",
        outcome: "You leave the vault. Miriel says nothing for twenty minutes. Then: 'It wasn't cursed.' She says nothing further.",
        effects: { morale: -5 },
        companionReactions: {
          miriel: "It wasn't cursed.",
          brom: "She's gonna be upset about that for a while.",
          finn: "Days. Minimum.",
        }
      }
    ]
  },

  ev_flood_trap: {
    title: "Rising Waters",
    text: "The doors seal behind you. Water begins pouring through the walls — ancient channels designed to drown intruders. Finn is already at the mechanism on the far wall. 'I can crack it!' he shouts over the roar. 'Probably! Give me thirty seconds!'",
    choices: [
      {
        text: "Trust Finn. Keep the monsters back.",
        outcome: "Wraith-guardians materialise from the walls. The party fights. Finn curses at the mechanism. Twenty-eight seconds later, the water stops. 'I said thirty. I beat it by two.' He is insufferably smug.",
        effects: { morale: +20, combat: 'sunken_city_encounter' },
        companionReactions: {
          finn: "BY TWO SECONDS. Do you know how impressive that is? Do you KNOW?",
          brom: "Grudgingly, yes. It was impressive.",
          miriel: "I would have just blasted the door, but Finn's solution was more elegant.",
          seraphina: "You saved us all, Finn. Own that.",
        }
      },
      {
        text: "Miriel — blow the doors!",
        outcome: "Miriel raises her staff. The doors explode outward. The water rushes harmlessly after them. Finn stares at the mechanism he'd nearly cracked. 'I was close.' 'You were,' says Miriel kindly.",
        effects: { morale: +15 },
        companionReactions: {
          finn: "I was close. For the record.",
          brom: "Good call. When in doubt, Miriel.",
          miriel: "It was a straightforward application of force. Though I confess — dramatic.",
          seraphina: "Okay, that was very cool.",
        }
      }
    ]
  },
};

// ---- ENEMY DEFINITIONS ----
const ENEMY_DEFS = {
  goblin:        { name: 'Goblin Scout',       sprite: 'goblin',        maxHp: 18, atk: 5,  def: 6,  spd: 12, xp: 20, color: '#508030', deathColor: '#304020' },
  orc:           { name: 'Orc Warrior',        sprite: 'orc',           maxHp: 40, atk: 10, def: 10, spd: 7,  xp: 50, color: '#406030', deathColor: '#203018' },
  warg:          { name: 'Warg',               sprite: 'warg',          maxHp: 28, atk: 8,  def: 6,  spd: 14, xp: 35, color: '#403020', deathColor: '#201810' },
  troll:         { name: 'Moor Troll',         sprite: 'troll',         maxHp: 80, atk: 18, def: 12, spd: 4,  xp: 120,color: '#507058', deathColor: '#303838' },
  wraith:        { name: 'Wraith',             sprite: 'wraith',        maxHp: 35, atk: 12, def: 14, spd: 10, xp: 80, color: '#1a1a2a', deathColor: '#000010' },
  dragon_knight: { name: 'Dragon Knight',      sprite: 'dragon_knight', maxHp: 65, atk: 16, def: 16, spd: 8,  xp: 110,color: '#202020', deathColor: '#101010' },
  lich_lord:     { name: 'Malachar the Undying',sprite:'lich_lord',     maxHp: 200,atk: 24, def: 18, spd: 9,  xp: 999,color: '#1a0030', deathColor: '#0a0018', isBoss: true },
};

// Create a live enemy instance from a def key
function makeEnemy(key) {
  const def = ENEMY_DEFS[key];
  if (!def) return null;
  return {
    key,
    name:       def.name,
    sprite:     def.sprite,
    hp:         def.maxHp,
    maxHp:      def.maxHp,
    atk:        def.atk,
    def:        def.def,
    spd:        def.spd,
    xp:         def.xp,
    color:      def.color,
    deathColor: def.deathColor,
    isBoss:     def.isBoss || false,
    isDead:     false,
    statusEffects: [],
    animState:  'idle',
    animTimer:  0,
    x: 0, y: 0,   // set by renderer
  };
}
