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
  correctInLevel: 0,   // ✅ 추가: 현재 레벨에서 맞춘 개수
  current: null,
  bgmOn: false
};

let audioOn = false;  // 읽기 음성 제어
let bgmOn = false;    // 배경음 제어

const QUESTIONS_PER_LEVEL = 5; // ✅ 레벨업까지 필요한 정답 수


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
const reverseSpeakBtn = document.getElementById("reverseSpeakBtn");
const reverseReplayBtn = document.getElementById("reverseReplayBtn");

// Stage 4
const dragArea = document.getElementById("dragArea");
const progressBar = document.getElementById("progressBar");
const levelUpPopup = document.getElementById("levelUpPopup");

// Stage 5 – write
const writeArea     = document.getElementById("writeArea");
const writeTargetEl = document.getElementById("writeTarget");
const writeCanvas   = document.getElementById("writeCanvas");
const writeSpeakBtn = document.getElementById("writeSpeakBtn");
const writeHintBtn  = document.getElementById("writeHintBtn");
const writeClearBtn = document.getElementById("writeClearBtn");
const writeNextBtn  = document.getElementById("writeNextBtn");


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

const cuteCorrectLines = [
  "딩동댕!",
  "와아 정답이야!",
  "천재 아니야?",
  "대박! 맞았어!",
  "우와 잘했어!"
];

function speakCuteCorrect(){
  const line = cuteCorrectLines[
    Math.floor(Math.random()*cuteCorrectLines.length)
  ];
  speakFeedback(line);
}

function speakCore(text, onEnd){

  if(!text || !audioOn) {
    if(onEnd) onEnd();
    return;
  }

  const synth = window.speechSynthesis;

  if(synth.speaking){
    synth.cancel();
  }

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 1.15;
  u.pitch = 1.5;
  u.volume = 1;

  if(onEnd){
    u.onend = onEnd;
  }

  synth.speak(u);
}

function speakLearning(text){
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

function updateProgress(){
  const percent = (state.correctInLevel / QUESTIONS_PER_LEVEL) * 100;
  progressBar.style.width = percent + "%";
}

function handleCorrect({ scoreAdd = 10 } = {}){

  launchConfetti();

  launchStars();

  launchBalloons();

  jumpCharacter();

  // 점수
  state.score += scoreAdd;
  renderScore(state.score, scoreValue);

  // 레벨 진행도 (정답 개수)
  state.correctInLevel += 1;
  updateProgress();

  speakCuteCorrect();

  if(audioOn){
    playTone(988,100,"triangle",0.07);
    setTimeout(()=>playTone(1318,120,"triangle",0.07),120);
    setTimeout(()=>playTone(1568,150,"triangle",0.07),240);
  }

  // 레벨업
  if(state.correctInLevel >= QUESTIONS_PER_LEVEL){
    state.level += 1;
    state.correctInLevel = 0;
    renderLevel(state.level, levelValue);
    updateProgress();

    if(state.level === 10){
      document.body.classList.add("rainbow-mode");
    }

    // 레벨업 연출
    showLevelUp();

 

    // 진행바 반짝 (옵션)
    if(progressBar){
      progressBar.classList.add("level-up");
      setTimeout(()=>progressBar.classList.remove("level-up"), 600);
    }
  }
}

function showLevelUp(){
  if(!levelUpPopup) return;

  levelUpPopup.classList.add("show");

  launchConfetti();
  launchStars();
  launchBalloons();

if(audioOn){
  playTone(880,100,"triangle",0.08);
  setTimeout(()=>playTone(988,120,"triangle",0.08),120);
  setTimeout(()=>playTone(1318,150,"triangle",0.08),240);
  setTimeout(()=>playTone(1568,200,"triangle",0.08),380);
}

  setTimeout(()=>{
    levelUpPopup.classList.remove("show");
  }, 1000);
}

function launchConfetti(){
  const container = document.getElementById("confettiContainer");
  if(!container) return;

  const colors = ["#ff6bb3","#8fd2ff","#ffd93d","#7cffc4","#ff9f43"];

  for(let i=0;i<40;i++){
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random()*100 + "vw";
    piece.style.background = colors[Math.floor(Math.random()*colors.length)];
    piece.style.animationDuration = (600 + Math.random()*600) + "ms";
    container.appendChild(piece);

    setTimeout(()=> piece.remove(), 1000);
  }
}

function launchStars(){
  for(let i=0;i<15;i++){
    const star = document.createElement("div");
    star.className="star";
    star.textContent="⭐";
    star.style.left = (40 + Math.random()*20) + "vw";
    star.style.top = "40vh";
    document.body.appendChild(star);

    setTimeout(()=>star.remove(),1000);
  }
}

function launchBalloons(){
  const emojis = ["🎈","🎉","🎊"];
  for(let i=0;i<8;i++){
    const b = document.createElement("div");
    b.className="balloon";
    b.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    b.style.left = Math.random()*100 + "vw";
    b.style.top = "70vh";
    document.body.appendChild(b);

    setTimeout(()=>b.remove(),1200);
  }
}

function jumpCharacter(){
  const img = document.querySelector(".hero img");
  if(!img) return;
  img.classList.add("jump");
  setTimeout(()=>img.classList.remove("jump"),400);
}

/* =========================
🎵 간단 효과음용 playTone
========================= */

let audioCtx = null;

function ensureAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone(freq, ms, type="sine", gain=0.05){
  if(!audioOn) return;   // 🔥 소리 꺼져있으면 재생 안함

  ensureAudio();

  if(audioCtx.state === "suspended"){
    audioCtx.resume();
  }

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;

  o.connect(g);
  g.connect(audioCtx.destination);

  o.start();
  setTimeout(()=> o.stop(), ms);
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
  // 1) 보기 개수 (캐릭터 수를 넘지 않게)
  const optionCount = Math.min(characters.length, 2 + state.level);

  // 2) 랜덤 풀 만들기
  const pool = [...characters].sort(()=>Math.random() - 0.5);

  // 3) 일단 optionCount개 뽑기
  let options = pool.slice(0, optionCount);

  // 4) ✅ 정답이 없으면 하나를 정답으로 교체
  const hasAnswer = options.some(x => x.name === correctChar.name);
  if(!hasAnswer){
    options[0] = correctChar;
  }

  // 5) 보기 순서 다시 섞기
  options = options.sort(()=>Math.random() - 0.5);

  // 6) 렌더
  choicesEl.innerHTML = "";

  options.forEach(opt=>{
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = opt.name;

    btn.addEventListener("click", ()=>{
      if(opt.name === correctChar.name){
        btn.classList.add("correct");
        handleCorrect({ scoreAdd: 10 });
        speakFeedback("정답!");

        setTimeout(()=>{
          state.current = pickRandom();
          runRecognition(state.current);
        }, 800);
      }else{

          btn.classList.add("wrong");

          speakFeedback("다시 생각해보자");

          if(audioOn){
            playTone(220,120,"sawtooth",0.05);
          }

          setTimeout(()=>{
            btn.classList.remove("wrong");
          }, 400);
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
  playSyllableAnimation(q.name);
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
}

function playSyllableAnimation(word){
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

        handleCorrect({ scoreAdd: 15 });
        speakFeedback("정답!", () => {
          state.current = pickRandom();
          runReverse(state.current);
        });

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
function getDragDifficulty(){
  if(state.level <= 2) return 1;
  if(state.level <= 5) return 2;
  return 3;
}

function shuffle(array){
  const arr = [...array];
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function runDrag(q){

  hideAllStages();
  dragArea.classList.add("active");
  dragArea.innerHTML = "";

  const title = document.createElement("div");
  title.textContent = "글자를 끌어서 맞춰보자!";
  title.style.fontSize = "20px";
  title.style.fontWeight = "900";

  const image = document.createElement("img");
  image.src = q.image;
  image.style.width = "180px";
  image.style.margin = "10px 0";

  const letters = q.name.split("");
  let shuffled = [...letters];

  // 가짜 글자 풀 (원하면 더 추가 가능)
  const fakeLetters = ["가","나","다","라","마","바","사","아","자","차"];

  let fakeCount = 0;

  // 🔥 레벨 기반 가짜 글자 증가
  if(state.level >= 3) fakeCount = 1;
  if(state.level >= 5) fakeCount = 2;
  if(state.level >= 7) fakeCount = 3;

  // 가짜 글자 추가
  for(let i = 0; i < fakeCount; i++){
    const fake = fakeLetters[Math.floor(Math.random()*fakeLetters.length)];
    shuffled.push(fake);
  }

  // 🔥 항상 섞기 (난이도 1에서도 섞고 싶다면 이게 깔끔)
  shuffled = shuffle(shuffled);

  const dropZone = document.createElement("div");
  dropZone.className = "drop-zone";

  const cardArea = document.createElement("div");
  cardArea.className = "card-area";

  let userAnswer = new Array(letters.length).fill("");

  // 🔹 빈칸 생성
  letters.forEach((_, index)=>{
    const slot = document.createElement("div");
    slot.className = "drop-slot";
    slot.dataset.index = index;

    slot.addEventListener("dragover", e=>{
      e.preventDefault();
    });

    slot.addEventListener("drop", e=>{
      const letter = e.dataTransfer.getData("text");
      const fromId = e.dataTransfer.getData("id");

      if(slot.textContent !== "") return;

      slot.textContent = letter;
      userAnswer[index] = letter;

      const draggedEl = document.getElementById(fromId);
      if(draggedEl) draggedEl.style.visibility = "hidden";

      checkAnswer();
    });

    slot.addEventListener("click", ()=>{

      if(slot.textContent !== ""){

        const slotIndex = Number(slot.dataset.index);
        const letter = slot.textContent;

        // 슬롯 비우기
        slot.textContent = "";
        userAnswer[slotIndex] = "";

        // 🔥 원래 카드 다시 보이게
        const cards = document.querySelectorAll(".letter-card");

        cards.forEach(card=>{
          if(card.textContent === letter && card.style.visibility === "hidden"){
            card.style.visibility = "visible";
          }
        });

      }

    });

    dropZone.appendChild(slot);
  });

  

  // 🔹 카드 생성
  shuffled.forEach((letter, i)=>{
    const card = document.createElement("div");
    card.className = "letter-card";
    card.textContent = letter;
    card.draggable = true;
    card.id = "card-" + i;

    card.addEventListener("dragstart", e=>{
      e.dataTransfer.setData("text", letter);
      e.dataTransfer.setData("id", card.id);
    });

    cardArea.appendChild(card);
  });

  function checkAnswer(){
    if(userAnswer.every(l => l !== "")){

      if(userAnswer.join("") === q.name){

        handleCorrect({ scoreAdd: 25 });
        speakFeedback("정답!");

        setTimeout(()=>{
          state.current = pickRandom();
          runDrag(state.current);
        }, 900);

      } else {

        dropZone.classList.add("shake");
        speakFeedback("다시 해보자");

        setTimeout(()=>{
          dropZone.classList.remove("shake");

          if(getDragDifficulty() === 1){
            // 🔹 그대로 유지
            userAnswer = new Array(letters.length).fill("");
            const slots = document.querySelectorAll(".drop-slot");
            slots.forEach(slot => slot.textContent = "");

            const cards = document.querySelectorAll(".letter-card");
            cards.forEach(card => card.style.visibility = "visible");

          } else {
            // 🔥 다시 섞기
            runDrag(q);
          }

        }, 600);
      }
    }
  }

  dragArea.appendChild(title);
  dragArea.appendChild(image);
  dragArea.appendChild(dropZone);
  dragArea.appendChild(cardArea);
}


/* -------- Stage 5 -------- */

let writeCtx = null;
let isDrawing = false;
let lastPt = null;
let writeHintOn = true;

function setupWriteCanvas(){
  if(!writeCanvas) return;

  const rect = writeCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  writeCanvas.width  = Math.floor(rect.width * dpr);
  writeCanvas.height = Math.floor(rect.height * dpr);

  writeCtx = writeCanvas.getContext("2d");
  writeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 펜 스타일
  writeCtx.lineCap = "round";
  writeCtx.lineJoin = "round";
  writeCtx.lineWidth = 10;
  writeCtx.strokeStyle = "#2b2b2b";

  redrawWriteGuide(); // 배경 가이드 그리기
}

function redrawWriteGuide(){
  if(!writeCtx) return;

  const rect = writeCanvas.getBoundingClientRect();
  // 전체 지우기
  writeCtx.clearRect(0, 0, rect.width, rect.height);

  // 힌트(따라쓰기) 텍스트
  if(writeHintOn && state.current){
    const word = state.current.name;

    writeCtx.save();
    writeCtx.globalAlpha = 0.12;
    writeCtx.fillStyle = "#6b8cff";
    writeCtx.textAlign = "center";
    writeCtx.textBaseline = "middle";

    // 레벨이 올라가면 힌트 약하게/작게 (난이도 상승)
    const base = Math.min(rect.width, rect.height);
    const size = Math.floor(base * (state.level <= 2 ? 0.42 : state.level <= 5 ? 0.34 : 0.26));

    writeCtx.font = `900 ${size}px ui-sans-serif, system-ui, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR"`;
    writeCtx.fillText(word, rect.width/2, rect.height/2);

    writeCtx.restore();
  }

  // 연습 줄(가볍게)
  writeCtx.save();
  writeCtx.globalAlpha = 0.08;
  writeCtx.strokeStyle = "#000";
  writeCtx.lineWidth = 2;
  const h = rect.height;
  writeCtx.beginPath();
  writeCtx.moveTo(16, h*0.35); writeCtx.lineTo(rect.width-16, h*0.35);
  writeCtx.moveTo(16, h*0.65); writeCtx.lineTo(rect.width-16, h*0.65);
  writeCtx.stroke();
  writeCtx.restore();
}

function getCanvasPoint(e){
  const rect = writeCanvas.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
  return { x, y };
}

function startDraw(e){ 
  if(!writeCtx) return;
  isDrawing = true;
  lastPt = getCanvasPoint(e);
}

function moveDraw(e){
  if(!isDrawing || !writeCtx) return;
  e.preventDefault();

  const pt = getCanvasPoint(e);
  writeCtx.beginPath();
  writeCtx.moveTo(lastPt.x, lastPt.y);
  writeCtx.lineTo(pt.x, pt.y);
  writeCtx.stroke();
  lastPt = pt;
}

function endDraw(){
  isDrawing = false;
  lastPt = null;
}

function runWrite(q){
  hideAllStages();
  writeArea.classList.add("active");

  state.current = q;
  if(writeTargetEl) writeTargetEl.textContent = q.name;

  // 캔버스 사이즈는 화면 렌더된 후가 안전
  requestAnimationFrame(setupWriteCanvas);
}

/* =========================
6️⃣ EVENTS
========================= */

soundBtn.addEventListener("click", async ()=>{

  audioOn = !audioOn;

  if(audioOn){

    soundIcon.textContent = "🔊";
    soundText.textContent = "소리 끄기";

    ensureAudio();

    if(audioCtx.state === "suspended"){
      await audioCtx.resume();
    }

    playTone(880,120,"triangle",0.06);

    // 🔥 음성 엔진 활성화
    setTimeout(()=>{
      speakCore("시작!");
    }, 50);

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

reverseSpeakBtn.addEventListener("click", ()=>{
  if(state.current){
    speakLearning(state.current.name);
  }
});

reverseReplayBtn.addEventListener("click", ()=>{
  if(state.current){
    playSyllableAnimation(state.current.name);
  }
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


// 캔버스 그리기 이벤트
writeCanvas.addEventListener("pointerdown", (e)=>{ startDraw(e); });
writeCanvas.addEventListener("pointermove", (e)=>{ moveDraw(e); });
writeCanvas.addEventListener("pointerup", endDraw);
writeCanvas.addEventListener("pointercancel", endDraw);
writeCanvas.addEventListener("pointerleave", endDraw);

writeClearBtn.addEventListener("click", ()=>{
  redrawWriteGuide();
});

writeHintBtn.addEventListener("click", ()=>{
  writeHintOn = !writeHintOn;
  writeHintBtn.textContent = writeHintOn ? "👻 힌트 끄기" : "👻 힌트 켜기";
  redrawWriteGuide();
});

writeSpeakBtn.addEventListener("click", ()=>{
  if(state.current) speakFeedback(state.current.name);
});

writeNextBtn.addEventListener("click", ()=>{
  state.current = pickRandom();
  runWrite(state.current);
});

/* =========================
7️⃣ INIT
========================= */
state.current = pickRandom();
renderStart(state.current, charImg, charName);
createBubbles();

// Chrome 음성 초기 로딩
window.speechSynthesis.getVoices();

/* iOS 음성 활성화용 */
document.addEventListener("pointerdown", ()=>{
  speechSynthesis.resume();
}, { once: true });