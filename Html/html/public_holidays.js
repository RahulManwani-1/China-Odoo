document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addHolidayBtn");
  const form = document.getElementById("holidayForm");
  const cancelBtn = document.getElementById("cancelHolidayForm");
  const tableBody = document.querySelector("#holidayTable tbody");

  let holidays = [];
  let editIndex = null;
  const API_URL = "http://localhost:5228/api/Leave/public-holidays";

  const fetchHolidays = async () => {
    try {
      const res = await fetch(API_URL);
      holidays = await res.json();
      console.log("Fetched holidays:", holidays); // debug
      renderTable();
    } catch (err) {
      console.error("Error fetching holidays:", err);
      alert("❌ Failed to fetch holidays!");
    }
  };

  const renderTable = () => {
    tableBody.innerHTML = "";
    holidays.forEach((holiday, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${holiday.holiday_name}</td>
        <td>${holiday.start_date.split('T')[0]}</td>
        <td>${holiday.end_date.split('T')[0]}</td>
        <td>${holiday.is_paid ? "Yes" : "No"}</td>
        <td>
          <button class="edit-btn" data-index="${index}">✏️ Edit</button>
          <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
        </td>`;
      tableBody.appendChild(row);
    });
  };

  addBtn.addEventListener("click", () => {
    form.reset();
    form.classList.remove("hidden");
    addBtn.style.display = "none";
    editIndex = null;
  });

  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.classList.add("hidden");
    addBtn.style.display = "inline-block";
    editIndex = null;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const holidayData = {
      holiday_name: document.getElementById("holiday_name").value,
      start_date: document.getElementById("holiday_start_date").value,
      end_date: document.getElementById("holiday_end_date").value,
      is_paid: document.getElementById("holiday_paid").value === "true"
    };

    try {
      if (editIndex !== null) {
        const id = holidays[editIndex].holiday_id; // ✅ use correct ID
        await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(holidayData)
        });
        alert("✏️ Holiday updated successfully!");
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(holidayData)
        });
        alert("✅ Holiday added successfully!");
      }
      await fetchHolidays();
      form.reset();
      form.classList.add("hidden");
      addBtn.style.display = "inline-block";
    } catch (err) {
      console.error("Error saving holiday:", err);
      alert("❌ Failed to save holiday!");
    }
  });

  tableBody.addEventListener("click", async (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains("delete-btn")) {
      if (confirm("🗑️ Delete this holiday?")) {
        try {
          const id = holidays[index].holiday_id; // ✅ correct ID
          await fetch(`${API_URL}/${id}`, { method: "DELETE" });
          await fetchHolidays();
        } catch (err) {
          console.error("Error deleting holiday:", err);
          alert("❌ Failed to delete holiday!");
        }
      }
      return;
    }

    if (e.target.classList.contains("edit-btn")) {
      const holiday = holidays[index];
      editIndex = index;
      form.classList.remove("hidden");
      addBtn.style.display = "none";

      document.getElementById("holiday_name").value = holiday.holiday_name;
      document.getElementById("holiday_start_date").value = holiday.start_date.split('T')[0];
      document.getElementById("holiday_end_date").value = holiday.end_date.split('T')[0];
      document.getElementById("holiday_paid").value = holiday.is_paid ? "true" : "false";
    }
  });

  fetchHolidays();
});
