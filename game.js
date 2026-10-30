(() => {
  const gameContainer = document.getElementById("game");
  const SEC = 960;
  const H = 540;

  /* ===== SONIDOS ===== */
  const SOUNDS = {
    menu:  { file: "audio/menu.mp3",     volume: 0.4, loop: true }, 
    music: { file: "audio/musica.mp3",   volume: 0.4, loop: true }, 
    jump:  { file: "audio/salto.mp3",    volume: 0.6 },             
    coin:  { file: "audio/moneda.mp3",   volume: 0.6 },             
    win:   { file: "audio/victoria.mp3", volume: 0.7 },             
    click: { file: "audio/click.mp3",    volume: 0.5 }            
  };

  const audioCache = {};
  let soundMuted = false;

  function getAudio(name) {
    if (!audioCache[name]) {
      const cfg = SOUNDS[name];
      const audio = new Audio(cfg.file);
      audio.loop = !!cfg.loop;
      audio.volume = cfg.volume;
      audio.muted = soundMuted;
      audioCache[name] = audio;
    }

    return audioCache[name];
  }

  let currentLoop = null;
  window.GameAudio = {
    play(name) {
      const audio = getAudio(name);
      audio.currentTime = 0;
      audio.play().catch(() => {}); 
    },

    loop(name) {
      if (currentLoop === name && !getAudio(name).paused) return;

      this.stopLoops();
      currentLoop = name;
      getAudio(name).play().catch(() => {});
    },

    stopLoops() {
      Object.keys(SOUNDS).forEach((name) => {
        if (SOUNDS[name].loop && audioCache[name]) {
          audioCache[name].pause();
          audioCache[name].currentTime = 0;
        }
      });
      currentLoop = null;
    },
    toggleMute() {
      soundMuted = !soundMuted;
      Object.values(audioCache).forEach((audio) => { audio.muted = soundMuted; });
      return soundMuted;
    }
  };

  /* ===== EFECTOS DE SONIDO ===== */
  const SFX_VOLUME = 0.7;
  const SFX_FILES = {
    jump: "audio/salto.mp3",     
    coin: "audio/moneda.mp3",    
    win: "audio/final.mp3"       
  };

  const characterImages = {
    chiikawa: "imagenes/chiikawa.png",
    hachiware: "imagenes/hachiware.png",
    usagi: "imagenes/usagi.png"
  };

  //Cosas a modificar

  const characterStats = {
    chiikawa: { speed: 4.5, jump: 13 },    // Equilibrado
    hachiware: { speed: 5.2, jump: 12.5 }, // Valiente
    usagi: { speed: 4.5, jump: 14.5 }      // Saltador
  };

  const SPRITE = 85;
  const HB = { offX: 18, w: 49, h: 76 };

  //cosa a modificar de la gravedad
  const GRAVITY = 0.6;
  const STEP = 1000 / 60;

  const START = { x: 40, y: 120 };
  const VILLAIN_SIZE = 70;

  const rooms = {

    /* ================== NIVEL PRINCIPAL ================== */

    main: {
      sections: [

        /* ===== SECCIÓN 1 · INICIO ===== */

        {
          name: "SECCIÓN 1 · INICIO",
          clouds: [{ x: 90, y: 400 }, { x: 640, y: 440, small: true }],
          ground: [{ x: 0, w: 960, top: 120 }],
          platforms: [{ x: 390, w: 160, top: 235 }],
          coins: [{ x: 450, y: 275 }]
        },

        /* ===== SECCIÓN 2 · DESARROLLO ===== */
        {
          name: "SECCIÓN 2 · DESARROLLO",
          clouds: [{ x: 70, y: 400 }, { x: 380, y: 330, small: true }, { x: 700, y: 430 }],
          ground: [
            { x: 0,   w: 170, top: 120 },
            { x: 170, w: 160, top: 80 },
            { x: 520, w: 100, top: 80 },
            { x: 620, w: 340, top: 120 }
          ],
          pit: { x: 330, w: 190, top: 40 },
          spikes: { x: 330, w: 190, y: 40, h: 34 },
          platforms: [
            { x: 80,  w: 140, top: 230 },
            { x: 345, w: 120, top: 190 },
            { x: 590, w: 150, top: 235 }
          ],
          block: { x: 130, y: 335, w: 56, h: 56 },
          coins: [{ x: 650, y: 280 }],
          pipes: [{ x: 810, w: 80, top: 200, solid: true, pipeTo: "secret" }],
          villains: [
            { id: "villano1", img: "imagenes/kimera.png", y: 120, min: 625, max: 735, speed: 1.2 }
          ]
        },

        /* ===== SECCIÓN 3 · FINAL ===== */
        {
          name: "SECCIÓN 3 · FINAL",
          clouds: [{ x: 90, y: 420 }, { x: 560, y: 450, small: true }, { x: 780, y: 480, small: true }],
          ground: [
            { x: 0,   w: 162, top: 120 },
            { x: 162, w: 186, top: 235 },
            { x: 348, w: 196, top: 130 },
            { x: 544, w: 99,  top: 85 },
            { x: 643, w: 317, top: 200 }
          ],
          platforms: [{ x: 455, w: 165, top: 320 }],
          coins: [{ x: 517, y: 362 }],
          pipes: [
            { x: 790, w: 100, top: 165, bottom: 20, solid: false },
            { x: 680, w: 80, top: 270, solid: true, exit: true }
          ],
          villains: [
            //Villano a modificar

            { id: "villano2", img: "imagenes/chiibaku.png", y: 130, min: 385, max: 474, speed: 1.4 }
          ],
          flag: { x: 800, base: 200, height: 280 }
        }
      ]
    },

    /* ================== SALA SECRETA (pequeña) ================== */
    secret: {
      secret: true,
      sections: [
        {
          name: "SALA SECRETA",
          ground: [{ x: 0, w: 960, top: 120 }],
          platforms: [{ x: 540, w: 170, top: 235 }],
          coins: [
            { x: 240, y: 135 }, { x: 300, y: 135 }, { x: 360, y: 135 },
            { x: 420, y: 135 }, { x: 480, y: 135 },
            { x: 565, y: 275 }, { x: 615, y: 275 }, { x: 665, y: 275 }
          ],
          pipes: [{ x: 830, w: 80, top: 190, solid: true, pipeTo: "main" }]
        }
      ]
    }
  };

  /* ---------- Estado ---------- */
  let worldEl, track, player, counter, banner, message;
  let animationFrame;
  let messageTimer;
  let keys = {};

  let currentRoom = "main";
  let sections = rooms.main.sections;
  let worldW = SEC * 3;

  let solids = [];
  let platforms = [];
  let coinList = [];
  let hazards = [];
  let villains = [];
  let flagZone = null;
  let totalCoins = 0;
  let progress = { collected: new Set(), blocks: new Set(), defeated: new Set() };

  let px, py, vy, camX;
  let onGround;
  let coins;
  let finished;
  let stats;
  let lastTime;
  let accumulator;
  let currentSection;
  let pipeCooldown;

  /* ---------- Utilidades ---------- */
  function box(el, x, y, w, h) {
    el.style.left = (x / worldW) * 100 + "%";
    el.style.bottom = (y / H) * 100 + "%";
    if (w !== undefined) el.style.width = (w / worldW) * 100 + "%";
    if (h !== undefined) el.style.height = (h / H) * 100 + "%";
  }

  function make(className, x, y, w, h, text) {
    const el = document.createElement("div");
    el.className = className;
    box(el, x, y, w, h);
    if (text) el.textContent = text;
    track.appendChild(el);
    return el;
  }

  function isDown(...names) {
    return names.some((name) => keys[name]);
  }

  function rectsOverlap(hx, hy, hw, hh, s) {
    return (
      hx < s.x + s.w &&
      hx + hw > s.x &&
      hy < s.top &&
      hy + hh > s.bottom
    );
  }

  function updateCounter() {
    counter.textContent = "MONEDAS: " + coins;
  }

  function showMessage(html, ms) {
    clearTimeout(messageTimer);
    message.innerHTML = html;
    message.classList.remove("hidden");

    if (ms) {
      messageTimer = setTimeout(() => message.classList.add("hidden"), ms);
    }
  }

  function countTotalCoins() {
    let total = 0;

    Object.values(rooms).forEach((room) => {
      room.sections.forEach((sec) => {
        total += (sec.coins || []).length;
        if (sec.block) total++;
      });
    });

    return total;
  }

  /* ---------- Construcción de una sala ---------- */
  function buildLevel(roomKey) {
    const room = rooms[roomKey];

    currentRoom = roomKey;
    sections = room.sections;
    worldW = SEC * sections.length;

    // Reemplazar el mundo anterior
    if (worldEl) worldEl.remove();

    worldEl = document.createElement("div");
    worldEl.className = "game-world" + (room.secret ? " secret" : "");

    track = document.createElement("div");
    track.className = "game-track";
    track.style.width = sections.length * 100 + "%";
    worldEl.appendChild(track);
    gameContainer.insertBefore(worldEl, gameContainer.firstChild);

    solids = [];
    platforms = [];
    coinList = [];
    hazards = [];
    villains = [];
    flagZone = null;

    sections.forEach((sec, i) => {
      const o = i * SEC;

      (sec.clouds || []).forEach((c) =>
        make("game-cloud" + (c.small ? " game-cloud-small" : ""), o + c.x, c.y, 105, 26)
      );

      (sec.ground || []).forEach((g) => {
        make("game-ground", o + g.x, 0, g.w, g.top);
        solids.push({ x: o + g.x, w: g.w, top: g.top, bottom: 0 });
      });

      if (sec.pit) {
        const p = sec.pit;
        make("game-pit-floor", o + p.x, 0, p.w, p.top);
        solids.push({ x: o + p.x, w: p.w, top: p.top, bottom: 0 });
      }

      if (sec.spikes) {
        const sp = sec.spikes;
        const el = make("game-spikes", o + sp.x, sp.y, sp.w, sp.h);
        for (let k = 0; k < 6; k++) el.appendChild(document.createElement("span"));
        hazards.push({ x: o + sp.x, w: sp.w, top: sp.y + sp.h - 8 });
      }

      (sec.platforms || []).forEach((p) => {
        make("game-platform", o + p.x, p.top - 28, p.w, 28);
        platforms.push({ x: o + p.x, w: p.w, top: p.top });
      });

      (sec.pipes || []).forEach((p) => {
        const bottom = p.bottom || 0;
        make("game-pipe", o + p.x, bottom, p.w, p.top - bottom);

        if (p.solid) {
          solids.push({
            x: o + p.x, w: p.w, top: p.top, bottom: 0,
            pipeTo: p.pipeTo || null,
            isExit: !!p.exit
          });
        }

        if (p.pipeTo) {
          make("game-pipe-hint", o + p.x, p.top + 8, p.w, 26, "▼");
        }
      });

      if (sec.block) {
        const b = sec.block;
        const id = "bloque-" + roomKey + "-" + i;
        const obj = { id, used: progress.blocks.has(id), el: null };

        obj.el = make("game-question", o + b.x, b.y, b.w, b.h, obj.used ? "" : "?");
        if (obj.used) obj.el.classList.add("used");

        solids.push({
          x: o + b.x, w: b.w, top: b.y + b.h, bottom: b.y,
          type: "block", ref: obj
        });
      }

      (sec.coins || []).forEach((c, k) => {
        const id = "moneda-" + roomKey + "-" + i + "-" + k;
        const el = make("game-star", o + c.x, c.y, 40, 40, "⭐");
        const collected = progress.collected.has(id);

        if (collected) el.style.display = "none";
        coinList.push({ id, x: o + c.x, y: c.y, w: 40, h: 40, el, collected });
      });

      (sec.villains || []).forEach((v) => {
        if (progress.defeated.has(v.id)) return;

        const el = document.createElement("img");
        el.className = "game-villain";
        el.src = v.img;
        el.alt = "Villano";
        el.draggable = false;
        track.appendChild(el);

        const villain = {
          id: v.id,
          el,
          x: o + v.min,
          y: v.y,
          min: o + v.min,
          max: o + v.max,
          speed: v.speed,
          dir: 1,
          alive: true
        };

        el.addEventListener("error", () => {
          const fallback = document.createElement("div");
          fallback.className = "game-villain game-villain-fallback";
          fallback.textContent = "👾";
          el.replaceWith(fallback);
          villain.el = fallback;
        });

        villains.push(villain);
      });

      if (sec.flag) {
        const f = sec.flag;
        make("game-flag-pole", o + f.x, f.base, 14, f.height);
        make("game-flag-ball", o + f.x - 3, f.base + f.height - 6, 20, 20);
        const pennant = make("game-flag-pennant", o + f.x + 14, f.base + f.height - 95, 125, 85);
        pennant.innerHTML = "<span>🐹</span>";

        flagZone = { x: o + f.x - 12, w: 38, top: f.base + f.height, bottom: f.base };
      }
    });

    player = document.createElement("img");
    player.src = characterImages[window.SELECTED_CHARACTER] || characterImages.chiikawa;
    player.alt = window.SELECTED_CHARACTER || "chiikawa";
    player.className = "game-character";
    player.draggable = false;
    track.appendChild(player);

    currentSection = -1;
  }

  /* ---------- Eventos de teclado ---------- */
  function handleKeyDown(event) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
      event.preventDefault();
    }

    keys[event.key] = true;

    if (event.key.toLowerCase() === "m") {
      const muted = window.GameAudio.toggleMute();
      showMessage(muted ? "SONIDO: NO" : "SONIDO: SÍ", 900);
    }

    if (event.key.toLowerCase() === "r") {
      window.startChiikawaGame();
    }
  }

  function handleKeyUp(event) {
    keys[event.key] = false;
  }

  function handleBlur() {
    keys = {};
  }

  /* ---------- Reglas del juego ---------- */
  function respawnAtSectionStart() {
    const index = Math.max(
      0,
      Math.min(sections.length - 1, Math.floor((px + HB.offX + HB.w / 2) / SEC))
    );

    px = index * SEC + START.x;
    py = START.y;
    vy = 0;
    onGround = true;
  }

  function hurt(text) {
    showMessage(text || "¡AUCH!", 1100);
    respawnAtSectionStart();
  }

  function bump(block) {
    if (block.used) return;

    block.used = true;
    progress.blocks.add(block.id);
    window.GameAudio.play("coin");
    coins++;
    updateCounter();
    block.el.classList.add("used", "bump");
    block.el.textContent = "";
    setTimeout(() => block.el.classList.remove("bump"), 250);
  }

  function defeat(villain) {
    villain.alive = false;
    progress.defeated.add(villain.id);
    villain.el.classList.add("squashed");

    const el = villain.el;
    setTimeout(() => el.remove(), 300);
  }

  function win() {
    finished = true;
    window.GameAudio.stopLoops();
    window.GameAudio.play("win");
    showMessage(
      "¡NIVEL COMPLETADO!<br>" +
        "MONEDAS: " + coins + " / " + totalCoins +
        "<br><small>R para jugar otra vez</small>"
    );
  }

  function updateBanner() {
    const index = Math.max(
      0,
      Math.min(sections.length - 1, Math.floor((px + SPRITE / 2) / SEC))
    );

    if (index !== currentSection) {
      currentSection = index;
      banner.textContent = sections[index].name;
    }
  }

  function snapCamera() {
    camX = Math.max(0, Math.min(px + SPRITE / 2 - SEC / 2, worldW - SEC));
  }

  /* Entrar o salir de un tubo */
  function usePipe(pipe) {
    pipeCooldown = 40;

    if (pipe.pipeTo === "secret") {
      buildLevel("secret");
      px = 60;
      py = START.y;
      showMessage("¡SALA SECRETA!<br><small>Agarra las monedas</small>", 1800);
    } else {
      buildLevel("main");
      const back = solids.find((s) => s.isExit);
      px = back.x + back.w / 2 - SPRITE / 2;
      py = back.top;
    }

    vy = 0;
    onGround = true;
    snapCamera();
    updateBanner();
    render();
  }

  /* ---------- Física ---------- */
  function update() {
    if (pipeCooldown > 0) pipeCooldown--;

    if (!finished) {
      /* Movimiento horizontal */
      let dir = 0;
      if (isDown("ArrowRight", "d", "D")) dir += 1;
      if (isDown("ArrowLeft", "a", "A")) dir -= 1;

      let nx = px + dir * stats.speed;
      nx = Math.max(-HB.offX, Math.min(nx, worldW - HB.offX - HB.w));

      for (const s of solids) {
        if (rectsOverlap(nx + HB.offX, py, HB.w, HB.h, s)) {
          if (dir > 0) nx = s.x - HB.offX - HB.w;
          else if (dir < 0) nx = s.x + s.w - HB.offX;
        }
      }
      px = nx;

      /* Salto */
      if (isDown("ArrowUp", " ", "w", "W") && onGround) {
        vy = stats.jump;
        onGround = false;
        window.GameAudio.play("jump");
      }

      /* Movimiento vertical */
      vy -= GRAVITY;
      if (vy < -16) vy = -16;

      const prevY = py;
      let ny = py + vy;
      const hx = px + HB.offX;
      let standing = null;
      onGround = false;

      if (vy <= 0) {
        let landing = null;

        for (const s of [...solids, ...platforms]) {
          const overlapsX = hx < s.x + s.w && hx + HB.w > s.x;

          if (overlapsX && prevY >= s.top - 0.001 && ny <= s.top) {
            if (!landing || s.top > landing.top) landing = s;
          }
        }

        if (landing) {
          ny = landing.top;
          vy = 0;
          onGround = true;
          standing = landing;
        }
      } else {
        for (const s of solids) {
          const overlapsX = hx < s.x + s.w && hx + HB.w > s.x;

          if (overlapsX && prevY + HB.h <= s.bottom + 0.001 && ny + HB.h > s.bottom) {
            ny = s.bottom - HB.h;
            vy = 0;
            if (s.type === "block") bump(s.ref);
          }
        }
      }

      py = ny;

      /* Tubos: párate encima y presiona ↓ */
      if (
        standing &&
        standing.pipeTo &&
        pipeCooldown <= 0 &&
        isDown("ArrowDown", "s", "S")
      ) {
        const center = hx + HB.w / 2;

        if (center > standing.x && center < standing.x + standing.w) {
          usePipe(standing);
          return;
        }
      }

      /* Picos */
      for (const h of hazards) {
        if (hx + 6 < h.x + h.w && hx + HB.w - 6 > h.x && py < h.top) {
          hurt("¡AUCH! LOS PICOS PINCHAN");
          break;
        }
      }

      if (py < -100) respawnAtSectionStart();

      /* Villanos: patrullan; si los pisas los derrotas */
      for (const v of villains) {
        if (!v.alive) continue;

        v.x += v.dir * v.speed;
        if (v.x <= v.min) { v.x = v.min; v.dir = 1; }
        if (v.x >= v.max) { v.x = v.max; v.dir = -1; }

        const body = { x: v.x + 10, w: VILLAIN_SIZE - 20, top: v.y + 55, bottom: v.y };

        if (rectsOverlap(px + HB.offX, py, HB.w, HB.h, body)) {
          const stomp = vy < 0 && prevY >= v.y + 30;

          if (stomp) {
            defeat(v);
            vy = 9;
            onGround = false;
          } else {
            hurt("¡UN VILLANO TE ATRAPÓ!");
            break;
          }
        }
      }

      /* Monedas */
      const hbx = px + HB.offX;

      for (const c of coinList) {
        if (
          !c.collected &&
          hbx < c.x + c.w &&
          hbx + HB.w > c.x &&
          py < c.y + c.h &&
          py + HB.h > c.y
        ) {
          c.collected = true;
          progress.collected.add(c.id);
          c.el.style.display = "none";
          window.GameAudio.play("coin");
          coins++;
          updateCounter();
        }
      }

      /* Bandera final */
      if (flagZone && rectsOverlap(hbx, py, HB.w, HB.h, flagZone)) {
        win();
      }

      updateBanner();
    }

    /* Cámara: se desliza suavemente detrás del personaje */
    const target = Math.max(
      0,
      Math.min(px + SPRITE / 2 - SEC / 2, worldW - SEC)
    );
    camX += (target - camX) * 0.12;
  }

  function render() {
    box(player, px, py, SPRITE, SPRITE);

    villains.forEach((v) => {
      if (v.alive) box(v.el, v.x, v.y, VILLAIN_SIZE, VILLAIN_SIZE);
    });

    track.style.transform = "translateX(" + (-camX / worldW) * 100 + "%)";
  }

  function gameLoop(time) {
    if (!player || gameContainer.classList.contains("hidden")) return;

    if (!lastTime) lastTime = time;
    accumulator += Math.min(time - lastTime, 100);
    lastTime = time;

    while (accumulator >= STEP) {
      update();
      accumulator -= STEP;
    }

    render();
    animationFrame = requestAnimationFrame(gameLoop);
  }

  /* ---------- Iniciar / reiniciar ---------- */
  function stopGame() {
    cancelAnimationFrame(animationFrame);
    clearTimeout(messageTimer);

    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", handleBlur);
  }

  window.startChiikawaGame = function () {
    stopGame();

    const character = window.SELECTED_CHARACTER || "chiikawa";
    stats = characterStats[character] || characterStats.chiikawa;

    keys = {};
    coins = 0;
    finished = false;
    lastTime = 0;
    accumulator = 0;
    pipeCooldown = 0;
    progress = { collected: new Set(), blocks: new Set(), defeated: new Set() };
    totalCoins = countTotalCoins();

    gameContainer.innerHTML = "";
    gameContainer.classList.remove("hidden");
    worldEl = null;

    counter = document.createElement("div");
    counter.className = "coin-counter";

    banner = document.createElement("div");
    banner.className = "game-banner";

    message = document.createElement("div");
    message.className = "game-message hidden";

    const backButton = document.createElement("button");
    backButton.textContent = "← VOLVER";
    backButton.className = "menu-button secondary-button game-back-button";

    gameContainer.append(counter, banner, message, backButton);

    buildLevel("main");
    updateCounter();
    window.GameAudio.loop("music");

    px = START.x;
    py = START.y;
    vy = 0;
    onGround = true;
    snapCamera();
    updateBanner();
    render();

    backButton.addEventListener("click", () => {
      stopGame();
      window.GameAudio.play("click");
      window.GameAudio.loop("menu");
      keys = {};
      player = null;

      gameContainer.classList.add("hidden");
      gameContainer.innerHTML = "";

      document.getElementById("character-screen").classList.remove("hidden");
    });

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    showMessage("¡EMPIEZA LA AVENTURA!<br><small>Llega a la bandera</small>", 2200);

    animationFrame = requestAnimationFrame(gameLoop);
  };
})();