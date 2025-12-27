  function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("employeeForm");
  const tableBody = document.getElementById("employeeTableBody");
  const addNewBtn = document.getElementById("addNewBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const logout = document.getElementById("logout");

  const positionSelect = document.getElementById("position_name");
  const recruitmentSelect = document.getElementById("recruitment_applicant");
  const departmentSelect = document.getElementById("department_name");
const managerSelect = document.getElementById("manager_name");

  let employees = [];
  let editIndex = null;
  const API_URL = "http://localhost:5228/api/employee";


  // ---------------- Fetch Departments ----------------
  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5228/api/Department");
      const departments = await res.json();
      departmentSelect.innerHTML = '<option value="">Select Department</option>';
      departments.forEach(dep => {
        const option = document.createElement("option");
        option.value = dep.department_name;
        option.textContent = dep.department_name;
        departmentSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };
  fetchDepartments();

  // ---------------- Fetch Positions ----------------
  const fetchPositions = async () => {
    try {
      const res = await fetch("http://localhost:5228/api/jobposition");
      const positions = await res.json();
      positionSelect.innerHTML = '<option value="">Select Position</option>';
      positions.forEach(pos => {
        const option = document.createElement("option");
        option.value = pos.position_name;
        option.textContent = pos.position_name;
        option.dataset.department = pos.department_name;
        positionSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error fetching positions:", err);
    }
  };
  fetchPositions();

  // ---------------- Filter Positions by Department ----------------
  departmentSelect.addEventListener("change", () => {
    const selectedDept = departmentSelect.value;
    Array.from(positionSelect.options).forEach(opt => {
      if (opt.value === "") return;
      opt.style.display = (opt.dataset.department === selectedDept) ? "" : "none";
    });
    positionSelect.value = "";
  });
const populateManagerDropdown = () => {
  if (!employees.length) return;
  managerSelect.innerHTML = '<option value="">Select Manager</option>';
  employees.forEach(emp => {
    const option = document.createElement("option");
    option.value = emp.first_name + " " + (emp.last_name || "");
    option.textContent = emp.first_name + " " + (emp.last_name || "");
    managerSelect.appendChild(option);
  });
};  
  // ---------------- Fetch Recruitment Applicants ----------------
const fetchRecruitments = async () => {
  try {
    const res = await fetch("http://localhost:5228/api/RecruitmentApplicant");
    const recruits = await res.json();

    recruitmentSelect.innerHTML = '<option value="">Select Recruitment</option>';

    // ✅ FILTER applied here
    recruits
      .filter(rec => rec.status !== "Contract Signed")
      .forEach(rec => {
        const option = document.createElement("option");
        option.value = rec.applicant_id;
        option.textContent = rec.applicant_name;
        option.dataset.firstName = rec.first_name || rec.applicant_name.split(" ")[0];
        option.dataset.lastName = rec.last_name || rec.applicant_name.split(" ")[1] || "";
        option.dataset.email = rec.email;
        option.dataset.department = rec.department_name;
        option.dataset.position_name = rec.position_name;
        recruitmentSelect.appendChild(option);
      });

  } catch (err) {
    console.error("Error fetching recruitment:", err);
  }
};

  // ---------------- Auto-fill from recruitment dropdown ----------------
  recruitmentSelect.addEventListener("change", (e) => {
    const selectedOption = e.target.selectedOptions[0];
    if (!selectedOption || selectedOption.value === "") return;
    document.getElementById("first_name").value = selectedOption.dataset.firstName || "";
    document.getElementById("last_name").value = selectedOption.dataset.lastName || "";
    document.getElementById("email").value = selectedOption.dataset.email || "";
    departmentSelect.value = selectedOption.dataset.department || "";
    departmentSelect.dispatchEvent(new Event("change"));
    positionSelect.value = selectedOption.dataset.position_name || "";
  });

  // ---------------- Auto-fill recruitment from URL ----------------
  const autoFillFromURL = async () => {
    const recruitmentName = new URLSearchParams(window.location.search).get("recruitment");
    if (!recruitmentName) return;

    const waitForRecruits = () => new Promise(resolve => {
      const interval = setInterval(() => {
        if (recruitmentSelect.options.length > 1) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });

    await waitForRecruits();

    const option = Array.from(recruitmentSelect.options).find(
      opt => opt.textContent.toLowerCase() === recruitmentName.toLowerCase()
    );

    if (option) {
      recruitmentSelect.value = option.value;
      recruitmentSelect.dispatchEvent(new Event("change"));
      form.classList.remove("hidden");
      addNewBtn.style.display = "none";
      editIndex = null;
    }
  };

  fetchRecruitments().then(autoFillFromURL);

  // ---------------- Fetch Employees ----------------
const fetchEmployees = async () => {
  try {
    const res = await fetch(API_URL);
    employees = await res.json();
    renderTable();
    populateManagerDropdown(); // ✅ Populate manager select
  } catch (err) {
    console.error("Error fetching employees:", err);
    alert("❌ Failed to fetch employees!");
  }
};

  const renderTable = () => {
    tableBody.innerHTML = "";
    employees.forEach((emp, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${emp.employee_id}</td>
        <td>${emp.first_name} ${emp.last_name || ""}</td>
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

  fetchEmployees();

  // ---------------- Form Buttons ----------------
  addNewBtn.addEventListener("click", () => {
    form.reset();
    form.classList.remove("hidden");
    addNewBtn.style.display = "none";
    editIndex = null;
  });

  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.classList.add("hidden");
    addNewBtn.style.display = "inline-block";
    editIndex = null;
  });

  // ---------------- Save / Update Employee ----------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emp = {
      first_name: document.getElementById("first_name").value,
      last_name: document.getElementById("last_name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      cnic: document.getElementById("cnic").value,
      department_name: departmentSelect.value,
      position_name: positionSelect.value,
      gender: document.getElementById("gender").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
      country: document.getElementById("country").value,
      status: document.getElementById("status").value,
        manager_name: managerSelect.value // ✅ Save manager

    };

    try {
      if (editIndex !== null) {
        const id = employees[editIndex].employee_id;
        await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emp)
        });
        alert("✏️ Employee updated successfully!");
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emp)
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

  // ---------------- Edit / Delete ----------------
  tableBody.addEventListener("click", async (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

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

    if (e.target.classList.contains("edit-btn")) {
      const emp = employees[index];
      editIndex = index;
      form.classList.remove("hidden");
      addNewBtn.style.display = "none";

      document.getElementById("first_name").value = emp.first_name;
      document.getElementById("last_name").value = emp.last_name || "";
      document.getElementById("email").value = emp.email;
      document.getElementById("phone").value = emp.phone;
      document.getElementById("cnic").value = emp.cnic;
      departmentSelect.value = emp.department_name;
      departmentSelect.dispatchEvent(new Event("change"));
      positionSelect.value = emp.position_name;
      document.getElementById("gender").value = emp.gender;
      document.getElementById("address").value = emp.address;
      document.getElementById("city").value = emp.city;
      document.getElementById("state").value = emp.state;
      document.getElementById("country").value = emp.country;
      document.getElementById("status").value = emp.status;
        managerSelect.value = emp.manager_name || ""; // ✅ Pre-fill manager

    }
  });
  // ---------------- Export to Excel ----------------
document.getElementById("exportExcel").addEventListener("click", () => {
  if (!employees.length) {
    alert("❌ No employee data to export!");
    return;
  }

  // Map data for Excel
  const data = employees.map(emp => ({
    ID: emp.employee_id,
    First_Name: emp.first_name,
    Last_Name: emp.last_name,
    Email: emp.email,
    Phone: emp.phone,
    CNIC: emp.cnic,
    Department: emp.department_name,
    Position: emp.position_name,
    Gender: emp.gender,
    Address: emp.address,
    City: emp.city,
    State: emp.state,
    Country: emp.country,
    Status: emp.status
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  XLSX.writeFile(wb, "Employees.xlsx");
});

// ---------------- Import from Excel ----------------
document.getElementById("importExcel").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const importedData = XLSX.utils.sheet_to_json(firstSheet);

    // Loop through each row and send to API
    for (const emp of importedData) {
      const payload = {
        first_name: emp.First_Name || "",
        last_name: emp.Last_Name || "",
        email: emp.Email || "",
        phone: emp.Phone || "",
        cnic: emp.CNIC || "",
        department_name: emp.Department || "",
        position_name: emp.Position || "",
        gender: emp.Gender || "",
        address: emp.Address || "",
        city: emp.City || "",
        state: emp.State || "",
        country: emp.Country || "",
        status: emp.Status || "Active"
      };

      try {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Error importing employee:", err);
      }
    }

    alert("✅ Excel data imported successfully!");
    await fetchEmployees();
  };
  reader.readAsArrayBuffer(file);
});


  // ---------------- Logout ----------------
  logout.addEventListener("click", () => {
    alert("👋 You have been logged out.");
    window.location.href = "index.html";
  });
});
