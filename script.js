
const SILVER_INTERVAL = 30 * 60 * 1000;
const RELIC_INTERVAL = 12 * 60 * 60 * 1000;

function saveData() {
  const characters = [...document.querySelectorAll(".character")].map(card => {
    return {
      name: card.querySelector("h2").textContent,
      silver: parseInt(card.querySelector(".silver-input").value),
      relic: parseInt(card.querySelector(".relic-input").value),
      silverStart: parseInt(card.dataset.silverStart),
      relicStart: parseInt(card.dataset.relicStart)
    };
  });
  localStorage.setItem("characters", JSON.stringify(characters));
}

function loadData() {
  const data = JSON.parse(localStorage.getItem("characters") || "[]");
  data.forEach(({ name, silver, relic, silverStart, relicStart }) => {
    addCharacter(name, silver, relic, silverStart, relicStart);
  });
}

function addCharacter(name = "ㅇㅈ", silver = 0, relic = 0, silverStart = Date.now(), relicStart = Date.now()) {
  const card = document.createElement("div");
  card.className = "character";
  card.dataset.silverStart = silverStart;
  card.dataset.relicStart = relicStart;

  card.innerHTML = \`
    <h2>\${name}</h2>
    <div>
      은동전: <input class="silver-input" type="number" value="\${silver}" />
      <span class="silver-timer"></span>
      <div class="bar"><div class="fill silver-bar"></div></div>
    </div>
    <div style="margin-top: 10px">
      공물: <input class="relic-input" type="number" value="\${relic}" />
      <span class="relic-timer"></span>
      <div class="bar"><div class="fill relic-bar"></div></div>
    </div>
    <div class="use-buttons">
      <button onclick="useSilver(this)">은동전 사용 (-10)</button>
      <button onclick="useRelic(this)">공물 사용 (-1)</button>
    </div>
    <button onclick="this.parentElement.remove(); saveData()">삭제</button>
  \`;

  document.getElementById("characterList").appendChild(card);
  saveData();
}

function useSilver(button) {
  const card = button.closest(".character");
  const input = card.querySelector(".silver-input");
  input.value = Math.max(0, parseInt(input.value) - 10);
  card.dataset.silverStart = Date.now();
  saveData();
}

function useRelic(button) {
  const card = button.closest(".character");
  const input = card.querySelector(".relic-input");
  input.value = Math.max(0, parseInt(input.value) - 1);
  card.dataset.relicStart = Date.now();
  saveData();
}

function updateTimers() {
  document.querySelectorAll(".character").forEach(card => {
    const silverInput = card.querySelector(".silver-input");
    const relicInput = card.querySelector(".relic-input");
    const silverCount = parseInt(silverInput.value);
    const relicCount = parseInt(relicInput.value);
    const silverStart = parseInt(card.dataset.silverStart);
    const relicStart = parseInt(card.dataset.relicStart);
    const now = Date.now();

    const nextSilverTime = SILVER_INTERVAL - ((now - silverStart) % SILVER_INTERVAL);
    const nextRelicTime = RELIC_INTERVAL - ((now - relicStart) % RELIC_INTERVAL);

    card.querySelector(".silver-timer").textContent = \` (\${format(nextSilverTime)} 후 +1)\`;
    card.querySelector(".relic-timer").textContent = \` (\${format(nextRelicTime)} 후 +1)\`;

    card.querySelector(".silver-bar").style.width = \`\${(SILVER_INTERVAL - nextSilverTime) / SILVER_INTERVAL * 100}%\`;
    card.querySelector(".relic-bar").style.width = \`\${(RELIC_INTERVAL - nextRelicTime) / RELIC_INTERVAL * 100}%\`;
  });
}

function format(ms) {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return \`\${h}시간 \${m}분 \${s}초\`;
}

setInterval(updateTimers, 1000);
window.addEventListener("load", loadData);
