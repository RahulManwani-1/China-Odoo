document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("employeeForm");
  const tableBody = document.getElementById("employeeTableBody");
  const addNewBtn = document.getElementById("addNewBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const logout = document.getElementById("logout");

  let employees = [];
  let editIndex = null; // Track currently edited employee

  const API_URL = "https://localhost:7228/api/employee"; // Replace with your API
const departmentSelect = document.getElementById("department_name");

const fetchDepartments = async () => {
  try {
    const res = await fetch("https://localhost:7228/api/Department");
    const departments = await res.json();

    departmentSelect.innerHTML = '<option value="">Select Department</option>';

    departments.forEach(dep => {
      const option = document.createElement("option");
      option.value = dep.department_name; // <-- send only the name
      option.textContent = dep.department_name;
      departmentSelect.appendChild(option);
    });
  } catch (err) {null
  }
};

fetchDepartments();

  // Render employee table
  const renderTable = () => {
    tableBody.innerHTML = "";
    employees.forEach((emp, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${emp.employee_id}</td>
        <td>${emp.first_name} ${emp.last_name}</td>
        <td>${emp.email}</td>
        <td>${emp.department_name}</td>
        <td>${emp.position_name}</td>
        <td>
          <button class="edit-btn" data-index="${index}">✏️ Edit</button>
          <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
        </td>`;
      tableBody.appendChild(row);
    });
  };

  // Fetch employees from API (GET)
  const fetchEmployees = async () => {
    try {
      const res = await fetch(API_URL);
      employees = await res.json();
      renderTable();
    } catch (err) {
      console.error("Error fetching employees:", err);
      alert("❌ Failed to fetch employees!");
    }
  };

  // Initial fetch
  fetchEmployees();

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

  // Save / Update employee (POST / PUT)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emp = {
      first_name: document.getElementById("first_name").value,
      last_name: document.getElementById("last_name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      date_of_birth: document.getElementById("date_of_birth").value,
      gender: document.getElementById("gender").value,
      cnic: document.getElementById("cnic").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
      postal_code: document.getElementById("postal_code").value,
      country: document.getElementById("country").value,
      department_name: document.getElementById("department_name").value,
      position_name: document.getElementById("position_name").value,
      date_of_joining: document.getElementById("date_of_joining").value,
      emergency_contact_name: document.getElementById("emergency_contact_name").value,
      emergency_contact_phone: document.getElementById("emergency_contact_phone").value,
      salary: parseFloat(document.getElementById("salary").value),
      status: document.getElementById("status").value
    };

    try {
      if (editIndex !== null) {
        // PUT
        const id = employees[editIndex].employee_id;
await fetch(`${API_URL}/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(emp)  // <-- send emp directly
});

        alert("✏️ Employee updated successfully!");
      } else {
        // POST
   // POST
await fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(emp)  // <-- send emp directly, not { employee: emp }
});

        alert("✅ Employee saved successfully!");
      }
      await fetchEmployees();
      form.reset();
      form.classList.add("hidden");
      addNewBtn.style.display = "inline-block";
      editIndex = null;
    } catch (err) {
      console.error("Error saving employee:", err);
      alert("❌ Failed to save employee!");
    }
  });

  // Table click handling (Edit / Delete / View)
  tableBody.addEventListener("click", async (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    // Delete
    if (e.target.classList.contains("delete-btn")) {
      if (confirm("🗑️ Are you sure you want to delete this employee?")) {
        try {
          const id = employees[index].employee_id;
          await fetch(`${API_URL}/${id}`, { method: "DELETE" });
          await fetchEmployees();
        } catch (err) {
          console.error("Error deleting employee:", err);
          alert("❌ Failed to delete employee!");
        }
      }
      return;
    }

    // Edit
    if (e.target.classList.contains("edit-btn")) {
      const emp = employees[index];
      editIndex = index;
      form.classList.remove("hidden");
      addNewBtn.style.display = "none";

      document.getElementById("first_name").value = emp.first_name;
      document.getElementById("last_name").value = emp.last_name;
      document.getElementById("email").value = emp.email;
      document.getElementById("phone").value = emp.phone;
      document.getElementById("date_of_birth").value = emp.date_of_birth;
      document.getElementById("gender").value = emp.gender;
      document.getElementById("cnic").value = emp.cnic;
      document.getElementById("address").value = emp.address;
      document.getElementById("city").value = emp.city;
      document.getElementById("state").value = emp.state;
      document.getElementById("postal_code").value = emp.postal_code;
      document.getElementById("country").value = emp.country;
      document.getElementById("department_name").value = emp.department_name;
      document.getElementById("position_name").value = emp.position_name;
      document.getElementById("date_of_joining").value = emp.date_of_joining;
      document.getElementById("emergency_contact_name").value = emp.emergency_contact_name;
      document.getElementById("emergency_contact_phone").value = emp.emergency_contact_phone;
      document.getElementById("salary").value = emp.salary;
      document.getElementById("status").value = emp.status;
    }
  });

  // View details modal
  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn") || e.target.classList.contains("delete-btn")) return;

    const row = e.target.closest("tr");
    const index = Array.from(tableBody.children).indexOf(row);
    const emp = employees[index];

    const modal = document.getElementById("employeeModal");
    const detailsDiv = document.getElementById("employeeDetails");
    const editFromModal = document.getElementById("editFromModal");
    const closeModal = document.getElementById("closeModal");

    detailsDiv.innerHTML = `
      <p><strong>ID:</strong> ${emp.employee_id}</p>
      <p><strong>Name:</strong> ${emp.first_name} ${emp.last_name}</p>
      <p><strong>Email:</strong> ${emp.email}</p>
      <p><strong>Phone:</strong> ${emp.phone}</p>
      <p><strong>Department:</strong> ${emp.department_name}</p>
      <p><strong>Position:</strong> ${emp.position_name}</p>
      <p><strong>Joining Date:</strong> ${emp.date_of_joining}</p>
      <p><strong>Salary:</strong> ${emp.salary}</p>
      <p><strong>Status:</strong> ${emp.status}</p>
    `;

    modal.classList.remove("hidden");

    editFromModal.onclick = () => {
      modal.classList.add("hidden");
      const editButton = tableBody.querySelector(`.edit-btn[data-index="${index}"]`);
      if (editButton) editButton.click();
    };

    closeModal.onclick = () => modal.classList.add("hidden");
    modal.onclick = (event) => { if (event.target === modal) modal.classList.add("hidden"); };
  });

  // Logout
  logout.addEventListener("click", () => {
    alert("👋 You have been logged out.");
    window.location.href = "index.html";
  });
});
