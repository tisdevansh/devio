import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Github, Linkedin } from 'lucide-react';

const PROFILE = {
  name: "Devansh Agarwal",
  email: "tisdevansh@gmail.com",
  linkedin: "https://www.linkedin.com/in/devansh-agarwal-3640643b0/",
  github: "github.com/tisdevansh",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  .pixel-font { font-family: 'Press Start 2P', monospace; }
  body { margin: 0; overflow: hidden; background-color: #000; touch-action: none; user-select: none; }
  .scanlines::before {
    content: " "; display: block; position: absolute; top: 0; left: 0; bottom: 0; right: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    z-index: 100; background-size: 100% 4px, 3px 100%; pointer-events: none;
  }
  .dialogue-box { background: rgba(0,0,0,0.85); border: 4px solid white; padding: 24px; color: white; box-shadow: 0 0 20px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(255,255,255,0.1); backdrop-filter: blur(4px); }
  .nes-btn { background: #E52521; color: white; border: 4px solid white; padding: 12px 24px; font-family: 'Press Start 2P', monospace; cursor: pointer; text-transform: uppercase; transition: all 0.2s; position: relative; overflow: hidden; }
  .nes-btn:hover { background: #ff4742; box-shadow: 0 0 15px rgba(229, 37, 33, 0.8); transform: scale(1.05); }
  .nes-btn:active { transform: scale(0.95); }
  .mobile-btn { background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.5); border-radius: 50%; color: white; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px); }
  .mobile-btn:active { background: rgba(255,255,255,0.4); transform: scale(0.9); }
`;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const playSound = (type) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  switch (type) {
    case 'jump':
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
      break;
    case 'coin':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.setValueAtTime(1500, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
      break;
    case 'stomp':
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
      break;
    case 'powerup': 
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(500, now + 0.1);
      osc.frequency.linearRampToValueAtTime(700, now + 0.2);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
      break;
    case 'pipe': 
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
      break;
    case 'bridgeCollapse':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(20, now + 0.8);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.8);
      osc.start(now); osc.stop(now + 0.8);
      break;
    case 'die':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
      break;
  }
};

// Added higher detail colors and specific sprites for Axe, Peach, etc.
const C = {
  'T': null, 'R': '#E52521', 'B': '#8B4513', 'K': '#000000', 
  'W': '#FFFFFF', 'Y': '#FFD700', 'O': '#FFCC99', 'U': '#0033CC', 
  'G': '#00AA00', 'D': '#006400', 'P': '#FF99CC', 'L': '#FFA500',
  'C': '#C84C0C', 'S': '#A9A9A9', 'F': '#FF4500' // S=Stone/Silver, F=Fire
};

const SPRITES = {
  marioIdle: [
    "TTTTRRRRRTTT", "TTTRRRRRRRRR", "TTTBBBOOOKTT", "TTBOBOOOKOOO", "TTBBOOOOOKKK", "TTTTBOOOOOOT",
    "TTTRRUURRTTT", "TTRRRUURRRRT", "TRRRRUURRRRT", "TOORUUUURRRT", "TOOOUUUUUOOT", "TTTUUUUUUUUT",
    "TUUUTTTTUUTT", "KBBTTTTTTTBB", "KBBTTTTTTTBB"
  ],
  marioRun: [
    "TTTTRRRRRTTT", "TTTRRRRRRRRR", "TTTBBBOOOKTT", "TTBOBOOOKOOO", "TTBBOOOOOKKK", "TTTTBOOOOOOT",
    "TTTTRRUURRTT", "TTTRRUURRRTT", "TTRRRUURRRTK", "TTOORUUUURRK", "TTOOOUUUUOTT", "TTTTUUUUUUTT",
    "TTTTUUTTTTBB", "TUUUUTTTTBBK", "TBBBKTTTTTTT"
  ],
  marioJump: [
    "TTTTTRRRRRTT", "TTTTRRRRRRRR", "TTTTBBBOOOKT", "TTTBOBOOOKOO", "TTTBBOOOOOKK", "TTTTTBOOOOOO",
    "TTTTRRUURRTT", "TTRRRRUURRRT", "TTRRRRUURRRT", "TTOOORUUURRT", "TTOOOOUUUUUT", "TTTUUUUUUUUU",
    "TTUUTTTTTTUU", "KBBTTTTTTTBB", "KBBTTTTTTTBB"
  ],
  turtle: [
    "TTTTKKKKTTTT", "TTTKOOOOKTTT", "TTKOOOKOOKTT", "TKKKOOOOOKKT", "KGKKOOOOOKKT", "KGGKKKKKKKTT",
    "KGGGWWWWGKTK", "KGGWGGGWWKTK", "TKGWGGGGWKKK", "TKWWWWWWWTKT", "TTKYYYYYKTTT", "TTTKKTTKKTTT",
    "TTBBKTTKBBTT", "TTBBKTTKBBTT"
  ],
  turtleSquash: [
    "TTTTTTTTTTTT", "TTTTTTTTTTTT", "TTTTTTTTTTTT", "TTTTTTTTTTTT", "TTTTTTTTTTTT", "TTTTTTTTTTTT",
    "TTTTKKKKTTTT", "TTTKOOOOKTTT", "KGGKKKKKKKTT", "KGGGWWWWGKTK", "TKGWGGGGWKKK", "TKWWWWWWWTKT",
    "TTKYYYYYKTTT", "KBBKTTTTKBBK"
  ],
  bowser: [ 
    "TTTTTTTTKTTTTTTT", "TTTTTGGTKTTTTTTT", "TTTGGGGGGTTTTTTT", "TTTGGGYYYGGTTTTT", "TTKGGYOOOYGKTTTT",
    "TKOGYOOKOYYOKTTT", "TKOOYOOOOOYOKTTT", "TTKKOOOOOOKKTTTT", "TTTTKKKKKKTTTTTT", "TTTLLRKKRLLTTTTT",
    "TTTLLRKKRLLTTTTT", "TTTLLRRRRLLTTTTT", "TKOOLLLLLLOOOKTT", "KBBKOOOOOKKBBKTT", "KBBKTTTTTTKBBKTT",
    "TKKTTTTTTTTKKTTT"
  ],
  peach: [
    "TTTTTYYYYYTTTTTT", "TTTTYYYYYYYTTTTT", "TTTYYOOOOOYYTTTT", "TTTTTOUUOOTTTTTT", "TTTTOOOOOTTTTTTT",
    "TTTTPPPPPPTTTTTT", "TTPPPPPPPPPPTTTT", "TTPPPPPPPPPPTTTT", "TTPPPPPPPPPPTTTT", "TTPPPPPPPPPPTTTT",
    "TPPPPPPPPPPPPTTT", "TPPPPPPPPPPPPTTT", "TPPPPPPPPPPPPTTT", "TPPPPPPPPPPPPTTT", "TPPPPPPPPPPPPTTT",
    "TTWWTTTTTTWWTTTT"
  ],
  axe: [
    "TTTTTWTTTTT", "TTTTTWWTTTT", "TTTWWWWWWTT", "TTWWWWWWTST", "TWWWWWWWSST", "TWWWWWWSSTT",
    "TTWWWWWSTTT", "TTTWWWWSTTT", "TTTTTWWSTTT", "TTTTTWSSTTT", "TTTTTWSSTTT", "TTTTTWSSTTT",
    "TTTTTWSSTTT", "TTTTTWSSTTT", "TTTTTWSSTTT"
  ],
  fireball: [
    "TTTFFFTT", "TTFFFFFT", "TFFYYYFT", "TFYYYYYF", "TFYYYYYF", "TFFYYYFT", "TTFFFFFT", "TTTFFFTT"
  ],
  coin: [
    "TTYYYYTT", "TYYYYYYT", "TYYLLYYT", "TYYLLYYT", "TYYLLYYT", "TYYLLYYT", "TYYYYYYT", "TTYYYYTT"
  ],
  qBlock: [
    "KKKKKKKKKKKKKKKK", "KYYYYYYYYYYYYYYK", "KYLLLLLLLLLLLLYK", "KYLKKKKKKKKKLLYK", "KYLKYLLLLYKLLYK",
    "KYLKYYYYYKLLYK", "KYLKTTTKYKLLYK", "KYLKTTTKYKLLYK", "KYLKTTKYKLLYK", "KYLKTTKYKLLYK",
    "KYLKTTTKKLLYK", "KYLKTTKYKLLYK", "KYLKTTKYKLLYK", "KYLKKKKKKKLLYK", "KYYYYYYYYYYYYYYK", "KKKKKKKKKKKKKKKK"
  ],
  brick: [
    "KKKKKKKKKKKKKKKK", "KCCCCCCCCCCCCCCK", "KCCCCCCCCCCCCCCK", "KCCCCCCCCCCCCCCK", "KKKKKKKKKKKKKKKK",
    "CCCCCCKCCCCCCCCC", "CCCCCCKCCCCCCCCC", "CCCCCCKCCCCCCCCC", "KKKKKKKKKKKKKKKK", "KCCCCCCCCCCCCCCK",
    "KCCCCCCCCCCCCCCK", "KCCCCCCCCCCCCCCK", "KKKKKKKKKKKKKKKK", "CCCCCCKCCCCCCCCC", "CCCCCCKCCCCCCCCC", "KKKKKKKKKKKKKKKK"
  ],
  stoneBlock: [ // Darker brick for castle
    "KKKKKKKKKKKKKKKK", "KSSSSSSSSSSSSSSK", "KSSSSSSSSSSSSSSK", "KSSSSSSSSSSSSSSK", "KKKKKKKKKKKKKKKK",
    "SSSSSSKSSSSSSSSS", "SSSSSSKSSSSSSSSS", "SSSSSSKSSSSSSSSS", "KKKKKKKKKKKKKKKK", "KSSSSSSSSSSSSSSK",
    "KSSSSSSSSSSSSSSK", "KSSSSSSSSSSSSSSK", "KKKKKKKKKKKKKKKK", "SSSSSSKSSSSSSSSS", "SSSSSSKSSSSSSSSS", "KKKKKKKKKKKKKKKK"
  ]
};

const preRenderSprite = (spriteArray, scale = 4) => {
  const canvas = document.createElement('canvas');
  const height = spriteArray.length;
  const width = spriteArray[0].length;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const colorChar = spriteArray[y][x];
      if (C[colorChar]) {
        ctx.fillStyle = C[colorChar];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  return canvas;
};

let SPRITE_CACHE = {};
const initSprites = () => {
  if (Object.keys(SPRITE_CACHE).length > 0) return;
  for (let key in SPRITES) {
    let scale = 4;
    if (key === 'bowser') scale = 6;
    if (key === 'qBlock' || key === 'brick' || key === 'stoneBlock') scale = 3; // 16x16 becomes 48x48
    if (key === 'peach') scale = 5;
    if (key === 'axe') scale = 4;
    SPRITE_CACHE[key] = preRenderSprite(SPRITES[key], scale);
  }
};

const IIM_IMG = new Image();
IIM_IMG.crossOrigin = "Anonymous";
IIM_IMG.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"; // High-res campus placeholder representing IIM Indore

const LEVEL = {
  // Surface World (X: 0 to 4000)
  surfaceGroundY: 480, 
  // Underworld / Castle (X: 4000 to 6000, Y is lower)
  castleGroundY: 1000, 
  
  pipe: { x: 3800, y: 480 - 96, w: 96, h: 96 },
  obstacles: [ 
    { x: 1500, y: 480 - 80, w: 64, h: 80 },
    { x: 2200, y: 480 - 120, w: 64, h: 120 },
    { x: 2800, y: 480 - 160, w: 64, h: 160 },
  ],

  blocks: [
    { x: 300, y: 300, type: 'q', content: "EDUCATION DATABANK\n\nSt Georges: ICSE 95.4%\n\nThe Pivot: Abandoned the crowded JEE engineering highway to forge a path in Commerce & Design. Realized I am a creator, not a calculator.", hit: false },
    { x: 600, y: 300, type: 'q', content: "SKILL UNLOCKED:\nUI/UX & Design Thinking\n\nI don't just make things look pretty; I architect experiences. Merging aesthetics with psychological flow to build systems people love.", hit: false },
    { x: 648, y: 300, type: 'brick', content: "", hit: false },
    { x: 696, y: 300, type: 'q', content: "SKILL UNLOCKED:\nFront-End Sorcery\n\nTurning wild ideas into interactive realities. React, Framer Motion, Node—if it can be imagined, it can be coded.", hit: false },
    { x: 1200, y: 300, type: 'q', content: "PROJECT: DEVANSH.EXE\n\nA standard resume is a static PDF. I built an entire physics-based, playable Mario universe in a single file to prove my capabilities. Actions > Words.", hit: false },
    { x: 1800, y: 250, type: 'q', content: "THE MAZE OF DISTRACTIONS\n\nStaying focused in the digital age is hard. Jumping these hurdles represents building unshakeable discipline.", hit: false },
    { x: 2500, y: 200, type: 'q', content: "LEAP OF FAITH\n\nSwitching streams from Science to Commerce was terrifying, but required a massive leap. Taking risks is my nature.", hit: false },
    { x: 3200, y: 250, type: 'q', content: "THE FINAL SPRINT\n\nThe tunnel approaches. The ultimate challenge awaits in the depths of the IPMAT arena.", hit: false },
  ],
  coins: [
    { x: 400, y: 380, collected: false }, { x: 440, y: 380, collected: false }, { x: 480, y: 380, collected: false },
    { x: 800, y: 260, collected: false }, { x: 840, y: 260, collected: false }, { x: 880, y: 260, collected: false },
    { x: 1900, y: 280, collected: false }, { x: 1940, y: 280, collected: false },
    { x: 2600, y: 280, collected: false }, { x: 2640, y: 280, collected: false }
  ],
  enemies: [
    { x: 500, type: 'turtle', startX: 500, range: 150, dir: -1, squashed: false, msg: "WEAKNESS SQUASHED:\nAcademic Burnout.\n\nEscaped the toxic JEE pressure cooker. Converted exhaustion into relentless creative momentum." },
    { x: 1000, type: 'turtle', startX: 1000, range: 200, dir: 1, squashed: false, msg: "WEAKNESS SQUASHED:\nFear of the Unknown.\n\nPivoting streams is terrifying. But taking the leap taught me absolute adaptability and self-trust." },
    { x: 1400, type: 'turtle', startX: 1400, range: 100, dir: -1, squashed: false, msg: "WEAKNESS SQUASHED:\nProcrastination.\n\nDefeated through sheer shipping momentum. Ideas are cheap; executing them perfectly is everything." },
    { x: 2000, type: 'turtle', startX: 2000, range: 150, dir: -1, squashed: false, msg: "WEAKNESS SQUASHED:\nPerfectionism.\n\nDone is better than perfect. I learned to iterate rapidly instead of getting stuck." },
    { x: 3000, type: 'turtle', startX: 3000, range: 200, dir: 1, squashed: false, msg: "WEAKNESS SQUASHED:\nSelf-Doubt.\n\nBuilt undeniable proof of my skills. I don't just claim I can code; I build the engine myself." },
  ],
  
  // Underworld Elements
  bridge: { startX: 4500, endX: 4900, y: 1000 - 48, active: true },
  axe: { x: 4920, y: 1000 - 96, hit: false },
  bowser: { x: 4750, hp: 1, fireballs: [], nextFire: 0, dead: false, fallY: 0 },
  princess: { x: 5400, y: 1000 - 80 }
};

const GameEngine = ({ setModal, setGameState, lives, setLives, setScore, modalActive }) => {
  const canvasRef = useRef(null);
  
  // Mutable physics & game state
  const state = useRef({
    cameraX: 0,
    cameraY: 0, // Follow Mario on Y axis
    mario: { x: 50, y: 0, vx: 0, vy: 0, w: 48, h: 60, isGrounded: false, dir: 1, state: 'idle', deadTimer: 0, invincibleTimer: 0, teleportTimer: 0 },
    keys: { left: false, right: false, up: false, down: false },
    blocks: JSON.parse(JSON.stringify(LEVEL.blocks)),
    coins: JSON.parse(JSON.stringify(LEVEL.coins)),
    enemies: JSON.parse(JSON.stringify(LEVEL.enemies)),
    bowser: JSON.parse(JSON.stringify(LEVEL.bowser)),
    axe: { ...LEVEL.axe },
    bridge: { ...LEVEL.bridge },
    particles: [],
    levelComplete: false,
    score: 0,
    theme: 'overworld', // overworld, underworld
    fadeAlpha: 0
  });

  const lastTime = useRef(performance.now());
  const reqRef = useRef();

  // Handle inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalActive) return; // Freeze input if modal open
      if(e.code === 'ArrowRight' || e.code === 'KeyD') state.current.keys.right = true;
      if(e.code === 'ArrowLeft' || e.code === 'KeyA') state.current.keys.left = true;
      if(e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') state.current.keys.up = true;
      if(e.code === 'ArrowDown' || e.code === 'KeyS') state.current.keys.down = true;
    };
    const handleKeyUp = (e) => {
      if(e.code === 'ArrowRight' || e.code === 'KeyD') state.current.keys.right = false;
      if(e.code === 'ArrowLeft' || e.code === 'KeyA') state.current.keys.left = false;
      if(e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') state.current.keys.up = false;
      if(e.code === 'ArrowDown' || e.code === 'KeyS') state.current.keys.down = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [modalActive]);

  useEffect(() => {
    initSprites();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const spawnParticles = (x, y, color, count, speed) => {
      for(let i=0; i<count; i++) {
        state.current.particles.push({
          x, y, vx: (Math.random()-0.5)*speed, vy: (Math.random()-1)*speed,
          life: 1, color, size: Math.random()*4+2
        });
      }
    };

    const killMario = () => {
      const m = state.current.mario;
      m.state = 'dead';
      m.vy = -500; m.vx = 0;
      m.deadTimer = 2; 
      playSound('die');
    };

    const handleDeathEnd = () => {
       const newLives = lives - 1;
       setLives(newLives);
       if (newLives <= 0) {
         setGameState('gameover');
       } else {
         const st = state.current;
         // Respawn logic based on world
         let rx = 50; let ry = 0;
         if (st.theme === 'underworld') { rx = 4200; ry = LEVEL.castleGroundY - 100; }
         st.mario = { x: rx, y: ry, vx: 0, vy: 0, w: 48, h: 60, isGrounded: false, dir: 1, state: 'idle', deadTimer: 0, invincibleTimer: 2, teleportTimer: 0 };
         state.current.keys = { left: false, right: false, up: false, down: false }; // Clear input lock
       }
    };

    const update = () => {
      if (!canvasRef.current) return;
      const st = state.current;
      const m = st.mario;
      const t = performance.now();
      const dt = Math.min((t - lastTime.current) / 1000, 0.05);
      lastTime.current = t;

      if (modalActive) {
         // Pause game logic if modal is showing, just draw
         draw(ctx, st, t);
         reqRef.current = requestAnimationFrame(update);
         return;
      }

      // Determine ground based on location
      const activeGroundY = m.x > 4000 ? LEVEL.castleGroundY : LEVEL.surfaceGroundY;
      st.theme = m.x > 4000 ? 'underworld' : 'overworld';

      /* PIPING TRANSITION LOGIC */
      if (m.state === 'piping') {
         m.y += 50 * dt; // slide down slowly
         st.fadeAlpha += 1 * dt; // fade to black
         if (st.fadeAlpha > 1) {
             // Teleport!
             m.x = 4200;
             m.y = LEVEL.castleGroundY - m.h - 100;
             m.state = 'idle';
             st.cameraX = 4200 - 200;
             st.cameraY = LEVEL.castleGroundY - 600;
         }
         draw(ctx, st, t);
         reqRef.current = requestAnimationFrame(update);
         return;
      }
      if (st.theme === 'underworld' && st.fadeAlpha > 0) {
         st.fadeAlpha -= 2 * dt; // fade back in
         if (st.fadeAlpha < 0) st.fadeAlpha = 0;
      }

      // Physics & Movement (Alive)
      if (m.state !== 'dead' && !st.levelComplete) {
        
        if (m.invincibleTimer > 0) m.invincibleTimer -= dt;

        // Pipe entry check
        if (st.keys.down && m.isGrounded && m.x > LEVEL.pipe.x + 10 && m.x + m.w < LEVEL.pipe.x + LEVEL.pipe.w - 10 && m.y + m.h === LEVEL.pipe.y) {
           m.state = 'piping';
           playSound('pipe');
           m.vx = 0; m.vy = 0;
           st.keys.down = false; // Reset
        }

        // X Movement
        if (st.keys.right) { m.vx += 1500 * dt; m.dir = 1; }
        else if (st.keys.left) { m.vx -= 1500 * dt; m.dir = -1; }
        else { m.vx *= 0.8; } // Friction
        
        if (m.vx > 300) m.vx = 300;
        if (m.vx < -300) m.vx = -300;
        if (Math.abs(m.vx) < 10) m.vx = 0;

        // Dust particles running
        if (m.isGrounded && Math.abs(m.vx) > 100 && Math.random() > 0.8) {
           spawnParticles(m.x + m.w/2, m.y + m.h, '#fff', 1, 50);
        }

        // Y Movement (Gravity)
        m.vy += 1500 * dt; 
        if (m.vy > 800) m.vy = 800;
        
        // Jump
        if (st.keys.up && m.isGrounded) {
          m.vy = -650;
          m.isGrounded = false;
          playSound('jump');
          spawnParticles(m.x + m.w/2, m.y + m.h, '#ddd', 5, 100);
        }

        // Apply X
        m.x += m.vx * dt;
        if (m.x < 0) m.x = 0; 
        if (st.theme === 'underworld' && m.x < 4100) m.x = 4100; // Left bound underground

        // Apply Y
        m.y += m.vy * dt;
        m.isGrounded = false;

        // Lava Death & Bottomless Pit Death
        if (st.theme === 'underworld' && m.y > LEVEL.castleGroundY + 100) {
            killMario();
        }
        if (st.theme === 'overworld' && m.y > LEVEL.surfaceGroundY + 100) {
            killMario(); // Fell into a pit
        }

        // Ground Collision
        let isOnSolidGround = true;
        if (st.theme === 'overworld') {
           // Pit between 2300 and 2450
           if (m.x + m.w/2 > 2300 && m.x + m.w/2 < 2450) isOnSolidGround = false;
        } else {
           if (m.x > st.bridge.startX && m.x < st.bridge.endX) isOnSolidGround = false;
        }

        if (isOnSolidGround && m.y + m.h >= activeGroundY) {
          m.y = activeGroundY - m.h;
          m.vy = 0;
          m.isGrounded = true;
        }

        // Bridge Collision (Underworld)
        if (st.bridge.active && st.theme === 'underworld' && m.x + m.w > st.bridge.startX && m.x < st.bridge.endX) {
           if (m.y + m.h >= st.bridge.y && m.y + m.h <= st.bridge.y + 40 && m.vy > 0) {
              m.y = st.bridge.y - m.h;
              m.vy = 0;
              m.isGrounded = true;
           }
        }

        // Obstacles (Pipes) Collision
        if (st.theme === 'overworld') {
           const obstacles = [...LEVEL.obstacles, LEVEL.pipe];
           obstacles.forEach(p => {
               if (m.x < p.x + p.w && m.x + m.w > p.x && m.y < p.y + p.h && m.y + m.h > p.y) {
                   if (m.vy > 0 && m.y + m.h < p.y + 40) { m.y = p.y - m.h; m.vy = 0; m.isGrounded = true; } // Top
                   else if (m.x < p.x + p.w/2) { m.x = p.x - m.w; m.vx = 0; } // Left
                   else { m.x = p.x + p.w; m.vx = 0; } // Right
               }
           });
        }

        // Question / Brick Block Collisions
        st.blocks.forEach(b => {
          const bw = 48; const bh = 48; 
          if (m.x < b.x + bw && m.x + m.w > b.x && m.y < b.y + bh && m.y + m.h > b.y) {
            const dx = (m.x + m.w/2) - (b.x + bw/2);
            const dy = (m.y + m.h/2) - (b.y + bh/2);
            const w = (m.w + bw) / 2;
            const h = (m.h + bh) / 2;
            const crossWidth = w * dy;
            const crossHeight = h * dx;

            if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
              if (crossWidth > crossHeight) {
                if (crossWidth > (-crossHeight)) { // Hit bottom of block
                  m.y = b.y + bh; m.vy = 0;
                  if (b.type === 'q' && !b.hit) {
                    b.hit = true;
                    playSound('powerup');
                    setScore(s => s + 100);
                    spawnParticles(b.x + bw/2, b.y, '#FFD700', 10, 150);
                    setModal({ title: "DATA UNLOCKED", text: b.content });
                    st.keys.left = false; st.keys.right = false; st.keys.up = false; 
                  } else if (b.type === 'brick') {
                    playSound('jump'); // bump sound
                  }
                } else { m.x = b.x - m.w; m.vx = 0; } // Left
              } else {
                if (crossWidth > (-crossHeight)) { m.x = b.x + bw; m.vx = 0; } // Right
                else { m.y = b.y - m.h; m.vy = 0; m.isGrounded = true; } // Top
              }
            }
          }
        });

        // Coins
        st.coins.forEach(c => {
          if (!c.collected && m.x < c.x + 32 && m.x + m.w > c.x && m.y < c.y + 32 && m.y + m.h > c.y) {
            c.collected = true;
            playSound('coin');
            setScore(s => s + 50);
            spawnParticles(c.x+16, c.y+16, '#FFD700', 5, 100);
          }
        });

        // Enemies (Turtles)
        st.enemies.forEach(e => {
          if (e.squashed) return;
          e.x += 50 * e.dir * dt;
          if (Math.abs(e.x - e.startX) > e.range) e.dir *= -1;

          if (m.invincibleTimer <= 0 && m.x < e.x + 48 && m.x + m.w > e.x && m.y < activeGroundY && m.y + m.h > activeGroundY - 48) {
            if (m.vy > 0 && m.y + m.h < activeGroundY - 20) {
              e.squashed = true;
              m.vy = -450; // Bounce
              playSound('stomp');
              setScore(s => s + 200);
              spawnParticles(e.x+24, e.y, '#fff', 10, 150);
              setModal({ title: "ACHIEVEMENT", text: e.msg });
              st.keys.left = false; st.keys.right = false; st.keys.up = false;
            } else {
              killMario();
            }
          }
        });

        // Bowser Logic
        if (st.theme === 'underworld') {
           const b = st.bowser;
           if (!b.dead && Math.abs(m.x - b.x) < 600) {
             // Shoot fire
             if (t > b.nextFire && !st.axe.hit) {
               b.fireballs.push({ x: b.x, y: st.bridge.y - 40, vx: -250 });
               b.nextFire = t + 2000;
             }
             
             // Touch Bowser = Death (no head jump kills here, it's classic SMB1)
             if (m.invincibleTimer <= 0 && !st.axe.hit && m.x < b.x + 96 && m.x + m.w > b.x && m.y + m.h > st.bridge.y - 96 && m.y < st.bridge.y) {
                killMario();
             }
           }

           // Fireballs
           b.fireballs.forEach((fb, i) => {
             fb.x += fb.vx * dt;
             spawnParticles(fb.x + 16, fb.y + 16, '#FF4500', 1, 20); // Fire trail
             if (fb.x < st.cameraX) b.fireballs.splice(i, 1);
             if (m.invincibleTimer <= 0 && m.x < fb.x + 32 && m.x + m.w > fb.x && m.y < fb.y + 32 && m.y + m.h > fb.y) {
                killMario();
             }
           });

           // Axe Logic
           if (!st.axe.hit && m.x + m.w > st.axe.x && m.x < st.axe.x + 40 && m.y + m.h >= st.bridge.y - 64) {
               st.axe.hit = true;
               st.bridge.active = false; // Bridge collapses
               playSound('bridgeCollapse');
               spawnParticles(st.axe.x, st.axe.y, '#FFF', 30, 300);
               st.score += 1000;
           }

           // Bowser Fall
           if (st.axe.hit && !b.dead) {
               b.fallY += 300 * dt;
               if (b.fallY > 500) b.dead = true;
           }

           // Princess / IIM Indore Collision
           if (m.x > LEVEL.princess.x && !st.levelComplete) {
              st.levelComplete = true;
              m.vx = 0; m.state = 'idle';
              playSound('powerup');
              setTimeout(() => setGameState('victory'), 2000);
           }
        }

        // Animation State
        if (m.state !== 'piping') {
          if (!m.isGrounded) m.state = 'jump';
          else if (Math.abs(m.vx) > 10) m.state = 'run';
          else m.state = 'idle';
        }

        // Camera Update (Smooth Tracking)
        const targetCamX = m.x - 300;
        st.cameraX += (targetCamX - st.cameraX) * 5 * dt;
        if (st.cameraX < 0) st.cameraX = 0;
        
        const targetCamY = activeGroundY - 480;
        st.cameraY += (targetCamY - st.cameraY) * 5 * dt;

      } else if (m.state === 'dead') {
        m.vy += 1500 * dt;
        m.y += m.vy * dt;
        m.deadTimer -= dt;
        if (m.deadTimer <= 0) handleDeathEnd();
      }

      // Update Particles
      st.particles.forEach((p, i) => {
         p.x += p.vx * dt; p.y += p.vy * dt;
         p.vy += 200 * dt; // gravity
         p.life -= 2 * dt;
         if(p.life <= 0) st.particles.splice(i, 1);
      });

      draw(ctx, st, t);
      reqRef.current = requestAnimationFrame(update);
    };

    reqRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(reqRef.current);
  }, [modalActive, lives, setGameState, setLives, setModal, setScore]);

  const draw = (ctx, st, t) => {
      const cw = canvasRef.current.width;
      const ch = canvasRef.current.height;
      const m = st.mario;

      // Backgrounds
      if (st.theme === 'overworld') {
        const grad = ctx.createLinearGradient(0, 0, 0, ch);
        grad.addColorStop(0, '#5C94FC'); grad.addColorStop(1, '#A0C4FF');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      } else {
        ctx.fillStyle = '#0a0000'; // Dark castle red/black
        ctx.fillRect(0, 0, cw, ch);
      }

      ctx.save();
      ctx.translate(-st.cameraX, -st.cameraY);

      // --- OVERWORLD SCENERY ---
      if (st.theme === 'overworld') {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for(let i=0; i<8000; i+=800) { // Clouds
           ctx.beginPath(); ctx.arc(i, 150, 40, 0, Math.PI*2); ctx.arc(i+30, 130, 50, 0, Math.PI*2); ctx.arc(i+60, 150, 40, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = '#00AA00'; // Bushes
        for(let i=400; i<8000; i+=1000) {
           ctx.beginPath(); ctx.arc(i, LEVEL.surfaceGroundY-20, 30, 0, Math.PI*2); ctx.arc(i+30, LEVEL.surfaceGroundY-40, 40, 0, Math.PI*2); ctx.arc(i+60, LEVEL.surfaceGroundY-20, 30, 0, Math.PI*2); ctx.fill();
        }

        // Overworld Ground (with pits)
        ctx.fillStyle = '#C84C0C';
        ctx.fillRect(0, LEVEL.surfaceGroundY, 2300, 1000);
        ctx.fillRect(2450, LEVEL.surfaceGroundY, 2000, 1000);
        ctx.fillStyle = '#903000'; // Pattern
        for(let i = 0; i < 2300; i+=40) { ctx.fillRect(i, LEVEL.surfaceGroundY, 2, 1000); ctx.fillRect(i, LEVEL.surfaceGroundY + 20, 40, 2); }
        for(let i = 2450; i < 4450; i+=40) { ctx.fillRect(i, LEVEL.surfaceGroundY, 2, 1000); ctx.fillRect(i, LEVEL.surfaceGroundY + 20, 40, 2); }

        // Obstacles (Green Pipes)
        const pipesToDraw = [...LEVEL.obstacles, LEVEL.pipe];
        pipesToDraw.forEach(p => {
            const pGrad = ctx.createLinearGradient(p.x, 0, p.x+p.w, 0);
            pGrad.addColorStop(0, '#006400'); pGrad.addColorStop(0.5, '#00EE00'); pGrad.addColorStop(1, '#006400');
            ctx.fillStyle = pGrad;
            ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.fillStyle = '#000'; ctx.strokeRect(p.x, p.y, p.w, p.h);
            ctx.fillRect(p.x-5, p.y, p.w+10, 24); // Pipe top
            ctx.fillStyle = pGrad; ctx.fillRect(p.x-4, p.y+1, p.w+8, 22);
        });
      }

      // --- UNDERWORLD SCENERY ---
      if (st.theme === 'underworld') {
        // Glowing Lava
        const lavaY = LEVEL.castleGroundY;
        const lavaGrad = ctx.createLinearGradient(0, lavaY, 0, lavaY + 100);
        lavaGrad.addColorStop(0, '#FF4500'); lavaGrad.addColorStop(1, '#8B0000');
        ctx.fillStyle = lavaGrad;
        ctx.fillRect(4000, lavaY, 2000, 500);
        
        // Animated Lava bubbles
        ctx.fillStyle = '#FFD700';
        for(let i=4000; i<6000; i+=60) {
           const offset = Math.sin(t/300 + i) * 10;
           ctx.fillRect(i, lavaY + 5 + offset, 10, 10);
        }

        // Underworld Ground (Stone)
        ctx.fillStyle = '#444';
        ctx.fillRect(4000, LEVEL.castleGroundY, 500, 500); // Start platform
        ctx.fillRect(4900, LEVEL.castleGroundY, 1000, 500); // End platform

        // Bridge
        if (st.bridge.active) {
          ctx.fillStyle = '#A0522D';
          for(let i=st.bridge.startX; i<st.bridge.endX; i+=30) {
             ctx.fillRect(i, st.bridge.y, 25, 10);
             // Rope
             ctx.fillStyle = '#D2B48C'; ctx.fillRect(i, st.bridge.y+15, 25, 2); ctx.fillStyle = '#A0522D';
          }
        }

        // Axe
        if (!st.axe.hit) {
           ctx.save();
           ctx.translate(st.axe.x + 16, st.axe.y + 16);
           ctx.rotate(Math.sin(t/200) * 0.1); // subtle float/swing
           ctx.drawImage(SPRITE_CACHE.axe, -16, -16);
           ctx.restore();
        }

        // IIM Indore Campus Image
        if (IIM_IMG.complete && IIM_IMG.naturalWidth !== 0) {
           ctx.globalAlpha = 0.9;
           // Draw campus background
           ctx.drawImage(IIM_IMG, LEVEL.princess.x - 200, LEVEL.castleGroundY - 300, 450, 300);
           ctx.globalAlpha = 1.0;
        }

        // Princess & Castle Text
        if (SPRITE_CACHE.peach) ctx.drawImage(SPRITE_CACHE.peach, LEVEL.princess.x, LEVEL.princess.y - 16);
        ctx.fillStyle = '#FFF'; ctx.font = '16px "Press Start 2P"'; 
        ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
        ctx.fillText("IIM INDORE HQ", LEVEL.princess.x - 40, LEVEL.princess.y - 40);
        ctx.shadowBlur = 0; // reset
      }

      // Blocks & Coins
      st.blocks.forEach(b => {
        if(b.type === 'q') ctx.drawImage(b.hit ? SPRITE_CACHE.stoneBlock : SPRITE_CACHE.qBlock, b.x, b.y);
        else ctx.drawImage(SPRITE_CACHE.brick, b.x, b.y);
      });

      st.coins.forEach(c => {
         if(!c.collected) {
           ctx.save(); ctx.translate(c.x + 16, c.y + 16); ctx.scale(Math.sin(t / 200) > 0 ? 1 : -1, 1);
           ctx.drawImage(SPRITE_CACHE.coin, -16, -16); ctx.restore();
         }
      });

      // Enemies
      st.enemies.forEach(e => {
        if(e.squashed) ctx.drawImage(SPRITE_CACHE.turtleSquash, e.x, LEVEL.surfaceGroundY - 24);
        else {
           ctx.save(); ctx.translate(e.x + 24, LEVEL.surfaceGroundY - 24); ctx.scale(e.dir, 1);
           ctx.drawImage(SPRITE_CACHE.turtle, -24, -24); ctx.restore();
        }
      });

      // Bowser (IPMAT Boss)
      const b = st.bowser;
      if (st.theme === 'underworld') {
        ctx.save();
        ctx.translate(b.x, st.bridge.y - 96 + b.fallY);
        if (!b.dead) {
           // Boss Text
           ctx.fillStyle = '#FF4500'; ctx.font = '12px "Press Start 2P"'; ctx.shadowColor = '#000'; ctx.shadowBlur = 5;
           ctx.fillText("IPMAT PAPER", 0, -20); ctx.shadowBlur = 0;
        }
        ctx.drawImage(SPRITE_CACHE.bowser, 0, 0);
        ctx.restore();

        // Fireballs
        b.fireballs.forEach(fb => ctx.drawImage(SPRITE_CACHE.fireball, fb.x, fb.y));
      }

      // Particles
      st.particles.forEach(p => {
         ctx.fillStyle = p.color;
         ctx.globalAlpha = p.life;
         ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      // Mario
      if (m.invincibleTimer <= 0 || Math.floor(t / 100) % 2 === 0) {
         ctx.save();
         let spr = SPRITE_CACHE.marioIdle;
         if (m.state === 'dead') spr = SPRITE_CACHE.marioIdle; // using idle for dead, rotated
         else if (m.state === 'jump') spr = SPRITE_CACHE.marioJump;
         else if (m.state === 'run') spr = (Math.floor(t / 100) % 2 === 0) ? SPRITE_CACHE.marioRun : SPRITE_CACHE.marioIdle;

         ctx.translate(m.x + m.w/2, m.y + m.h/2);
         if (m.state === 'dead') ctx.rotate(Math.PI);
         ctx.scale(m.dir, 1);
         ctx.drawImage(spr, -m.w/2, -m.h/2);
         ctx.restore();
      }

      ctx.restore();

      // Screen Fade
      if (st.fadeAlpha > 0) {
         ctx.fillStyle = `rgba(0,0,0,${Math.min(st.fadeAlpha, 1)})`;
         ctx.fillRect(0,0,cw,ch);
      }
  };

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="block w-full h-full" />
      
      {/* Mobile Touch Overlay */}
      <div className="md:hidden absolute bottom-8 left-0 w-full px-8 flex justify-between select-none pointer-events-auto z-50">
         <div className="flex gap-4">
            <button className="mobile-btn w-16 h-16 text-2xl" onTouchStart={(e)=>{e.preventDefault(); state.current.keys.left=true;}} onTouchEnd={(e)=>{e.preventDefault(); state.current.keys.left=false;}}>◀</button>
            <button className="mobile-btn w-16 h-16 text-2xl" onTouchStart={(e)=>{e.preventDefault(); state.current.keys.right=true;}} onTouchEnd={(e)=>{e.preventDefault(); state.current.keys.right=false;}}>▶</button>
         </div>
         <div className="flex gap-4">
            <button className="mobile-btn w-16 h-16 text-2xl" onTouchStart={(e)=>{e.preventDefault(); state.current.keys.down=true;}} onTouchEnd={(e)=>{e.preventDefault(); state.current.keys.down=false;}}>▼</button>
            <button className="mobile-btn w-16 h-16 text-lg bg-red-500/50" onTouchStart={(e)=>{e.preventDefault(); state.current.keys.up=true;}} onTouchEnd={(e)=>{e.preventDefault(); state.current.keys.up=false;}}>A</button>
         </div>
      </div>
    </div>
  );
};

const App = () => {
  const [gameState, setGameState] = useState('start'); 
  const [lives, setLives] = useState(2);
  const [score, setScore] = useState(0);
  const [modal, setModal] = useState(null);

  // Restart Logic
  const restart = () => {
     setLives(2); setScore(0); setGameState('playing'); setModal(null);
  };

  // Allow "Enter" or "Right Arrow" key to close the dialogue box
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.key === 'Enter' || e.key === 'ArrowRight') && modal) {
        setModal(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [modal]);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden scanlines text-white">
      <style>{FONTS}</style>

      {/* UI HUD */}
      {gameState === 'playing' && (
        <div className="absolute top-4 left-4 right-4 flex justify-between z-40 pixel-font text-sm md:text-xl drop-shadow-[2px_2px_0_black]">
          <div>DEVANSH<br/>{score.toString().padStart(6, '0')}</div>
          <div>IPMAT ATTEMPTS<br/>{"❤️".repeat(lives)}</div>
          <div className="text-right">WORLD<br/>1-1</div>
        </div>
      )}

      {/* Start Screen */}
      <AnimatePresence>
        {gameState === 'start' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-50">
            <motion.h1 
              initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="pixel-font text-5xl md:text-7xl text-white mb-2 text-center tracking-wider drop-shadow-[4px_4px_0_#E52521]">
              MARIO<span className="text-[#E52521]">.EXE</span>
            </motion.h1>
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pixel-font text-yellow-400 text-lg md:text-2xl mb-12 text-center">
              THE INTERACTIVE RESUME
            </motion.h2>

            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8 }} className="dialogue-box text-xs md:text-sm leading-loose max-w-xl w-11/12 mb-10 border-blue-500">
              <p className="text-green-400 mb-4">{'>'} SYSTEM BOOT: SUCCESS</p>
              <p className="mb-2">- Use ARROW KEYS/WASD to move, SPACE to jump.</p>
              <p className="mb-2 text-yellow-300">- Hit [?] blocks to unlock Resume Data.</p>
              <p className="mb-2">- Jump on enemies to overcome weaknesses.</p>
              <p className="mb-2 text-purple-400">- Stand on the Green Pipe and press DOWN to enter the Castle.</p>
              <p className="text-red-400 mt-4 animate-pulse">- Boss Fight: Run past Bowser (IPMAT) and hit the Axe!</p>
            </motion.div>
            
            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              onClick={() => setGameState('playing')} className="nes-btn animate-pulse text-xl px-8 py-4">
              PRESS START
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Engine rendering layer */}
      {gameState === 'playing' && (
         <GameEngine setModal={setModal} setGameState={setGameState} lives={lives} setLives={setLives} setScore={setScore} modalActive={!!modal} />
      )}

      {/* Dialogue Box (DGB) */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{opacity:0, y: 50}} animate={{opacity:1, y: 0}} exit={{opacity:0, scale: 0.9}} className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto">
            <div className="dialogue-box max-w-2xl w-11/12 text-center relative border-yellow-400 border-4">
               <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 flex items-center justify-center text-black pixel-font text-xl">!</div>
               <h3 className="pixel-font text-yellow-400 text-lg md:text-xl mb-6 leading-relaxed">{modal.title}</h3>
               <p className="pixel-font text-xs md:text-sm leading-loose whitespace-pre-wrap mb-10 text-gray-200">{modal.text}</p>
               <button className="nes-btn text-xs px-6 py-3" onClick={() => setModal(null)}>CONTINUE [ENTER/➔]</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#110000] text-center border-8 border-red-900 w-full overflow-hidden px-4">
            <h2 className="pixel-font text-red-600 text-3xl md:text-5xl mb-6 animate-pulse drop-shadow-[0_0_15px_red] break-words w-full">GAME OVER</h2>
            <p className="pixel-font text-xs sm:text-sm md:text-base leading-loose max-w-md w-11/12 mb-12 text-gray-300 break-words">
               You exhausted your 2 IPMAT attempts.<br/><br/>But in the real world, failure is just data. Recalibrate your strategy, upgrade your skills, and try again.
            </p>
            <button onClick={restart} className="nes-btn px-6 py-3 sm:px-10 sm:py-4 text-sm sm:text-xl max-w-[90vw] break-words">PLAY AGAIN</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory / Multiplayer Lobby Screen */}
      <AnimatePresence>
        {gameState === 'victory' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{ duration: 1 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#000022] to-[#003366] text-center overflow-y-auto overflow-x-hidden py-10 px-2 w-full">
            <div className="scanlines absolute inset-0 mix-blend-overlay"></div>
            
            <motion.h2 
              initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
              className="pixel-font text-yellow-400 text-xl sm:text-3xl md:text-5xl mb-8 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] z-10 mt-10 w-full px-2 break-words max-w-[95vw]">
              MISSION COMPLETE!
            </motion.h2>

            <div className="dialogue-box text-left max-w-3xl w-11/12 z-10 border-green-400 mb-8 mx-auto">
               <p className="pixel-font text-xs sm:text-sm md:text-base leading-loose mb-6 text-gray-200 break-words">
                 <span className="text-green-400">SUCCESS:</span> You dropped the IPMAT paper into the lava, conquered your weaknesses, and reached IIM Indore! 
                 <br/><br/>
                 You've seen the data. You've played the journey. Now it's time to initiate contact in the real world. Welcome to the Multiplayer Lobby.
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8">
                 <motion.a whileHover={{ y: -5 }} href={`mailto:${PROFILE.email}`} className="bg-blue-900/50 border-2 border-blue-400 p-4 sm:p-6 flex flex-col items-center justify-center text-center transition-colors hover:bg-blue-800 break-all">
                   <Mail className="w-10 h-10 sm:w-12 sm:h-12 mb-4 text-blue-300" />
                   <span className="pixel-font text-[10px] sm:text-xs text-blue-200">DIRECT COMMS</span>
                 </motion.a>
                 <motion.a whileHover={{ y: -5 }} href={PROFILE.linkedin} target="_blank" rel="noreferrer" className="bg-indigo-900/50 border-2 border-indigo-400 p-4 sm:p-6 flex flex-col items-center justify-center text-center transition-colors hover:bg-indigo-800 break-all">
                   <Linkedin className="w-10 h-10 sm:w-12 sm:h-12 mb-4 text-indigo-300" />
                   <span className="pixel-font text-[10px] sm:text-xs text-indigo-200">PROFESSIONAL GRID</span>
                 </motion.a>
                 <motion.a whileHover={{ y: -5 }} href={`https://${PROFILE.github}`} target="_blank" rel="noreferrer" className="bg-gray-900/50 border-2 border-gray-400 p-4 sm:p-6 flex flex-col items-center justify-center text-center transition-colors hover:bg-gray-800 break-all">
                   <Github className="w-10 h-10 sm:w-12 sm:h-12 mb-4 text-gray-300" />
                   <span className="pixel-font text-[10px] sm:text-xs text-gray-200">SOURCE CODE</span>
                 </motion.a>
               </div>
            </div>

            <button onClick={restart} className="nes-btn z-10 px-6 py-3 sm:px-8 sm:py-3 mb-10 text-xs sm:text-sm max-w-[90vw] break-words">PLAY AGAIN</button>
            
            <p className="pixel-font text-[8px] sm:text-[10px] text-gray-500 z-10 pb-4">© DEVANSH AGARWAL. BUILT WITH REACT, CANVAS & RESILIENCE.</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;