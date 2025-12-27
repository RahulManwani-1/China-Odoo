  function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("scheduleForm");
  const tableBody = document.getElementById("scheduleTableBody");
  const addNewBtn = document.getElementById("addNewBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const logout = document.getElementById("logout");

  let schedules = [];
  let editIndex = null;

  const API_URL = "http://localhost:5228/api/WorkSchedule";

  /* -------------------- Helpers -------------------- */

  const formatTime = (value) => {
    if (!value) return null;
    return value.length === 5 ? value + ":00" : value;
  };

  const toggleAddButton = () => {
    if (schedules.length > 0) {
      addNewBtn.style.display = "none";
    } else {
      addNewBtn.style.display = "inline-block";
    }
  };

  /* -------------------- Render Table -------------------- */

  const renderTable = () => {
    tableBody.innerHTML = "";

    schedules.forEach((sch, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${sch.schedule_id}</td>
        <td>${sch.shift_name}</td>
        <td>${sch.shift_start_time}</td>
        <td>${sch.shift_end_time}</td>
        <td>${sch.break_start_time || "-"}</td>
        <td>${sch.break_end_time || "-"}</td>
        <td>${sch.working_days}</td>
        <td>
          <button class="edit-btn" data-index="${index}">✏️ Edit</button>
          <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  };

  /* -------------------- Fetch Schedules -------------------- */

  const fetchSchedules = async () => {
    try {
      const res = await fetch(API_URL);
      schedules = await res.json();
      renderTable();
      toggleAddButton();
    } catch (err) {
      console.error("Fetch error:", err);
      alert("❌ Failed to fetch schedules");
    }
  };

  fetchSchedules();

  /* -------------------- Add New -------------------- */

  addNewBtn.addEventListener("click", () => {
    if (schedules.length > 0) return; // only one allowed
    form.reset();
    form.classList.remove("hidden");
    addNewBtn.style.display = "none";
    editIndex = null;
  });

  /* -------------------- Cancel -------------------- */

  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.classList.add("hidden");
    toggleAddButton();
    editIndex = null;
  });

  /* -------------------- Save / Update -------------------- */

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const schedule = {
      shift_name: document.getElementById("shift_name").value,
      shift_start_time: formatTime(document.getElementById("shift_start_time").value),
      shift_end_time: formatTime(document.getElementById("shift_end_time").value),
      break_start_time: formatTime(document.getElementById("break_start_time").value),
      break_end_time: formatTime(document.getElementById("break_end_time").value),
      working_days: document.getElementById("working_days").value
    };

    try {
      if (editIndex !== null) {
        schedule.schedule_id = schedules[editIndex].schedule_id;

        await fetch(`${API_URL}/${schedule.schedule_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(schedule)
        });

        alert("✏️ Schedule updated successfully!");
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(schedule)
        });

        alert("✅ Schedule created successfully!");
      }

      await fetchSchedules();
      form.reset();
      form.classList.add("hidden");
      editIndex = null;
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save schedule");
    }
  });

  /* -------------------- Table Actions -------------------- */

  tableBody.addEventListener("click", async (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    // DELETE
    if (e.target.classList.contains("delete-btn")) {
      if (!confirm("🗑️ Are you sure?")) return;

      try {
        const id = schedules[index].schedule_id;
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        await fetchSchedules();
      } catch (err) {
        console.error("Delete error:", err);
        alert("❌ Failed to delete");
      }
      return;
    }

    // EDIT
    if (e.target.classList.contains("edit-btn")) {
      const sch = schedules[index];
      editIndex = index;

      form.classList.remove("hidden");
      addNewBtn.style.display = "none";

      document.getElementById("shift_name").value = sch.shift_name;
      document.getElementById("shift_start_time").value = sch.shift_start_time || "";
      document.getElementById("shift_end_time").value = sch.shift_end_time || "";
      document.getElementById("break_start_time").value = sch.break_start_time || "";
      document.getElementById("break_end_time").value = sch.break_end_time || "";
      document.getElementById("working_days").value = sch.working_days;
    }
  });

  /* -------------------- Logout -------------------- */

  logout.addEventListener("click", () => {
    alert("👋 You have been logged out.");
    window.location.href = "index.html";
  });
});
