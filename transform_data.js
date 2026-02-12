const fs = require('fs');

// Raw data from code.txt (Copy-pasted for simplicity, or I could read the file)
const CARD_DATABASE = [
    // ROW 1
    {
        id: "0_fool_hod",
        name: "0 - The Fool",
        character: "Hod",
        keywords: ["Beginnings", "Naivety", "Optimism"],
        readings: [
            "Mindset: Naive optimism. You believe you can fix everything if you just try hard enough.",
            "Heart: A desire to be helpful that masks a deep fear of being useless or unwanted.",
            "Hands: Good intentions, but often clumsy or inexperienced execution.",
            "Shadow: You are suppressing guilt over past failures, smiling to hide the shame.",
            "Soul: A resilient spirit capable of great change, provided you accept your flaws."
        ]
    },
    {
        id: "i_magician_tellulu",
        name: "I - The Magician",
        character: "Tellulu",
        keywords: ["Alchemy", "Recipe", "Obsession"],
        readings: [
            "Mindset: You believe logic, science, or a 'recipe' can solve matters of the heart.",
            "Heart: A desperate, bubbling longing to be loved back, bordering on obsession.",
            "Hands: You are mixing dangerous elements in your life to brew a perfect solution.",
            "Shadow: You reduce living people to formulas or ingredients to make them easier to understand.",
            "Soul: A creator who fears the chaos of natural emotion, seeking control through chemistry."
        ]
    },
    {
        id: "ii_priestess_faust",
        name: "II - The High Priestess",
        character: "Faust",
        keywords: ["Intellect", "Mystery", "Silence"],
        readings: [
            "Mindset: You believe you are the smartest person in the room, and you usually are.",
            "Heart: You value detached curiosity over vulnerable connection.",
            "Hands: You act only when the outcome is calculated and certainty is 100%.",
            "Shadow: Arrogance. You underestimate the power of chaotic human emotion.",
            "Soul: A lonely vessel of pure knowledge, isolated by its own genius."
        ]
    },
    {
        id: "iii_empress_carmen",
        name: "III - The Empress",
        character: "Carmen",
        keywords: ["Motherhood", "Consumption", "Nature"],
        readings: [
            "Mindset: You believe you are the savior that those around you need.",
            "Heart: A love so deep and overwhelming that it suffocates those you care about.",
            "Hands: You rarely act directly; you inspire or manipulate others to act for you.",
            "Shadow: A desire to merge boundaries and lose yourself in others completely.",
            "Soul: A spirit that mistakes total consumption for total love."
        ]
    },
    {
        id: "iv_emperor_ryoshu",
        name: "IV - The Emperor",
        character: "Ryoshu",
        keywords: ["Authority", "Art", "Violence"],
        readings: [
            "Mindset: You adhere to a strict personal code of aesthetic perfection.",
            "Heart: You crave the intense beauty found in pushing boundaries or breaking things.",
            "Hands: You carve your own path through the world, disregarding social norms.",
            "Shadow: You view people as objects or 'paint' for your own life's canvas.",
            "Soul: An artist's soul that values the masterpiece over the suffering it costs."
        ]
    },
    {
        id: "v_hierophant_ayin",
        name: "V - The Hierophant",
        character: "Ayin",
        keywords: ["System", "Belief", "Sacrifice"],
        readings: [
            "Mindset: The script is written. You are merely following the necessary plan.",
            "Heart: Cold utilitarianism. You are willing to sacrifice anything for the 'greater good'.",
            "Hands: You build systems or routines that grind you down to produce results.",
            "Shadow: You have cut away parts of your own humanity to achieve your goal.",
            "Soul: A visionary willing to become a monster to build a perfect world."
        ]
    },
    {
        id: "vi_lovers_ghostdoll",
        name: "VI - The Lovers",
        character: "Ghost & Doll",
        keywords: ["Puppetry", "Waltz", "Dependency"],
        readings: [
            "Mindset: You view relationships as a dance where steps must be followed perfectly.",
            "Heart: A love that transcends boundaries, but requires strings attached.",
            "Hands: You manipulate the people around you like joints in a doll.",
            "Shadow: A paralyzing fear of cutting the strings and standing alone.",
            "Soul: Two halves of a whole that cannot survive without the other."
        ]
    },
    {
        id: "vii_chariot_outis",
        name: "VII - The Chariot",
        character: "Outis",
        keywords: ["War", "Strategy", "Return"],
        readings: [
            "Mindset: The mission comes first. Your personal feelings are irrelevant.",
            "Heart: A desperate, hidden need to return to a place or person you call 'home'.",
            "Hands: You use strategy, deception, and office politics to survive.",
            "Shadow: You are a chameleon; no one knows whose side you are truly on.",
            "Soul: A weary traveler who fears they have forgotten the face of who they are returning to."
        ]
    },
    {
        id: "viii_strength_redmist",
        name: "VIII - Strength",
        character: "The Red Mist",
        keywords: ["Power", "Courage", "Control"],
        readings: [
            "Mindset: Only the strongest survive. You must be the strongest.",
            "Heart: A fierce, violent protectiveness over the few people you trust.",
            "Hands: You obliterate obstacles with brute force rather than negotiation.",
            "Shadow: A deep fear that without your strength/utility, you are nothing.",
            "Soul: An indomitable will that seeks peace but only knows how to fight."
        ]
    },
    // ROW 2
    {
        id: "ix_hermit_yisang",
        name: "IX - The Hermit",
        character: "Yi Sang",
        keywords: ["Solitude", "Reflection", "Idealism"],
        readings: [
            "Mindset: The real world is flawed; you retreat inward to find the ideal.",
            "Heart: A poetic melancholy for a past that can never truly return.",
            "Hands: You create things that isolate you rather than connect you.",
            "Shadow: Passive resignation. A wish to simply melt away or fly into the sun.",
            "Soul: A broken mirror trying to reflect a perfect world."
        ]
    },
    {
        id: "x_wheel_hokma",
        name: "X - Wheel of Fortune",
        character: "Hokma",
        keywords: ["Time", "Cycle", "Destiny"],
        readings: [
            "Mindset: Time is absolute. Everything happens as it must.",
            "Heart: Unwavering devotion to a leader, god, or idea from your past.",
            "Hands: You wait and record. You ensure the cycle continues as written.",
            "Shadow: You are trapped in the past, unable to accept the new era.",
            "Soul: A clock ticking down to an inevitable end that you welcome."
        ]
    },
    {
        id: "xi_justice_sancho",
        name: "XI - Justice",
        character: "Sancho",
        keywords: ["Truth", "Loyalty", "Cause"],
        readings: [
            "Mindset: Unwavering loyalty. You define your justice by whom you follow.",
            "Heart: Pure innocence that wants to see the best in your 'hero'.",
            "Hands: You carry burdens and shoes that are too heavy for you.",
            "Shadow: A lack of individual will; you struggle to exist without a master.",
            "Soul: A faithful squire wandering through a nightmare, holding onto a dream."
        ]
    },
    {
        id: "xii_hanged_lefty",
        name: "XII - The Hanged Man",
        character: "Lefty",
        keywords: ["Artificial", "Synthesis", "Discarded"],
        readings: [
            "Mindset: You question your own authenticity. 'Am I real? Am I human?'",
            "Heart: A longing for warmth and connection you feel you don't deserve.",
            "Hands: You stitch yourself together from scraps, adapting to survive.",
            "Shadow: The pile of rejected parts and past versions of yourself you left behind.",
            "Soul: A heart beating with borrowed blood, seeking its own rhythm."
        ]
    },
    {
        id: "xiii_death_argalia",
        name: "XIII - Death",
        character: "Argalia",
        keywords: ["End", "Transformation", "Vibration"],
        readings: [
            "Mindset: You believe the world is discordant and must be 'tuned' through destruction.",
            "Heart: A twisted love; you hurt others because you believe it 'saves' them.",
            "Hands: You cut ties and end chapters abruptly. You are the conductor of the finale.",
            "Shadow: You are dancing to a rhythm only you can hear, isolating you from reality.",
            "Soul: A vibration seeking silence through absolute chaos."
        ]
    },
    {
        id: "xiv_temperance_angela",
        name: "XIV - Temperance",
        character: "Angela",
        keywords: ["Balance", "Patience", "Synthesis"],
        readings: [
            "Mindset: 'I deserve to be real.' You are seeking your own definition.",
            "Heart: A complex mix of resentment and longing toward your creators/parents.",
            "Hands: You are trying to balance your cold logic with new, overwhelming emotions.",
            "Shadow: You are willing to betray everyone to get what you feel you are owed.",
            "Soul: A machine dreaming it has a heart, learning what pain feels like."
        ]
    },
    {
        id: "xv_devil_honglu",
        name: "XV - The Devil",
        character: "Hong Lu",
        keywords: ["Bondage", "Materialism", "Ignorance"],
        readings: [
            "Mindset: Life is a game to be played. Why take it so serious?",
            "Heart: A detachment born of privilege; you struggle to truly understand suffering.",
            "Hands: You possess an eye that sees too much, yet you do not act on it.",
            "Shadow: A hidden family trauma masked by a pleasant, ignorant smile.",
            "Soul: A pristine jewel resting in a pile of filth, untouched but alone."
        ]
    },
    {
        id: "xvi_tower_bongbong",
        name: "XVI - The Tower",
        character: "Bong Bong",
        keywords: ["Disaster", "Upheaval", "Legend"],
        readings: [
            "Mindset: Chaos incarnate. No thoughts, just action.",
            "Heart: The pure, simple thrill of the hunt and survival.",
            "Hands: You are a force of nature; you destroy obstacles without hesitation.",
            "Shadow: You have no past and no future. You exist only in the glitch of the now.",
            "Soul: An anomaly that transcends the rules of the world."
        ]
    },
    {
        id: "xvii_star_xiao",
        name: "XVII - The Star",
        character: "Xiao",
        keywords: ["Hope", "Inspiration", "Fire"],
        readings: [
            "Mindset: Duty above all. You are the shield for your people.",
            "Heart: A burning grief that you have transformed into fuel for your fire.",
            "Hands: You lead by example, burning away impurities with your actions.",
            "Shadow: A crushing fear of failing those who look up to you.",
            "Soul: An iron will forged in fire, beautiful but rigid."
        ]
    },
    {
        id: "xviii_moon_haehwan",
        name: "XVIII - The Moon",
        character: "Haehwan",
        keywords: ["Censorship", "Spice", "Surveillance"],
        readings: [
            "Mindset: You self-censor your thoughts to stay safe from judgment.",
            "Heart: A spicy, rebellious desire that you constantly suppress.",
            "Hands: You cook up convenient lies or 'comfort food' to placate others.",
            "Shadow: You are your own jailer; the cage is in your head.",
            "Soul: A wild bird trapping itself in a cage of salt and pepper."
        ]
    },
    // ROW 3
    {
        id: "xvii_star_don",
        name: "XVII - The Star",
        character: "Don",
        keywords: ["Hope", "Dream", "Delusion"],
        readings: [
            "Mindset: Delusional heroism. You see giants where others see windmills.",
            "Heart: An untainted, blinding hope that refuses to die.",
            "Hands: You charge forward without a plan, driven by a dream.",
            "Shadow: Denial. You strictly refuse to see the ugliness of the world.",
            "Soul: A guiding light that burns too bright, risking burning everything around it."
        ]
    },
    {
        id: "xviii_moon_rodion",
        name: "XVIII - The Moon",
        character: "Rodion",
        keywords: ["Illusion", "Risk", "Guilt"],
        readings: [
            "Mindset: Fate is a gamble, and you are betting it all on red.",
            "Heart: A deep, eating guilt over what you did to survive.",
            "Hands: Impulsive action driven by hunger or cold.",
            "Shadow: You hide your sharp intelligence behind a facade of laziness.",
            "Soul: A shivering child wrapping themselves in a fur coat of bravado."
        ]
    },
    {
        id: "xviii_moon_torino",
        name: "XVIII - The Moon",
        character: "Torino",
        keywords: ["Cosmic", "Mystery", "Observer"],
        readings: [
            "Mindset: Your thoughts drift like satellites, detached from earthly concerns.",
            "Heart: A gravity that pulls everything in gently, yet remains distant.",
            "Hands: You float through life, observing without truly touching.",
            "Shadow: The dark side of the moon; the face you never show to anyone.",
            "Soul: A mysterious observer belonging to the stars, not the earth."
        ]
    },
    {
        id: "xix_sun_ishmael",
        name: "XIX - The Sun",
        character: "Ishmael",
        keywords: ["Success", "Clarity", "Obsession"],
        readings: [
            "Mindset: Single-minded obsession with your objective.",
            "Heart: A blazing anger that directs your entire life's course.",
            "Hands: You are a survivor; you navigate storms others would drown in.",
            "Shadow: You define yourself by your enemy. Without them, who are you?",
            "Soul: A sailor lost at sea, guided only by the burning sun of vengeance."
        ]
    },
    {
        id: "xx_judgement_sinclair",
        name: "XX - Judgement",
        character: "Sinclair",
        keywords: ["Judgment", "Rebirth", "Absolution"],
        readings: [
            "Mindset: You are torn between two worlds, paralyzed by the choice.",
            "Heart: A desperate need for someone to either punish you or redeem you.",
            "Hands: Hesitant inaction followed by explosive, uncontrollable bursts.",
            "Shadow: A deep, repressed rage against your lineage and past.",
            "Soul: A bird struggling to break out of the egg to be born."
        ]
    },
    {
        id: "xx_judgement_binah",
        name: "XX - Judgement",
        character: "Binah",
        keywords: ["Judgment", "Finality", "Chains"],
        readings: [
            "Mindset: Cold detachment. You see the chains of cause and effect.",
            "Heart: You find comfort in the inevitable end of things.",
            "Hands: You act as an arbiter; your actions are precise, cruel, and necessary.",
            "Shadow: You are a prisoner of your own knowledge and secrets.",
            "Soul: An ancient observer who has transcended human morality."
        ]
    },
    {
        id: "xx_judgement_purple",
        name: "XX - Judgement",
        character: "Purple Girl",
        keywords: ["Violet", "Fragment", "Patchwork"],
        readings: [
            "Mindset: You see the world in bruised, violet colors.",
            "Heart: A kaleidoscope of conflicting emotions, cycling between blue and red.",
            "Hands: You are sewing together the pieces of a broken past.",
            "Shadow: The color you refuse to see; the memory you cannot patch.",
            "Soul: A field of violets growing on a grave; beauty born from loss."
        ]
    },
    {
        id: "xxi_world_excalibur",
        name: "XXI - The World",
        character: "Excalibur",
        keywords: ["Glory", "Burden", "Weapon"],
        readings: [
            "Mindset: You believe you are chosen for a great purpose.",
            "Heart: The weight of expectation is crushing you.",
            "Hands: You cut through problems with legendary force, but lack finesse.",
            "Shadow: You fear you are just a tool in someone else's legend.",
            "Soul: A rusted blade waiting for a king who may never come."
        ]
    }
];

// Transform Logic
const transformedCards = CARD_DATABASE.map(card => {
    return {
        id: card.id,
        name: { en: card.name, ko: card.name, ja: card.name },
        character: { en: card.character, ko: card.character, ja: card.character },
        keywords: { en: card.keywords, ko: card.keywords, ja: card.keywords },
        readings: {
            en: card.readings,
            ko: card.readings,
            ja: card.readings
        }
    };
});

const POSITIONS = [
    {
        id: 0,
        title: "I. HEAD",
        desc: "MINDSET",
        guidance: "Examine the card's figure. Are they looking forward or backward? This reflects your current focus. Does the card imply control or chaos? This is how you perceive your own agency right now."
    },
    {
        id: 1,
        title: "II. HEART",
        desc: "DESIRE",
        guidance: "Look for the emotional core of the image. Is it warm or cold? Static or moving? This represents a desire you may not be admitting to yourself—or a fear that drives your heartbeat."
    },
    {
        id: 2,
        title: "III. HAND",
        desc: "ACTION",
        guidance: "Focus on the tools or weapons in the card. How is the character interacting with their world? This is your method of problem-solving. Are you building, destroying, or waiting?"
    },
    {
        id: 3,
        title: "IV. SHADOW",
        desc: "HIDDEN",
        guidance: "This position reveals what you repress. Consider the darker elements of the card art. What is the character ignoring? That is your blind spot."
    },
    {
        id: 4,
        title: "V. SOUL",
        desc: "ESSENCE",
        guidance: "This is the core. Strip away the context of the other cards. If this card was the only thing that existed, what story would it tell? This is your fundamental truth."
    }
];

const transformedPositions = POSITIONS.map(pos => {
    return {
        id: pos.id,
        title: { en: pos.title, ko: pos.title, ja: pos.title },
        desc: { en: pos.desc, ko: pos.desc, ja: pos.desc },
        guidance: { en: pos.guidance, ko: pos.guidance, ja: pos.guidance }
    };
});

const output = "DIVINATION_CARDS: " + JSON.stringify(transformedCards, null, 4) + ",\n" +
    "DIVINATION_POSITIONS: " + JSON.stringify(transformedPositions, null, 4);

fs.writeFileSync('divina_data.json', output, 'utf8');
