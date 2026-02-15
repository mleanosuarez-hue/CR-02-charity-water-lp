// Simple Thirst Mode game
(() => {
  const startBtn = document.getElementById('startBtn');
  const homeScreen = document.getElementById('homeScreen');
  const gameScreen = document.getElementById('gameScreen');
  const gameArea = document.getElementById('gameArea');
  const hydrationFill = document.getElementById('hydrationFill');
  const hydrationText = document.getElementById('hydrationText');
  const timeText = document.getElementById('timeText');
  const scoreText = document.getElementById('scoreText');
  const messageBox = document.getElementById('messageBox');

  let hydration = 100;
  let timeElapsed = 0;
  let score = 0;
  let spawnTimer = null;
  let gameTimer = null;
  let running = false;

  function updateHUD() {
    hydration = Math.max(0, Math.min(100, hydration));
    hydrationFill.style.width = hydration + '%';
    hydrationText.textContent = Math.round(hydration) + '%';
    timeText.textContent = timeElapsed;
    scoreText.textContent = score;
  }

  function startGame() {
    if (running) return;
    // reset
    hydration = 100; timeElapsed = 0; score = 0;
    updateHUD();
    homeScreen.classList.remove('active');
    gameScreen.classList.add('active');
    messageBox.textContent = 'Click the clean drops to survive!';
    running = true;

    gameTimer = setInterval(() => {
      timeElapsed += 1;
      hydration -= 1; // natural drain
      if (hydration <= 0) endGame();
      updateHUD();
    }, 1000);

    spawnTimer = setInterval(spawnDrop, 800);
  }

  function endGame() {
    running = false;
    clearInterval(spawnTimer);
    clearInterval(gameTimer);
    // remove remaining drops
    document.querySelectorAll('.drop').forEach(d => d.remove());
    messageBox.textContent = `Game Over — Score: ${score} — Survived ${timeElapsed}s`;
    // show home screen controls again
    setTimeout(() => {
      gameScreen.classList.remove('active');
      homeScreen.classList.add('active');
    }, 1200);
  }

  function spawnDrop() {
    if (!running) return;
    const drop = document.createElement('div');
    const clean = Math.random() < 0.68; // more clean than dirty
    drop.className = 'drop ' + (clean ? 'clean' : 'dirty');
    drop.classList.add('falling');
    drop.dataset.type = clean ? 'clean' : 'dirty';

    // Inline SVG for a cartoon water drop (smiling) and an angry green drop
    const cleanSVG = `
      <svg viewBox="0 0 64 76" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stop-color="#69b8f7" />
            <stop offset="1" stop-color="#2E9DF7" />
          </linearGradient>
        </defs>
        <path d="M32 2 C22 14 8 26 8 40 C8 57 19 70 32 74 C45 70 56 57 56 40 C56 26 42 14 32 2 Z" fill="url(#g1)" />
        <circle cx="22" cy="36" r="3.6" fill="#fff" />
        <circle cx="42" cy="36" r="3.6" fill="#fff" />
        <path d="M22 46 Q32 56 42 46" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" />
      </svg>`;

    const dirtySVG = `
      <svg viewBox="0 0 64 76" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="g2" x1="0" x2="1">
            <stop offset="0" stop-color="#7bd07b" />
            <stop offset="1" stop-color="#4FCB53" />
          </linearGradient>
        </defs>
        <path d="M32 2 C22 14 8 26 8 40 C8 57 19 70 32 74 C45 70 56 57 56 40 C56 26 42 14 32 2 Z" fill="url(#g2)" />
        <circle cx="22" cy="36" r="3.4" fill="#0b240b" />
        <circle cx="42" cy="36" r="3.4" fill="#0b240b" />
        <path d="M18 30 L24 34" stroke="#0b240b" stroke-width="2.2" stroke-linecap="round" />
        <path d="M46 30 L40 34" stroke="#0b240b" stroke-width="2.2" stroke-linecap="round" />
        <path d="M24 50 Q32 44 40 50" stroke="#0b240b" stroke-width="3" stroke-linecap="round" fill="none" />
      </svg>`;

    drop.innerHTML = clean ? cleanSVG : dirtySVG;
    drop.setAttribute('role', 'button');
    drop.setAttribute('tabindex', '0');
    drop.setAttribute('aria-label', clean ? 'clean water drop' : 'dirty water drop');

    const areaW = gameArea.clientWidth;
    const x = Math.max(8, Math.floor(Math.random() * (areaW - 64)));
    drop.style.left = x + 'px';
    const duration = 3500 + Math.floor(Math.random() * 3500);
    drop.style.animationDuration = duration + 'ms';

    // click / keyboard handler
    let clicked = false;
    function handleCollect() {
      if (!running) return;
      if (clicked) return;
      clicked = true;
      const t = drop.dataset.type;
      if (t === 'clean') {
        hydration += 10;
        score += 1;
        messageBox.textContent = 'Nice! Hydration restored.';
      } else {
        hydration -= 14;
        score = Math.max(0, score - 1);
        messageBox.textContent = 'Yuck — that was dirty!';
      }
      updateHUD();
      drop.remove();
    }

    drop.addEventListener('click', handleCollect);
    drop.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); handleCollect(); } });

    // when animation ends (reached bottom)
    drop.addEventListener('animationend', () => {
      if (!running) return;
      if (!clicked) {
        if (drop.dataset.type === 'clean') {
          hydration -= 6; // missed a clean drop
          messageBox.textContent = 'Missed a clean drop — stay sharp!';
        }
      }
      updateHUD();
      drop.remove();
      if (hydration <= 0) endGame();
    });

    gameArea.appendChild(drop);
  }

  // wire start button
  startBtn.addEventListener('click', () => startGame());

  // initial HUD update
  updateHUD();

  // expose for debugging (optional)
  window.__thirstGame = { startGame, endGame };

})();
