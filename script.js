// script.js

document.addEventListener("DOMContentLoaded", function () {
  loadCharacters();
  loadDailyQuestsForAll();
  resetIfNeeded();
});

// ─── 은동전/공물 인터벌 정의 ─────────────────
const COIN_INTERVAL_SEC    = 30 * 60;      // 30분 (초 단위)
const TRIBUTE_INTERVAL_SEC = 12 * 60 * 60; // 12시간 (초 단위)

function formatHMS(totalSec) {
  const sec = totalSec % 60;
  const min = Math.floor((totalSec % 3600) / 60);
  const hr  = Math.floor(totalSec / 3600);
  return { hr, min, sec };
}

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

    // 이름
    const title = document.createElement("h3");
    title.textContent = name;
    div.appendChild(title);

    // — 은동전 입력 + 타이머 —
    const silverLabel = document.createElement("label");
    silverLabel.textContent = "은동전: ";
    const silverInput = document.createElement("input");
    silverInput.type  = "number";
    silverInput.value = localStorage.getItem(name + "_silver") || 0;
    silverInput.dataset.name = name;
    silverInput.dataset.type = "silver";
    silverInput.oninput = () => {
      localStorage.setItem(name + "_silver", silverInput.value);
      updateProgress();
    };
    silverLabel.appendChild(silverInput);
    div.appendChild(silverLabel);

    const silverTime = document.createElement("span");
    silverTime.className = "timer";
    silverTime.dataset.name     = name;
    silverTime.dataset.interval = COIN_INTERVAL_SEC;
    const silverKey = `${name}_silver_until`;
    silverTime.dataset.until = localStorage.getItem(silverKey)
      || new Date(Date.now() + COIN_INTERVAL_SEC * 1000).toISOString();
    localStorage.setItem(silverKey, silverTime.dataset.until);
    div.appendChild(silverTime);

    // — 은동전 타이머 설정 버튼 —
    const editSilver = document.createElement("button");
    editSilver.textContent = "⏰";
    editSilver.title = "마지막 은동전 획득 시간 설정";
    editSilver.style.marginLeft = "4px";
    editSilver.onclick = () => {
      const input = prompt(
        "마지막 은동전 획득 시간 입력\n" +
        "• HH:MM (예: 14:30)\n" +
        "• ISO (예: 2025-05-05T02:20)\n" +
        "• 상대시간 (예: 30분 전)"
      );
      if (!input) return;
      const now = new Date();
      let dt;
      if (/^\d{1,2}:\d{2}$/.test(input)) {
        const [h, m] = input.split(":").map(n => parseInt(n, 10));
        dt = new Date(now);
        dt.setHours(h, m, 0, 0);
        if (dt > now) dt.setDate(dt.getDate() - 1);
      } else if (/전/.test(input)) {
        const match = input.match(/(\d+)\s*(분|시간)/);
        if (!match) return alert("잘못된 형식입니다.");
        const num = parseInt(match[1], 10);
        const unit = match[2] === "시간" ? 3600 : 60;
        dt = new Date(now.getTime() - num * unit * 1000);
      } else {
        dt = new Date(input);
        if (isNaN(dt)) return alert("잘못된 형식입니다.");
      }
      const iso = dt.toISOString();
      silverTime.dataset.until = iso;
      localStorage.setItem(silverKey, iso);
      updateProgress();
    };
    div.appendChild(editSilver);

    // 은동전 진행바
    const silverBar = document.createElement("div");
    silverBar.className = "bar";
    const silverFill = document.createElement("div");
    silverFill.className = "fill";
    silverBar.appendChild(silverFill);
    div.appendChild(silverBar);

    // — 공물 입력 + 타이머 —
    const tributeLabel = document.createElement("label");
    tributeLabel.textContent = "공물: ";
    const tributeInput = document.createElement("input");
    tributeInput.type  = "number";
    tributeInput.value = localStorage.getItem(name + "_tribute") || 0;
    tributeInput.dataset.name = name;
    tributeInput.dataset.type = "tribute";
    tributeInput.oninput = () => {
      localStorage.setItem(name + "_tribute", tributeInput.value);
      updateProgress();
    };
    tributeLabel.appendChild(tributeInput);
    div.appendChild(tributeLabel);

    const tributeTime = document.createElement("span");
    tributeTime.className = "timer";
    tributeTime.dataset.name     = name;
    tributeTime.dataset.interval = TRIBUTE_INTERVAL_SEC;
    const tributeKey = `${name}_tribute_until`;
    tributeTime.dataset.until = localStorage.getItem(tributeKey)
      || new Date(Date.now() + TRIBUTE_INTERVAL_SEC * 1000).toISOString();
    localStorage.setItem(tributeKey, tributeTime.dataset.until);
    div.appendChild(tributeTime);

    // — 공물 타이머 설정 버튼 —
    const editTribute = document.createElement("button");
    editTribute.textContent = "⏰";
    editTribute.title = "마지막 공물 획득 시간 설정";
    editTribute.style.marginLeft = "4px";
    editTribute.onclick = () => {
      const input = prompt(
        "마지막 공물 획득 시간 입력\n" +
        "• HH:MM (예: 02:20)\n" +
        "• ISO (예: 2025-05-05T02:20)\n" +
        "• 상대시간 (예: 12시간 전)"
      );
      if (!input) return;
      const now = new Date();
      let dt;
      if (/^\d{1,2}:\d{2}$/.test(input)) {
        const [h, m] = input.split(":").map(n => parseInt(n, 10));
        dt = new Date(now);
        dt.setHours(h, m, 0, 0);
        if (dt > now) dt.setDate(dt.getDate() - 1);
      } else if (/전/.test(input)) {
        const match = input.match(/(\d+)\s*(분|시간)/);
        if (!match) return alert("잘못된 형식입니다.");
        const num = parseInt(match[1], 10);
        const unit = match[2] === "시간" ? 3600 : 60;
        dt = new Date(now.getTime() - num * unit * 1000);
      } else {
        dt = new Date(input);
        if (isNaN(dt)) return alert("잘못된 형식입니다.");
      }
      const iso = dt.toISOString();
      tributeTime.dataset.until = iso;
      localStorage.setItem(tributeKey, iso);
      updateProgress();
    };
    div.appendChild(editTribute);

    // 공물 진행바
    const tributeBar = document.createElement("div");
    tributeBar.className = "bar";
    const tributeFill = document.createElement("div");
    tributeFill.className = "fill";
    tributeBar.appendChild(tributeFill);
    div.appendChild(tributeBar);

    // — 사용 버튼 (타이머 리셋 제거) —
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

    // — 삭제 버튼 —
    const delBtn = document.createElement("button");
    delBtn.textContent = "삭제";
    delBtn.onclick = () => {
      if (!confirm("정말 삭제할까요?")) return;
      localStorage.removeItem(name + "_silver");
      localStorage.removeItem(name + "_tribute");
      localStorage.removeItem(silverKey);
      localStorage.removeItem(tributeKey);
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
      silverFill.style.width  = Math.min(silver, 100)  + "%";
      tributeFill.style.width = Math.min(tribute * 10, 100) + "%";
    });
  });
}

// 일일 숙제 체크리스트 (변경 없음)
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

// ─── 타이머 업데이트 및 자동 +1/리셋 로직 ─────────────────
setInterval(() => {
  document.querySelectorAll(".timer").forEach(el => {
    const interval = parseInt(el.dataset.interval, 10);
    const name     = el.dataset.name;
    const key      = interval === COIN_INTERVAL_SEC
                     ? `${name}_silver_until`
                     : `${name}_tribute_until`;

    let end  = new Date(el.dataset.until);
    let diff = Math.floor((end - new Date()) / 1000);

    // 타이머 만료 시: 자동 +1, interval로 재설정, 저장
    if (diff <= 0) {
      // 1) 자동 +1
      const input = document.querySelector(`input[data-name="${name}"][data-type="${interval===COIN_INTERVAL_SEC?'silver':'tribute'}"]`);
      input.value = (parseInt(input.value,10) || 0) + 1;
      input.oninput();

      // 2) 새로운 만료 시점 설정
      diff = interval;
      const next = new Date(Date.now() + interval * 1000).toISOString();
      el.dataset.until = next;
      localStorage.setItem(key, next);
    }

    // 남은 시간 표시
    const { hr, min, sec } = formatHMS(diff);
    el.textContent = interval === COIN_INTERVAL_SEC
      ? ` (${min}분 ${sec}초 후 +1)`
      : ` (${hr}시간 ${min}분 ${sec}초 후 +1)`;
  });
}, 1000);
