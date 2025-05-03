
document.addEventListener("DOMContentLoaded", function () {
  loadCharacters();
  loadDailyQuestsForAll();
  resetIfNeeded();
});

function addCharacter() {
  const name = prompt("캐릭터 이름을 입력하세요:");
  if (!name) return;

  const characters = JSON.parse(localStorage.getItem("characters") || "[]");
  if (characters.includes(name)) return;

  characters.push(name);
  localStorage.setItem("characters", JSON.stringify(characters));
  loadCharacters();
  loadDailyQuestsForAll();
}

function loadCharacters() {
  const characters = JSON.parse(localStorage.getItem("characters") || "[]");
  const container = document.getElementById("characterList");
  container.innerHTML = "";

  characters.forEach((name) => {
    const div = document.createElement("div");
    div.className = "character";

    const title = document.createElement("h3");
    title.textContent = name;
    div.appendChild(title);

    const silverLabel = document.createElement("label");
    silverLabel.innerHTML = "은동전: ";
    const silverInput = document.createElement("input");
    silverInput.type = "number";
    silverInput.value = localStorage.getItem(name + "_silver") || 0;
    silverInput.oninput = () => {
      localStorage.setItem(name + "_silver", silverInput.value);
      updateProgress();
    };
    silverLabel.appendChild(silverInput);
    div.appendChild(silverLabel);

    const silverTime = document.createElement("span");
    div.appendChild(silverTime);

    const silverBar = document.createElement("div");
    silverBar.className = "bar";
    const silverFill = document.createElement("div");
    silverFill.className = "fill";
    silverBar.appendChild(silverFill);
    div.appendChild(silverBar);

    const tributeLabel = document.createElement("label");
    tributeLabel.innerHTML = "공물: ";
    const tributeInput = document.createElement("input");
    tributeInput.type = "number";
    tributeInput.value = localStorage.getItem(name + "_tribute") || 0;
    tributeInput.oninput = () => {
      localStorage.setItem(name + "_tribute", tributeInput.value);
      updateProgress();
    };
    tributeLabel.appendChild(tributeInput);
    div.appendChild(tributeLabel);

    const tributeTime = document.createElement("span");
    div.appendChild(tributeTime);

    const tributeBar = document.createElement("div");
    tributeBar.className = "bar";
    const tributeFill = document.createElement("div");
    tributeFill.className = "fill";
    tributeBar.appendChild(tributeFill);
    div.appendChild(tributeBar);

    const useDiv = document.createElement("div");
    useDiv.className = "use-buttons";
    const useSilver = document.createElement("button");
    useSilver.textContent = "은동전 사용 (-10)";
    useSilver.onclick = () => {
      silverInput.value = Math.max(0, silverInput.value - 10);
      silverInput.oninput();
    };
    const useTribute = document.createElement("button");
    useTribute.textContent = "공물 사용 (-1)";
    useTribute.onclick = () => {
      tributeInput.value = Math.max(0, tributeInput.value - 1);
      tributeInput.oninput();
    };
    useDiv.appendChild(useSilver);
    useDiv.appendChild(useTribute);
    div.appendChild(useDiv);

    const delBtn = document.createElement("button");
    delBtn.textContent = "삭제";
    delBtn.onclick = () => {
      if (confirm("정말 삭제할까요?")) {
        localStorage.removeItem(name + "_silver");
        localStorage.removeItem(name + "_tribute");
        localStorage.removeItem("characters");
        const remain = characters.filter(c => c !== name);
        localStorage.setItem("characters", JSON.stringify(remain));
        loadCharacters();
        loadDailyQuestsForAll();
      }
    };
    div.appendChild(delBtn);

    container.appendChild(div);
  });

  updateProgress();
}

function updateProgress() {
  const characters = JSON.parse(localStorage.getItem("characters") || "[]");

  characters.forEach((name) => {
    const charDivs = document.querySelectorAll(".character");
    charDivs.forEach((div) => {
      if (div.querySelector("h3").textContent !== name) return;

      const silver = parseInt(localStorage.getItem(name + "_silver") || 0);
      const tribute = parseInt(localStorage.getItem(name + "_tribute") || 0);

      const silverFill = div.querySelectorAll(".fill")[0];
      const tributeFill = div.querySelectorAll(".fill")[1];
      silverFill.style.width = (silver / 100) * 100 + "%";
      tributeFill.style.width = (tribute / 10) * 100 + "%";

      const silverTime = div.querySelectorAll("span")[0];
      const tributeTime = div.querySelectorAll("span")[1];
      let silverRemain = (100 - silver) * 30 * 60;
      const silverNext = new Date(Date.now() + silverRemain * 1000);
      silverTime.dataset.until = silverNext;
      silverTime.className = "timer";
    
      let tributeRemain = (10 - tribute) * 720 * 60;
      const tributeNext = new Date(Date.now() + tributeRemain * 1000);
      tributeTime.dataset.until = tributeNext;
      tributeTime.className = "timer";
    
    });
  });
}

// 숙제 로직
const dailyQuests = [
  { title: "검은 구멍", max: 3 },
  { title: "소환의 결계", max: 2 },
  { title: "망령의 탑", max: 5 },
  { title: "요일 던전", max: 1 },
  { title: "일일 미션", max: 1 },
];

function loadDailyQuestsForAll() {
  const characters = JSON.parse(localStorage.getItem("characters") || "[]");
  const container = document.getElementById("dailyQuestList");
  container.innerHTML = "";

  characters.forEach((name) => {
    const wrapper = document.createElement("div");
    wrapper.className = "daily-character";

    const title = document.createElement("h3");
    title.textContent = name;
    wrapper.appendChild(title);

    dailyQuests.forEach((task) => {
      const taskDiv = document.createElement("div");
      taskDiv.className = "daily-task";

      const label = document.createElement("h4");
      label.textContent = task.title;
      taskDiv.appendChild(label);

      const key = `quest_${name}_${task.title}`;
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      for (let i = 0; i < task.max; i++) {
        const circle = document.createElement("span");
        circle.className = "check-circle" + (saved[i] ? " checked" : "");
        circle.addEventListener("click", () => {
          saved[i] = !saved[i];
          localStorage.setItem(key, JSON.stringify(saved));
          loadDailyQuestsForAll();
        });
        taskDiv.appendChild(circle);
      }

      const percent = Math.floor((saved.filter(Boolean).length / task.max) * 100);
      const bar = document.createElement("div");
      bar.className = "bar";
      const fill = document.createElement("div");
      fill.className = "fill";
      fill.style.width = percent + "%";
      bar.appendChild(fill);
      taskDiv.appendChild(bar);

      wrapper.appendChild(taskDiv);
    });

    container.appendChild(wrapper);
  });
}

// 매일 6시 리셋
function resetIfNeeded() {
  const lastReset = localStorage.getItem("daily_reset_time");
  const now = new Date();
  const resetTime = new Date();
  resetTime.setHours(6, 0, 0, 0);

  if (!lastReset || new Date(lastReset).toDateString() !== now.toDateString() && now >= resetTime) {
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith("quest_")) localStorage.removeItem(k);
    });
    localStorage.setItem("daily_reset_time", now.toISOString());
  }
}

setInterval(() => {
  document.querySelectorAll(".timer").forEach(el => {
    const end = new Date(el.dataset.until);
    const now = new Date();
    let diff = Math.floor((end - now) / 1000);
    if (diff < 0) diff = 0;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    el.textContent = ` (${h}시간 ${m}분 ${s}초 후 +1)`;
  });
}, 1000);


function calculateEarnedItems(lastUpdate, interval, currentCount) {
    const now = Date.now();
    const elapsed = Math.floor((now - lastUpdate) / 1000);
    const earned = Math.floor(elapsed / interval);
    const remainder = elapsed % interval;
    return [currentCount + earned, interval - remainder];
}

function updateTimers() {
    characters.forEach((char, index) => {
        const now = Date.now();

        const [silverCount, silverLeft] = calculateEarnedItems(char.lastSilverUpdate || now, SILVER_INTERVAL, char.silver);
        const [relicCount, relicLeft] = calculateEarnedItems(char.lastRelicUpdate || now, RELIC_INTERVAL, char.relic);

        char.silver = silverCount;
        char.relic = relicCount;
        char.lastSilverUpdate = now - (SILVER_INTERVAL - silverLeft) * 1000;
        char.lastRelicUpdate = now - (RELIC_INTERVAL - relicLeft) * 1000;

        renderCharacters();
        saveData();
    });
}

setInterval(updateTimers, 1000);
