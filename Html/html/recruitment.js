document.addEventListener("DOMContentLoaded", function() {
  // ====== Department Handling ======
  const deptForm = document.getElementById("departmentForm");
  const deptTableBody = document.getElementById("departmentTableBody");

  let departments = JSON.parse(localStorage.getItem("departments")) || [];

  function generateDeptSequence() {
    const num = departments.length + 1;
    return `Dept/${String(num).padStart(3, '0')}`;
  }

  function renderDepartments() {
    if (!deptTableBody) return;
    deptTableBody.innerHTML = "";
    departments.forEach(dept => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${dept.sequence}</td>
        <td>${dept.name}</td>
        <td>${dept.manager}</td>
        <td>${dept.employees}</td>
      `;
      deptTableBody.appendChild(row);
    });
  }

  deptForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("deptName").value.trim();
    const manager = document.getElementById("managerName").value.trim();
    const employees = document.getElementById("numEmployees").value;

    if (!name || !manager) return;

    const newDept = {
      sequence: generateDeptSequence(),
      name,
      manager,
      employees,
    };

    departments.push(newDept);
    localStorage.setItem("departments", JSON.stringify(departments));
    renderDepartments();
    deptForm.reset();
  });

  renderDepartments();
});

document.addEventListener("DOMContentLoaded", () => {
  const appTable = document.getElementById("applicationTable").querySelector("tbody");
  const addNewApp = document.getElementById("addNewApp");
  const formContainer = document.getElementById("applicationFormContainer");
  const form = document.getElementById("applicationForm");
  const cancelForm = document.getElementById("cancelForm");
  const formTitle = document.getElementById("formTitle");

  let applications = JSON.parse(localStorage.getItem("applications")) || [];
  let editingIndex = null;

  function renderApplications() {
    appTable.innerHTML = "";
    applications.forEach((app, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${app.sequence}</td>
        <td>${app.name}</td>
        <td>${app.position}</td>
        <td>${app.department}</td>
        <td>${app.stage}</td>
      `;
      tr.addEventListener("click", () => openForm(index));
      appTable.appendChild(tr);
    });
  }

  function generateSequence() {
    const num = applications.length + 1;
    return "APP-" + num.toString().padStart(4, "0");
  }

  function openForm(index = null) {
    formContainer.classList.remove("hidden");
    form.reset();

    if (index !== null) {
      const app = applications[index];
      editingIndex = index;
      formTitle.textContent = "Edit Application - " + app.sequence;
      document.getElementById("applicantName").value = app.name;
      document.getElementById("applicantEmail").value = app.email;
      document.getElementById("applicantPhone").value = app.phone;
      document.getElementById("applicantDept").value = app.department;
      document.getElementById("applicantPosition").value = app.position;
      document.getElementById("expectedSalary").value = app.salary;
      document.getElementById("experience").value = app.experience;
      document.getElementById("qualification").value = app.qualification;
      document.getElementById("stageSelect").value = app.stage;
      document.getElementById("notes").value = app.notes;
    } else {
      editingIndex = null;
      formTitle.textContent = "Create Application";
    }
  }

  addNewApp.addEventListener("click", () => openForm());

  cancelForm.addEventListener("click", () => {
    formContainer.classList.add("hidden");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newApp = {
      sequence: editingIndex === null ? generateSequence() : applications[editingIndex].sequence,
      name: document.getElementById("applicantName").value,
      email: document.getElementById("applicantEmail").value,
      phone: document.getElementById("applicantPhone").value,
      department: document.getElementById("applicantDept").value,
      position: document.getElementById("applicantPosition").value,
      salary: document.getElementById("expectedSalary").value,
      experience: document.getElementById("experience").value,
      qualification: document.getElementById("qualification").value,
      stage: document.getElementById("stageSelect").value,
      notes: document.getElementById("notes").value
    };

    if (editingIndex === null) {
      applications.push(newApp);
    } else {
      applications[editingIndex] = newApp;
    }

    localStorage.setItem("applications", JSON.stringify(applications));
    formContainer.classList.add("hidden");
    renderApplications();
  });

  renderApplications();
});
document.addEventListener("DOMContentLoaded", function() {
  const jobForm = document.getElementById("jobForm");
  const jobTableBody = document.querySelector("#jobTable tbody");

  // Load saved job positions
  let jobPositions = JSON.parse(localStorage.getItem("jobPositions")) || [];

  // Function to generate unique sequence
  function generateSequence() {
    const num = jobPositions.length + 1;
    return `Job/Pos/${String(num).padStart(3, '0')}`;
  }

  // Render job positions in table
  function renderJobs() {
    jobTableBody.innerHTML = "";
    jobPositions.forEach(job => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${job.sequence}</td>
        <td>${job.position}</td>
        <td>${job.department}</td>
        <td>${job.required}</td>
        <td>${job.description}</td>
      `;
      jobTableBody.appendChild(row);
    });
  }

  // On form submit
  jobForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const position = document.getElementById("positionName").value.trim();
    const department = document.getElementById("department").value.trim();
    const required = document.getElementById("employeesRequired").value;
    const description = document.getElementById("description").value.trim();

    if (!position || !department || !description) return;

    const newJob = {
      sequence: generateSequence(),
      position,
      department,
      required,
      description,
    };

    jobPositions.push(newJob);
    localStorage.setItem("jobPositions", JSON.stringify(jobPositions));
    renderJobs();

    jobForm.reset();
  });

  renderJobs();
});
