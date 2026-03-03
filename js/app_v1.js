// 1️⃣ import
// 2️⃣ state 선언
// 3️⃣ DOM 요소 선언
// 4️⃣ 순수 로직 함수 (pickRandom, setStage, runStage 등)
// 5️⃣ 모드별 실행 함수 (runExposure, runRecognition 등)
// 6️⃣ 이벤트 리스너 등록
// 7️⃣ 초기 실행 코드


import { characters } from "./data.js";
import {
  renderStart,
  showStart,
  showGame,
  renderQuiz,
  renderScore,
  renderLevel
} from "./ui.js";


const state = {
  stage: 1,
  unlockedStage: 5,   // 부모가 허용한 최대 단계
  score: 0,
  current: null,
  bgmOn: false
};

// decorative bubbles
function createBubbles() {
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
// ✅ 주의: 실제 티니핑 이미지/노래(저작권) 대신 "귀여운 임시 캐릭터/간단 BGM"으로 구성했어요.
    // 나중에 조카 개인용으로 직접 가진 이미지로 교체하고 싶으면, char.imgUrl만 바꾸면 됩니다.

    // --- Tiny "cute" SVG avatar generator (data URI) ---
    function makeAvatarDataURI(seedText, bg1, bg2){
      const eyes = [
        {cx: 140, cy: 150},{cx: 220, cy: 150}
      ];
      const blushY = 190;
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${bg1}"/>
      <stop offset="1" stop-color="${bg2}"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="rgba(0,0,0,.18)"/>
    </filter>
  </defs>
  <rect width="360" height="360" rx="42" fill="url(#g)"/>
  <g filter="url(#s)">
    <circle cx="180" cy="185" r="120" fill="rgba(255,255,255,.88)"/>
    <circle cx="180" cy="175" r="120" fill="rgba(255,255,255,.65)"/>
  </g>

  <!-- ears / hair-ish -->
  <circle cx="96" cy="120" r="36" fill="rgba(255,255,255,.75)"/>
  <circle cx="264" cy="120" r="36" fill="rgba(255,255,255,.75)"/>

  <!-- eyes -->
  <g>
    <circle cx="${eyes[0].cx}" cy="${eyes[0].cy}" r="16" fill="#2b2b2b"/>
    <circle cx="${eyes[1].cx}" cy="${eyes[1].cy}" r="16" fill="#2b2b2b"/>
    <circle cx="${eyes[0].cx-5}" cy="${eyes[0].cy-6}" r="6" fill="#fff"/>
    <circle cx="${eyes[1].cx-5}" cy="${eyes[1].cy-6}" r="6" fill="#fff"/>
  </g>

  <!-- mouth -->
  <path d="M150 215 C 170 240, 190 240, 210 215" fill="none" stroke="#2b2b2b" stroke-width="10" stroke-linecap="round"/>

  <!-- blush -->
  <ellipse cx="115" cy="${blushY}" rx="22" ry="14" fill="rgba(255,120,180,.35)"/>
  <ellipse cx="245" cy="${blushY}" rx="22" ry="14" fill="rgba(255,120,180,.35)"/>

  <!-- little star -->
  <path d="M300 70 L312 98 L342 98 L318 115 L328 144 L300 128 L272 144 L282 115 L258 98 L288 98 Z"
        fill="rgba(255,255,255,.85)"/>

  <!-- label -->
  <text x="180" y="320" text-anchor="middle" font-size="26" font-weight="900"
        font-family="ui-sans-serif, system-ui, -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR'"
        fill="rgba(0,0,0,.55)">${seedText}</text>
</svg>`;
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }



    // --- DOM ---
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
    
    // Stage 1 – 노출 모드(Exposure)
    const exposureArea = document.getElementById("exposureArea");
    const exposureImg = document.getElementById("exposureImg");
    const exposureName = document.getElementById("exposureName");
    const speakBtn = document.getElementById("speakBtn");
    const nextBtn = document.getElementById("nextBtn");

    // Stage 2 – 인지 모드(recognition)
    const recognitionArea = document.getElementById("recognitionArea");
    const choicesEl = document.getElementById("choices");
    const quizImg = document.getElementById("quizImg");

    // Stage 3 – 거꾸로 모드(reverse)
    const reverseArea = document.getElementById("reverseArea");
    const reverseName = document.getElementById("reverseName");
    const reverseChoices = document.getElementById("reverseChoices");


    function hideAllStages() {
      document.querySelectorAll(".stage-area")
        .forEach(el => el.classList.remove("active"));
    }

 


    function setStage(stageNumber) {
      if (stageNumber <= state.unlockedStage) {
        state.stage = stageNumber;
        toast("모드가 선택됐어요!");
      } else {
        toast("아직 잠겨 있어요 🔒");
      }
    }

    function startLearning() {
      state.current = pickRandom();
      runStage(state.current);
    }

    function runStage(q) {

      // 🔥 Stage 1이면 점수 숨김
      if (state.stage === 1) {
        statusBar.classList.add("hidden");
      } else {
        statusBar.classList.remove("hidden");
      }
      switch (state.stage) {
        case 1:
          runExposure(q);
          break;
        case 2:
          runRecognition(q);
          break;
        case 3:
          runReverse(q);
          break;
        case 4:
          runDrag(q);
          break;
        case 5:
          runWrite(q);
          break;
      }
    }

    // Stage 1 – 노출 모드(Exposure)
    function speak(text) {
      if (!audioOn) return;           // 🔥 소리 꺼져있으면 읽기 안함

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }

    function runExposure(q) {
      hideAllStages();
      exposureArea.classList.add("active");

      exposureImg.src = q.image;
      exposureName.textContent = q.name;
      speak(q.name);
    }

    // Stage 2 – 인식 모드(recognition)
    function runRecognition(q) {
      hideAllStages();
      recognitionArea.classList.add("active");

      quizImg.src = q.image;

      generateChoices(q);
    }

    // 선택지 생성 함수
    function generateChoices(correctChar) {

      const pool = [...characters]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      if (!pool.includes(correctChar)) {
        pool[0] = correctChar;
      }

      const options = pool.sort(() => Math.random() - 0.5);

      choicesEl.innerHTML = "";

      options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "choice";
        btn.textContent = opt.name;

        btn.addEventListener("click", () => {
          if (opt.name === correctChar.name) {
            btn.classList.add("correct"); 
            state.score += 10;   // ⭐ 점수 증가
            renderScore(state.score, scoreValue);
            speak("정답! " + correctChar.name);

            if (state.score % 50 === 0) {
              state.level++;
              renderLevel(state.level, levelValue);
            }
            setTimeout(() => {
              state.current = pickRandom();
              runRecognition(state.current);
            }, 800);
          } else {
            speak("다시 생각해보자");
          }
        });

        choicesEl.appendChild(btn);
      });
    }

     // Stage 3 – 거꾸로 모드(reverse)
    function runReverse(q) {
      hideAllStages();
      reverseArea.classList.add("active");

      speakSyllables(q.name);  // ⭐ 음절 강조 포함

      generateReverseChoices(q);
    }

    // 음절 강조 함수
    function splitSyllables(word) {
      return word.split("");
    }

    function speakSyllables(word) {

      const syllables = splitSyllables(word);
      reverseName.innerHTML = "";

      syllables.forEach(s => {
        const span = document.createElement("span");
        span.textContent = s;
        span.className = "syllable";
        reverseName.appendChild(span);
      });

      const spans = reverseName.querySelectorAll(".syllable");

      let i = 0;

      function highlightNext() {

        if (i > 0) spans[i - 1].classList.remove("active");

        if (i < spans.length) {
          spans[i].classList.add("active");
          speak(spans[i].textContent);
          i++;
          setTimeout(highlightNext, 600);
        } else {
          speak(word);
        }
      }

      highlightNext();
    }

    // 이미지 선택지 생성
    function generateReverseChoices(correctChar) {

      const pool = [...characters]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      if (!pool.includes(correctChar)) {
        pool[0] = correctChar;
      }

      const options = pool.sort(() => Math.random() - 0.5);

      reverseChoices.innerHTML = "";

      options.forEach(opt => {

        const img = document.createElement("img");
        img.src = opt.image;

        img.addEventListener("click", () => {

          if (opt.name === correctChar.name) {

            state.score += 15;
            renderScore(state.score, scoreValue);

            speak("정답!");

            setTimeout(() => {
              state.current = pickRandom();
              runReverse(state.current);
            }, 900);

          } else {
            speak("다시 생각해보자");
          }

        });

        reverseChoices.appendChild(img);
      });
    }



    // --- helper ---
    function toast(msg){
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastEl._t);
      toastEl._t = setTimeout(()=>toastEl.classList.remove('show'), 1400);
    }

    function pickRandom(){
      return characters[Math.floor(Math.random()*characters.length)];
    }

    // --- Simple BGM (no copyrighted audio): WebAudio beeps loop ---
    let audioCtx = null;
    let bgmOn = false;
    let bgmTimer = null;
    let audioOn = false;   // 🔥 소리(배경음+읽기) 전체 ON/OFF

    function ensureAudio(){
      if(!audioCtx){
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    function playTone(freq, ms, type="sine", gain=0.05){
      if(!bgmOn) return;
      ensureAudio();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      setTimeout(()=>{ o.stop(); }, ms);
    }

    // A tiny cheerful loop (4 beats)
    function startBGM(){
      bgmOn = true;
      soundIcon.textContent = "🔊";
      soundText.textContent = "소리 끄기";
      toast("소리 켰어! 🎵");

      const pattern = [
        {f: 523, ms: 120}, // C5
        {f: 659, ms: 120}, // E5
        {f: 784, ms: 120}, // G5
        {f: 659, ms: 120}, // E5
      ];
      let i = 0;
      clearInterval(bgmTimer);
      bgmTimer = setInterval(()=>{
        const p = pattern[i % pattern.length];
        playTone(p.f, p.ms, "triangle", 0.045);
        i++;
      }, 240);
    }

    function stopBGM(){
      bgmOn = false;
      soundIcon.textContent = "🔇";
      soundText.textContent = "소리 켜기";
      clearInterval(bgmTimer);
      bgmTimer = null;
      toast("소리 껐어 😊");
    }

    // Autoplay restrictions: only start audio after a user gesture.
    function toggleSound() {
      if (!audioOn) {
        audioOn = true;                 // 🔥 전체 소리 ON
        try {
          ensureAudio();
          if (audioCtx.state === "suspended") audioCtx.resume();
          startBGM();                   // 배경음도 켬
        } catch (e) {
          console.warn(e);
          toast("이 기기에서 소리 권한이 필요해!");
        }
      } else {
        audioOn = false;                // 🔥 전체 소리 OFF
        stopBGM();                      // 배경음 끄기
        speechSynthesis.cancel();       // 🔥 읽는 중이면 즉시 멈춤
      }
    }

    function shuffleCharacter(){
      state.current = pickRandom();
      renderStart(state.current, charImg, charName);
      // little sound feedback
      if(bgmOn) playTone(880, 90, "sine", 0.05);
    }

    // --- Simple game: pick the right name ---
    function nextQuestion(){
      const q = pickRandom();
      state.current = q;
      renderQuiz(q, quizImg);

      // create 3 choices, shuffled
      const pool = [...characters].sort(()=>Math.random()-0.5);
      // ensure correct one included
      if(!pool.some(x=>x.name===q.name)){
        pool[0] = q;
      }
 
      const choiceCount = 2 + state.level; // 레벨1=3개, 레벨2=4개...
      const options = pool.slice(0, choiceCount).sort(()=>Math.random()-0.5);

      choicesEl.innerHTML = "";
      options.forEach(opt=>{
        const btn = document.createElement('button');
        btn.className = "choice";
        btn.textContent = opt.name;
        btn.addEventListener('click', ()=>{
          if(opt.name === q.name){
            toast("딩동댕! 잘했어 ⭐");
            state.score++;
            renderScore(state.score, scoreValue);
            if (state.score % 5 === 0) {
              state.level++;
              renderLevel(state.level, levelValue);
              toast("레벨 업! 🚀");
            }
            if(bgmOn){
              playTone(988, 90, "triangle", 0.06);
              setTimeout(()=>playTone(1175, 110, "triangle", 0.06), 110);
            }
            setTimeout(nextQuestion, 650);
          }else{
            toast("괜찮아~ 다시 해볼까? 😊");
            if(bgmOn) playTone(220, 120, "sine", 0.04);
          }
        });
        choicesEl.appendChild(btn);
      });
    }

    // --- Events ---
    soundBtn.addEventListener('click', toggleSound);
    shuffleBtn.addEventListener('click', shuffleCharacter);
    
    startBtn.addEventListener('click', ()=>{
      if(!bgmOn) toast("소리 켜면 더 재밌어! 🔊");

      showGame(startScreen, gameScreen);

      // 상태 초기화
      state.score = 0;
      renderScore(state.score, scoreValue);

      state.level = 1;
      renderLevel(state.level, levelValue);

      // 🔥 여기서 학습 시작
      startLearning();
    });

    backBtn.addEventListener('click', () => {
      showStart(startScreen, gameScreen);
    });

    nextBtn.addEventListener("click", () => {
      state.current = pickRandom();
      runExposure(state.current);
    });
  
    speakBtn.addEventListener("click", () => {
      speak(state.current.name);
    });

    // First render: random character
    state.current = pickRandom();
    renderStart(state.current, charImg, charName);

    // Helpful: first tap anywhere can enable audio resume (some browsers require it)
    document.addEventListener('pointerdown', ()=>{
      if(audioCtx && audioCtx.state === "suspended"){
        audioCtx.resume().catch(()=>{});
      }
    }, {once:false});

    document.querySelectorAll(".mode-buttons button")
      .forEach(btn => {
        btn.addEventListener("click", () => {
          const stage = Number(btn.dataset.stage);
          setStage(stage);
        });
      });

createBubbles();