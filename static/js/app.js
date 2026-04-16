/* =========================================================
   Motivation App – Frontend Logic
   ========================================================= */

const API = "/api";

// ── DOM refs ──────────────────────────────────────────────
const goalsList          = document.getElementById("goals-list");
const emptyState         = document.getElementById("empty-state");
const statTotal          = document.getElementById("stat-total");
const statCompleted      = document.getElementById("stat-completed");
const statActive         = document.getElementById("stat-active");
const statPct            = document.getElementById("stat-pct");
const overallBar         = document.getElementById("overall-bar");
const overallPctLabel    = document.getElementById("overall-pct-label");
const motivationText     = document.getElementById("motivation-text");
const modal              = document.getElementById("goal-modal");
const modalTitle         = document.getElementById("modal-title");
const form               = document.getElementById("goal-form");
const inputTitle         = document.getElementById("input-title");
const inputDesc          = document.getElementById("input-desc");
const inputTarget        = document.getElementById("input-target");
const progressSlider     = document.getElementById("progress-slider");
const progressDisplay    = document.getElementById("progress-display");
const progressRow        = document.getElementById("progress-row");
const btnAddGoal         = document.getElementById("btn-add-goal");
const btnCancel          = document.getElementById("btn-cancel");
const toast              = document.getElementById("toast");

let editingId = null;
let toastTimer = null;

// ── Toast ─────────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// ── API helpers ───────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Render a single goal card ─────────────────────────────
function goalCard(g) {
  const pct = g.target > 0 ? Math.round((g.progress / g.target) * 100) : 0;
  const div = document.createElement("div");
  div.className = "goal-card" + (g.completed ? " completed" : "");
  div.dataset.id = g.id;
  div.innerHTML = `
    <div class="goal-info">
      <div class="goal-title">${escHtml(g.title)}</div>
      ${g.description ? `<div class="goal-desc">${escHtml(g.description)}</div>` : ""}
    </div>
    <div class="goal-actions">
      ${!g.completed ? `<button class="icon-btn complete-btn" title="Mark complete">✔</button>` : ""}
      <button class="icon-btn edit-btn" title="Edit">✎</button>
      <button class="icon-btn delete-btn" title="Delete">🗑</button>
    </div>
    <div class="goal-progress-wrap">
      <div class="goal-progress-label">
        <span>Progress</span>
        <span>${g.progress} / ${g.target} &nbsp;(${pct}%)</span>
      </div>
      <div class="goal-progress-outer">
        <div class="goal-progress-inner" style="width:${pct}%"></div>
      </div>
    </div>
  `;

  div.querySelector(".edit-btn").addEventListener("click", () => openEdit(g));
  div.querySelector(".delete-btn").addEventListener("click", () => deleteGoal(g.id));
  const cb = div.querySelector(".complete-btn");
  if (cb) cb.addEventListener("click", () => markComplete(g.id));

  return div;
}

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Refresh dashboard ─────────────────────────────────────
async function refresh() {
  const [goals, stats] = await Promise.all([
    apiFetch("/goals"),
    apiFetch("/stats"),
  ]);

  // stats
  statTotal.textContent     = stats.total;
  statCompleted.textContent = stats.completed;
  statActive.textContent    = stats.active;
  statPct.textContent       = stats.completion_pct + "%";
  overallBar.style.width    = stats.completion_pct + "%";
  overallPctLabel.textContent = stats.completion_pct + "%";
  motivationText.textContent = stats.message;

  // goals
  goalsList.innerHTML = "";
  if (goals.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    goals.forEach(g => goalsList.appendChild(goalCard(g)));
  }
}

// ── Modal helpers ─────────────────────────────────────────
function openCreate() {
  editingId = null;
  modalTitle.textContent = "➕ New Goal";
  form.reset();
  progressRow.style.display = "none";
  modal.classList.add("active");
  inputTitle.focus();
}

function openEdit(g) {
  editingId = g.id;
  modalTitle.textContent = "✎ Edit Goal";
  inputTitle.value  = g.title;
  inputDesc.value   = g.description || "";
  inputTarget.value = g.target;
  progressSlider.max   = g.target;
  progressSlider.value = g.progress;
  progressDisplay.textContent = g.progress;
  progressRow.style.display = "flex";
  modal.classList.add("active");
  inputTitle.focus();
}

function closeModal() {
  modal.classList.remove("active");
}

// ── CRUD ──────────────────────────────────────────────────
async function saveGoal(e) {
  e.preventDefault();
  const title  = inputTitle.value.trim();
  const desc   = inputDesc.value.trim();
  const target = parseInt(inputTarget.value, 10) || 100;

  try {
    if (editingId === null) {
      await apiFetch("/goals", {
        method: "POST",
        body: JSON.stringify({ title, description: desc, target }),
      });
      showToast("🎯 Goal created!");
    } else {
      const progress = parseInt(progressSlider.value, 10);
      await apiFetch(`/goals/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({ title, description: desc, target, progress }),
      });
      showToast("✏️ Goal updated!");
    }
    closeModal();
    await refresh();
  } catch (err) {
    showToast("⚠️ " + err.message);
  }
}

async function deleteGoal(id) {
  if (!confirm("Delete this goal?")) return;
  try {
    await apiFetch(`/goals/${id}`, { method: "DELETE" });
    showToast("🗑 Goal deleted.");
    await refresh();
  } catch (err) {
    showToast("⚠️ " + err.message);
  }
}

async function markComplete(id) {
  try {
    await apiFetch(`/goals/${id}/complete`, { method: "PATCH" });
    showToast("🏆 Goal completed!");
    await refresh();
  } catch (err) {
    showToast("⚠️ " + err.message);
  }
}

// ── Event listeners ───────────────────────────────────────
btnAddGoal.addEventListener("click", openCreate);
btnCancel.addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
form.addEventListener("submit", saveGoal);

progressSlider.addEventListener("input", () => {
  progressDisplay.textContent = progressSlider.value;
});

inputTarget.addEventListener("input", () => {
  const v = parseInt(inputTarget.value, 10);
  if (!isNaN(v) && v > 0 && editingId !== null) {
    progressSlider.max = v;
    if (parseInt(progressSlider.value, 10) > v) {
      progressSlider.value = v;
      progressDisplay.textContent = v;
    }
  }
});

// ── Boot ──────────────────────────────────────────────────
refresh();
