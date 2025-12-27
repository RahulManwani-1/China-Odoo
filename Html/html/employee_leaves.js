document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addEmployeeLeaveBtn");
  const form = document.getElementById("employeeLeaveForm");
  const cancelBtn = document.getElementById("cancelLeaveForm");
  const tableBody = document.querySelector("#employeeLeavesTable tbody");

  const employeeSelect = document.getElementById("leave_employee_name");
  const departmentSelect = document.getElementById("leave_department");

  let leaves = [];
  let employees = [];
  let editIndex = null;
  const LEAVE_API = "http://localhost:5228/api/Leave/employee-leaves";
  const EMPLOYEE_API = "http://localhost:5228/api/employee";

  // ---------------- Fetch Employees for Dropdown ----------------
  const fetchEmployees = async () => {
    try {
      const res = await fetch(EMPLOYEE_API);
      employees = await res.json();
      employeeSelect.innerHTML = '<option value="">Select Employee</option>';
      departmentSelect.innerHTML = '<option value="">Select Department</option>';

      employees.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.first_name + " " + (emp.last_name || "");
        option.textContent = emp.first_name + " " + (emp.last_name || "");
        option.dataset.department = emp.department_name;
        employeeSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // ---------------- Update Department Dropdown on Employee Select ----------------
  employeeSelect.addEventListener("change", (e) => {
    const selectedOption = e.target.selectedOptions[0];
    if (selectedOption && selectedOption.value !== "") {
      departmentSelect.value = selectedOption.dataset.department || "";
    } else {
      departmentSelect.value = "";
    }
  });

  // ---------------- Fetch Leaves ----------------
  const fetchLeaves = async () => {
    try {
      const res = await fetch(LEAVE_API);
      leaves = await res.json();
      renderTable();
    } catch (err) {
      console.error("Error fetching leaves:", err);
      alert("❌ Failed to fetch leaves!");
    }
  };

  // ---------------- Render Table ----------------
  const renderTable = () => {
    tableBody.innerHTML = "";
    leaves.forEach((leave, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${leave.employee_name}</td>
        <td>${leave.department}</td>
        <td>${leave.leave_type}</td>
        <td>${leave.start_date.split('T')[0]}</td>
        <td>${leave.end_date.split('T')[0]}</td>
        <td>${leave.status}</td>
        <td>
          <button class="edit-btn" data-index="${index}">✏️ Edit</button>
          <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
        </td>`;
      tableBody.appendChild(row);
    });
  };

  // ---------------- Form Buttons ----------------
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

  // ---------------- Save / Update Leave ----------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const leaveData = {
      employee_name: employeeSelect.value,
      department: departmentSelect.value,
      leave_type: document.getElementById("leave_type").value,
      start_date: document.getElementById("leave_start_date").value,
      end_date: document.getElementById("leave_end_date").value,
      status: document.getElementById("leave_status").value,
      email: "" // optional
    };

    try {
      if (editIndex !== null) {
        const id = leaves[editIndex].leave_id; 
        await fetch(`${LEAVE_API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leaveData)
        });
        alert("✏️ Leave updated successfully!");
      } else {
        await fetch(LEAVE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leaveData)
        });
        alert("✅ Leave added successfully!");
      }
      await fetchLeaves();
      form.reset();
      form.classList.add("hidden");
      addBtn.style.display = "inline-block";
      editIndex = null;
    } catch (err) {
      console.error("Error saving leave:", err);
      alert("❌ Failed to save leave!");
    }
  });

  // ---------------- Edit / Delete Leave ----------------
  tableBody.addEventListener("click", async (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    const leave = leaves[index];

    if (e.target.classList.contains("delete-btn")) {
      if (confirm("🗑️ Delete this leave?")) {
        try {
          await fetch(`${LEAVE_API}/${leave.leave_id}`, { method: "DELETE" });
          await fetchLeaves();
        } catch (err) {
          console.error("Error deleting leave:", err);
          alert("❌ Failed to delete leave!");
        }
      }
      return;
    }

    if (e.target.classList.contains("edit-btn")) {
      editIndex = index;
      form.classList.remove("hidden");
      addBtn.style.display = "none";

      employeeSelect.value = leave.employee_name;
      departmentSelect.value = leave.department;
      document.getElementById("leave_type").value = leave.leave_type;
      document.getElementById("leave_start_date").value = leave.start_date.split('T')[0];
      document.getElementById("leave_end_date").value = leave.end_date.split('T')[0];
      document.getElementById("leave_status").value = leave.status;
    }
  });

  // ---------------- Init ----------------
  fetchEmployees().then(fetchLeaves);
});
