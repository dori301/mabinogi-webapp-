
const characterList = document.getElementById('character-list');
let characters = JSON.parse(localStorage.getItem('characters') || '[]');

function saveCharacters() {
  localStorage.setItem('characters', JSON.stringify(characters));
}

function addCharacter() {
  const name = prompt("캐릭터 이름을 입력하세요:");
  if (!name) return;
  const silver = parseInt(prompt("현재 은동전 개수 (0~100):") || "0");
  const relic = parseInt(prompt("현재 마족 공물 개수 (0~10):") || "0");
  const now = new Date().getTime();

  characters.push({
    name,
    silver,
    relic,
    silverTime: now - (silver * 30 * 60 * 1000),
    relicTime: now - (relic * 12 * 60 * 60 * 1000),
  });
  saveCharacters();
  renderCharacters();
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}시간 ${minutes}분 ${seconds}초`;
}

function renderCharacters() {
  characterList.innerHTML = '';
  characters.forEach((char, index) => {
    const now = new Date().getTime();
    const silverElapsed = now - char.silverTime;
    const relicElapsed = now - char.relicTime;
    const silverCount = Math.min(100, Math.floor(silverElapsed / (30 * 60 * 1000)));
    const relicCount = Math.min(10, Math.floor(relicElapsed / (12 * 60 * 60 * 1000)));
    const silverProgress = Math.min(100, (silverElapsed / (30 * 60 * 1000)) % 1 * 100);
    const relicProgress = Math.min(100, (relicElapsed / (12 * 60 * 60 * 1000)) % 1 * 100);

    if (silverCount >= 80 || relicCount >= 8) {
      if (Notification.permission === "granted") {
        new Notification(`${char.name} 경고`, {
          body: `은동전 ${silverCount}개 / 공물 ${relicCount}개 도달`,
        });
      }
    }

    const div = document.createElement('div');
    div.className = 'character';
    div.innerHTML = `
      <strong>${char.name}</strong><br/>
      은동전: ${silverCount}개 (${formatTime((100 - silverCount) * 30 * 60 * 1000)})<br/>
      <div class="progress-bar"><div class="progress-fill" style="width: ${silverProgress}%;"></div></div>
      공물: ${relicCount}개 (${formatTime((10 - relicCount) * 12 * 60 * 60 * 1000)})<br/>
      <div class="progress-bar"><div class="progress-fill" style="width: ${relicProgress}%;"></div></div>
    `;
    characterList.appendChild(div);
  });
}

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

setInterval(renderCharacters, 1000);
renderCharacters();
