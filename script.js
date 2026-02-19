let localTasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskList = document.getElementById("taskList");
const totalTasksEl = document.getElementById("totalTasks");
const urgentTasksEl = document.getElementById("urgentTasks");

function saveLocal() {
  localStorage.setItem("tasks", JSON.stringify(localTasks));
}

function addTask() {
  const nameInput = document.getElementById("taskInput");
  const dateInput = document.getElementById("dateInput");

  const name = nameInput.value.trim();
  const date = dateInput.value;

  if (!name || !date) {
    alert("Fill all fields");
    return;
  }

  localTasks.push({
    name: name,
    deadline: date,
    created: new Date().toISOString()
  });

  saveLocal();
  displayTasks();

  nameInput.value = "";
  dateInput.value = "";
}

function displayTasks() {
  taskList.innerHTML = "";

  let total = localTasks.length;
  let urgent = 0;

  localTasks.forEach((task, index) => {
    renderTask(task, index);

    let now = new Date().getTime();
    let deadline = new Date(task.deadline).getTime();
    let hoursLeft = (deadline - now) / (1000 * 60 * 60);

    if (hoursLeft <= 24 && hoursLeft > 0) {
      urgent++;
    }
  });

  if (totalTasksEl) totalTasksEl.textContent = total;
  if (urgentTasksEl) urgentTasksEl.textContent = urgent;
}

function renderTask(task, index) {
  let now = new Date().getTime();
  let deadline = new Date(task.deadline).getTime();
  let created = new Date(task.created).getTime();

  let total = deadline - created;
  let left = deadline - now;

  let percent = 0;
  if (total > 0) {
    percent = 100 - ((left / total) * 100);
  }

  if (percent < 0) percent = 100;
  if (percent > 100) percent = 100;

  let hoursLeft = Math.floor(left / (1000 * 60 * 60));
  let isOverdue = left <= 0;

  let div = document.createElement("div");
  div.className = "task";

  if (isOverdue) {
    div.classList.add("overdue");
  }

  div.innerHTML = `
    <div class="task-header">
      <div class="task-title">${task.name}</div>
      <div class="task-time ${isOverdue ? "overdue" : ""}">
        ${isOverdue ? "Overdue ❗" : hoursLeft + " hrs left"}
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress" style="width:${percent}%"></div>
    </div>

    <button class="complete-btn">Complete</button>
  `;

  div.querySelector(".complete-btn").addEventListener("click", function () {
    localTasks.splice(index, 1);
    saveLocal();
    displayTasks();
  });

  taskList.appendChild(div);
}

displayTasks();
