document.addEventListener("DOMContentLoaded", function () {
  loadCharacters();
  loadDailyQuestsForAll();
  resetIfNeeded();
});

// ─── 은동전/공물 인터벌 정의 ─────────────────
const COIN_INTERVAL_SEC    = 30 * 60;     // 30분(초 단위)
const TRIBUTE_INTERVAL_SEC = 12 * 60 * 60; // 12시간(초 단위)

function formatHMS(totalSec) {
  const sec = totalSec % 60;
  const min = Math.floor((totalSec % 3600) / 60);
  const hr  = Math.floor(totalSec / 3600);
  return { hr, min, sec };
}

// 캐릭터 로드
function addCharacter() {
  const name = prompt("캐릭터 이름을 입력하세요:");
  if (!name) return;

  const chars = JSON.parse(localStorage.getItem("characters") || "[]");
  if (chars.includes(name)) return;

  chars.push(name);
  localStorage.setItem("characters", JSON.stringify(chars));
  loadCharacters();
  loadDailyQuestsForAll();
}

function loadCharacters() {
  const characters = JSON.parse(localStorage.getItem("characters") || "[]");
  const container  = document.getElementById("characterList");
  container.innerHTML = "";

  characters.forEach((name) => {
    const div = document.createElement("div");
    div.className = "character";

    // 제목
    const title = document.createElement("h3");
    title.textContent = name;
    div.appendChild(title);

    // 은동전 입력 + 타이머
    const silverLabel = document.createElement("label");
    silverLabel.innerHTML = "은동전: ";
    const silverInput = document.createElement("input");
    silverInput.type  = "number";
    silverInput.value = localStorage.getItem(name + "_silver") || 0;
    silverInput.oninput = () => {
      localStorage.setItem(name + "_silver", silverInput.value);
      updateProgress();
    };
    silverLabel.appendChild(silverInput);
    div.appendChild(silverLabel);

    const silverTime = document.createElement("span");
    silverTime.className = "timer";
    // 다음 증가 시점 저장용
    silverTime.dataset.interval = COIN_INTERVAL_SEC;
    silverTime.dataset.until    = new Date(Date.now() + COIN_INTERVAL_SEC * 1000).toISOString();
    div.appendChild(silverTime);

    // 은동전 진행바
    const silverBar = document.createElement("div");
    silverBar.className = "bar";
    const silverFill = document.createElement("div");
    silverFill.className = "fill";
    silverBar.appendChild(silverFill);
    div.appendChild(silverBar);

    // 공물 입력 + 타이머
    const tributeLabel = document.createElement("label");
    tributeLabel.innerHTML = "공물: ";
    const tributeInput = document.createElement("input");
    tributeInput.type  = "number";
    tributeInput.value = localStorage.getItem(name + "_tribute") || 0;
    tributeInput.oninput = () => {
      localStorage.setItem(name + "_tribute", tributeInput.value);
      updateProgress();
    };
    tributeLabel.appendChild(tributeInput);
    div.appendChild(tributeLabel);

    const tributeTime = document.createElement("span");
    tributeTime.className = "timer";
    tributeTime.dataset.interval = TRIBUTE_INTERVAL_SEC;
    tributeTime.dataset.until    = new Date(Date.now() + TRIBUTE_INTERVAL_SEC * 1000).toISOString();
    div.appendChild(tributeTime);

    // 공물 진행바
    const tributeBar = document.createElement("div");
    tributeBar.className = "bar";
    const tributeFill = document.createElement("div");
    tributeFill.className = "fill";
    tributeBar.appendChild(tributeFill);
    div.appendChild(tributeBar);

    // 사용 버튼
    const useDiv = document.createElement("div");
    useDiv.className = "use-buttons";
    const useSilver = document.createElement("button");
    useSilver.textContent = "은동전 사용 (-10)";
    useSilver.onclick = () => {
      silverInput.value = Math.max(0, silverInput.value - 10);
      silverInput.oninput();
      // 사용 시점에 타이머도 리셋
      silverTime.dataset.until = new Date(Date.now() + COIN_INTERVAL_SEC * 1000).toISOString();
    };
    const useTribute = document.createElement("button");
    useTribute.textContent = "공물 사용 (-1)";
    useTribute.onclick = () => {
      tributeInput.value = Math.max(0, tributeInput.value - 1);
      tributeInput.oninput();
      tributeTime.dataset.until = new Date(Date.now() + TRIBUTE_INTERVAL_SEC * 1000).toISOString();
    };
    useDiv.appendChild(useSilver);
    useDiv.appendChild(useTribute);
    div.appendChild(useDiv);

    // 삭제 버튼
    const delBtn = document.createElement("button");
    delBtn.textContent = "삭제";
    delBtn.onclick = () => {
      if (!confirm("정말 삭제할까요?")) return;
      localStorage.removeItem(name + "_silver");
      localStorage.removeItem(name + "_tribute");
      const remain = characters.filter(c => c !== name);
      localStorage.setItem("characters", JSON.stringify(remain));
      loadCharacters();
      loadDailyQuestsForAll();
    };
    div.appendChild(delBtn);

    container.appendChild(div);
  });

  updateProgress();
}

function updateProgress() {
  const characters = JSON.parse(localStorage.getItem("characters") || "[]");
  characters.forEach((name) => {
    document.querySelectorAll(".character").forEach((div) => {
      if (div.querySelector("h3").textContent !== name) return;

      const silver  = parseInt(localStorage.getItem(name + "_silver")  || 0);
      const tribute = parseInt(localStorage.getItem(name + "_tribute") || 0);

      const [silverFill, tributeFill] = div.querySelectorAll(".fill");
      silverFill.style.width  = (silver  / 100) * 100 + "%";
      tributeFill.style.width = (tribute / 10)  * 100 + "%";
    });
  });
}

// 타이머 표시 및 자동 리셋
setInterval(() => {
  document.querySelectorAll(".timer").forEach(el => {
    const interval = parseInt(el.dataset.interval, 10);
    let end = new Date(el.dataset.until);
    let now = new Date();
    let diff = Math.floor((end - now) / 1000);

    // 만료 시점에 자동으로 다시 interval만큼 리셋
    if (diff <= 0) {
      diff = interval;
      el.dataset.until = new Date(now.getTime() + interval * 1000).toISOString();
    }

    const { hr, min, sec } = formatHMS(diff);
    // 은동전(30분)은 hr이 항상 0이므로 자동으로 “0시간” 생략해도 되고
    el.textContent = el.dataset.interval == COIN_INTERVAL_SEC
      ? ` (${min}분 ${sec}초 후 +1)`
      : ` (${hr}시간 ${min}분 ${sec}초 후 +1)`;
  });
}, 1000);

// --- 이하 일일 숙제 체크리스트 로직은 그대로 ---
const dailyQuests = [
  { title: "검은 구멍", max: 3 },
  { title: "소환의 결계", max: 2 },
  { title: "망령의 탑", max: 5 },
  { title: "요일 던전", max: 1 },
  { title: "일일 미션", max: 1 },
];

function loadDailyQuestsForAll() {
  const characters = JSON.parse(localStorage.getItem("characters") || "[]");
  const container  = document.getElementById("dailyQuestList");
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
  const now       = new Date();
  const resetTime = new Date();
  resetTime.setHours(6, 0, 0, 0);

  if (
    !lastReset ||
    (new Date(lastReset).toDateString() !== now.toDateString() && now >= resetTime)
  ) {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("quest_")) localStorage.removeItem(k);
    });
    localStorage.setItem("daily_reset_time", now.toISOString());
  }
}
