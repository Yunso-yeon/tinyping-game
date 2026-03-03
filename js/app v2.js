/* =========================
1️⃣ IMPORT
========================= */

import { characters } from "./data.js";
import {
  renderStart,
  showStart,
  showGame,
  renderScore,
  renderLevel
} from "./ui.js";


/* =========================
2️⃣ STATE
========================= */

const state = {
  stage: 1,
  unlockedStage: 5,
  score: 0,
  level: 1,
  current: null
};

let audioOn = false;  // 읽기 음성 제어
let bgmOn = false;    // 배경음 제어


/* =========================
3️⃣ DOM
========================= */

const startScreen = document.getElementById('startScreen');
const gameScreen  = document.getElementById('gameScreen');
const charImg     = document.getElementById('charImg');
const charName    = document.getElementById('charName');

const soundBtn  = document.getElementById('soundBtn');
const soundIcon = document.getElementById('soundIcon');
const soundText = document.getElementById('soundText');
const shuffleBtn= document.getElementById('shuffleBtn');
const startBtn  = document.getElementById('startBtn');
const backBtn   = document.getElementById('backBtn');

const toastEl   = document.getElementById('toast');
const statusBar = document.getElementById("statusBar");
const scoreValue = document.getElementById('scoreValue');
const levelValue = document.getElementById('levelValue');

// Stage 1
const exposureArea = document.getElementById("exposureArea");
const exposureImg = document.getElementById("exposureImg");
const exposureName = document.getElementById("exposureName");
const speakBtn = document.getElementById("speakBtn");
const nextBtn = document.getElementById("nextBtn");

// Stage 2
const recognitionArea = document.getElementById("recognitionArea");
const quizImg = document.getElementById("quizImg");
const choicesEl = document.getElementById("choices");

// Stage 3
const reverseArea = document.getElementById("reverseArea");
const reverseName = document.getElementById("reverseName");
const reverseChoices = document.getElementById("reverseChoices");

// Stage 4
const dragArea = document.getElementById("dragArea");



/* =========================
4️⃣ PURE LOGIC
========================= */

function pickRandom(){
  return characters[Math.floor(Math.random()*characters.length)];
}

function hideAllStages(){
  document.querySelectorAll(".stage-area")
    .forEach(el => el.classList.remove("active"));
}

function setStage(stageNumber){
  if(stageNumber <= state.unlockedStage){
    state.stage = stageNumber;
  } else {
  }
}


/* =========================
🎤 음성 시스템
========================= */

function speakCore(text){
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function speakLearning(text){
  if(!audioOn) return;
  speakCore(text);
}

function speakFeedback(text){
  speakCore(text);
}

/* =========================
효과
========================= */

function createBubbles(){
  for(let i=0;i<16;i++){
    const b=document.createElement('div');
    b.className='bubble';
    b.style.left = Math.random()*100+'vw';
    b.style.top  = (60+Math.random()*60)+'vh';
    b.style.width = (10+Math.random()*26)+'px';
    b.style.height= b.style.width;
    b.style.animationDuration = (6+Math.random()*10)+'s';
    b.style.animationDelay = (Math.random()*6)+'s';
    document.body.appendChild(b);
  }
}


/* =========================
5️⃣ STAGE EXECUTION
========================= */

function runStage(q){

  if(state.stage === 1){
    statusBar.classList.add("hidden");
  } else {
    statusBar.classList.remove("hidden");
  }

  switch(state.stage){
    case 1: runExposure(q); break;
    case 2: runRecognition(q); break;
    case 3: runReverse(q); break;
    case 4: runDrag(q); break;
    case 5: runWrite(q); break;
  }
}


/* -------- Stage 1 -------- */

function runExposure(q){
  hideAllStages();
  exposureArea.classList.add("active");

  exposureImg.src = q.image;
  exposureName.textContent = q.name;

  speakLearning(q.name);
}


/* -------- Stage 2 -------- */

function runRecognition(q){
  hideAllStages();
  recognitionArea.classList.add("active");

  quizImg.src = q.image;
  generateChoices(q);
}

function generateChoices(correctChar){

  const pool = [...characters].sort(()=>Math.random()-0.5);
  const options = pool.slice(0, 2 + state.level);

  choicesEl.innerHTML = "";

  options.forEach(opt=>{
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = opt.name;

    btn.addEventListener("click", ()=>{

      if(opt.name === correctChar.name){

        btn.classList.add("correct");

        state.score += 10;
        renderScore(state.score, scoreValue);

        speakFeedback("정답!");

        if(state.score % 50 === 0){
          state.level++;
          renderLevel(state.level, levelValue);
        }

        setTimeout(()=>{
          state.current = pickRandom();
          runRecognition(state.current);
        }, 800);

      } else {
        speakFeedback("다시 생각해보자");
      }

    });

    choicesEl.appendChild(btn);
  });
}


/* -------- Stage 3 -------- */

function runReverse(q){
  hideAllStages();
  reverseArea.classList.add("active");

  renderSyllables(q.name);
  generateReverseChoices(q);
}

function renderSyllables(word){

  reverseName.innerHTML = "";

  const letters = word.split("");

  letters.forEach(ch=>{
    const span = document.createElement("span");
    span.textContent = ch;
    span.className = "syllable";
    reverseName.appendChild(span);
  });

  const spans = reverseName.querySelectorAll(".syllable");

  let i = 0;

  function highlightNext(){

    if(i > 0){
      spans[i-1].classList.remove("active");
    }

    if(i < spans.length){

      spans[i].classList.add("active");

      // 🔥 음성은 토글에 따라
      speakLearning(spans[i].textContent);

      i++;
      setTimeout(highlightNext, 500);

    } else {
      spans[i-1].classList.remove("active");
    }
  }

  highlightNext();
}

function generateReverseChoices(correctChar){

  const pool = [...characters].sort(()=>Math.random()-0.5);

  // 🔥 정답이 반드시 포함되도록 보장
  let options = pool.slice(0,3);

  if(!options.some(c => c.name === correctChar.name)){
    options[0] = correctChar;
  }

  options = options.sort(()=>Math.random()-0.5);

  reverseChoices.innerHTML = "";

  options.forEach(opt=>{

    const img = document.createElement("img");
    img.src = opt.image;   // 🔥 image 필드 확인
    img.alt = opt.name;

    img.addEventListener("click", ()=>{

      if(opt.name === correctChar.name){

        state.score += 15;
        renderScore(state.score, scoreValue);

        speakFeedback("정답!");

        setTimeout(()=>{
          state.current = pickRandom();
          runReverse(state.current);
        }, 900);

      } else {
        speakFeedback("다시 생각해보자");
      }

    });

    reverseChoices.appendChild(img);
  });
}

/* -------- Stage 4 -------- */
function runDrag(q){
  hideAllStages();
  dragArea.classList.add("active");

  dragArea.innerHTML = "";

  const title = document.createElement("div");
  title.textContent = "글자를 순서대로 맞춰보자!";
  title.style.fontSize = "20px";
  title.style.fontWeight = "900";

  const image = document.createElement("img");
  image.src = q.image;
  image.style.width = "200px";
  image.style.margin = "10px 0";

  const hintBtn = document.createElement("button");
  hintBtn.textContent = "💡 힌트";
  hintBtn.className = "pill";

  hintBtn.addEventListener("click", ()=>{
    if(userAnswer.length < letters.length){
      userAnswer.push(letters[userAnswer.length]);
      renderAnswer();
    }
  });

  dragArea.appendChild(hintBtn);

  const answerBox = document.createElement("div");
  answerBox.className = "answer-box";

  const letters = q.name.split("");
  const shuffled = [...letters].sort(()=>Math.random()-0.5);

  const cardArea = document.createElement("div");
  cardArea.className = "card-area";

  let userAnswer = [];

  shuffled.forEach(letter=>{
    const btn = document.createElement("button");
    btn.className = "letter-card";
    btn.textContent = letter;

    btn.addEventListener("click", ()=>{
      // 🔥 1. 눌렀을 때 튀는 효과
    btn.classList.add("pop");
    setTimeout(()=>btn.classList.remove("pop"),150);
    
      userAnswer.push(letter);
      renderAnswer();

      if(userAnswer.length === letters.length){
        checkAnswer();
      }
    });

    cardArea.appendChild(btn);
  });

  function renderAnswer(){
    answerBox.innerHTML = userAnswer.join(" ");
  }

function checkAnswer(){

  if(userAnswer.join("") === q.name){

    state.score += 20;
    renderScore(state.score, scoreValue);

    speakFeedback("정답!");

    setTimeout(()=>{
      state.current = pickRandom();
      runDrag(state.current);
    }, 800);

  } else {

    answerBox.classList.add("shake");
    speakFeedback("다시 해보자");

    setTimeout(()=>{
      answerBox.classList.remove("shake");
      userAnswer = [];
      renderAnswer();
    }, 500);  // 🔥 흔들림 끝난 후 초기화
  }
}

  dragArea.appendChild(title);
  dragArea.appendChild(image);
  dragArea.appendChild(answerBox);
  dragArea.appendChild(cardArea);
}


/* =========================
6️⃣ EVENTS
========================= */

soundBtn.addEventListener("click", ()=>{
  audioOn = !audioOn;

  if(audioOn){
    soundIcon.textContent = "🔊";
    soundText.textContent = "소리 끄기";
  } else {
    soundIcon.textContent = "🔇";
    soundText.textContent = "소리 켜기";
    speechSynthesis.cancel();
  }
});

startBtn.addEventListener("click", ()=>{

  showGame(startScreen, gameScreen);

  state.score = 0;
  state.level = 1;
  renderScore(state.score, scoreValue);
  renderLevel(state.level, levelValue);

  state.current = pickRandom();
  runStage(state.current);
});

backBtn.addEventListener("click", ()=>{
  showStart(startScreen, gameScreen);
});

nextBtn.addEventListener("click", ()=>{
  state.current = pickRandom();
  runExposure(state.current);
});

speakBtn.addEventListener("click", ()=>{
  speakLearning(state.current.name);
});

document.querySelectorAll(".mode-buttons button")
  .forEach(btn=>{
    btn.addEventListener("click", ()=>{

      const stage = Number(btn.dataset.stage);

      if(stage > state.unlockedStage) return;

      // 🔥 1. 기존 선택 제거
      document.querySelectorAll(".mode-buttons button")
        .forEach(b => b.classList.remove("selected"));

      // 🔥 2. 현재 버튼 선택 표시
      btn.classList.add("selected");

      if (bgmOn) playTone(880, 80, "triangle", 0.05);

      // 🔥 3. stage 변경
      setStage(stage);

    });
  });


/* =========================
7️⃣ INIT
========================= */

state.current = pickRandom();
renderStart(state.current, charImg, charName);
createBubbles();