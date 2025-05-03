
const characterList = document.getElementById('characterList');

const SILVER_COIN_INTERVAL = 30 * 60 * 1000;
const RELIC_INTERVAL = 12 * 60 * 60 * 1000;
const MAX_SILVER = 100;
const MAX_RELIC = 10;

let characters = JSON.parse(localStorage.getItem('characters') || '[]');

function saveCharacters() {
  localStorage.setItem('characters', JSON.stringify(characters));
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}시간 ${minutes}분 ${seconds}초`;
}

function updateDisplay() {
  characterList.innerHTML = '';
  const now = Date.now();

  characters.forEach((char, idx) => {
    const silverElapsed = now - char.silverTimestamp;
    const relicElapsed = now - char.relicTimestamp;
    let silver = Math.min(MAX_SILVER, char.initialSilver + Math.floor(silverElapsed / SILVER_COIN_INTERVAL));
    let relic = Math.min(MAX_RELIC, char.initialRelic + Math.floor(relicElapsed / RELIC_INTERVAL));

    const silverRemain = SILVER_COIN_INTERVAL - (silverElapsed % SILVER_COIN_INTERVAL);
    const relicRemain = RELIC_INTERVAL - (relicElapsed % RELIC_INTERVAL);

    const div = document.createElement('div');
    div.className = 'character';

    div.innerHTML = `
      <h2>${char.name}</h2>
      <div>
        은동전: <input type="number" min="0" max="100" value="${silver}" onchange="updateAmount(${idx}, 'silver', this.value)">
        (${formatTime(silverRemain)} 후 +1)
        <div class="bar"><div class="fill" style="width: ${silver / MAX_SILVER * 100}%"></div></div>
      </div>
      <div>
        공물: <input type="number" min="0" max="10" value="${relic}" onchange="updateAmount(${idx}, 'relic', this.value)">
        (${formatTime(relicRemain)} 후 +1)
        <div class="bar"><div class="fill" style="width: ${relic / MAX_RELIC * 100}%"></div></div>
      </div>
      <button onclick="removeCharacter(${idx})">삭제</button>
    `;

    characterList.appendChild(div);
  });
}

function updateAmount(idx, type, value) {
  const now = Date.now();
  if (type === 'silver') {
    characters[idx].initialSilver = parseInt(value);
    characters[idx].silverTimestamp = now;
  } else {
    characters[idx].initialRelic = parseInt(value);
    characters[idx].relicTimestamp = now;
  }
  saveCharacters();
  updateDisplay();
}

function removeCharacter(index) {
  if (confirm('이 캐릭터를 삭제할까요?')) {
    characters.splice(index, 1);
    saveCharacters();
    updateDisplay();
  }
}

function addCharacter() {
  const name = prompt('캐릭터 이름을 입력하세요');
  if (!name) return;
  const initialSilver = parseInt(prompt('현재 은동전 개수를 입력하세요 (0~100)') || '0');
  const initialRelic = parseInt(prompt('현재 마족 공물 개수를 입력하세요 (0~10)') || '0');

  characters.push({
    name,
    initialSilver,
    initialRelic,
    silverTimestamp: Date.now(),
    relicTimestamp: Date.now(),
  });
  saveCharacters();
  updateDisplay();
}

setInterval(updateDisplay, 1000);
updateDisplay();
