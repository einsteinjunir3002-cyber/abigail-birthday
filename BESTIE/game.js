// Abigail's Birthday Adventure - Main Game Script

// --- Canvas Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

let GAME_WIDTH = 800;
let GAME_HEIGHT = 600;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    GAME_WIDTH = canvas.width;
    GAME_HEIGHT = canvas.height;
    ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Level Textures & Seamless Patterns ---
function createOptimizedPattern(img, w, h) {
    try {
        const can = document.createElement('canvas');
        can.width = w;
        can.height = h;
        const c = can.getContext('2d');
        c.drawImage(img, 0, 0, w, h);
        return ctx.createPattern(can, 'repeat');
    } catch (e) {
        try { return ctx.createPattern(img, 'repeat'); } catch (err) { return null; }
    }
}

const sandImg = new Image();
sandImg.src = 'beach_sand.jpg';
let sandPattern = null;
sandImg.onload = () => { sandPattern = createOptimizedPattern(sandImg, 128, 128); };

const booksImg = new Image();
booksImg.src = 'ucc_books.jpg';
let booksPattern = null;
booksImg.onload = () => { booksPattern = createOptimizedPattern(booksImg, 128, 128); };

const carpetImg = new Image();
carpetImg.src = 'red_carpet.jpg';
let carpetPattern = null;
carpetImg.onload = () => { carpetPattern = createOptimizedPattern(carpetImg, 128, 128); };

// --- Game Constants ---
const GRAVITY = 0.62;
const FRICTION = 0.82;
const MAX_SPEED = 5.8;
const JUMP_POWER = -12.4;
const TILE_SIZE = 40;

// --- Game State ---
let gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER, VICTORY
let currentLevel = 1;
let score = 0;
let giftsFound = 0;
let timeElapsed = 0;
let startTime = 0;
let isBonusRound = false;
let bonusRoundTimer = 0;
const BONUS_ROUND_DURATION = 360; // 6 seconds at 60fps



const giftData = [
    {
        img: 'WhatsApp Image 2026-11-22 at 10.19.11 AM.jpeg',
        msg: "Hold on Abigail! Did you need a permit to cause this many heart attacks? That posture, that elegance, that dangerous face card! Certified 10/10 royalty! 🔥😍"
    },
    {
        img: 'WhatsApp Video 2026-11-24 at 8.17.17 PM.mp4',
        msg: "Special Motion Memory Unlocked! Seeing Abigail live in action is 1000x sweeter! That laugh is an absolute public hazard, you know that? 🎬💖"
    },
    {
        img: 'WhatsApp Image 2026-11-22 at 10.19.12 AM (1).jpeg',
        msg: "Warning: That toothy smile could power an entire city! Too bright, too sweet, and entirely too cute! Don't you ever stop laughing like that, Abigail! 😁✨"
    },
    {
        img: 'WhatsApp Video 2026-11-24 at 8.17.27 PM.mp4',
        msg: "Pure superstar energy! You make living life look like a high-budget music video! Happy Birthday, most gorgeous troublemaker! 💃🎉"
    },
    {
        img: 'WhatsApp Image 2026-11-22 at 10.19.12 AM.jpeg',
        msg: "Are you made of copper and tellurium? Because you are Cu-Te, Abigail! How does someone wake up and look this effortlessly charming? 🤭💘"
    },
    {
        img: 'WhatsApp Video 2026-11-24 at 8.17.38 PM.mp4',
        msg: "That playful charming energy! Honestly, being your friend and personal paparazzi is proof that my personal taste in people is absolutely god-tier! 📸😉"
    },
    {
        img: 'WhatsApp Image 2026-11-22 at 10.19.13 AM.jpeg',
        msg: "Wait a second Abigail, is this a casual picture or a Vogue magazine cover? The melanin, the glow, the queen energy—totally unmatched! 👑💫"
    },
    {
        img: 'WhatsApp Video 2026-11-24 at 8.17.40 PM.mp4',
        msg: "A smile so radiant it makes the sun look like an amateur! Keep being fine, keep being funny, and keep ruling your universe! ☀️🥰"
    },
    {
        img: 'WhatsApp Image 2026-11-22 at 10.19.13 AM (1).jpeg',
        msg: "Casual, fresh, and cute on 100%! If looking this pretty was illegal, you'd be serving multiple life sentences without parole! 🚨💖"
    },
    {
        img: 'WhatsApp Video 2026-11-24 at 8.16.38 PM.mp4',
        msg: "Look at that cheeky energy! Don't let anyone fool you, Abigail is 100% charming trouble and I am completely here for it! 😜🥂"
    },
    {
        img: 'WhatsApp Image 2026-11-22 at 10.19.13 AM (2).jpeg',
        msg: "They say perfection doesn't exist, but then Abigail posted this photo and proved everyone wrong! Certified baddie! 💅🔥"
    },
    {
        img: 'WhatsApp Video 2026-11-24 at 8.17.20 PM.mp4',
        msg: "Soft life, good vibes, and the prettiest birthday girl alive! May this new chapter bring you fat blessings and pure peace of mind! 🍾🎈"
    },
    {
        img: 'WhatsApp Video 2026-11-24 at 8.17.35 PM.mp4',
        msg: "If smiles were currency, Abigail would have bought out the entire country by now! You are hopelessly cute! 💸😍"
    },
    {
        img: 'WhatsApp Video 2026-11-24 at 8.17.48 PM.mp4',
        msg: "Cocky truth: Anyone else might try to bring glitter to the party, but you? You ARE the entire sparkle! Happy Birthday gorgeous! ✨💌"
    },
    {
        img: 'WhatsApp Video 2026-11-24 at 8.17.49 PM.mp4',
        msg: "Final Motion Secret: You are deeply loved, wildly appreciated, and ridiculously attractive. Happy Birthday Queen Abigail! 👑🎂💖"
    }
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Smart non-repeating gift deck
let giftDeck = [];
let giftDeckIndex = 0;
let lastGiftImage = null;

function initGiftDeck() {
    giftDeck = [...giftData];
    shuffleArray(giftDeck);
    
    // Ensure that no two identical images are adjacent in the deck
    for (let i = 1; i < giftDeck.length; i++) {
        if (giftDeck[i].img === giftDeck[i - 1].img) {
            for (let j = 0; j < giftDeck.length; j++) {
                if (j !== i && j !== i - 1 && giftDeck[j].img !== giftDeck[i].img) {
                    [giftDeck[i], giftDeck[j]] = [giftDeck[j], giftDeck[i]];
                    break;
                }
            }
        }
    }
    
    // Ensure the first item of new deck does not match the last image seen from the previous deck
    if (lastGiftImage && giftDeck.length > 1 && giftDeck[0].img === lastGiftImage) {
        for (let j = 1; j < giftDeck.length; j++) {
            if (giftDeck[j].img !== lastGiftImage) {
                [giftDeck[0], giftDeck[j]] = [giftDeck[j], giftDeck[0]];
                break;
            }
        }
    }
    giftDeckIndex = 0;
}

function getNextGift() {
    if (giftDeck.length === 0 || giftDeckIndex >= giftDeck.length) {
        initGiftDeck();
    }
    const gift = giftDeck[giftDeckIndex];
    giftDeckIndex++;
    lastGiftImage = gift.img;
    return gift;
}
let animationFrameId;

// --- Audio ---
const bgm = document.getElementById('bgm');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'collect') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'hurt') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }
}

// --- Input Handling ---
const keys = {
    ArrowLeft: false, a: false,
    ArrowRight: false, d: false,
    ArrowUp: false, w: false, " ": false,
    ArrowDown: false, s: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
    }
    if (gameState === 'CUTSCENE' && cutscenePhase >= 1 && (e.key === ' ' || e.key === 'Enter')) {
        triggerVictory();
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Enhanced Mobile Controls (Multi-touch, Pointer & Touch Support)
const triggerAction = (key, val, e) => {
    if (e && e.cancelable) e.preventDefault();
    if (val && gameState === 'CUTSCENE' && cutscenePhase >= 1) { triggerVictory(); return; }
    keys[key] = val;
};

['touchstart', 'mousedown', 'pointerdown'].forEach(evt => {
    const bl = document.getElementById('btnLeft');
    const br = document.getElementById('btnRight');
    const bj = document.getElementById('btnJump');
    const bs = document.getElementById('btnShoot');
    if (bl) bl.addEventListener(evt, (e) => triggerAction('ArrowLeft', true, e), { passive: false });
    if (br) br.addEventListener(evt, (e) => triggerAction('ArrowRight', true, e), { passive: false });
    if (bj) bj.addEventListener(evt, (e) => triggerAction('ArrowUp', true, e), { passive: false });
    if (bs) bs.addEventListener(evt, (e) => triggerAction(' ', true, e), { passive: false });
});

['touchend', 'mouseup', 'mouseleave', 'touchcancel', 'pointerup', 'pointercancel'].forEach(evt => {
    const bl = document.getElementById('btnLeft');
    const br = document.getElementById('btnRight');
    const bj = document.getElementById('btnJump');
    const bs = document.getElementById('btnShoot');
    if (bl) bl.addEventListener(evt, (e) => triggerAction('ArrowLeft', false, e), { passive: false });
    if (br) br.addEventListener(evt, (e) => triggerAction('ArrowRight', false, e), { passive: false });
    if (bj) bj.addEventListener(evt, (e) => triggerAction('ArrowUp', false, e), { passive: false });
    if (bs) bs.addEventListener(evt, (e) => triggerAction(' ', false, e), { passive: false });
});

// Always ensure mobile controls are visible on touch or mobile-sized screens
if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024) {
    const mc = document.getElementById('mobileControls');
    if (mc) mc.classList.remove('hidden');
}

// Check touch support to show controls
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.getElementById('mobileControls').classList.remove('hidden');
}

// --- Levels ---
// 0: Air, 1: Solid block, 2: Collectible (Cupcake), 3: Enemy Spawner, 4: Gift, 5: Goal, 6: Spikes
// Secret room portal: 7
const levels = [
    {
        // Level 1: Birthday Meadow - Mario staircase: ground -> step1 -> step2 -> step3 -> step4 -> step5 -> GOAL
        name: "Birthday Meadow",
        theme: "meadow",
        tileType: "grass",
        map: [
            "1111111111111111111111111111111111111111",  // 0  ceiling
            "1000000000000000000000000000000000000001",  // 1
            "1000000000000000000000000000000000000001",  // 2
            "1000000000000000000000000000000000000001",  // 3
            "1000000000000000000000000000004000020001",  // 4  bonus cupcake at top right col 36, gift col 30
            "1000000000000000000000000000000000005001",  // 5  GOAL (portal) col 36
            "1000000000000000000000004000000001111001",  // 6  GOAL platform cols 33-36, gift col 24
            "1000000000000000000000000000011110000001",  // 7  step5 cols 28-31
            "1000000000000000000000011110000000000001",  // 8  step4 cols 22-25
            "1000000000000020084000000000000000000001",  // 9  cupcake col 14, ant, gift col 18
            "1000000000000000011110000000000000000001",  // 10 step3 cols 16-19
            "1000000020084000000000000000000000000001",  // 11 cupcake col 7, ant, gift col 12
            "1000000000011110000000000000000000000001",  // 12 step2 cols 10-13
            "1000000000000000000020000000000000000001",  // 13 extra cupcake
            "1000020800000000000000000000000000000001",  // 14 cupcake col 4 (reward on step1), ant
            "1001111000000000000000000000000000000001",  // 15 step1 cols 2-5
            "1000000000000000040000000000000000000001",  // 16 gift col 17
            "10P0020800000300000000000000000000000001",  // 17 player col2, cupcake col5, ant col6, bomb col12
            "1111111111111111111111111111111111111111",  // 18 ground floor
            "1111111111111111111111111111111111111111"   // 19
        ],
        targetScore: 3,
        bg: '#87CEEB',
        floorColor: '#7CFC00'
    },
    {
        // Level 2: Gift Valley
        name: "Gift Valley",
        theme: "valley",
        tileType: "candy",
        map: [
            "1111111111111111111111111111111111111111",  // 0
            "1000000000000000000000000000000000000001",  // 1
            "1000000000000000000000000000000000000001",  // 2
            "1000000000000000000000000000000000000001",  // 3
            "1000000000000000004000000000000000000001",  // 4 gift high right
            "1000000000000000111100000000000000000001",  // 5 platform under gift
            "1000000000000000000000000000020000000001",  // 6 cupcake high left
            "1001111000000000000000000000111000000001",  // 7 left HIGH + right
            "1000000000020080000000000000000000000001",  // 8  ant
            "1000000000111110000000000000000000000001",  // 9 MID platform center
            "1000000000000000000000000003000000000001",  // 10 bomb
            "1000000000000000008000011110000000000001",  // 11 ant on MID right
            "1000000000000000000000000000000000000001",  // 12
            "1000000020000000000000000000000004000001",  // 13 extra cupcake col 8, gift
            "1001111100000000000000000000001111100001",  // 14 STEP platforms
            "1000000000000000000000000000000000000001",  // 15
            "1000080000000000000000000000000800000001",  // 16 ants
            "10P9020030000080000000000020000000007051",  // 17 player, BACK-DOOR col3, cupcake col5, bomb, ant, items, portal
            "1111000001110000011111111000001111111111",  // 18 broken floor
            "1111666661116666611111111666661111111111"   // 19 spikes
        ],
        targetScore: 10,
        bg: '#FFB6C1',
        floorColor: '#FF69B4'
    },
    {
        // Level 3: Goblin Castle (Boss level)
        name: "Goblin Castle",
        theme: "castle",
        tileType: "stone",
        map: [
            "1111111111111111111111111111111111111111",  // 0
            "1000000000000000000000000000000000000001",  // 1
            "1000000000020002000200000000000000000001",  // 2 (+3 cupcakes)
            "1000000000000000000002000000000000000001",  // 3 cupcake high
            "1000000000000011110000000000000000000001",  // 4 HIGHEST platform
            "1000020000000000000000000000020000000001",  // 5 (+2 cupcakes)
            "1000000000000000000000000000030000000001",  // 6 bomb
            "1000000000000000000000001111100000000001",  // 7 castle rampart right
            "1001111002002000000000000000000000000001",  // 8 castle rampart left (+2 cupcakes)
            "1000000000000000002000000000000000000001",  // 9
            "1000000000000011100000001110000000000001",  // 10 mid platforms
            "1000000000000020000000200000000000000001",  // 11 (+2 cupcakes)
            "1000000000200000000000000000000000000001",  // 12 extra cupcake
            "1001110000000000000000000000000001110001",  // 13 step platforms
            "1000000200000000000000000000000200000001",  // 14 (+2 cupcakes)
            "1000000000000000000000000000000000000001",  // 15
            "1000000000000000000000000000000000000001",  // 16
            "100P002000000000000000000000B00B00000001",  // 17 ground with 2 bosses, extra cupcake
            "1111111111111111111111111111111111111111",  // 18
            "1111111111111111111111111111111111111111"   // 19
        ],
        targetScore: 0,
        bg: '#483D8B',
        floorColor: '#696969'
    },
    {
        // Level 4: Cape Coast Beach & Coconut Grove
        name: "Sunset Beach Paradise",
        theme: "beach",
        tileType: "sand",
        map: [
            "1111111111111111111111111111111111111111",  // 0  open sky ceiling
            "1000000000000000000000000000000000000001",  // 1
            "1000000000000000000000000000000000000001",  // 2
            "1000000000000000000000000000000000000001",  // 3
            "1000000000000000000000000000000000400001",  // 4  gift high right
            "1000000000000000000000000000000011110001",  // 5  high platform
            "1000000000000000000400000000000000000001",  // 6  gift mid
            "1000000000000000111110000000000000000001",  // 7  boardwalk
            "1000000002000000000000000000000200000001",  // 8  cupcakes
            "1000000111100000000000000000111100000001",  // 9  dune platforms
            "1000000000000000000000000000000000000001",  // 10
            "1000000000000000000000000000000000000501",  // 11 beach exit portal
            "1001111000000000000000000000000000111111",  // 12 pier for portal
            "10000000000200C00000000200C0000000000001",  // 13 crabs
            "1000000001111110000001111110000000000001",  // 14 mid dunes
            "1000000000000000000000000000000000400001",  // 15 gift
            "1000000000000000000000000000000111110001",  // 16
            "10P0020000000000200C00000000000000000001",  // 17 player, cupcakes, crab
            "1111111100000111111111100000111111111111",  // 18 broken shore
            "1111111166666111111111166666111111111111"   // 19 deep ocean water spikes
        ],
        targetScore: 4,
        bg: '#ffaf7b',
        floorColor: '#f4d06f'
    },
    {
        // Level 5: Glamour Boulevard
        name: "Glamour Boulevard",
        theme: "study",
        tileType: "books",
        map: [
            "1111111111111111111111111111111111111111",  // 0
            "1000000000000000000000000000000000000001",  // 1
            "1000000000000000000000000000000000000001",  // 2
            "1000000000000000000000000000000000000501",  // 3  exit portal
            "1000000000000000000000000000000000111111",  // 4  high podium
            "1000000000000000000000000000000000000001",  // 5
            "1000000000000000000040000000000000000001",  // 6  gift
            "1000000000000000011111000000000000000001",  // 7  lecture desk
            "1000000000020000000000000002000000000001",  // 8  cupcakes
            "1000000011111000000000001111100000000001",  // 9  study desks
            "1000000000000000000000000000000000000001",  // 10
            "1001111000000000000000000000000011110001",  // 11
            "1000000000000000000400000000000000000001",  // 12 gift
            "1000000000000001111110000000000000000001",  // 13
            "100000000200A0000000000200A0000000000001",  // 14 alarm clock enemies
            "1000001111110000000011111100000000000001",  // 15
            "1000000000000000000000000000000000400001",  // 16 gift
            "10P0020000000000000000000000000011111001",  // 17 player, cupcake
            "1111111111000001111111111000001111111111",  // 18 broken floor
            "1111111111666661111111111666661111111111"   // 19 exam pressure spikes
        ],
        targetScore: 5,
        bg: '#203a43',
        floorColor: '#8b4513'
    },
    {
        // Level 6: Queen's Coronation & Krakens
        name: "Queen's Coronation",
        theme: "convocation",
        tileType: "carpet",
        map: [
            "1111111111111111111111111111111111111111",  // 0
            "1000000000000000000000000000000000000001",  // 1
            "1000000000000000000000000000000000000001",  // 2
            "1000000000000000000000000000000000000001",  // 3
            "1000000000000000000000000000000000000001",  // 4
            "1000000000000000000000000000000000000001",  // 5
            "1000000000000000000000000000000040000001",  // 6  royal gift
            "1000000000000000000000000000001111111001",  // 7  balcony
            "1000000000000000000000000000000000000001",  // 8
            "1000000000000000000040000000000000000001",  // 9  royal gift
            "1000000000000000011111100000000000000001",  // 10
            "1000000002000000000000000000000000000001",  // 11 cupcake
            "1000000111110000000000000000000000000001",  // 12 red carpet steps
            "1000000000000000000000000000000000000001",  // 13
            "1001111000000000000000000000000000000001",  // 14
            "1000000000000000000000000000000000000001",  // 15
            "1000000000000000000000000000000000000001",  // 16
            "10P00200000000000000000000000000B0000001",  // 17 Player at left, Final Boss Titan at right
            "1111111111111111111111111111111111111111",  // 18 solid Great Hall red carpet floor
            "1111111111111111111111111111111111111111"   // 19
        ],
        targetScore: 0,
        bg: '#2b0938',
        floorColor: '#800020'
    }
];

// --- Engine Classes ---
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.initialized = false;
    }
    update(target) {
        if (!target) return;
        // Center on target with slight vertical look-ahead
        let targetX = target.x - GAME_WIDTH / 2;
        let targetY = target.y - GAME_HEIGHT / 2 + 80;
        
        // Clamp target to level bounds
        const maxScrollX = mapWidth * TILE_SIZE - GAME_WIDTH;
        if (maxScrollX <= 0) {
            targetX = (mapWidth * TILE_SIZE - GAME_WIDTH) / 2;
        } else {
            targetX = Math.max(0, Math.min(maxScrollX, targetX));
        }
        
        const maxScrollY = mapHeight * TILE_SIZE - GAME_HEIGHT;
        if (maxScrollY <= 0) {
            targetY = 0;
        } else {
            targetY = Math.max(0, Math.min(maxScrollY, targetY));
        }

        // On first frame or level load, snap immediately
        if (!this.initialized) {
            this.x = targetX;
            this.y = targetY;
            this.initialized = true;
            return;
        }

        // Smooth camera follow (lerp) for buttery smooth motion
        this.x += (targetX - this.x) * 0.10;
        this.y += (targetY - this.y) * 0.09;
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 48; // Taller than a tile so they must crouch under 1-tile gaps
        this.vx = 0;
        this.vy = 0;
        this.speed = MAX_SPEED;
        this.grounded = false;
        this.crouching = false;
        this.hp = 3;
        this.invulnerable = 0;
        this.facingRight = true;
        this.jumps = 0;
        this.maxJumps = 2;
        this.jumpKeyWasPressed = false;
        this.shootKeyWasPressed = false;
        this.coyoteTimer = 0;
        this.jumpBuffer = 0;
    }

    update() {
        if (this.invulnerable > 0) this.invulnerable--;

        // Coyote time & Jump buffering
        if (this.grounded) {
            this.coyoteTimer = 6;
        } else if (this.coyoteTimer > 0) {
            this.coyoteTimer--;
        }

        const jumpPressed = keys.ArrowUp || keys.w;
        if (jumpPressed && !this.jumpKeyWasPressed) {
            this.jumpBuffer = 6;
        } else if (this.jumpBuffer > 0) {
            this.jumpBuffer--;
        }

        // Responsive Input & Acceleration
        const accel = 1.1;
        const turnAccel = 2.0;
        if (keys.ArrowLeft || keys.a) {
            if (this.vx > 0) {
                this.vx -= turnAccel; // Crisp skid-turn when reversing direction
            } else {
                this.vx -= accel;
            }
            this.facingRight = false;
        } else if (keys.ArrowRight || keys.d) {
            if (this.vx < 0) {
                this.vx += turnAccel; // Crisp skid-turn when reversing direction
            } else {
                this.vx += accel;
            }
            this.facingRight = true;
        } else {
            this.vx *= FRICTION;
        }
        
        // Crouch
        if ((keys.ArrowDown || keys.s) && this.grounded) {
            if (!this.crouching) {
                this.y += (this.h - this.h / 1.5); // Move top edge down
                this.crouching = true;
            }
            this.vx *= 0.5; // Slow down when crouching
        } else {
            if (this.crouching) {
                this.y -= (this.h - this.h / 1.5); // Move top edge back up
                this.crouching = false;
            }
        }

        // Clamp velocity
        const maxSpd = this.crouching ? this.speed * 0.5 : this.speed;
        if (this.vx > maxSpd) this.vx = maxSpd;
        if (this.vx < -maxSpd) this.vx = -maxSpd;
        if (Math.abs(this.vx) < 0.15) this.vx = 0;

        // Jump execution with coyote time & jump buffering
        if (this.jumpBuffer > 0) {
            if (this.coyoteTimer > 0) {
                this.vy = JUMP_POWER;
                this.grounded = false;
                this.coyoteTimer = 0;
                this.jumpBuffer = 0;
                this.jumps = 1;
                playSound('jump');
            } else if (this.jumps < this.maxJumps) {
                this.vy = JUMP_POWER;
                this.jumpBuffer = 0;
                this.jumps++;
                playSound('jump');
            }
        }

        // Variable jump height on button release
        if (!jumpPressed && this.vy < -4) {
            this.vy *= 0.65;
        }
        this.jumpKeyWasPressed = jumpPressed;

        // Shoot
        const shootPressed = keys[" "];
        if (shootPressed && !this.shootKeyWasPressed) {
            const vx = this.facingRight ? 9.5 : -9.5;
            projectiles.push(new Projectile(this.x + this.w/2, this.y + this.h/2 - 10, vx, 0, true, 'orange', 8));
            playSound('jump');
        }
        this.shootKeyWasPressed = shootPressed;

        this.vy += GRAVITY;

        // Physics X
        this.x += this.vx;
        this.checkCollisions('x');

        // Physics Y
        this.y += this.vy;
        this.checkCollisions('y');
        
        // Death by falling
        if (this.y > mapHeight * TILE_SIZE) {
            this.takeDamage(100); // instant death
        }
    }

    checkCollisions(axis) {
        this.grounded = false;
        
        let currentH = this.crouching ? this.h / 1.5 : this.h;

        // Determine grid cells the player occupies
        const left = Math.floor(this.x / TILE_SIZE);
        const right = Math.floor((this.x + this.w - 0.1) / TILE_SIZE);
        const top = Math.floor(this.y / TILE_SIZE);
        const bottom = Math.floor((this.y + currentH - 0.1) / TILE_SIZE);

        for (let r = top; r <= bottom; r++) {
            for (let c = left; c <= right; c++) {
                const tile = getTile(c, r);
                if (tile === 1) { // Solid wall
                    const tx = c * TILE_SIZE;
                    const ty = r * TILE_SIZE;

                    if (axis === 'x') {
                        if (this.vx > 0) {
                            this.x = tx - this.w;
                            this.vx = 0;
                        } else if (this.vx < 0) {
                            this.x = tx + TILE_SIZE;
                            this.vx = 0;
                        }
                    } else if (axis === 'y') {
                        if (this.vy > 0) {
                            this.y = ty - currentH;
                            this.vy = 0;
                            this.grounded = true;
                            this.jumps = 0;
                        } else if (this.vy < 0) {
                            this.y = ty + TILE_SIZE;
                            this.vy = 0;
                        }
                    }
                } else if (tile === 6) { // Spikes
                    if (this.y + currentH > r * TILE_SIZE + 20) { // Simple hitbox for spikes
                        this.takeDamage(1);
                        this.vy = -8; // bounce off spikes
                    }
                }
            }
        }
    }

    takeDamage(amount) {
        if (this.invulnerable > 0) return;
        this.hp -= amount;
        playSound('hurt');
        this.invulnerable = 60; // 1 second of i-frames
        updateHUD();
        
        if (this.hp <= 0) {
            gameState = 'GAMEOVER';
            showOverlay('gameOverOverlay');
        }
    }

    draw(ctx, camX, camY) {
        // Flash if invulnerable
        if (this.invulnerable > 0 && Math.floor(Date.now() / 100) % 2 === 0) return;

        ctx.save();
        ctx.translate(this.x - camX + this.w/2, this.y - camY + this.h/2);
        if (!this.facingRight) ctx.scale(-1, 1);
        
        // Crouching offset
        const crouchOffset = this.crouching ? 10 : 0;
        
        ctx.save();
        ctx.translate(0, crouchOffset);

        // Legs
        ctx.strokeStyle = '#ffdfc4'; // Skin tone
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Left leg
        ctx.moveTo(-5, 20);
        ctx.lineTo(-7, 30 - crouchOffset/2);
        // Right leg
        ctx.moveTo(5, 20);
        ctx.lineTo(7, 30 - crouchOffset/2);
        ctx.stroke();

        // Arms (Hands)
        ctx.beginPath();
        // Left arm
        ctx.moveTo(-10, 5);
        ctx.lineTo(-15, 15);
        // Right arm
        ctx.moveTo(10, 5);
        ctx.lineTo(15, 15);
        ctx.stroke();

        // Body (Dress)
        ctx.fillStyle = '#ff7096'; // Dress
        ctx.beginPath();
        ctx.moveTo(-10, 20);
        ctx.lineTo(10, 20);
        ctx.lineTo(12, 0);
        ctx.lineTo(-12, 0);
        ctx.fill();
        
        // Pigtails (Hair)
        ctx.fillStyle = '#3a2e25'; // Hair
        ctx.beginPath();
        ctx.arc(-15, -10, 6, 0, Math.PI * 2);
        ctx.arc(15, -10, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#ffdfc4'; // Skin tone
        ctx.beginPath();
        ctx.arc(0, -15, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair Top
        ctx.fillStyle = '#3a2e25'; // Hair
        ctx.beginPath();
        ctx.arc(0, -18, 16, Math.PI, 0);
        ctx.fill();
        
        // Crown
        ctx.fillStyle = '#ffd166'; // Gold
        ctx.beginPath();
        ctx.moveTo(-10, -32);
        ctx.lineTo(-5, -20);
        ctx.lineTo(0, -35);
        ctx.lineTo(5, -20);
        ctx.lineTo(10, -32);
        ctx.lineTo(10, -18);
        ctx.lineTo(-10, -18);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(5, -15, 2, 0, Math.PI * 2);
        ctx.arc(10, -15, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(7.5, -10, 3, 0, Math.PI);
        ctx.stroke();

        ctx.restore();

        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 32;
        this.vx = type === 'alarm' ? 2.6 : (type === 'crab' ? 1.8 : 1.5);
        this.vy = 0;
        this.type = type; // 'ant', 'crab', 'alarm', 'paper', 'bomb'
        this.active = true;
        this.timer = Math.random() * 100;
    }
    update() {
        if (!this.active) return;
        this.timer++;
        
        if (this.type === 'ant' || this.type === 'crab' || this.type === 'alarm') {
            // Apply gravity so ground enemies stay on bricks
            this.vy = (this.vy || 0) + GRAVITY;
            this.y += this.vy;
            
            // Vertical collision with tiles
            const col = Math.floor((this.x + this.w / 2) / TILE_SIZE);
            const botRow = Math.floor((this.y + this.h) / TILE_SIZE);
            if (getTile(col, botRow) === 1) {
                this.y = botRow * TILE_SIZE - this.h;
                this.vy = 0;
            }
            
            // Horizontal patrol
            this.x += this.vx;
            // Turn at ledge (no tile below next step) or wall
            const ahead = this.vx > 0 ? Math.floor((this.x + this.w) / TILE_SIZE) : Math.floor(this.x / TILE_SIZE);
            const belowAhead = Math.floor((this.y + this.h + 2) / TILE_SIZE);
            if (getTile(ahead, Math.floor(this.y / TILE_SIZE)) === 1 || getTile(ahead, belowAhead) === 0) {
                this.vx *= -1;
            }
        } else if (this.type === 'paper') {
            // Paper gently hovers and floats back and forth
            this.x += this.vx;
            this.y += Math.sin(this.timer * 0.08) * 1.5;
            const ahead = this.vx > 0 ? Math.floor((this.x + this.w) / TILE_SIZE) : Math.floor(this.x / TILE_SIZE);
            if (getTile(ahead, Math.floor(this.y / TILE_SIZE)) === 1 || this.x < 50 || this.x > (mapWidth - 2) * TILE_SIZE) {
                this.vx *= -1;
            }
        } else if (this.type === 'bomb') {
            // Bombs also fall and rest on solid surfaces (stationary once landed)
            this.vy = (this.vy || 0) + GRAVITY;
            this.y += this.vy;
            const col = Math.floor((this.x + this.w / 2) / TILE_SIZE);
            const botRow = Math.floor((this.y + this.h) / TILE_SIZE);
            if (getTile(col, botRow) === 1) {
                this.y = botRow * TILE_SIZE - this.h;
                this.vy = 0;
            }
        }

        // Check collision with player
        if (rectIntersect(this, player)) {
            player.takeDamage(1);
        }
    }
    draw(ctx, camX, camY) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x - camX, this.y - camY);
        ctx.font = '32px sans-serif';
        if (this.type === 'bomb') {
            ctx.fillText('💣', 0, 30); 
        } else if (this.type === 'ant') {
            ctx.fillText('🐜', 0, 30);
        } else if (this.type === 'crab') {
            // Beach Crab with snapping claws
            const clawBob = Math.sin(this.timer * 0.2) * 2;
            ctx.save();
            ctx.translate(0, clawBob);
            ctx.fillText('🦀', 0, 30);
            ctx.restore();
        } else if (this.type === 'alarm') {
            // Buzzing Alarm Clock
            const rattle = Math.sin(this.timer * 0.5) * 2;
            ctx.save();
            ctx.translate(rattle, 0);
            ctx.fillText('⏰', 0, 30);
            ctx.restore();
        } else if (this.type === 'paper') {
            ctx.fillText('📝', 0, 30);
        } else {
            ctx.fillText('👹', 0, 30);
        }
        ctx.restore();
    }
}

class BirdEnemy {
    constructor(x, y, direction = -1, speed = 3.2, type = 'seagull') {
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.w = type === 'mortarboard' ? 32 : (type === 'paper' ? 30 : 38);
        this.h = 28;
        this.vx = direction * speed;
        this.vy = 0;
        this.type = type; // 'seagull', 'paper', 'mortarboard'
        this.active = true;
        this.flapTimer = Math.random() * 10;
        this.bobFreq = type === 'mortarboard' ? 0.025 : (0.04 + Math.random() * 0.02);
        this.bobAmp = type === 'mortarboard' ? 14 : (22 + Math.random() * 12);
        this.timeAlive = 0;
        this.rot = 0;
    }

    update() {
        if (!this.active) return;
        this.timeAlive++;
        this.x += this.vx;
        this.y = this.baseY + Math.sin(this.timeAlive * this.bobFreq) * this.bobAmp;
        this.flapTimer += 0.22;
        this.rot += this.type === 'mortarboard' ? 0.035 : 0.08;

        // Deactivate when far off level
        if (this.vx < 0 && this.x < -120) this.active = false;
        if (this.vx > 0 && this.x > (mapWidth * TILE_SIZE) + 120) this.active = false;

        // Collide with player
        if (rectIntersect(this, player)) {
            player.takeDamage(1);
        }
    }

    draw(ctx, camX, camY) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x - camX + this.w / 2, this.y - camY + this.h / 2);

        if (this.type === 'mortarboard') {
            // Spinning graduation cap
            ctx.rotate(this.rot);
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🎓', 0, 0);
        } else if (this.type === 'paper') {
            // Swooping paper airplane / exam wisp
            if (this.vx > 0) ctx.scale(-1, 1);
            ctx.rotate(Math.sin(this.timeAlive * this.bobFreq) * 0.25);
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✈️', 0, 0);
        } else {
            // Coastal Seagull (Custom Animated 2D Vector)
            if (this.vx > 0) ctx.scale(-1, 1);

            const wingFlap = Math.sin(this.flapTimer);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.beginPath();
            ctx.ellipse(0, 24, 14, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Body
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Gray tail tips
            ctx.fillStyle = '#495057';
            ctx.beginPath();
            ctx.moveTo(10, -2);
            ctx.lineTo(20, -5);
            ctx.lineTo(18, 3);
            ctx.closePath();
            ctx.fill();

            // Head & Eye
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-12, -2, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-14, -4, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Bright Yellow Beak
            ctx.fillStyle = '#ffb703';
            ctx.beginPath();
            ctx.moveTo(-18, -3);
            ctx.lineTo(-26, -1);
            ctx.lineTo(-18, 1);
            ctx.closePath();
            ctx.fill();

            // Animated Flapping Wings
            ctx.fillStyle = '#e9ecef';
            ctx.strokeStyle = '#6c757d';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-2, -2);
            const wingTipY = -18 * wingFlap;
            ctx.quadraticCurveTo(4, wingTipY - 6, 8, wingTipY);
            ctx.quadraticCurveTo(8, wingTipY + 4, 6, 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }
}

class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 32;
        this.type = type; // 'cupcake', 'gift', 'portal'
        this.active = true;
        this.floatOffset = Math.random() * Math.PI;
        this.cooldown = 0;
    }
    update() {
        if (!this.active) return;
        if (this.cooldown > 0) this.cooldown--;
        
        // Check collision with player
        if (this.cooldown === 0 && rectIntersect(this, player)) {
            this.collect();
        }
    }
    collect() {
        if (this.type === 'portal') {
            const remainingGifts = collectibles.filter(c => c.type === 'gift' && c.active).length;
            
            if (remainingGifts === 0) {
                this.active = false;
                levelComplete();
            } else {
                let msg = `You must collect ${remainingGifts} more gift${remainingGifts !== 1 ? 's' : ''}!`;
                this.cooldown = 60; // 1 second cooldown so it doesn't spam
                player.x -= (player.vx || 2); // gently push player back
                showMessage(msg);
            }
        } else if (this.type === 'backportal') {
            this.cooldown = 60;
            player.x -= (player.vx || 2);
            gameState = 'PAUSED';
            showOverlay('confirmOverlay');
        } else {
            this.active = false;
            if (this.type === 'bonus_cupcake') {
                score++;
                player.hp++; // Each bonus cupcake directly grants +1 health!
                playSound('collect');
                spawnParticles(this.x, this.y, '#ffd700');
                spawnParticles(this.x, this.y, '#ff477e');
                updateHUD();
            } else if (this.type === 'cupcake') {
                score++;
                if (score > 0 && score % 2 === 0) {
                    player.hp++; // Grant an extra life every 2 cupcakes indefinitely
                }
                playSound('collect');
                spawnParticles(this.x, this.y, '#ffd166');
                updateHUD();
            } else if (this.type === 'gift') {
                giftsFound++;
                playSound('collect');
                spawnParticles(this.x, this.y, '#ff477e');
                updateHUD();
                showSecretMessage();
            }
        }
    }
    draw(ctx, camX, camY) {
        if (!this.active) return;
        ctx.save();
        // Floating animation
        const yOffset = Math.sin(Date.now() / 200 + this.floatOffset) * 5;
        ctx.translate(this.x - camX, this.y - camY + yOffset);
        
        ctx.font = '32px sans-serif';
        if (this.type === 'bonus_cupcake') {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(16, 16, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText('🧁', 0, 30);
        } else if (this.type === 'cupcake') ctx.fillText('🧁', 0, 30);
        else if (this.type === 'gift') ctx.fillText('🎁', 0, 30);
        else if (this.type === 'portal') {
            ctx.fillStyle = 'rgba(0, 255, 204, 0.28)';
            ctx.beginPath();
            ctx.arc(16, 16, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText('🚪', 0, 30);
        }
        else if (this.type === 'backportal') {
            ctx.fillStyle = 'rgba(255, 170, 0, 0.28)';
            ctx.beginPath();
            ctx.arc(16, 16, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText('🔙', 0, 30);
        }
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10 - 2;
        this.color = color;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.02;
        this.size = Math.random() * 5 + 3;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // Gravity
        this.life -= this.decay;
    }
    draw(ctx, camX, camY) {
        if (this.life <= 0) return;
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - camX, this.y - camY, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

class Projectile {
    constructor(x, y, vx, vy, isPlayer, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.isPlayer = isPlayer;
        this.color = color;
        this.size = size;
        this.active = true;
        this.w = size * 2;
        this.h = size * 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > mapWidth * TILE_SIZE || this.y < 0 || this.y > mapHeight * TILE_SIZE) {
            this.active = false;
        }
    }
    draw(ctx, camX, camY) {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - camX + this.size, this.y - camY + this.size, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Boss class
class Boss {
    constructor(x, y, bossType = 'goblin', subType = null) {
        this.x = x;
        this.y = y;
        this.bossType = bossType; // 'goblin', 'titan', or 'kraken'
        this.subType = subType; // 'kraken_left', 'kraken_center', 'kraken_right'
        if (bossType === 'kraken') {
            this.w = 84;
            this.h = 84;
            this.hp = 12;
            this.maxHp = 12;
            this.vx = subType === 'kraken_left' ? 1.6 : (subType === 'kraken_center' ? 1.9 : 1.7);
            this.title = subType === 'kraken_left' ? "⚔️ KRAKEN LEVIATHAN ⚔️" : (subType === 'kraken_center' ? "👑 ANCIENT KRAKEN BEHEMOTH 👑" : "⚡ ABYSSAL VOID KRAKEN ⚡");
        } else if (bossType === 'titan') {
            this.w = 72;
            this.h = 72;
            this.hp = 14;
            this.maxHp = 14;
            this.vx = 1.6;
            this.title = "EXAM PRESSURE TITAN";
        } else {
            this.w = 64;
            this.h = 64;
            this.hp = 10;
            this.maxHp = 10;
            this.vx = 2;
            this.title = "GOBLIN CHIEF";
        }
        this.vy = 0;
        this.active = true;
        this.state = 'patrol';
        this.timer = 0;
    }
    update() {
        if (!this.active) return;
        this.timer++;
        
        if (this.state === 'patrol') {
            this.x += this.vx;
            
            if (this.bossType === 'kraken') {
                let minX = 60;
                let maxX = (mapWidth - 3) * TILE_SIZE;
                if (this.subType === 'kraken_left') {
                    minX = 60;
                    maxX = 650;
                } else if (this.subType === 'kraken_center') {
                    minX = 480;
                    maxX = 1120;
                } else if (this.subType === 'kraken_right') {
                    minX = 950;
                    maxX = 1530;
                }
                if (this.x < minX || this.x > maxX) {
                    this.vx *= -1;
                }
            } else {
                if (this.x < player.x - 450 || this.x > player.x + 450 || this.x < 100 || this.x > (mapWidth - 3) * TILE_SIZE) {
                    this.vx *= -1;
                }
            }
            
            // Shooting cadence
            if (this.bossType === 'kraken') {
                const offset = this.subType === 'kraken_left' ? 0 : (this.subType === 'kraken_center' ? 45 : 90);
                const isEnraged = this.hp <= 6;
                const interval = isEnraged ? 100 : 140;
                if ((this.timer + offset) % interval === 0) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist > 0) {
                        const speed = 4.8;
                        const vx = (dx / dist) * speed;
                        const vy = (dy / dist) * speed;
                        projectiles.push(new Projectile(this.x + this.w/2, this.y + this.h/2, vx, vy, false, '#00f5d4', 8));
                        if (isEnraged) {
                            // Enraged kraken fires dual shadow bolts
                            projectiles.push(new Projectile(this.x + this.w/2, this.y + this.h/2, vx, vy - 1.8, false, '#ff0055', 7));
                        }
                    }
                }
            } else if (this.bossType === 'titan') {
                const interval = this.hp <= 7 ? 95 : 130;
                if (this.timer % interval === 0) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist > 0) {
                        const speed = 4.6;
                        const vx = (dx / dist) * speed;
                        const vy = (dy / dist) * speed;
                        projectiles.push(new Projectile(this.x + this.w/2, this.y + this.h/2, vx, vy, false, '#00f5d4', 7));
                        if (this.hp <= 7) {
                            projectiles.push(new Projectile(this.x + this.w/2, this.y + this.h/2, vx, vy - 1.5, false, '#ffd166', 6));
                        }
                    }
                }
            } else {
                if (this.timer % 120 === 0) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist > 0) {
                        projectiles.push(new Projectile(this.x + this.w/2, this.y + this.h/2, (dx / dist) * 6, (dy / dist) * 6, false, 'red', 7));
                    }
                }
            }

            // Jumping cadence
            let jumpInterval = 120;
            if (this.bossType === 'kraken') {
                jumpInterval = this.hp <= 6 ? 120 : 160;
            } else if (this.bossType === 'titan') {
                jumpInterval = this.hp <= 7 ? 110 : 150;
            }
            if (this.timer > jumpInterval && Math.random() > 0.45) {
                this.state = 'jump';
                this.vy = this.bossType === 'kraken' ? -12 : (this.bossType === 'titan' ? -11.5 : -12);
                this.timer = 0;
            }
        } else if (this.state === 'jump') {
            this.x += this.vx * 1.1;
            this.y += this.vy;
            this.vy += GRAVITY;
            const floorY = (mapHeight - 2) * TILE_SIZE - this.h;
            if (this.y >= floorY) {
                this.y = floorY;
                this.vy = 0;
                this.state = 'patrol';
                this.timer = 0;
                if (this.bossType === 'kraken') {
                    spawnParticles(this.x + this.w/2, floorY + this.h, '#00f5d4');
                    spawnParticles(this.x + this.w/2, floorY + this.h, '#ff0055');
                } else if (this.bossType === 'titan') {
                    spawnParticles(this.x + this.w/2, floorY + this.h, '#9b5de5');
                    spawnParticles(this.x + this.w/2, floorY + this.h, '#ffd700');
                }
            }
        }

        // Player stomp boss
        if (rectIntersect(player, this)) {
            if (player.vy > 0 && player.y + player.h < this.y + this.h / 2) {
                // Stomp
                player.vy = -10;
                this.takeDamage();
            } else {
                player.takeDamage(1);
            }
        }
    }
    takeDamage() {
        this.hp--;
        playSound('hurt');
        const pColor = this.bossType === 'kraken' ? '#00f5d4' : (this.bossType === 'titan' ? '#9b5de5' : '#000');
        spawnParticles(this.x + this.w/2, this.y + this.h/2, pColor);
        if (this.hp <= 0) {
            this.active = false;
            spawnParticles(this.x + this.w/2, this.y + this.h/2, '#ffd700');
            spawnParticles(this.x + this.w/2, this.y + this.h/2, '#ff477e');
            
            // In Level 6, defeating the Exam Pressure Titan transitions to the 5-second Cupcake Rush bonus round!
            if (currentLevel === 6 && this.bossType === 'titan') {
                startBonusRound();
                return;
            }

            const remainingActive = bosses.filter(b => b.active).length;
            if (remainingActive === 0 && gameState !== 'CUTSCENE' && gameState !== 'VICTORY') {
                if (currentLevel === 3) {
                    showLevelBanner(`Castle Conquered! 🎉`);
                    triggerCutscene();
                } else if (currentLevel < levels.length) {
                    showLevelBanner(`Boss Defeated! Portal Opened! 🌟`);
                    const portalX = Math.min(mapWidth * TILE_SIZE - 120, Math.max(120, this.x));
                    collectibles.push(new Collectible(portalX, (mapHeight - 3) * TILE_SIZE, 'portal'));
                    playSound('win');
                } else {
                    // All 3 Kraken Titans defeated in Level 6!
                    localStorage.setItem('abigailGameCompleted', 'true');
                    checkLevelSelectUnlock();
                    showLevelBanner(`👑 3 KRAKEN TITANS DEFEATED! 👑`);
                    triggerCutscene();
                }
            }
        }
    }
    draw(ctx, camX, camY) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x - camX, this.y - camY);

        if (this.bossType === 'kraken') {
            // --- SCARY & POWERFUL KRAKEN FROM CLASH OF THE TITANS ---
            const isEnraged = this.hp <= 6;
            
            // Soft radiant aura behind kraken (blazing fast, replaces heavy shadowBlur)
            const auraGrad = ctx.createRadialGradient(this.w / 2, this.h / 2, 10, this.w / 2, this.h / 2, this.w * 0.65);
            auraGrad.addColorStop(0, isEnraged ? 'rgba(255, 0, 85, 0.45)' : 'rgba(0, 245, 212, 0.35)');
            auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(this.w / 2, this.h / 2, this.w * 0.65, 0, Math.PI * 2);
            ctx.fill();

            // 1. Writhing Tentacles (6 huge sinusoidal serpentine tentacles with suction discs)
            const tentacleBaseY = this.h * 0.72;
            const tentacleOffsets = [-36, -22, -8, 8, 22, 36];
            for (let t = 0; t < tentacleOffsets.length; t++) {
                const offX = tentacleOffsets[t];
                const wave = Math.sin(this.timer * 0.1 + t * 1.1) * 14;
                const tipX = this.w / 2 + offX + wave;
                const tipY = this.h + 20 + Math.cos(this.timer * 0.08 + t) * 8;
                
                // Outer thick muscular tentacle
                ctx.beginPath();
                ctx.moveTo(this.w / 2 + offX * 0.6, tentacleBaseY);
                ctx.quadraticCurveTo(this.w / 2 + offX * 1.2 + wave * 0.6, this.h * 0.88, tipX, tipY);
                ctx.lineWidth = 9;
                ctx.strokeStyle = isEnraged ? '#2d0a21' : '#14312b';
                ctx.lineCap = 'round';
                ctx.stroke();

                // Inner flesh/energy ridge
                ctx.beginPath();
                ctx.moveTo(this.w / 2 + offX * 0.6, tentacleBaseY);
                ctx.quadraticCurveTo(this.w / 2 + offX * 1.2 + wave * 0.6, this.h * 0.88, tipX, tipY);
                ctx.lineWidth = 4;
                ctx.strokeStyle = isEnraged ? '#ff007f' : '#00f5d4';
                ctx.stroke();

                // Glowing sucker disk
                const suckerX = (this.w / 2 + offX * 0.6 + tipX) / 2;
                const suckerY = (tentacleBaseY + tipY) / 2;
                ctx.beginPath();
                ctx.arc(suckerX, suckerY, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#ffd700';
                ctx.fill();
            }

            // 2. Heavy Carapace & Torso (Ancient Craggy Stone/Chitin Armor)
            const bodyGrad = ctx.createLinearGradient(0, 0, 0, this.h);
            if (isEnraged) {
                bodyGrad.addColorStop(0, '#3a0928');
                bodyGrad.addColorStop(0.5, '#200516');
                bodyGrad.addColorStop(1, '#0e020a');
            } else {
                bodyGrad.addColorStop(0, '#1a332d');
                bodyGrad.addColorStop(0.5, '#0e201b');
                bodyGrad.addColorStop(1, '#05100d');
            }
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(this.w / 2, this.h * 0.52, this.w * 0.44, this.h * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = isEnraged ? '#ff0055' : '#00b4d8';
            ctx.stroke();

            // Dorsal carapace ridges & spikes
            ctx.fillStyle = isEnraged ? '#55083a' : '#1e3d36';
            for (let s = -2; s <= 2; s++) {
                const spikeX = this.w / 2 + s * 14;
                const spikeY = this.h * 0.18 - Math.abs(s) * 4;
                ctx.beginPath();
                ctx.moveTo(spikeX - 7, spikeY + 12);
                ctx.lineTo(spikeX, spikeY - 14 - Math.abs(s) * 2);
                ctx.lineTo(spikeX + 7, spikeY + 12);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = isEnraged ? '#ff477e' : '#52b788';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // 3. Monstrous Gaping Maw with Razor Fangs
            ctx.fillStyle = '#060a09';
            ctx.beginPath();
            ctx.ellipse(this.w / 2, this.h * 0.64, this.w * 0.28, this.h * 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isEnraged ? '#990033' : '#0d4036';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Razor-sharp fangs
            ctx.fillStyle = '#e8f0ec';
            for (let f = -3; f <= 3; f++) {
                const fangX = this.w / 2 + f * 6.5;
                // Upper fangs
                ctx.beginPath();
                ctx.moveTo(fangX - 2.5, this.h * 0.54);
                ctx.lineTo(fangX, this.h * 0.62);
                ctx.lineTo(fangX + 2.5, this.h * 0.54);
                ctx.closePath();
                ctx.fill();
                // Lower fangs
                ctx.beginPath();
                ctx.moveTo(fangX - 2.5, this.h * 0.74);
                ctx.lineTo(fangX, this.h * 0.66);
                ctx.lineTo(fangX + 2.5, this.h * 0.74);
                ctx.closePath();
                ctx.fill();
            }

            // 4. Glowing Demonic Eyes with Slit Pupils
            const eyeY = this.h * 0.38;
            const eyeSpacing = 16;
            for (let side of [-1, 1]) {
                const eyeX = this.w / 2 + side * eyeSpacing;
                // Heavy bony brow ridge
                ctx.beginPath();
                ctx.moveTo(eyeX - 10, eyeY - 7);
                ctx.lineTo(eyeX + 10, eyeY - (side * 2));
                ctx.strokeStyle = '#05100d';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Glowing eye socket
                ctx.fillStyle = isEnraged ? '#ff0033' : '#ffd700';
                ctx.beginPath();
                ctx.ellipse(eyeX, eyeY, 8, 5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Demonic vertical slit pupil
                ctx.fillStyle = '#050706';
                ctx.beginPath();
                ctx.ellipse(eyeX, eyeY, 2.2, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Specular reflection
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(eyeX - 1.5, eyeY - 2, 2, 2);
            }

            ctx.shadowBlur = 0;

            // 5. Boss Title & Enraged Indicator
            ctx.fillStyle = isEnraged ? '#ff0055' : '#00f5d4';
            ctx.font = 'bold 10px "Fredoka One", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.title || 'KRAKEN TITAN', this.w / 2, -26);
            if (isEnraged) {
                ctx.fillStyle = '#ffd166';
                ctx.font = 'bold 9px "Fredoka One", sans-serif';
                ctx.fillText('⚡ ABYSSAL FURY ⚡', this.w / 2, -37);
            }

            // 6. Glowing Boss Health Bar
            const barW = this.w + 16;
            const barX = -8;
            const barY = -16;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(barX, barY, barW, 8);
            const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            if (isEnraged) {
                hpGrad.addColorStop(0, '#ff0055');
                hpGrad.addColorStop(1, '#ff9e00');
            } else {
                hpGrad.addColorStop(0, '#00f5d4');
                hpGrad.addColorStop(1, '#4361ee');
            }
            ctx.fillStyle = hpGrad;
            ctx.fillRect(barX, barY, barW * Math.max(0, this.hp / this.maxHp), 8);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, 8);

        } else if (this.bossType === 'titan') {
            // Exam Pressure Titan - Fast glowing circle aura replaces heavy shadowBlur
            const auraColor = this.hp <= 7 ? 'rgba(255, 0, 85, 0.42)' : 'rgba(155, 93, 229, 0.38)';
            ctx.fillStyle = auraColor;
            ctx.beginPath();
            ctx.arc(this.w / 2, this.h / 2, 40, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '56px sans-serif';
            ctx.fillText('🧙🏾‍♂️', 0, 56);

            // Mortarboard cap floating on top
            ctx.font = '32px sans-serif';
            ctx.fillText('🎓', 18, 12);

            if (this.hp <= 7) {
                ctx.fillStyle = '#ff0055';
                ctx.font = 'bold 12px "Fredoka One", sans-serif';
                ctx.fillText('⚡ ENRAGED ⚡', -6, -20);
            }

            // Health bar
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, -12, this.w, 7);
            const hpGrad = ctx.createLinearGradient(0, 0, this.w, 0);
            hpGrad.addColorStop(0, '#ffd166');
            hpGrad.addColorStop(1, '#ff477e');
            ctx.fillStyle = hpGrad;
            ctx.fillRect(0, -12, this.w * (this.hp / this.maxHp), 7);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, -12, this.w, 7);
        } else {
            // Castle Goblin
            ctx.font = '64px sans-serif';
            ctx.fillText('👺', 0, 50);
            ctx.fillStyle = 'red';
            ctx.fillRect(0, -10, this.w, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(0, -10, this.w * (this.hp / this.maxHp), 5);
        }

        ctx.restore();
    }
}

// --- Bonus Round & Kraken Spawning Logic ---
function startBonusRound() {
    isBonusRound = true;
    bonusRoundTimer = BONUS_ROUND_DURATION; // 3 seconds at 60fps
    projectiles = []; // Clear dangerous projectiles so player can rush safely
    
    // Spawn 40 bonus cupcakes all across the Grand Hall!
    const spawnLocations = [];
    
    // Floor level cupcakes (row 17, along x coordinates from 3 to 38)
    for (let c = 3; c <= 38; c += 2) {
        spawnLocations.push({ x: c * TILE_SIZE, y: 17 * TILE_SIZE });
    }
    // Red carpet stairs and platforms
    // Row 14 platform
    for (let c = 3; c <= 7; c++) spawnLocations.push({ x: c * TILE_SIZE, y: 13 * TILE_SIZE });
    // Row 12 platform
    for (let c = 8; c <= 13; c++) spawnLocations.push({ x: c * TILE_SIZE, y: 11 * TILE_SIZE });
    // Row 10 platform
    for (let c = 18; c <= 24; c++) spawnLocations.push({ x: c * TILE_SIZE, y: 9 * TILE_SIZE });
    // Row 7 balcony
    for (let c = 31; c <= 37; c++) spawnLocations.push({ x: c * TILE_SIZE, y: 6 * TILE_SIZE });
    // Floating air cupcakes in the center
    for (let c = 12; c <= 28; c += 3) {
        spawnLocations.push({ x: c * TILE_SIZE, y: 15 * TILE_SIZE });
        spawnLocations.push({ x: c * TILE_SIZE, y: 14 * TILE_SIZE });
    }

    spawnLocations.forEach(loc => {
        collectibles.push(new Collectible(loc.x, loc.y, 'bonus_cupcake'));
    });

    playSound('win');
    showLevelBanner("🧁 CUPCAKE RUSH: 6 SECONDS! 🧁");
}

function endBonusRoundAndSpawnKrakens() {
    isBonusRound = false;
    bonusRoundTimer = 0;
    
    // Transform any uncollected bonus cupcakes into golden particles
    collectibles = collectibles.filter(c => {
        if (c.type === 'bonus_cupcake') {
            spawnParticles(c.x, c.y, '#ffd700');
            return false;
        }
        return true;
    });

    playSound('hurt');
    showLevelBanner("⚠️ 3 KRAKEN TITANS AWAKENED! 🐙⚠️");
    
    // Spawn the 3 Kraken bosses across the hall (ground row 18)
    const floorY = (mapHeight - 2) * TILE_SIZE - 84;
    bosses = [
        new Boss(220, floorY, 'kraken', 'kraken_left'),
        new Boss(780, floorY, 'kraken', 'kraken_center'),
        new Boss(1340, floorY, 'kraken', 'kraken_right')
    ];
}


// --- Globals ---
let player;
let camera = new Camera();
let currentMap = [];
let mapWidth = 0;
let mapHeight = 0;
let enemies = [];
let collectibles = [];
let particles = [];
let projectiles = [];
let bosses = [];
let birds = [];
let birdSpawnTimer = 0;
let bgmStarted = false;
let cutsceneTimer = 0;
let cutscenePhase = 0;
let cutsceneCakeX = 0;
let cutsceneCakeY = 0;
let cutsceneSamuelX = 0;
let cutsceneSamuelY = 0;
let victoryInterval = null;

function triggerCutscene() {
    gameState = 'CUTSCENE';
    cutsceneTimer = 0;
    cutscenePhase = 0;
    bosses = [];
    enemies = [];
    collectibles = [];
    projectiles = []; // Clear boss projectiles so none hit the player!
    birds = [];

    if (player) {
        player.vx = 0;
        player.vy = 0;
        player.invulnerable = 99999;
    }

    // Hide HUD for cinematic cutscene presentation
    const hudEl = document.getElementById('hud');
    if (hudEl) hudEl.classList.add('hidden');

    // Smart placement of Cake and Samuel Bekoe near Abigail
    const pX = player ? player.x : 400;
    const pY = player ? player.y : (mapHeight - 3) * TILE_SIZE;

    // Check if player is near right edge of the level
    if (pX > (mapWidth * TILE_SIZE) - 340) {
        cutsceneCakeX = pX - 140;
        cutsceneSamuelX = cutsceneCakeX - 70;
        if (player) player.facingRight = false;
    } else {
        cutsceneCakeX = pX + 110;
        cutsceneSamuelX = cutsceneCakeX + 70;
        if (player) player.facingRight = true;
    }

    cutsceneCakeX = Math.max(80, Math.min(mapWidth * TILE_SIZE - 180, cutsceneCakeX));
    cutsceneSamuelX = Math.max(60, Math.min(mapWidth * TILE_SIZE - 120, cutsceneSamuelX));

    // Calculate ground height directly below cutsceneCakeX
    const col = Math.max(1, Math.min(mapWidth - 2, Math.floor(cutsceneCakeX / TILE_SIZE)));
    let groundRow = mapHeight - 2;
    for (let r = Math.max(0, Math.floor(pY / TILE_SIZE)); r < mapHeight; r++) {
        if (getTile(col, r) === 1) {
            groundRow = r;
            break;
        }
    }
    cutsceneCakeY = groundRow * TILE_SIZE - 54;
    cutsceneSamuelY = groundRow * TILE_SIZE - 68;

    playSound('win');
}

// --- Helper Functions ---
function drawRoundedRect(ctx, x, y, w, h, r) {
    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
}

function getTile(col, row) {
    if (col < 0 || col >= mapWidth || row < 0 || row >= mapHeight) return 1; // Wall out of bounds
    if (!currentMap || !currentMap[row]) return 1;
    const char = currentMap[row][col];
    const val = parseInt(char, 10);
    return isNaN(val) ? 0 : val;
}

function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.w || 
             r2.x + r2.w < r1.x || 
             r2.y > r1.y + r1.h ||
             r2.y + r2.h < r1.y);
}

function spawnParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// --- Helper Scenery Functions ---
function drawPalmTree(ctx, x, y, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Trunk
    ctx.strokeStyle = '#6b4226';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(15, -45, 10, -90);
    ctx.stroke();

    // Palm Fronds
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 5;
    const leafAngles = [-0.85, -0.4, 0, 0.4, 0.85];
    leafAngles.forEach(angle => {
        ctx.save();
        ctx.translate(10, -90);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(25, -20, 52, 12);
        ctx.stroke();
        ctx.restore();
    });

    // Coconuts
    ctx.fillStyle = '#4a2810';
    ctx.beginPath();
    ctx.arc(6, -88, 5, 0, Math.PI * 2);
    ctx.arc(14, -86, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Pre-rendered Chandelier for ultra-smooth Level 6 Convocation performance
let chandelierCanvas = null;
function initChandelierCanvas() {
    chandelierCanvas = document.createElement('canvas');
    chandelierCanvas.width = 64;
    chandelierCanvas.height = 70;
    const cctx = chandelierCanvas.getContext('2d');
    
    cctx.save();
    cctx.translate(32, 5);

    // Chain
    cctx.strokeStyle = '#ffd700';
    cctx.lineWidth = 2;
    cctx.beginPath();
    cctx.moveTo(0, 0);
    cctx.lineTo(0, 24);
    cctx.stroke();

    // Curved bracket
    cctx.strokeStyle = '#ffd700';
    cctx.lineWidth = 3;
    cctx.beginPath();
    cctx.arc(0, 24, 20, 0, Math.PI);
    cctx.stroke();

    // Candles
    [-15, 0, 15].forEach(cx => {
        const halo = cctx.createRadialGradient(cx, 18, 2, cx, 18, 12);
        halo.addColorStop(0, 'rgba(255, 235, 150, 0.95)');
        halo.addColorStop(0.5, 'rgba(255, 200, 50, 0.4)');
        halo.addColorStop(1, 'rgba(255, 200, 50, 0)');
        cctx.fillStyle = halo;
        cctx.beginPath();
        cctx.arc(cx, 18, 12, 0, Math.PI * 2);
        cctx.fill();

        cctx.fillStyle = '#ff7b00';
        cctx.beginPath();
        cctx.arc(cx, 19, 3, 0, Math.PI * 2);
        cctx.fill();
    });

    cctx.restore();
}

function drawChandelier(ctx, x, y) {
    if (!chandelierCanvas) initChandelierCanvas();
    ctx.drawImage(chandelierCanvas, x - 32, y);
}

const convocationConfetti = [];
for (let i = 0; i < 40; i++) {
    convocationConfetti.push({
        x: Math.random() * 1600,
        y: Math.random() * 800,
        size: Math.random() * 5 + 3,
        color: ['#ffd700', '#ff477e', '#00f5d4', '#ffffff', '#fee440', '#ff7096'][Math.floor(Math.random() * 6)],
        speed: Math.random() * 0.8 + 0.4,
        rot: Math.random() * Math.PI
    });
}

function updateFloatingConfetti() {
    convocationConfetti.forEach(p => {
        p.y += p.speed;
        p.rot += 0.025;
        if (p.y > 800) {
            p.y = -10;
            p.x = Math.random() * 1600;
        }
    });
}

function drawFloatingConfetti(ctx) {
    const camX = camera ? Math.round(camera.x) : 0;
    const camY = camera ? Math.round(camera.y) : 0;
    
    for (let i = 0; i < convocationConfetti.length; i++) {
        const p = convocationConfetti[i];
        const sx = p.x - camX * 0.35;
        const sy = p.y - camY * 0.35;
        if (sx < -20 || sx > canvas.width + 20 || sy < -20 || sy > canvas.height + 20) continue;
        
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/3, p.size, p.size * 0.6);
        ctx.restore();
    }
}

// --- Level Loading ---
function loadLevel(lvlIndex) {
    const lvl = levels[lvlIndex - 1];
    currentMap = [...lvl.map];
    mapHeight = currentMap.length;
    mapWidth = currentMap[0].length;
    
    enemies = [];
    collectibles = [];
    particles = [];
    projectiles = [];
    bosses = [];
    birds = [];
    birdSpawnTimer = 0;
    isBonusRound = false;
    bonusRoundTimer = 0;
    
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            const tile = currentMap[r][c];
            if (tile === 'P') {
                const savedHp = (player && player.hp > 0) ? player.hp : 3;
                player = new Player(c * TILE_SIZE, r * TILE_SIZE);
                player.hp = savedHp; // Keep health between levels
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            } else if (tile === '2') {
                collectibles.push(new Collectible(c * TILE_SIZE, r * TILE_SIZE, 'cupcake'));
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            } else if (tile === '3') {
                enemies.push(new Enemy(c * TILE_SIZE, r * TILE_SIZE, 'bomb'));
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            } else if (tile === '8') {
                enemies.push(new Enemy(c * TILE_SIZE, r * TILE_SIZE, 'ant'));
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            } else if (tile === 'C') {
                enemies.push(new Enemy(c * TILE_SIZE, r * TILE_SIZE, 'crab'));
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            } else if (tile === 'A') {
                enemies.push(new Enemy(c * TILE_SIZE, r * TILE_SIZE, 'alarm'));
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            } else if (tile === 'E') {
                enemies.push(new Enemy(c * TILE_SIZE, r * TILE_SIZE, 'paper'));
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            } else if (tile === '4') {
                collectibles.push(new Collectible(c * TILE_SIZE, r * TILE_SIZE, 'gift'));
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            } else if (tile === '5') {
                collectibles.push(new Collectible(c * TILE_SIZE, r * TILE_SIZE, 'portal'));
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            } else if (tile === '9') {
                collectibles.push(new Collectible(c * TILE_SIZE, r * TILE_SIZE, 'backportal'));
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            } else if (tile === 'B') {
                const bossType = lvlIndex === 6 ? 'titan' : 'goblin';
                bosses.push(new Boss(c * TILE_SIZE, r * TILE_SIZE, bossType));
                let rowStr = currentMap[r];
                currentMap[r] = rowStr.substr(0, c) + '0' + rowStr.substr(c + 1);
            }
        }
    }

    // Spawn initial atmospheric flying birds/items
    if (lvlIndex === 4) {
        birds.push(new BirdEnemy(600, 140, -1, 3.0, 'seagull'));
        birds.push(new BirdEnemy(1100, 180, -1, 3.4, 'seagull'));
    } else if (lvlIndex === 5) {
        birds.push(new BirdEnemy(700, 160, -1, 2.4, 'paper'));
    } else if (lvlIndex === 6) {
        birds.push(new BirdEnemy(850, 140, -1, 1.8, 'mortarboard'));
    }
    
    camera = new Camera();
    updateHUD();
    const levelNames = [
        "Level 1: Birthday Meadow 🌸",
        "Level 2: Gift Valley 🎁",
        "Level 3: Goblin Castle 🏰",
        "Level 4: Sunset Beach Paradise 🏖️",
        "Level 5: Glamour Boulevard 💎",
        "Level 6: Queen's Coronation 👑"
    ];
    document.getElementById('levelDisplay').innerText = levelNames[lvlIndex - 1] || `Level ${lvlIndex}`;
}

// --- Main Loop ---
function update() {
    if (gameState === 'PLAYING') {
        if (isBonusRound) {
            bonusRoundTimer--;
            if (bonusRoundTimer <= 0) {
                endBonusRoundAndSpawnKrakens();
            }
        }

        if (player) player.update();
        if (camera && player) camera.update(player);
        
        if (currentLevel === 6) {
            updateFloatingConfetti();
        }
        
        enemies.forEach(e => e.update());
        collectibles.forEach(c => c.update());
        bosses.forEach(b => b.update());
        birds.forEach(b => b.update());
        
        // Remove inactive entities
        enemies = enemies.filter(e => e.active);
        collectibles = collectibles.filter(c => c.active);
        bosses = bosses.filter(b => b.active);
        birds = birds.filter(b => b.active);

        const camX = camera ? camera.x : 0;
        const camY = camera ? camera.y : 0;

        // Periodically spawn birds & airborne enemies
        birdSpawnTimer++;
        if (currentLevel === 4) {
            // Beach: seagulls fly by periodically every ~3.5 seconds
            if (birdSpawnTimer > 210) {
                birdSpawnTimer = 0;
                const fromRight = Math.random() > 0.4;
                const spawnX = fromRight ? camX + GAME_WIDTH + 60 : camX - 60;
                const dir = fromRight ? -1 : 1;
                const spawnY = Math.random() * (canvas.height * 0.4) + camY + 40;
                birds.push(new BirdEnemy(spawnX, spawnY, dir, 2.6 + Math.random() * 1.6, 'seagull'));
            }
        } else if (currentLevel === 5) {
            // Exam halls: paper airplanes swoop across
            if (birdSpawnTimer > 250) {
                birdSpawnTimer = 0;
                const fromRight = Math.random() > 0.5;
                const spawnX = fromRight ? camX + GAME_WIDTH + 60 : camX - 60;
                const dir = fromRight ? -1 : 1;
                const spawnY = Math.random() * (canvas.height * 0.38) + camY + 50;
                birds.push(new BirdEnemy(spawnX, spawnY, dir, 2.2 + Math.random() * 1.4, 'paper'));
            }
        } else if (currentLevel === 6) {
            // Convocation: flying graduation mortarboards
            if (birdSpawnTimer > 230) {
                birdSpawnTimer = 0;
                const fromRight = Math.random() > 0.5;
                const spawnX = fromRight ? camX + GAME_WIDTH + 60 : camX - 60;
                const dir = fromRight ? -1 : 1;
                const spawnY = Math.random() * (canvas.height * 0.4) + camY + 40;
                birds.push(new BirdEnemy(spawnX, spawnY, dir, 1.5 + Math.random() * 0.6, 'mortarboard'));
            }
        }
        
        // Projectiles
        projectiles.forEach(p => {
            p.update();
            if (!p.active) return;
            
            if (p.isPlayer) {
                bosses.forEach(b => {
                    if (b.active && rectIntersect(p, b)) {
                        b.takeDamage();
                        p.active = false;
                    }
                });
                
                enemies.forEach(e => {
                    if (e.active && e.type !== 'bomb' && rectIntersect(p, e)) {
                        e.active = false;
                        p.active = false;
                        spawnParticles(e.x + e.w/2, e.y + e.h/2, '#555');
                        playSound('hurt'); // Or a small pop sound
                        score += 2; // Extra points for killing an enemy
                        updateHUD();
                    }
                });

                birds.forEach(b => {
                    if (b.active && rectIntersect(p, b)) {
                        b.active = false;
                        p.active = false;
                        const pColor = b.type === 'mortarboard' ? '#ffd700' : (b.type === 'paper' ? '#48cae4' : '#ffffff');
                        spawnParticles(b.x + b.w/2, b.y + b.h/2, pColor);
                        spawnParticles(b.x + b.w/2, b.y + b.h/2, '#ffd700');
                        playSound('hurt');
                        score += 3;
                        updateHUD();
                    }
                });
            }
            
            if (!p.isPlayer) {
                if (rectIntersect(p, player)) {
                    player.takeDamage(1);
                    p.active = false;
                }
            }
        });
        projectiles = projectiles.filter(p => p.active);
        
        // Particles
        particles.forEach(p => p.update());
        particles = particles.filter(p => p.life > 0);
    } else if (gameState === 'CUTSCENE') {
        cutsceneTimer++;

        // Smooth camera glide to frame Abigail, Cake, and Samuel Bekoe perfectly
        if (player && camera) {
            const focusX = (player.x + cutsceneSamuelX) / 2;
            const focusY = (player.y + cutsceneSamuelY) / 2;
            const maxScrollX = mapWidth * TILE_SIZE - GAME_WIDTH;
            const targetCamX = Math.max(0, Math.min(Math.max(0, maxScrollX), focusX - GAME_WIDTH / 2));
            const maxScrollY = mapHeight * TILE_SIZE - GAME_HEIGHT;
            const targetCamY = Math.max(0, Math.min(Math.max(0, maxScrollY), focusY - GAME_HEIGHT / 2 + 30));
            camera.x += (targetCamX - camera.x) * 0.08;
            camera.y += (targetCamY - camera.y) * 0.08;
        }

        if (cutscenePhase === 0 && cutsceneTimer > 45) {
            cutscenePhase = 1;
            spawnParticles(cutsceneSamuelX, cutsceneSamuelY + 20, '#4a90e2');
            spawnParticles(cutsceneSamuelX, cutsceneSamuelY + 20, '#ffd700');
        } else if (cutscenePhase === 1 && cutsceneTimer > 110) {
            cutscenePhase = 2;
            spawnParticles(cutsceneCakeX + 32, cutsceneCakeY, '#ff7096');
        } else if (cutscenePhase === 2 && cutsceneTimer > 800) { // ~13.5s auto-advance
            triggerVictory();
        }

        // Keep updating particles during cutscene
        particles.forEach(p => p.update());
        particles = particles.filter(p => p.life > 0);
    }
    // Level banner countdown
    if (levelBannerTimer > 0) levelBannerTimer--;
}

function draw() {
    if (gameState === 'MENU' || gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'GAMEOVER' || gameState === 'VICTORY' || gameState === 'CUTSCENE') {
        const lvl = levels[currentLevel - 1];
        if (!lvl) return;
        
        const camX = camera ? Math.round(camera.x) : 0;
        const camY = camera ? Math.round(camera.y) : 0;
        
        // --- Level Themed Backgrounds ---
        if (lvl.theme === 'beach') {
            // Cape Coast Tropical Sunset
            const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGrad.addColorStop(0, '#3a1c71');    // Twilight purple
            skyGrad.addColorStop(0.35, '#d76d77'); // Warm sunset rose
            skyGrad.addColorStop(0.7, '#ffaf7b');  // Golden hour orange
            skyGrad.addColorStop(1, '#ffe0a3');    // Soft sand glow
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Glowing Tropical Sun
            const sunX = canvas.width * 0.72 - (camX * 0.04);
            const sunY = 150 - (camY * 0.03);
            const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 110);
            sunGlow.addColorStop(0, 'rgba(255, 245, 170, 1)');
            sunGlow.addColorStop(0.4, 'rgba(255, 180, 80, 0.65)');
            sunGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 110, 0, Math.PI * 2);
            ctx.fill();

            // Ocean Horizon with animated turquoise rolling waves
            const oceanY = Math.max(160, canvas.height - 230 - (camY * 0.12));
            const oceanGrad = ctx.createLinearGradient(0, oceanY, 0, canvas.height);
            oceanGrad.addColorStop(0, '#0077b6');
            oceanGrad.addColorStop(0.5, '#0096c7');
            oceanGrad.addColorStop(1, '#48cae4');
            ctx.fillStyle = oceanGrad;
            ctx.fillRect(0, oceanY, canvas.width, canvas.height - oceanY);

            // Animated white sea foam waves
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            const waveTime = Date.now() / 450;
            ctx.moveTo(0, oceanY);
            for (let wx = 0; wx <= canvas.width; wx += 25) {
                const waveH = Math.sin(wx * 0.03 + waveTime) * 6 + Math.cos(wx * 0.015 - waveTime * 0.8) * 3;
                ctx.lineTo(wx, oceanY + waveH);
            }
            ctx.lineTo(canvas.width, oceanY + 12);
            ctx.lineTo(0, oceanY + 12);
            ctx.closePath();
            ctx.fill();

            // Parallax swaying palm tree silhouettes in background
            ctx.fillStyle = 'rgba(40, 20, 60, 0.45)';
            const bgPalmWrap = Math.max(1, (mapWidth + 5) * TILE_SIZE);
            for (let i = 0; i < 7; i++) {
                const px = ((i * 340) - (camX * 0.22)) % bgPalmWrap;
                if (px > -100 && px < canvas.width + 100) {
                    drawPalmTree(ctx, px, oceanY - 5, 1.15);
                }
            }
        } else if (lvl.theme === 'study') {
            // Glamour Boulevard Background
            const hallGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            hallGrad.addColorStop(0, '#0f2027');
            hallGrad.addColorStop(0.5, '#203a43');
            hallGrad.addColorStop(1, '#2c5364');
            ctx.fillStyle = hallGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Giant Boulevard Wall in background with love math
            const boardX = 80 - (camX * 0.18);
            const boardY = 70 - (camY * 0.12);
            ctx.fillStyle = '#1e3d2f';
            ctx.strokeStyle = '#8d5524';
            ctx.lineWidth = 7;
            ctx.fillRect(boardX, boardY, 680, 170);
            ctx.strokeRect(boardX, boardY, 680, 170);

            // Chalk writings
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 20px "Fredoka One", cursive';
            ctx.fillText("ABIGAIL'S ROYAL BOULEVARD 💎", boardX + 25, boardY + 36);
            ctx.font = '15px sans-serif';
            ctx.fillText("Face Card = Platinum Tier 👑", boardX + 25, boardY + 68);
            ctx.fillText("Abigail + Smile = Lethal Hazard 🔥", boardX + 25, boardY + 98);
            ctx.fillText("Bestie Dispatch: lim(Charm) -> ∞ 💖", boardX + 25, boardY + 128);
            ctx.fillText("∫ Love(Abigail) dt = ∞ ✨", boardX + 430, boardY + 68);
            ctx.fillText("Unstoppable Birthday Superstar! 🥂", boardX + 430, boardY + 98);
        } else if (lvl.theme === 'convocation') {
            // Royal Purple & Maroon Velvet Convocation Hall
            const hallGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            hallGrad.addColorStop(0, '#2b0938');
            hallGrad.addColorStop(0.55, '#4a1236');
            hallGrad.addColorStop(1, '#240019');
            ctx.fillStyle = hallGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grand Convocation Banner
            const bannerX = canvas.width / 2 - (camX * 0.05);
            ctx.fillStyle = '#ffb703';
            ctx.font = 'bold 22px "Fredoka One", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("👑 QUEEN ABIGAIL'S ROYAL CORONATION 👑", bannerX, 55 - (camY * 0.05));
            ctx.fillStyle = '#ffd166';
            ctx.font = '15px "Fredoka One", sans-serif';
            ctx.fillText("Honoring Birthday Queen Abigail • Pure Radiance & Charm ✨", bannerX, 82 - (camY * 0.05));
            ctx.textAlign = 'left';

            // Hanging golden chandeliers
            for (let i = 0; i < 6; i++) {
                const cx = (i * 300 + 70) - (camX * 0.25);
                drawChandelier(ctx, cx, 12 - (camY * 0.08));
            }

            // Drifting celebration confetti
            drawFloatingConfetti(ctx);
        } else {
            // Default background for levels 1-3
            ctx.fillStyle = lvl.bg || '#a0e7e5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Background Clouds
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = '64px sans-serif';
            const cloudWrap = Math.max(1, mapWidth * TILE_SIZE);
            for (let i = 0; i < 5; i++) {
                ctx.fillText('☁️', ((i * 300) - (camX * 0.2)) % cloudWrap, 100 + (i%2)*50);
            }
        }
        
        if (!currentMap || currentMap.length === 0) return;

        // Draw Map Tiles in world space with single context translation (zero per-tile save/restores)
        ctx.save();
        ctx.translate(-camX, -camY);
        
        for (let r = 0; r < mapHeight; r++) {
            for (let c = 0; c < mapWidth; c++) {
                const tile = getTile(c, r);
                if (tile === 0) continue;
                const wx = c * TILE_SIZE;
                const wy = r * TILE_SIZE;
                
                // Screen viewport culling
                if (wx + TILE_SIZE < camX - 10 || wx > camX + canvas.width + 10 || wy + TILE_SIZE < camY - 10 || wy > camY + canvas.height + 10) continue;

                if (tile === 1) {
                    if (lvl.tileType === 'sand' && sandPattern) {
                        ctx.fillStyle = sandPattern;
                        ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
                        if (r === 0 || getTile(c, r - 1) === 0) {
                            ctx.fillStyle = '#ffeaa7';
                            ctx.fillRect(wx, wy, TILE_SIZE, 5);
                        }
                        ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
                        ctx.strokeRect(wx, wy, TILE_SIZE, TILE_SIZE);
                    } else if (lvl.tileType === 'books' && booksPattern) {
                        ctx.fillStyle = booksPattern;
                        ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
                        if (r === 0 || getTile(c, r - 1) === 0) {
                            ctx.fillStyle = '#ffd166';
                            ctx.fillRect(wx, wy, TILE_SIZE, 4);
                        }
                        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
                        ctx.strokeRect(wx, wy, TILE_SIZE, TILE_SIZE);
                    } else if (lvl.tileType === 'carpet' && carpetPattern) {
                        ctx.fillStyle = carpetPattern;
                        ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
                        if (r === 0 || getTile(c, r - 1) === 0) {
                            ctx.fillStyle = '#ffd700';
                            ctx.fillRect(wx, wy, TILE_SIZE, 5);
                        }
                        ctx.strokeStyle = 'rgba(128, 0, 0, 0.45)';
                        ctx.strokeRect(wx, wy, TILE_SIZE, TILE_SIZE);
                    } else {
                        ctx.fillStyle = lvl.floorColor;
                        ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
                        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
                        ctx.strokeRect(wx, wy, TILE_SIZE, TILE_SIZE);
                    }
                } else if (tile === 6) {
                    // Hazard spikes / quicksand
                    if (lvl.theme === 'beach') {
                        ctx.fillStyle = 'rgba(0, 119, 182, 0.85)';
                        ctx.fillRect(wx, wy + 10, TILE_SIZE, TILE_SIZE - 10);
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '22px sans-serif';
                        ctx.fillText('🌊', wx + 8, wy + 32);
                    } else {
                        ctx.fillStyle = 'gray';
                        ctx.beginPath();
                        ctx.moveTo(wx, wy + TILE_SIZE);
                        ctx.lineTo(wx + TILE_SIZE/2, wy + TILE_SIZE/2);
                        ctx.lineTo(wx + TILE_SIZE, wy + TILE_SIZE);
                        ctx.fill();
                    }
                }
            }
        }
        ctx.restore();
        
        // Draw Entities
        collectibles.forEach(c => c.draw(ctx, camX, camY));
        enemies.forEach(e => e.draw(ctx, camX, camY));
        birds.forEach(b => b.draw(ctx, camX, camY));
        bosses.forEach(b => b.draw(ctx, camX, camY));
        
        // Projectiles
        projectiles.forEach(p => p.draw(ctx, camX, camY));
        
        // Player
        if (player) player.draw(ctx, camX, camY);
        
        if (gameState === 'CUTSCENE') {
            ctx.save();
            ctx.translate(-camX, -camY);

            const cakeX = cutsceneCakeX;
            const cakeY = cutsceneCakeY;

            // Sparkles around cake
            if (cutsceneTimer % 12 === 0) {
                spawnParticles(cakeX + 32, cakeY + 20, '#ffd700');
            }

            // Draw Cake
            ctx.font = '64px sans-serif';
            ctx.fillText('🎂', cakeX, cakeY + 50);

            if (cutscenePhase >= 1) {
                // Draw Samuel Bekoe popping out with a celebratory bounce
                const bobbing = Math.sin(cutsceneTimer * 0.12) * 3;
                const samuelX = cutsceneSamuelX;
                const samuelY = cutsceneSamuelY + bobbing;

                // Samuel Body
                ctx.fillStyle = '#4a90e2'; // Blue shirt
                ctx.beginPath();
                ctx.moveTo(samuelX - 15, samuelY + 40);
                ctx.lineTo(samuelX + 15, samuelY + 40);
                ctx.lineTo(samuelX + 20, samuelY + 70);
                ctx.lineTo(samuelX - 20, samuelY + 70);
                ctx.fill();

                // Head
                ctx.fillStyle = '#8d5524'; // Skin tone
                ctx.beginPath();
                ctx.arc(samuelX, samuelY + 20, 15, 0, Math.PI * 2);
                ctx.fill();

                // Friendly Eyes & Smile
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(samuelX - 5, samuelY + 18, 2.5, 0, Math.PI * 2);
                ctx.arc(samuelX + 5, samuelY + 18, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(samuelX - 5, samuelY + 18, 1.2, 0, Math.PI * 2);
                ctx.arc(samuelX + 5, samuelY + 18, 1.2, 0, Math.PI * 2);
                ctx.fill();

                // Hair
                ctx.fillStyle = '#000000'; // Black hair
                ctx.beginPath();
                ctx.arc(samuelX, samuelY + 15, 16, Math.PI, 0);
                ctx.fill();

                // Waving hand
                ctx.fillStyle = '#8d5524';
                ctx.beginPath();
                const waveArm = Math.sin(cutsceneTimer * 0.18) * 8;
                ctx.arc(samuelX + 22, samuelY + 28 + waveArm, 6, 0, Math.PI * 2);
                ctx.fill();

                // Name tag
                ctx.fillStyle = '#ff477e';
                ctx.font = 'bold 16px "Fredoka One", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⭐ Samuel Bekoe ⭐', samuelX, samuelY - 8);
                ctx.textAlign = 'left';

                if (cutscenePhase >= 2) {
                    // Chat Bubble - Clamped safely inside visible screen view!
                    const bubbleW = Math.min(300, canvas.width - 40);
                    const bubbleH = 142;
                    
                    let bubbleX = samuelX - bubbleW / 2;
                    let bubbleY = samuelY - bubbleH - 22;

                    // Clamping bubble within current camera viewport
                    const minWorldX = camX + 20;
                    const maxWorldX = camX + canvas.width - bubbleW - 20;
                    bubbleX = Math.max(minWorldX, Math.min(maxWorldX, bubbleX));
                    
                    if (bubbleY < camY + 15) {
                        bubbleY = samuelY + 80;
                    }

                    // Shadow
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    drawRoundedRect(ctx, bubbleX + 4, bubbleY + 4, bubbleW, bubbleH, 14);
                    ctx.fill();

                    // Bubble body
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#ff7096';
                    ctx.lineWidth = 3;
                    drawRoundedRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 14);
                    ctx.fill();
                    ctx.stroke();

                    // Bubble tail pointing towards Samuel
                    const tailX = Math.max(bubbleX + 24, Math.min(bubbleX + bubbleW - 24, samuelX));
                    ctx.beginPath();
                    if (bubbleY < samuelY) {
                        ctx.moveTo(tailX - 10, bubbleY + bubbleH);
                        ctx.lineTo(samuelX, samuelY - 4);
                        ctx.lineTo(tailX + 10, bubbleY + bubbleH);
                    } else {
                        ctx.moveTo(tailX - 10, bubbleY);
                        ctx.lineTo(samuelX, samuelY + 75);
                        ctx.lineTo(tailX + 10, bubbleY);
                    }
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.stroke();

                    // Hide tail inner stroke overlap
                    ctx.fillStyle = '#ffffff';
                    if (bubbleY < samuelY) {
                        ctx.fillRect(tailX - 9, bubbleY + bubbleH - 3, 18, 6);
                    } else {
                        ctx.fillRect(tailX - 9, bubbleY - 3, 18, 6);
                    }

                    // Message Header
                    ctx.fillStyle = '#ff477e';
                    ctx.font = 'bold 15px "Fredoka One", sans-serif';
                    ctx.fillText('💌 Birthday Dispatch:', bubbleX + 16, bubbleY + 25);

                    // Message Lines
                    ctx.fillStyle = '#222222';
                    ctx.font = 'bold 13px sans-serif';
                    ctx.fillText('Happy Birthday Abigail! 🎉🎂', bubbleX + 16, bubbleY + 50);
                    ctx.font = '13px sans-serif';
                    ctx.fillText('Certified 10/10 & Lethal Face Card! 💖', bubbleX + 16, bubbleY + 70);
                    if (currentLevel === 3) {
                        ctx.fillText('Castle conquered! Sunset Beach awaits! 🏖️', bubbleX + 16, bubbleY + 90);
                        ctx.fillText('Tap to see your congrats & move to Level 4! ✨', bubbleX + 16, bubbleY + 110);
                    } else {
                        ctx.fillText('The sweetest & funniest superstar in the world! 🔥', bubbleX + 16, bubbleY + 90);
                        ctx.fillText('Enjoy your cake & soft life, Queen Abigail! ✨', bubbleX + 16, bubbleY + 110);
                    }

                    // Skip prompt (pulsing)
                    const pulseAlpha = 0.5 + 0.5 * Math.sin(cutsceneTimer * 0.12);
                    ctx.fillStyle = `rgba(255, 71, 126, ${pulseAlpha})`;
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'right';
                    const promptText = currentLevel === 3 ? '[Tap to View Congrats & Proceed ⏩]' : '[Tap / Press Space to continue ⏩]';
                    ctx.fillText(promptText, bubbleX + bubbleW - 14, bubbleY + 130);
                    ctx.textAlign = 'left';
                }
            }
            ctx.restore();
        }

        // Draw Particles
        particles.forEach(p => p.draw(ctx, camX, camY));
        
        ctx.restore();

        // Draw Cupcake Rush countdown HUD if active
        if (isBonusRound && bonusRoundTimer > 0) {
            ctx.save();
            const remainingSecs = (bonusRoundTimer / 60).toFixed(1);
            const progress = bonusRoundTimer / BONUS_ROUND_DURATION;
            
            const pillW = Math.min(520, canvas.width - 40);
            const pillH = 58;
            const pillX = canvas.width / 2 - pillW / 2;
            const pillY = 70;
            
            ctx.fillStyle = 'rgba(25, 8, 38, 0.90)';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 16);
            else ctx.fillRect(pillX, pillY, pillW, pillH);
            ctx.fill();
            
            const pulseGlow = 10 + Math.sin(Date.now() / 100) * 6;
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = pulseGlow;
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ffd700';
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Health rush progress bar
            const barW = (pillW - 24) * progress;
            const barGrad = ctx.createLinearGradient(pillX + 12, 0, pillX + pillW - 12, 0);
            barGrad.addColorStop(0, '#ff477e');
            barGrad.addColorStop(0.5, '#ffd166');
            barGrad.addColorStop(1, '#06d6a0');
            ctx.fillStyle = barGrad;
            ctx.fillRect(pillX + 12, pillY + pillH - 10, barW, 6);

            // Title and countdown text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px "Fredoka One", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`🧁 CUPCAKE RUSH: ${remainingSecs}s! GRAB FOR HP! 🧁`, canvas.width / 2, pillY + 28);
            ctx.fillStyle = '#ffd166';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`Every cupcake adds +1 Heart for the 3 Kraken Bosses!`, canvas.width / 2, pillY + 44);
            ctx.textAlign = 'left';
            ctx.restore();
        }

        // Draw level banner if active
        if (levelBannerTimer > 0) {
            const alpha = Math.min(1, levelBannerTimer / 30);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(canvas.width/2 - 160, canvas.height/2 - 36, 320, 72);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 36px Fredoka One, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(levelBannerText, canvas.width/2, canvas.height/2 + 12);
            ctx.textAlign = 'left';
            ctx.restore();
        }
    }
}

let lastTime = 0;
let accumulator = 0;
const FIXED_STEP = 1000 / 60; // 16.66667ms per standard 60fps update
const MAX_ACCUMULATED_DELTA = 100; // Prevent spiral of death on tab focus/unfocus

function gameLoop(timestamp) {
    try {
        if (!timestamp) timestamp = performance.now();
        if (!lastTime) lastTime = timestamp;
        
        let delta = timestamp - lastTime;
        lastTime = timestamp;
        
        // Clamp delta to avoid huge physics spikes
        if (delta > MAX_ACCUMULATED_DELTA) delta = MAX_ACCUMULATED_DELTA;
        if (delta < 0) delta = 0;
        
        accumulator += delta;
        
        // Advance physics by fixed 1/60th second steps for 100% normal, smooth speed
        let updates = 0;
        while (accumulator >= FIXED_STEP && updates < 4) {
            update();
            accumulator -= FIXED_STEP;
            updates++;
        }
        
        // Discard any residual accumulator beyond 2 steps if behind
        if (accumulator > FIXED_STEP * 2) {
            accumulator = 0;
        }
        
        // Render every frame for ultra-smooth display refresh (60Hz, 120Hz, 144Hz, etc.)
        draw();
    } catch (err) {
        console.error("Game loop error:", err);
    }
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- UI & Logic Flow ---
const overlays = document.querySelectorAll('.overlay');
function hideAllOverlays() {
    overlays.forEach(o => o.classList.add('hidden'));
}
function showOverlay(id) {
    hideAllOverlays();
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function startGame() {
    if (victoryInterval) {
        clearInterval(victoryInterval);
        victoryInterval = null;
    }
    if (!bgmStarted) {
        bgm.play().catch(e => console.log('Audio play prevented by browser'));
        bgmStarted = true;
    }
    
    currentLevel = 1;
    score = 0;
    giftsFound = 0;
    // shuffleArray(giftData); // Disabled so gifts cycle through all 6 pictures before repeating
    player = null; // Reset player completely so they spawn with 3 hearts
    startTime = Date.now();
    lastTime = performance.now();
    accumulator = 0;
    loadLevel(currentLevel);
    gameState = 'PLAYING';
    
    hideAllOverlays();
    document.getElementById('hud').classList.remove('hidden');
}

function togglePause() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        showOverlay('pauseOverlay');
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        lastTime = performance.now();
        accumulator = 0;
        hideAllOverlays();
    }
}

function updateHUD() {
    if (!player) return;
    let heartsHTML = '';
    for (let i = 0; i < player.hp; i++) {
        heartsHTML += '❤️';
    }
    document.getElementById('hearts').innerHTML = heartsHTML;
    document.getElementById('cupcakeCount').innerText = score;
    document.getElementById('giftCount').innerText = giftsFound;
}

function showMessage(msg) {
    document.getElementById('messageText').innerText = msg;
    showOverlay('messageOverlay');
    gameState = 'PAUSED';
}

function showSecretMessage() {
    // Smart non-repeating gift drawer
    const currentGift = getNextGift();
    
    document.getElementById('messagePic').classList.remove('hidden');
    
    const imgEl = document.getElementById('secretPic');
    const vidEl = document.getElementById('secretVid');
    
    const isVideo = currentGift.img.toLowerCase().endsWith('.mp4');
    if (isVideo) {
        if (imgEl) { imgEl.style.display = 'none'; imgEl.src = ''; }
        if (vidEl) {
            vidEl.style.display = 'block';
            vidEl.controls = true;
            vidEl.playsInline = true;
            vidEl.muted = false;
            vidEl.onerror = function() {
                if (!this.triedFallback) {
                    this.triedFallback = true;
                    this.src = 'pics/' + encodeURI(currentGift.img);
                }
            };
            vidEl.triedFallback = false;
            vidEl.src = '../pics/' + encodeURI(currentGift.img);
            vidEl.play().catch(e => {});
        }
    } else {
        if (vidEl) { vidEl.pause(); vidEl.style.display = 'none'; vidEl.src = ''; }
        if (imgEl) {
            imgEl.style.display = 'block';
            imgEl.onerror = function() {
                if (!this.triedFallback) {
                    this.triedFallback = true;
                    this.src = 'pics/' + encodeURI(currentGift.img);
                }
            };
            imgEl.triedFallback = false;
            imgEl.src = '../pics/' + encodeURI(currentGift.img);
        }
    }
    
    showMessage(currentGift.msg);
}

function levelComplete() {
    spawnParticles(player.x, player.y, '#ffd700');
    if (currentLevel === 3) {
        // Milestone: Conquered Level 3! Trigger the congratulatory cutscene & overlay card
        triggerCutscene();
        return;
    }
    if (currentLevel < levels.length) {
        currentLevel++;
        score = 0; // Reset score for new level
        loadLevel(currentLevel);
        const levelNames = [
            "Level 1: Birthday Meadow 🌸",
            "Level 2: Gift Valley 🎁",
            "Level 3: Goblin Castle 🏰",
            "Level 4: Sunset Beach Paradise 🏖️",
            "Level 5: Glamour Boulevard 💎",
            "Level 6: Queen's Coronation 👑"
        ];
        showLevelBanner(levelNames[currentLevel - 1] || `Level ${currentLevel}`);
    } else {
        triggerCutscene();
    }
}

function goBackLevel() {
    if (currentLevel > 1) {
        currentLevel--;
        score = 0;
        loadLevel(currentLevel);
        showLevelBanner(`Back to Level ${currentLevel}`);
    }
}

let levelBannerTimer = 0;
let levelBannerText = '';
function showLevelBanner(text) {
    levelBannerText = text;
    levelBannerTimer = 180; // 3 seconds at 60fps
}

function triggerVictory() {
    gameState = 'VICTORY';
    playSound('win');
    const hudEl = document.getElementById('hud');
    if (hudEl) hudEl.classList.add('hidden');
    
    const timeSecs = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(timeSecs / 60).toString().padStart(2, '0');
    const s = (timeSecs % 60).toString().padStart(2, '0');
    
    document.getElementById('finalCupcakes').innerText = score;
    document.getElementById('finalGifts').innerText = giftsFound;
    document.getElementById('finalTime').innerText = `${m}:${s}`;
    
    const victoryTitle = document.getElementById('victoryTitle');
    const samuelCardSubtitle = document.getElementById('samuelCardSubtitle');
    const samuelMessageBody = document.getElementById('samuelMessageBody');
    const statsSubtitle = document.getElementById('statsSubtitle');
    const nextLevelBtn = document.getElementById('nextLevelBtn');

    if (currentLevel === 3) {
        if (victoryTitle) victoryTitle.innerText = "HAPPY BIRTHDAY ABIGAIL! 👑🎂🎉";
        if (samuelCardSubtitle) samuelCardSubtitle.innerText = "Level 3 Conquered • Special Congratulations from Samuel Bekoe 💌";
        if (samuelMessageBody) {
            samuelMessageBody.innerHTML = `
                <p>“Queen Abigail! 👑 Huge congratulations on conquering the Castle of Charm and mastering Abigail's Birthday Quest! You grabbed the cupcakes, dodged the drama monsters, and gave the world a masterclass in looking effortlessly stunning!</p>
                <p>Wishing you infinite blessings, soft life, sweet surprises, and endless joy today and always! Enjoy your cake, superstar! 🎂🥂💖</p>
                <p style="color: #0077b6; font-weight: bold; margin-top: 10px; background: rgba(0, 180, 216, 0.12); padding: 10px 14px; border-radius: 8px; border-left: 4px solid #00b4d8;">🌟 The journey continues! Click 'Proceed to Next Level' below to walk Sunset Beach Paradise, strut Glamour Boulevard, and march to your Royal Coronation!”</p>
                <div class="samuel-signature">— With Love & Flirty Energy ✨</div>
            `;
        }
        if (statsSubtitle) statsSubtitle.innerText = "🏆 Milestone Achieved: Goblin Castle Conquered! 🏆";
        if (nextLevelBtn) {
            nextLevelBtn.style.display = 'inline-block';
            nextLevelBtn.innerText = "Proceed to Next Level 🏖️ (Level 4: Beach)";
        }
    } else {
        if (victoryTitle) victoryTitle.innerText = "👑 GRAND CONVOCATION & ROYAL CORONATION! 👑";
        if (samuelCardSubtitle) samuelCardSubtitle.innerText = "All 6 Worlds Mastered • Certified 10/10 Birthday Queen! 👑✨";
        if (samuelMessageBody) {
            samuelMessageBody.innerHTML = `
                <p>“ALL HAIL QUEEN ABIGAIL! 👑✨ You conquered every single challenge across all 6 levels—from the Birthday Meadow to Cape Coast Beach, crushed the Kraken Titans, and took your rightful place on the Birthday Throne! A magnificent celebration for our 10/10 Queen.</p>
                <p>Wishing you endless luxury, high-paying jobs, peace of mind, and soft life today and forever! Happy Birthday Queen Abigail! 🎂🥂🍾💖”</p>
                <div class="samuel-signature">— Samuel Bekoe ✨</div>
            `;
        }
        if (statsSubtitle) statsSubtitle.innerText = "👑 All 6 Worlds Mastered: Birthday Queen Supreme! 👑";
        if (nextLevelBtn) {
            nextLevelBtn.style.display = 'none';
        }
        // Unlock Level Select in Main Menu permanently!
        try {
            localStorage.setItem('abigailGameCompleted', 'true');
        } catch (e) {}
        checkLevelSelectUnlock();
    }

    // Fireworks effect on canvas
    if (victoryInterval) clearInterval(victoryInterval);
    victoryInterval = setInterval(() => {
        if (gameState === 'VICTORY') {
            const camX = camera ? camera.x : 0;
            const camY = camera ? camera.y : 0;
            const x = Math.random() * canvas.width + camX;
            const y = Math.random() * (canvas.height/2) + camY;
            const colors = ['#ff0', '#f0f', '#0ff', '#0f0', '#f00', '#ff7096'];
            const color = colors[Math.floor(Math.random()*colors.length)];
            spawnParticles(x, y, color);
        }
    }, 350);

    showOverlay('victoryOverlay');
}

// Level Select Unlocking & Choice Logic
function checkLevelSelectUnlock() {
    let isCompleted = false;
    try {
        isCompleted = localStorage.getItem('abigailGameCompleted') === 'true';
    } catch (e) {}
    const selectBtn = document.getElementById('levelSelectBtn');
    if (selectBtn) {
        selectBtn.style.display = isCompleted ? 'block' : 'none';
    }
}

// Canvas tap/click to advance cutscene
canvas.addEventListener('click', () => {
    if (gameState === 'CUTSCENE' && cutscenePhase >= 1) {
        triggerVictory();
    }
});

const nextLevelBtnEl = document.getElementById('nextLevelBtn');
if (nextLevelBtnEl) {
    nextLevelBtnEl.addEventListener('click', () => {
        if (victoryInterval) {
            clearInterval(victoryInterval);
            victoryInterval = null;
        }
        currentLevel = 4;
        score = 0;
        lastTime = performance.now();
        accumulator = 0;
        loadLevel(4);
        gameState = 'PLAYING';
        hideAllOverlays();
        document.getElementById('hud').classList.remove('hidden');
        showLevelBanner("Level 4: Sunset Beach Paradise 🏖️");
    });
}

// --- Event Listeners ---
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('instructionsBtn').addEventListener('click', () => showOverlay('instructionsOverlay'));
document.getElementById('creditsBtn').addEventListener('click', () => showOverlay('creditsOverlay'));
document.getElementById('backFromInstBtn').addEventListener('click', () => {
    checkLevelSelectUnlock();
    showOverlay('menuOverlay');
});
document.getElementById('backFromCreditsBtn').addEventListener('click', () => {
    checkLevelSelectUnlock();
    showOverlay('menuOverlay');
});

// Level Select button in main menu
const levelSelectBtnEl = document.getElementById('levelSelectBtn');
if (levelSelectBtnEl) {
    levelSelectBtnEl.addEventListener('click', () => {
        showOverlay('levelSelectOverlay');
    });
}

const backFromLevelSelectBtnEl = document.getElementById('backFromLevelSelectBtn');
if (backFromLevelSelectBtnEl) {
    backFromLevelSelectBtnEl.addEventListener('click', () => {
        checkLevelSelectUnlock();
        showOverlay('menuOverlay');
    });
}

// Level Choice Grid Buttons (Levels 1 to 6)
document.querySelectorAll('.level-choice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const lvl = parseInt(e.currentTarget.getAttribute('data-level'), 10);
        if (!isNaN(lvl) && lvl >= 1 && lvl <= 6) {
            if (victoryInterval) {
                clearInterval(victoryInterval);
                victoryInterval = null;
            }
            if (!bgmStarted) {
                bgm.play().catch(e => console.log('Audio play prevented by browser'));
                bgmStarted = true;
            }
            currentLevel = lvl;
            score = 0;
            giftsFound = 0;
            player = null; // Fresh spawn
            startTime = Date.now();
            lastTime = performance.now();
            accumulator = 0;
            loadLevel(currentLevel);
            gameState = 'PLAYING';
            hideAllOverlays();
            document.getElementById('hud').classList.remove('hidden');
            const levelNames = [
                "Level 1: Birthday Meadow 🌸",
                "Level 2: Gift Valley 🎁",
                "Level 3: Goblin Castle 🏰",
                "Level 4: Sunset Beach Paradise 🏖️",
                "Level 5: Glamour Boulevard 💎",
                "Level 6: Queen's Coronation 👑"
            ];
            showLevelBanner(levelNames[currentLevel - 1] || `Level ${currentLevel}`);
        }
    });
});

document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resumeBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', () => {
    lastTime = performance.now();
    accumulator = 0;
    loadLevel(currentLevel);
    gameState = 'PLAYING';
    hideAllOverlays();
});
document.getElementById('menuBtn').addEventListener('click', () => {
    gameState = 'MENU';
    document.getElementById('hud').classList.add('hidden');
    checkLevelSelectUnlock();
    showOverlay('menuOverlay');
});

document.getElementById('retryBtn').addEventListener('click', () => {
    lastTime = performance.now();
    accumulator = 0;
    loadLevel(currentLevel);
    gameState = 'PLAYING';
    hideAllOverlays();
});
document.getElementById('goMenuBtn').addEventListener('click', () => {
    gameState = 'MENU';
    document.getElementById('hud').classList.add('hidden');
    checkLevelSelectUnlock();
    showOverlay('menuOverlay');
});

document.getElementById('replayBtn').addEventListener('click', startGame);

document.getElementById('dismissOrientationBtn').addEventListener('click', () => {
    document.getElementById('orientation-overlay').classList.add('dismissed');
});

document.getElementById('closeMsgBtn').addEventListener('click', () => {
    gameState = 'PLAYING';
    lastTime = performance.now();
    accumulator = 0;
    hideAllOverlays();
});

document.getElementById('confirmYesBtn').addEventListener('click', () => {
    gameState = 'PLAYING';
    lastTime = performance.now();
    accumulator = 0;
    hideAllOverlays();
    goBackLevel();
});

document.getElementById('confirmNoBtn').addEventListener('click', () => {
    gameState = 'PLAYING';
    lastTime = performance.now();
    accumulator = 0;
    hideAllOverlays();
});

// URL Parameter Support for Direct Level Linking (e.g., ?level=6 or ?lvl=6)
const urlParams = new URLSearchParams(window.location.search);
const directLevelParam = parseInt(urlParams.get('level') || urlParams.get('lvl'), 10);

if (!isNaN(directLevelParam) && directLevelParam >= 1 && directLevelParam <= 6) {
    currentLevel = directLevelParam;
    score = 0;
    giftsFound = 0;
    player = null;
    startTime = Date.now();
    lastTime = performance.now();
    accumulator = 0;
    loadLevel(currentLevel);
    gameState = 'PLAYING';
    hideAllOverlays();
    const directHud = document.getElementById('hud');
    if (directHud) directHud.classList.remove('hidden');
    const levelNames = [
        "Level 1: Birthday Meadow 🌸",
        "Level 2: Gift Valley 🎁",
        "Level 3: Goblin Castle 🏰",
        "Level 4: Sunset Beach Paradise 🏖️",
        "Level 5: Glamour Boulevard 💎",
        "Level 6: Queen's Coronation 👑"
    ];
    showLevelBanner(levelNames[currentLevel - 1] || `Level ${currentLevel}`);
} else {
    // Initialize Level 1 map & entities for menu background
    loadLevel(1);
    gameState = 'MENU';
    checkLevelSelectUnlock();
    const initialHud = document.getElementById('hud');
    if (initialHud) initialHud.classList.add('hidden');
}

// Start loop
gameLoop();

