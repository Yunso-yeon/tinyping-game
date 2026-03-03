// ui.js

export function renderStart(current, charImg, charName) {
  charImg.src = current.image;
  charName.textContent = current.name;
}

export function showStart(startScreen, gameScreen) {
  startScreen.classList.add('active');
  gameScreen.classList.remove('active');
}

export function showGame(startScreen, gameScreen) {
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');
}

export function renderQuiz(q, quizImg) {
  quizImg.src = q.image;
}

export function renderScore(score, scoreEl) {
  scoreEl.textContent = score;
}

export function renderLevel(level, levelEl) {
  levelEl.textContent = level;
}