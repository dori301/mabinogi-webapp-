
document.addEventListener("DOMContentLoaded", function () {
  loadDailyQuests();
  resetIfNeeded();
});

const dailyQuests = [
  { title: "검은 구멍", max: 3 },
  { title: "소환의 결계", max: 2 },
  { title: "망령의 탑", max: 5 },
  { title: "요일 던전", max: 1 },
  { title: "일일 미션", max: 1 },
];

function loadDailyQuests() {
  const container = document.getElementById("dailyQuestList");
  container.innerHTML = "";

  dailyQuests.forEach((task, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "daily-task";

    const header = document.createElement("h4");
    header.textContent = task.title;
    wrapper.appendChild(header);

    const saved = JSON.parse(localStorage.getItem("quest_" + task.title)) || [];
    for (let i = 0; i < task.max; i++) {
      const circle = document.createElement("span");
      circle.className = "check-circle";
      if (saved[i]) circle.classList.add("checked");
      circle.addEventListener("click", () => {
        saved[i] = !saved[i];
        localStorage.setItem("quest_" + task.title, JSON.stringify(saved));
        loadDailyQuests();
      });
      wrapper.appendChild(circle);
    }

    container.appendChild(wrapper);
  });
}

// 리셋 조건: 매일 오전 6시 이후 첫 접속 시 localStorage 초기화
function resetIfNeeded() {
  const lastReset = localStorage.getItem("daily_reset_time");
  const now = new Date();
  const resetTime = new Date();
  resetTime.setHours(6, 0, 0, 0);

  if (!lastReset || new Date(lastReset).toDateString() !== now.toDateString() && now >= resetTime) {
    dailyQuests.forEach(q => localStorage.removeItem("quest_" + q.title));
    localStorage.setItem("daily_reset_time", now.toISOString());
  }
}
