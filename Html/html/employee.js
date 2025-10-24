document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("employeeForm");
  const tableBody = document.getElementById("employeeTableBody");
  const addNewBtn = document.getElementById("addNewBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const logout = document.getElementById("logout");

  let employees = JSON.parse(localStorage.getItem("employees")) || [];
  let editIndex = null; // Track currently edited employee

  const generateSequence = () => {
    const num = employees.length + 1;
    return `EMP/${String(num).padStart(3, "0")}`;
  };

  const renderTable = () => {
    tableBody.innerHTML = "";
    employees.forEach((emp, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${emp.sequence}</td>
        <td>${emp.firstName} ${emp.lastName}</td>
        <td>${emp.email}</td>
        <td>${emp.department}</td>
        <td>${emp.jobTitle}</td>
        <td>
          <button class="edit-btn" data-index="${index}">✏️ Edit</button>
          <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
        </td>`;
      tableBody.appendChild(row);
    });
  };

  renderTable();

  // Add new
  addNewBtn.addEventListener("click", () => {
    form.reset();
    form.classList.remove("hidden");
    addNewBtn.style.display = "none";
    editIndex = null; // not editing now
  });

// View details when row is clicked
tableBody.addEventListener("click", (e) => {
  // prevent conflict with Edit/Delete buttons
  if (e.target.classList.contains("edit-btn") || e.target.classList.contains("delete-btn")) return;

  const row = e.target.closest("tr");
  const index = Array.from(tableBody.children).indexOf(row);
  const emp = employees[index];

  const modal = document.getElementById("employeeModal");
  const detailsDiv = document.getElementById("employeeDetails");
  const editFromModal = document.getElementById("editFromModal");
  const closeModal = document.getElementById("closeModal");

  // Fill details
  detailsDiv.innerHTML = `
    <p><strong>Sequence:</strong> ${emp.sequence}</p>
    <p><strong>Name:</strong> ${emp.firstName} ${emp.lastName}</p>
    <p><strong>Email:</strong> ${emp.email}</p>
    <p><strong>Phone:</strong> ${emp.phone}</p>
    <p><strong>Department:</strong> ${emp.department}</p>
    <p><strong>Job Title:</strong> ${emp.jobTitle}</p>
    <p><strong>Manager:</strong> ${emp.manager}</p>
    <p><strong>Location:</strong> ${emp.location}</p>
    <p><strong>Join Date:</strong> ${emp.joinDate}</p>
    <p><strong>End Date:</strong> ${emp.endDate || "-"}</p>
    <p><strong>Gender:</strong> ${emp.gender}</p>
    <p><strong>Marital Status:</strong> ${emp.maritalStatus}</p>
    <p><strong>CNIC:</strong> ${emp.cnic}</p>
    <p><strong>Bank Account:</strong> ${emp.bankAccount}</p>
    <p><strong>Emergency Contact:</strong> ${emp.emergencyContact}</p>
    <p><strong>Emergency Phone:</strong> ${emp.emergencyPhone}</p>
  `;

  modal.classList.remove("hidden");

  // Edit from modal
  editFromModal.onclick = () => {
    modal.classList.add("hidden");
    const editButton = tableBody.querySelector(`.edit-btn[data-index="${index}"]`);
    if (editButton) editButton.click(); // reuse edit logic
  };

  closeModal.onclick = () => modal.classList.add("hidden");
  modal.onclick = (event) => {
    if (event.target === modal) modal.classList.add("hidden");
  };
});

  // Cancel
  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.classList.add("hidden");
    addNewBtn.style.display = "inline-block";
    editIndex = null;
  });

  // Save / Update
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const emp = {
      sequence: editIndex !== null ? employees[editIndex].sequence : generateSequence(),
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      jobTitle: document.getElementById("jobTitle").value,
      department: document.getElementById("department").value,
      manager: document.getElementById("manager").value,
      location: document.getElementById("location").value,
      joinDate: document.getElementById("joinDate").value,
      endDate: document.getElementById("endDate").value,
      gender: document.getElementById("gender").value,
      maritalStatus: document.getElementById("maritalStatus").value,
      cnic: document.getElementById("cnic").value,
      bankAccount: document.getElementById("bankAccount").value,
      emergencyContact: document.getElementById("emergencyContact").value,
      emergencyPhone: document.getElementById("emergencyPhone").value,
    };

    if (editIndex !== null) {
      // update
      employees[editIndex] = emp;
      alert("✏️ Employee updated successfully!");
      editIndex = null;
    } else {
      // add new
      employees.push(emp);
      alert("✅ Employee saved successfully!");
    }

    localStorage.setItem("employees", JSON.stringify(employees));
    renderTable();

    form.reset();
    form.classList.add("hidden");
    addNewBtn.style.display = "inline-block";
  });

  // Delete + Edit Handling
  tableBody.addEventListener("click", (e) => {
    const index = e.target.dataset.index;

    // Delete
    if (e.target.classList.contains("delete-btn")) {
      if (confirm("🗑️ Are you sure you want to delete this employee?")) {
        employees.splice(index, 1);
        localStorage.setItem("employees", JSON.stringify(employees));
        renderTable();
      }
    }

    // Edit
    if (e.target.classList.contains("edit-btn")) {
      const emp = employees[index];
      editIndex = index;

      // Prefill the form
      form.classList.remove("hidden");
      addNewBtn.style.display = "none";

      document.getElementById("firstName").value = emp.firstName;
      document.getElementById("lastName").value = emp.lastName;
      document.getElementById("email").value = emp.email;
      document.getElementById("phone").value = emp.phone;
      document.getElementById("jobTitle").value = emp.jobTitle;
      document.getElementById("department").value = emp.department;
      document.getElementById("manager").value = emp.manager;
      document.getElementById("location").value = emp.location;
      document.getElementById("joinDate").value = emp.joinDate;
      document.getElementById("endDate").value = emp.endDate;
      document.getElementById("gender").value = emp.gender;
      document.getElementById("maritalStatus").value = emp.maritalStatus;
      document.getElementById("cnic").value = emp.cnic;
      document.getElementById("bankAccount").value = emp.bankAccount;
      document.getElementById("emergencyContact").value = emp.emergencyContact;
      document.getElementById("emergencyPhone").value = emp.emergencyPhone;
    }
  });

  // Logout
  logout.addEventListener("click", () => {
    alert("👋 You have been logged out.");
    window.location.href = "index.html";
  });
});