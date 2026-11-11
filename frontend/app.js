const list = document.querySelector("#tasks");
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-title");
const count = document.querySelector("#count");
const message = document.querySelector("#message");

async function api(path, options={}) {
  const response = await fetch(`/api${path}`, {
    headers: {"Content-Type":"application/json"},
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Có lỗi xảy ra");
  return data;
}
function showMessage(text="") { message.textContent = text; }
async function loadTasks() {
  try {
    const tasks = await api("/tasks");
    list.innerHTML = "";
    count.textContent = `${tasks.length} công việc`;
    tasks.forEach(task => {
      const li = document.createElement("li");
      li.className = `task ${task.done ? "done" : ""}`;
      const title = document.createElement("span");
      title.textContent = task.title;
      const toggle = document.createElement("button");
      toggle.className = "small";
      toggle.textContent = task.done ? "Hoàn tác" : "Hoàn thành";
      toggle.onclick = async () => { try { await api(`/tasks/${task.id}`, {method:"PATCH", body:JSON.stringify({done:!task.done})}); await loadTasks(); } catch(e){showMessage(e.message);} };
      const del = document.createElement("button");
      del.className = "small delete";
      del.textContent = "Xóa";
      del.onclick = async () => { try { await api(`/tasks/${task.id}`, {method:"DELETE"}); await loadTasks(); } catch(e){showMessage(e.message);} };
      li.append(title,toggle,del); list.append(li);
    });
    showMessage("");
  } catch (e) { showMessage(`Không kết nối được Backend: ${e.message}`); }
}
form.addEventListener("submit", async e => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  try { await api("/tasks", {method:"POST", body:JSON.stringify({title})}); input.value=""; await loadTasks(); }
  catch(e) { showMessage(e.message); }
});
document.querySelector("#reload").onclick = loadTasks;
loadTasks();
