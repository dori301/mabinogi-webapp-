
const SILVER_INTERVAL = 30 * 60 * 1000;
const TRIBUTE_INTERVAL = 12 * 60 * 60 * 1000;

function saveData() {
  localStorage.setItem("characters", JSON.stringify(characters));
}

function loadData() {
  const data = localStorage.getItem("characters");
  if (data) {
    characters = JSON.parse(data);
  }
}

function format(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}시간 ${m}분 ${s}초`;
}

function render() {
  const now = Date.now();
  const container = document.getElementById("characterList");
  container.innerHTML = "";
  characters.forEach((c, i) => {
    const silverElapsed = now - c.lastSilver;
    const tributeElapsed = now - c.lastTribute;
    const silverGain = Math.floor(silverElapsed / SILVER_INTERVAL);
    const tributeGain = Math.floor(tributeElapsed / TRIBUTE_INTERVAL);
    if (silverGain > 0) {
      c.silver = Math.min(100, c.silver + silverGain);
      c.lastSilver = now - (silverElapsed % SILVER_INTERVAL);
    }
    if (tributeGain > 0) {
      c.tribute = Math.min(10, c.tribute + tributeGain);
      c.lastTribute = now - (tributeElapsed % TRIBUTE_INTERVAL);
    }
    const silverRemain = SILVER_INTERVAL - (now - c.lastSilver);
    const tributeRemain = TRIBUTE_INTERVAL - (now - c.lastTribute);
    const div = document.createElement("div");
    div.className = "character";
    div.innerHTML = `
      <h3>${c.name}</h3>
      은동전: <input value="${c.silver}" onchange="updateValue(${i}, 'silver', this.value)" style="width: 60px;"> (${format(silverRemain)} 후 +1)
      <div class="bar"><div class="fill" style="width:${(c.silver / 100) * 100}%"></div></div>
      공물: <input value="${c.tribute}" onchange="updateValue(${i}, 'tribute', this.value)" style="width: 60px;"> (${format(tributeRemain)} 후 +1)
      <div class="bar"><div class="fill" style="width:${(c.tribute / 10) * 100}%"></div></div>
      <div class="use-buttons">
        <button onclick="useItem(${i}, 'silver')">은동전 사용 (-10)</button>
        <button onclick="useItem(${i}, 'tribute')">공물 사용 (-1)</button>
      </div>
      <button class="delete" onclick="deleteCharacter(${i})">삭제</button>
    `;
    container.appendChild(div);
  });
  saveData();
}

function updateValue(index, type, value) {
  characters[index][type] = parseInt(value);
  saveData();
  render();
}

function addCharacter() {
  const name = prompt("캐릭터 이름 입력:");
  if (!name) return;
  characters.push({
    name,
    silver: 0,
    tribute: 0,
    lastSilver: Date.now(),
    lastTribute: Date.now()
  });
  saveData();
  render();
}

function deleteCharacter(index) {
  characters.splice(index, 1);
  saveData();
  render();
}

function showTab(tab) {
  document.getElementById("timerSection").classList.toggle("hidden", tab !== "timer");
  document.getElementById("checklistSection").classList.toggle("hidden", tab !== "checklist");
  document.getElementById("timerTab").classList.toggle("active", tab === "timer");
  document.getElementById("checklistTab").classList.toggle("active", tab === "checklist");
}

let characters = [];
loadData();
setInterval(render, 1000);
