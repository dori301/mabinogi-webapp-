
const MAX_SILVER = 100;
const MAX_TRIBUTE = 10;
const SILVER_INTERVAL = 30 * 60 * 1000;
const TRIBUTE_INTERVAL = 12 * 60 * 60 * 1000;

function saveCharacters(data) {
  localStorage.setItem("mabiCharacters", JSON.stringify(data));
}
function loadCharacters() {
  const raw = localStorage.getItem("mabiCharacters");
  return raw ? JSON.parse(raw) : [];
}
function formatTime(ms) {
  const t = Math.floor(ms / 1000);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${h}시간 ${m}분 ${s}초`;
}
function addCharacter() {
  const name = prompt("캐릭터 이름을 입력하세요");
  if (!name) return;
  const now = Date.now();
  const data = loadCharacters();
  data.push({
    name, silver: 0, tribute: 0,
    lastSilver: now, lastTribute: now
  });
  saveCharacters(data);
  renderCharacters();
}
function deleteCharacter(index) {
  const data = loadCharacters();
  data.splice(index, 1);
  saveCharacters(data);
  renderCharacters();
}
function useItem(index, type) {
  const data = loadCharacters();
  if (type === "silver" && data[index].silver >= 10) {
    data[index].silver -= 10;
  } else if (type === "tribute" && data[index].tribute >= 1) {
    data[index].tribute -= 1;
  }
  saveCharacters(data);
  renderCharacters();
}
function updateResources() {
  const now = Date.now();
  const data = loadCharacters();
  let updated = false;
  for (const c of data) {
    let sTime = now - c.lastSilver;
    let tTime = now - c.lastTribute;
    const sGain = Math.floor(sTime / SILVER_INTERVAL);
    const tGain = Math.floor(tTime / TRIBUTE_INTERVAL);
    if (sGain > 0) {
      c.silver = Math.min(MAX_SILVER, c.silver + sGain);
      c.lastSilver += sGain * SILVER_INTERVAL;
      updated = true;
    }
    if (tGain > 0) {
      c.tribute = Math.min(MAX_TRIBUTE, c.tribute + tGain);
      c.lastTribute += tGain * TRIBUTE_INTERVAL;
      updated = true;
    }
  }
  if (updated) saveCharacters(data);
}
function renderCharacters() {
  updateResources();
  const list = document.getElementById("characterList");
  list.innerHTML = "";
  const now = Date.now();
  const data = loadCharacters();
  data.forEach((c, i) => {
    const sRemain = SILVER_INTERVAL - (now - c.lastSilver) % SILVER_INTERVAL;
    const tRemain = TRIBUTE_INTERVAL - (now - c.lastTribute) % TRIBUTE_INTERVAL;
    const el = document.createElement("div");
    el.className = "character";
    el.innerHTML = `
      <h3>${c.name}</h3>
      <div>은동전: <input value="${c.silver}" onchange="updateValue(${i}, 'silver', this.value)"> (${formatTime(sRemain)} 후 +1)</div>
      <div class="bar"><div class="fill" style="width:${(c.silver / MAX_SILVER) * 100}%"></div></div>
      <div>공물: <input value="${c.tribute}" onchange="updateValue(${i}, 'tribute', this.value)"> (${formatTime(tRemain)} 후 +1)</div>
      <div class="bar"><div class="fill" style="width:${(c.tribute / MAX_TRIBUTE) * 100}%"></div></div>
      <div class="use-buttons">
        <button onclick="useItem(${i}, 'silver')">은동전 사용 (-10)</button>
        <button onclick="useItem(${i}, 'tribute')">공물 사용 (-1)</button>
      </div>
      <button class="delete" onclick="deleteCharacter(${i})">삭제</button>
    `;
    list.appendChild(el);
  });
}
function updateValue(i, type, val) {
  const data = loadCharacters();
  data[i][type] = parseInt(val) || 0;
  saveCharacters(data);
  renderCharacters();
}
setInterval(renderCharacters, 1000);
window.onload = renderCharacters;
