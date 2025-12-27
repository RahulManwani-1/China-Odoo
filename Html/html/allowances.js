function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("allowanceForm");
  const tableBody = document.getElementById("allowanceTableBody");
  const addNewBtn = document.getElementById("addNewBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const logout = document.getElementById("logout");
    const status = document.getElementById("status");


  const employeeSelect = document.getElementById("employee_name"); // dropdown
  const employeeIdInput = document.getElementById("employee_id"); // hidden / readonly

  let allowances = [];
  let employees = [];
  let editIndex = null;

  const API_ALLOWANCE = "http://localhost:5228/api/Allowance"; 
  const API_EMPLOYEE = "http://localhost:5228/api/Employee"; 

  // Render allowances table
  const renderTable = () => {
    tableBody.innerHTML = "";
    allowances.forEach((a, index) => {
      const row = document.createElement("tr");
     row.innerHTML = `
  <td>${a.allowance_id}</td>
  <td>${a.employee_id}</td>
  <td>${a.employee_name}</td>
  <td>${a.allowance_type}</td>
  <td>${a.amount.toFixed(2)}</td>
  <td>${a.status}</td>
  <td>
    <button class="edit-btn" data-index="${index}">✏️ Edit</button>
    <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
  </td>`;

      tableBody.appendChild(row);
    });
  };

  // Fetch allowances
  const fetchAllowances = async () => {
    try {
      const res = await fetch(API_ALLOWANCE);
      allowances = await res.json();
      renderTable();
    } catch (err) {
      console.error("Error fetching allowances:", err);
      alert("❌ Failed to fetch allowances!");
    }
  };

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    try {
      const res = await fetch(API_EMPLOYEE);
      employees = await res.json();

      // Populate dropdown
      employeeSelect.innerHTML = "<option value=''>Select Employee</option>";
      employees.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.employee_id; // store ID
        option.textContent = emp.first_name;
        employeeSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error fetching employees:", err);
      alert("❌ Failed to fetch employees!");
    }
  };

  fetchAllowances();
  fetchEmployees();

  // When employee is selected, update hidden ID
  employeeSelect.addEventListener("change", () => {
    employeeIdInput.value = employeeSelect.value;
  });

  // Add new button
  addNewBtn.addEventListener("click", () => {
    form.reset();
    form.classList.remove("hidden");
    addNewBtn.style.display = "none";
    editIndex = null;
  });

  // Cancel button
  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.classList.add("hidden");
    addNewBtn.style.display = "inline-block";
    editIndex = null;
  });

  // Save / Update
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const allowance = {
      employee_id: Number(employeeIdInput.value),
      employee_name: employeeSelect.options[employeeSelect.selectedIndex].text,
      allowance_type: document.getElementById("allowance_type").value,
      amount: Number(document.getElementById("amount").value),
        status: document.getElementById("status").value

    };

    try {
      if (editIndex !== null) {
        allowance.allowance_id = allowances[editIndex].allowance_id;
        const id = allowance.allowance_id;
        await fetch(`${API_ALLOWANCE}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(allowance)
        });
        alert("✏️ Allowance updated successfully!");
      } else {
        await fetch(API_ALLOWANCE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(allowance)
        });
        alert("✅ Allowance saved successfully!");
      }

      await fetchAllowances();
      form.reset();
      form.classList.add("hidden");
      addNewBtn.style.display = "inline-block";
      editIndex = null;
    } catch (err) {
      console.error("Error saving allowance:", err);
      alert("❌ Failed to save allowance!");
    }
  });

  // Table click (edit/delete)
  tableBody.addEventListener("click", async (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains("delete-btn")) {
      if (confirm("🗑️ Are you sure you want to delete this allowance?")) {
        try {
          const id = allowances[index].allowance_id;
          await fetch(`${API_ALLOWANCE}/${id}`, { method: "DELETE" });
          await fetchAllowances();
        } catch (err) {
          console.error("Error deleting allowance:", err);
          alert("❌ Failed to delete allowance!");
        }
      }
      return;
    }

    if (e.target.classList.contains("edit-btn")) {
      const a = allowances[index];
      editIndex = index;
      form.classList.remove("hidden");
      addNewBtn.style.display = "none";

      employeeIdInput.value = a.employee_id;
      employeeSelect.value = a.employee_id;
      document.getElementById("allowance_type").value = a.allowance_type;
      document.getElementById("amount").value = a.amount;
      document.getElementById("status").value = a.status;

    }
  });

  // Logout
  logout.addEventListener("click", () => {
    alert("👋 You have been logged out.");
    window.location.href = "index.html";
  });
});
