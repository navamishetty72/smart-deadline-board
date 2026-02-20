import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2oHrtHvX1WSnK7rDz5iZk-ZLPFzY9dOw",
  authDomain: "deadline-board-938be.firebaseapp.com",
  databaseURL: "https://deadline-board-938be-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "deadline-board-938be",
  storageBucket: "deadline-board-938be.appspot.com",
  messagingSenderId: "437793739914",
  appId: "1:437793739914:web:237b53f3ce8b6a07784973"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let mode = "single";
let localTasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentGroupId = null;

const taskList = document.getElementById("taskList");
const totalTasksEl = document.getElementById("totalTasks");
const urgentTasksEl = document.getElementById("urgentTasks");

document.getElementById("singleBtn").onclick = () => {
  mode = "single";
  document.getElementById("singleBtn").classList.add("active");
  document.getElementById("groupBtn").classList.remove("active");
  document.getElementById("authSection").classList.add("hidden");
  document.getElementById("groupSection").classList.add("hidden");
  displayTasks();
};

document.getElementById("groupBtn").onclick = () => {
  mode = "group";
  document.getElementById("groupBtn").classList.add("active");
  document.getElementById("singleBtn").classList.remove("active");
  document.getElementById("authSection").classList.remove("hidden");
  document.getElementById("groupSection").classList.remove("hidden");
};

document.getElementById("signupBtn").onclick = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("Signed Up"))
    .catch(e => alert(e.message));
};

document.getElementById("loginBtn").onclick = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("Logged In"))
    .catch(e => alert(e.message));
};

document.getElementById("createGroupBtn").onclick = () => {
  const groupRef = push(ref(db, "groups"));
  currentGroupId = groupRef.key;
  alert("Group ID: " + currentGroupId);
};

document.getElementById("joinGroupBtn").onclick = () => {
  currentGroupId = groupIdInput.value;
  onValue(ref(db, "groups/" + currentGroupId), snapshot => {
    taskList.innerHTML = "";
    snapshot.forEach(child => renderTask(child.val(), child.key, true));
  });
};

document.getElementById("addTaskBtn").onclick = () => {
  const name = taskInput.value.trim();
  const date = dateInput.value;
  if (!name || !date) return;

  if (mode === "single") {
    localTasks.push({ name, deadline: date, created: new Date().toISOString() });
    localStorage.setItem("tasks", JSON.stringify(localTasks));
    displayTasks();
  } else {
    if (!currentGroupId) return alert("Join group first");
    push(ref(db, "groups/" + currentGroupId), {
      name,
      deadline: date,
      created: new Date().toISOString()
    });
  }

  taskInput.value = "";
  dateInput.value = "";
};

function displayTasks() {
  taskList.innerHTML = "";
  let urgent = 0;

  localTasks.forEach((task, index) => {
    renderTask(task, index);
    const now = Date.now();
    const deadline = new Date(task.deadline).getTime();
    if ((deadline - now) / 3600000 <= 24 && deadline > now) urgent++;
  });

  totalTasksEl.textContent = localTasks.length;
  urgentTasksEl.textContent = urgent;
}

function renderTask(task, indexOrId, isGroup = false) {
  const div = document.createElement("div");
  div.className = "task";

  const now = Date.now();
  const deadline = new Date(task.deadline).getTime();
  const hoursLeft = Math.floor((deadline - now) / 3600000);
  const isOverdue = deadline <= now;

  if (isOverdue) div.classList.add("overdue");

  div.innerHTML = `
    <div class="task-header">
      <div>${task.name}</div>
      <div class="task-time ${isOverdue ? "overdue" : ""}">
        ${isOverdue ? "Overdue ❗" : hoursLeft + " hrs left"}
      </div>
    </div>
    <button>Complete</button>
  `;

  div.querySelector("button").onclick = () => {
    if (isGroup) {
      remove(ref(db, "groups/" + currentGroupId + "/" + indexOrId));
    } else {
      localTasks.splice(indexOrId, 1);
      localStorage.setItem("tasks", JSON.stringify(localTasks));
      displayTasks();
    }
  };

  taskList.appendChild(div);
}

displayTasks();