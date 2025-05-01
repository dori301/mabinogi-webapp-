let characters = [];

function addCharacter() {
  const name = prompt("캐릭터 이름을 입력하세요:");
  if (!name) return;

  const now = new Date();
  const character = {
    name,
    silverTime: now.getTime(),
    relicTime: now.getTime()
  };
  characters.push(character);
  render();
}

function updateTimers() {
  const now = new Date().getTime();
  characters.forEach(char => {
    char.silver = Math.min(100, Math.floor((now - char.silverTime) / (30 * 60 * 1000)));
    char.relic = Math.min(10, Math.floor((now - char.relicTime) / (12 * 60 * 60 * 1000)));
  });
  render();
}

function render() {
  const container = document.getElementById("characters");
  container.innerHTML = "";
  characters.forEach(char => {
    const div = document.createElement("div");
    div.className = "character";

    const silverPercent = (char.silver / 100) * 100;
    const relicPercent = (char.relic / 10) * 100;

    div.innerHTML = `
      <h2>${char.name}</h2>
      <p>은동전: ${char.silver} / 100</p>
      <div class="progress"><div class="progress-bar" style="width:${silverPercent}%">${silverPercent.toFixed(0)}%</div></div>
      <p>마족 공물: ${char.relic} / 10</p>
      <div class="progress"><div class="progress-bar" style="width:${relicPercent}%">${relicPercent.toFixed(0)}%</div></div>
    `;
    container.appendChild(div);
  });
}

setInterval(updateTimers, 30000);
window.onload = updateTimers;
