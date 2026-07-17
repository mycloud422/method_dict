// ===== DATA =====
const methods = [
  "x", "z", "ness", "ess", "ally", "ism", "lla", "many", "perb", "hl", "ivy", "vy", "ts",
  "tsu", "oo", "nga", "aphy", "achi", "aho", "uli", "alop", "bah", "ahu", "ili", "hyal",
  "sz", "bh", "alin", "asht", "ael", "yle", "avy", "thra", "hais", "sio", "pf", "mh", "ui",
  "pso", "zh", "weh", "pez", "ez", "az", "sd", "esso", "dh", "arma", "sidh", "dha", "sadh",
  "kus", "lw", "tcha", "sf", "yc", "ycle", "yp", "tze", "aya", "asca", "fd", "gyms", "oso",
  "azi", "bk", "hd", "cw", "wp", "cch", "pk", "pd", "gd", "nse", "fb", "sse", "mg", "hana",
  "acus", "lh", "dii", "nk", "ikh", "ios", "ior", "trak", "elfs", "rg", "abug", "ths",
  "sso", "ette", "lv", "kte", "obbi", "nja", "yd"
];

let dictionary = [];
let cachedStartList = [];
let validMethods = [];
const buttons = {};

// ===== DOM =====
const buttonsDiv = document.getElementById("buttons");
const results = document.getElementById("results");
const startInput = document.getElementById("start");
const endInput = document.getElementById("endInput");
const capBtn = document.getElementById("capBtn");
const clearBtn = document.getElementById("clearBtn");
const sortMode = document.getElementById("sortMode");
const minLenInput = document.getElementById("minLen");
const quickFireBtn = document.getElementById("quickFireBtn");
const resultFilterInput = document.getElementById("resultFilter");
const resultsCount = document.querySelector(".results-count");

// ===== STATE =====
let capEnabled = true;
let quickFire = false;
let quickFireIndex = 0;

// ===== INIT =====
loadDictionary();
createMethodButtons();
setupEventListeners();

// ===== LOAD DICTIONARY =====
function loadDictionary() {
  fetch("https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words.txt")
    .then(res => res.text())
    .then(text => {
      dictionary = text
        .split("\n")
        .map(w => w.trim().toLowerCase())
        .filter(w => /^[a-z]+$/.test(w));
      runFullSearch(); 
    });
}

// ===== CREATE METHOD BUTTONS =====
function createMethodButtons() {
  methods.forEach(method => {
    const btn = document.createElement("button");
    btn.textContent = method;
    btn.type = "button";

    btn.addEventListener("click", () => {
      endInput.value = method;
      renderResults();
    });

    buttonsDiv.appendChild(btn);
    buttons[method] = btn;
  });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  capBtn.classList.add("active");
  capBtn.textContent = "Cap: 10";
  capBtn.addEventListener("click", toggleCap);

  clearBtn.addEventListener("click", clearEnd);
  quickFireBtn.addEventListener("click", toggleQuickFire);

  [startInput, endInput, minLenInput].forEach(input => {
    input.addEventListener("keydown", handleEnter);
  });

  sortMode.addEventListener("change", renderResults);
  resultFilterInput.addEventListener("input", renderResults); // Filter listener
  
  document.addEventListener("keydown", handleTab);
  document.addEventListener("keydown", handleShiftAdvance);
}

// ===== EVENT HANDLERS =====
function toggleCap() {
  capEnabled = !capEnabled;
  capBtn.textContent = capEnabled ? "Cap: 10" : "Cap: OFF";
  capBtn.classList.toggle("active", capEnabled);
  renderResults();
}

function clearEnd() {
  endInput.value = "";
  renderResults();
}

function handleEnter(e) {
  if (e.key === "Enter" && e.target === startInput) {
    runFullSearch(e);
  }
}

function toggleQuickFire() {
  quickFire = !quickFire;
  quickFireBtn.textContent = quickFire ? "QuickFire: ON" : "QuickFire: OFF";
  quickFireBtn.classList.toggle("active", quickFire);
  endInput.disabled = quickFire;
}

function handleShiftAdvance(e) {
  if (!quickFire) return;
  if (validMethods.length === 0) return;

  if (e.key === "Shift") {
    e.preventDefault();
    quickFireIndex++;
    if (quickFireIndex >= validMethods.length) quickFireIndex = 0;
    applyQuickFire();
    renderResults();
  }
}

function handleTab(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    startInput.focus();
    startInput.value = "";
  }
}

// ===== SEARCH =====
function runFullSearch() {
  const start = startInput.value.toLowerCase();
  const minLen = parseInt(minLenInput.value);
  cacheStartList(start, minLen);
  updateHeatmap();
  quickFireIndex = 0;
  applyQuickFire();
  renderResults();
}

function cacheStartList(start, minLen) {
  cachedStartList = dictionary.filter(w =>
    (start === "" || w.startsWith(start)) &&
    (isNaN(minLen) || w.length >= minLen)
  );
}

// ===== HEATMAP + VALID METHODS =====
function updateHeatmap() {
  validMethods = [];
  methods.forEach(m => {
    let count = 0;
    for (let i = 0; i < cachedStartList.length; i++) {
      if (cachedStartList[i].endsWith(m)) {
        count++;
        if (count >= 20) break;
      }
    }

    if (count === 0) {
      buttons[m].style.backgroundColor = "#0d0d0d";
      buttons[m].style.color = "#333";
      buttons[m].style.borderColor = "#1a1a1a";
      return;
    }

    validMethods.unshift(m);
    const ratio = Math.min(1, count / 20);
    const opacity = 0.15 + (ratio * 0.85);
    
    buttons[m].style.backgroundColor = `rgba(59, 185, 80, ${opacity * 0.3})`;
    buttons[m].style.color = `rgba(59, 185, 80, ${opacity})`;
    buttons[m].style.borderColor = `rgba(59, 185, 80, ${opacity * 0.5})`;
  });
}

// ===== QUICK FIRE =====
function applyQuickFire(e) {
  if (!quickFire) return;
  if (validMethods.length === 0) return;
  const index = e && e.shiftKey ? 1 : quickFireIndex;
  const method = validMethods[index];
  if (!method) return;
  endInput.value = method;
}

// ===== RENDER RESULTS =====
function renderResults() {
  const ending = endInput.value.toLowerCase();
  const filterText = resultFilterInput.value.toLowerCase();
  
  results.innerHTML = "";

  let filtered = cachedStartList
    .filter(w => ending === "" || w.endsWith(ending))
    .filter(w => filterText === "" || w.includes(filterText)) // Internal filter logic
    .sort(sortWords);
    
  const totalFound = filtered.length;
  const displayList = filtered.slice(0, capEnabled ? 10 : 200);

  // Update count text
  resultsCount.textContent = totalFound + (totalFound === 1 ? " WORD" : " WORDS");

  displayList.forEach(word => {
    const li = document.createElement("li");
    if (ending) {
      const split = word.length - ending.length;
      li.innerHTML = `${word.slice(0, split)}<span>${word.slice(split)}</span>`;
    } else {
      li.textContent = word;
    }
    results.appendChild(li);
  });
}

// ===== SORT =====
function sortWords(a, b) {
  const mode = sortMode.value;
  if (mode === "short") return a.length - b.length || a.localeCompare(b);
  if (mode === "long") return b.length - a.length || a.localeCompare(b);
  if (mode === "alpha") return a.localeCompare(b);
  return 0;
}