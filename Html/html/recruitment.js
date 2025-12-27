  function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", function () {

  const deptForm = document.getElementById("departmentForm");
  const deptTableBody = document.getElementById("departmentTableBody");
  const parentDeptSelect = document.getElementById("parentDept");
  const managerSelect = document.getElementById("managerName");

  const API_URL = "http://localhost:5228/api/Department";
  const EMP_API = "http://localhost:5228/api/employee";
const JOB_API = "http://localhost:5228/api/jobposition";

  let employees = [];
  let departments = [];
  let editDepartmentId = null;

  /* =========================
     FETCH EMPLOYEES
  ========================= */
  async function fetchEmployees() {
    try {
      const res = await fetch(EMP_API);
      employees = await res.json();

      managerSelect.innerHTML = '<option value="">Select Manager</option>';
      employees.forEach(emp => {
        const opt = document.createElement("option");
        opt.value = `${emp.first_name} ${emp.last_name}`;
        opt.textContent = `${emp.first_name} ${emp.last_name}`;
        managerSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Employee fetch error", err);
    }
  }

  /* =========================
     FETCH PARENT DEPARTMENTS
  ========================= */
  async function fetchParentDepartments() {
    try {
      const res = await fetch(API_URL);
      departments = await res.json();

      parentDeptSelect.innerHTML =
        '<option value="">Select Parent Department</option>';

      departments.forEach(dept => {
        const opt = document.createElement("option");
        opt.value = dept.department_name;
        opt.textContent = dept.department_name;
        parentDeptSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Parent dept fetch error", err);
    }
  }

  /* =========================
     FETCH & RENDER DEPARTMENTS
  ========================= */
  async function fetchDepartments() {
    try {
      const res = await fetch(API_URL);
      departments = await res.json(); // ✅ global array update
      renderDepartments();
    } catch (err) {
      console.error("Department fetch error", err);
    }
  }

  function renderDepartments() {
    deptTableBody.innerHTML = "";

    departments.forEach(dept => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>Dept/${String(dept.department_id).padStart(3, "0")}</td>
        <td>${dept.department_name}</td>
        <td>${dept.manager_name}</td>
        <td>${dept.number_of_employees}</td>
        <td>${dept.parent_department_name || "-"}</td>
        <td>${new Date(dept.created_on).toLocaleString()}</td>
        <td>
          <button class="edit-btn" onclick="editDepartment(${dept.department_id})">✏️</button>
          <button class="delete-btn" onclick="deleteDepartment(${dept.department_id})">🗑️</button>
        </td>
      `;

      deptTableBody.appendChild(row);
    });
  }

  /* =========================
     CREATE / UPDATE
  ========================= */
  deptForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("deptName").value.trim();
    const manager = managerSelect.value.trim();
    const parentDept = parentDeptSelect.value;

    if (!name) {
      alert("Please fill department name and manager");
      return;
    }

    if (parentDept && parentDept.toLowerCase() === name.toLowerCase()) {
      alert("Department and Parent Department cannot be same");
      return;
    }

    const duplicate = departments.some(dept =>
      dept.department_name.toLowerCase() === name.toLowerCase() &&
      (dept.parent_department_name || "").toLowerCase() ===
      (parentDept || "").toLowerCase() &&
      dept.department_id !== editDepartmentId
    );

    if (duplicate) {
      alert("This department already exists under the same parent");
      return;
    }

    const payload = {
      department_name: name,
      manager_name: manager,
      parent_department_name: parentDept || null
    };

    const url = editDepartmentId
      ? `${API_URL}/${editDepartmentId}`
      : API_URL;

    const method = editDepartmentId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Save failed");

      alert(editDepartmentId ? "Department updated!" : "Department saved!");

      deptForm.reset();
      editDepartmentId = null;
      document.querySelector(".save-btn").innerText = "💾 Save Department";

      fetchDepartments();
      fetchParentDepartments();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  });

  /* =========================
     EDIT
  ========================= */
  window.editDepartment = function (id) {
    const dept = departments.find(d => d.department_id === id);
    if (!dept) return;

    document.getElementById("deptName").value = dept.department_name;
    managerSelect.value = dept.manager_name;
    parentDeptSelect.value = dept.parent_department_name || "";

    editDepartmentId = id;
    document.querySelector(".save-btn").innerText = "✏️ Update Department";
  };

  /* =========================
     DELETE
  ========================= */
window.deleteDepartment = async function (id) {

  const dept = departments.find(d => d.department_id === id);
  if (!dept) return;

  try {
    /* 🔴 STEP 1: CHECK IF THIS DEPARTMENT IS A PARENT */
    const hasChildDepartments = departments.some(
      d => d.parent_department_name === dept.department_name
    );

    if (hasChildDepartments) {
      alert(
        `❌ Cannot delete department!\n\n` +
        `"${dept.department_name}" is a parent of other departments.\n` +
        `Please delete or reassign child departments first.`
      );
      return;
    }

    /* 🔴 STEP 2: CHECK JOB POSITIONS */
    const jobRes = await fetch(JOB_API);
    const jobs = await jobRes.json();

    const hasJobs = jobs.some(
      job => job.department_name === dept.department_name
    );

    if (hasJobs) {
      alert(
        `❌ Cannot delete department!\n\n` +
        `Job positions exist under "${dept.department_name}".\n` +
        `Please delete or move job positions first.`
      );
      return;
    }

    /* ✅ STEP 3: CONFIRM DELETE */
    if (!confirm("Are you sure you want to delete this department?")) return;

    /* ✅ STEP 4: DELETE */
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");

    alert("✅ Department deleted successfully!");
    fetchDepartments();
    fetchParentDepartments();

  } catch (err) {
    console.error(err);
    alert("❌ Failed to delete department");
  }
};



  /* =========================
     INITIAL LOAD
  ========================= */
  fetchEmployees();
  fetchDepartments();
  fetchParentDepartments();

});

document.addEventListener("DOMContentLoaded", async function () {

  const jobForm = document.getElementById("jobForm");
  const jobTableBody = document.querySelector("#jobTable tbody");
  const deptSelect = document.getElementById("jobDept");

  const JOB_API = "http://localhost:5228/api/jobposition";
  const DEPT_API = "http://localhost:5228/api/Department";
  const EMP_API = "http://localhost:5228/api/employee";

let employees = [];


  let departments = [];
  let jobPositions = [];
  let editJobId = null;

  /* ==============================
     1️⃣ FETCH DEPARTMENTS
  ============================== */
  async function fetchDepartmentsForJob() {
    try {
      const res = await fetch(DEPT_API);
      departments = await res.json();

      deptSelect.innerHTML = '<option value="">Select Department</option>';
      departments.forEach(dept => {
        const option = document.createElement("option");
        option.value = dept.department_name;
        option.textContent = dept.department_name;
        deptSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Department fetch error:", err);
    }
  }
async function fetchEmployees() {
  try {
    const res = await fetch(EMP_API);
    employees = await res.json();
  } catch (err) {
    console.error("Employee fetch error:", err);
  }
}
function getEmployeeCount(positionName) {
  return employees.filter(emp =>
    emp.position_name &&
    emp.position_name.toLowerCase() === positionName.toLowerCase()
  ).length;
}

  /* ==============================
     2️⃣ FETCH JOB POSITIONS
  ============================== */
  async function fetchJobs() {
    try {
      const res = await fetch(JOB_API);
      jobPositions = await res.json();   // ✅ GLOBAL UPDATE
      renderJobs();
    } catch (err) {
      console.error("Job fetch error:", err);
    }
  }

  /* ==============================
     3️⃣ RENDER JOB TABLE
  ============================== */
function renderJobs() {
  jobTableBody.innerHTML = "";

  jobPositions.forEach(job => {
    const encodedName = encodeURIComponent(job.position_name);
    const shortUrl =
      `http://127.0.0.1:5500/Html/html/recruitment_application.html?position=${encodedName}`;

    const expireOn = job.expire_on
      ? new Date(job.expire_on).toLocaleString()
      : "Not Set";

    const employeeCount = getEmployeeCount(job.position_name);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.position_id}</td>
      <td>${job.position_name}</td>
      <td>${job.department_name}</td>
      <td>${job.job_description}</td>
      <td>${expireOn}</td>
      <td>${job.sources || "-"}</td>
      <td>
        <a href="${shortUrl}" target="_blank" style="color:blue">Open Form</a>
      </td>
      <td style="text-align:center;font-weight:bold">
        ${employeeCount}
      </td>
      <td>
        <button class="edit-btn" onclick="editJob(${job.position_id})">✏️</button>
        <button class="delete-btn"
          onclick="deleteJob(${job.position_id}, ${employeeCount})">
          🗑️
        </button>
      </td>
    `;
    jobTableBody.appendChild(row);
  });
}


  /* ==============================
     4️⃣ SUBMIT (CREATE / UPDATE)
  ============================== */
  jobForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const positionName = document.getElementById("positionName").value.trim();
    const department = deptSelect.value;
    const description = document.getElementById("description").value.trim();
    const expireOn = document.getElementById("expireOn").value;
    const source = document.getElementById("source").value.trim();

    if (!positionName || !department || !description || !expireOn || !source) {
      alert("Please fill all required fields");
      return;
    }

    // ❌ DUPLICATE CHECK
    const duplicate = jobPositions.some(job =>
      job.position_name.toLowerCase() === positionName.toLowerCase() &&
      job.position_id !== editJobId
    );

    if (duplicate) {
      alert("This job position already exists");
      return;
    }

    const payload = {
      position_name: positionName,
      department_name: department,
      job_description: description,
      expire_on: (expireOn),
      sources: source
    };

    const url = editJobId
      ? `${JOB_API}/${editJobId}`
      : JOB_API;

    const method = editJobId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Save failed");

      alert(editJobId ? "Job updated!" : "Job saved!");

      jobForm.reset();
      editJobId = null;
      document.querySelector(".save-btn").innerText = "💾 Save Job Position";

      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Failed to save job");
    }
  });

  /* ==============================
     5️⃣ EDIT JOB
  ============================== */
  window.editJob = function (id) {
    const job = jobPositions.find(j => j.position_id === id);
    if (!job) return;

    document.getElementById("positionName").value = job.position_name;
    deptSelect.value = job.department_name;
    document.getElementById("description").value = job.job_description;
    document.getElementById("expireOn").value =
      job.expire_on ? job.expire_on.slice(0, 16) : "";
    document.getElementById("source").value = job.sources || "";

    editJobId = id;
    document.querySelector(".save-btn").innerText = "✏️ Update Job Position";
  };

  /* ==============================
     6️⃣ DELETE JOB
  ============================== */
window.deleteJob = async function (id, employeeCount) {

  if (employeeCount > 0) {
    alert("❌ Cannot delete this job position. Employees are assigned.");
    return;
  }

  if (!confirm("Are you sure you want to delete this job?")) return;

  try {
    const res = await fetch(`${JOB_API}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");

    alert("Job deleted!");
    fetchJobs();
  } catch (err) {
    console.error(err);
    alert("Failed to delete job");
  }
};

  /* ==============================
     INITIAL LOAD
  ============================== */
  await fetchDepartmentsForJob();
  await fetchEmployees();   // 👈 MUST LOAD FIRST

  await fetchJobs();

});


document.addEventListener("DOMContentLoaded", () => {
  const appTable = document.getElementById("applicationTable").querySelector("tbody");
  const addNewApp = document.getElementById("addNewApp");
  const formContainer = document.getElementById("applicationFormContainer");
  const form = document.getElementById("applicationForm");
  const cancelForm = document.getElementById("cancelForm");
  const formTitle = document.getElementById("formTitle");
  const stars = document.querySelectorAll(".star");

  const interviewerSelect = document.getElementById("interviewerName");
  const secondInterviewerSelect = document.getElementById("secondInterviewer"); // now select
  const firstInterviewInput = document.getElementById("firstInterview");
  const secondInterviewInput = document.getElementById("secondInterview");

  const deptSelect = document.getElementById("applicantDept");
  const positionSelect = document.getElementById("applicantPosition");

  const APP_API = "http://localhost:5228/api/RecruitmentApplicant";
  const EMP_API = "http://localhost:5228/api/employee";
  const JOB_API = "http://localhost:5228/api/jobposition";
  const pdfInput = document.getElementById("pdfUpload");
  const pdfPreview = document.getElementById("pdfPreview");

  let uploadedPDFBase64 = null;
  let applications = [];
  let employees = [];
  let jobs = [];
  let editingIndex = null;
  let selectedRating = 0;

  // ⭐ Star rating
  function updateStars(rating) {
    stars.forEach(star => {
      const value = parseInt(star.getAttribute("data-value"));
      star.classList.toggle("filled", value <= rating);
    });
  }

  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.getAttribute("data-value"));
      updateStars(selectedRating);
    });
  });

  // Handle PDF selection
  pdfInput.addEventListener("change", () => {
    const file = pdfInput.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        uploadedPDFBase64 = reader.result.split(',')[1];
        pdfPreview.innerHTML = `<embed src="${reader.result}" type="application/pdf" width="100%" height="300px">`;
      };
      reader.readAsDataURL(file);
    } else {
      uploadedPDFBase64 = null;
      pdfPreview.innerHTML = "❌ Invalid file type. Please upload a PDF.";
    }
  });

  // 🌐 Fetch Employees for both interviewer dropdowns
  async function fetchEmployees() {
    try {
      const res = await fetch(EMP_API);
      employees = await res.json();
      [interviewerSelect, secondInterviewerSelect].forEach(select => {
        select.innerHTML = '<option value="">Select Interviewer</option>';
        employees.forEach(emp => {
          const option = document.createElement("option");
          option.value = emp.first_name + " " + emp.last_name;
          option.textContent = emp.first_name + " " + emp.last_name;
          select.appendChild(option);
        });
      });
    } catch (err) {
      console.error("Error fetching employees:", err);
      alert("❌ Failed to load interviewers");
    }
  }

  // 🌐 Fetch Jobs
  async function fetchJobs() {
    try {
      const res = await fetch(JOB_API);
      jobs = await res.json();
      const deptSet = new Set();
      deptSelect.innerHTML = '<option value="">Select Department</option>';
      jobs.forEach(job => {
        if (!deptSet.has(job.department_name)) {
          const option = document.createElement("option");
          option.value = job.department_name;
          option.textContent = job.department_name;
          deptSelect.appendChild(option);
          deptSet.add(job.department_name);
        }
      });

      positionSelect.innerHTML = '<option value="">Select Position</option>';
      jobs.forEach(job => {
        const option = document.createElement("option");
        option.value = job.position_name;
        option.textContent = job.position_name;
        positionSelect.appendChild(option);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // 🔥 Filter positions by department
  deptSelect.addEventListener("change", () => {
    const selectedDept = deptSelect.value;
    positionSelect.innerHTML = '<option value="">Select Position</option>';
    jobs.filter(j => j.department_name === selectedDept)
        .forEach(j => positionSelect.appendChild(new Option(j.position_name, j.position_name)));
  });

  // 🌐 Fetch Applications
  async function fetchApplications() {
    try {
      const res = await fetch(APP_API);
      applications = await res.json();
      renderApplications();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to fetch applications");
    }
  }

  function renderApplications() {
    appTable.innerHTML = "";
    applications.forEach((app, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${app.applicant_id}</td>
        <td>${app.applicant_name}</td>
        <td>${app.position_name}</td>
        <td>${app.department_name}</td>
        <td>${app.status}</td>
        <td>${'★'.repeat(app.rating || 0) + '☆'.repeat(5-(app.rating || 0))}</td>
      `;
      tr.addEventListener("click", () => openForm(index));
      appTable.appendChild(tr);
    });
  }

  function openForm(index = null) {
    formContainer.classList.remove("hidden");
    form.reset();
    updateStars(0);
    selectedRating = 0;
    uploadedPDFBase64 = null;
    pdfPreview.innerHTML = "";

    if (index !== null) {
      const app = applications[index];
      editingIndex = index;
      formTitle.textContent = "Edit Application - " + app.applicant_id;

      document.getElementById("applicantName").value = app.applicant_name;
      document.getElementById("applicantEmail").value = app.email;
      document.getElementById("applicantPhone").value = app.phone;
      document.getElementById("applicantCnic").value = app.cnic || "";
      deptSelect.value = app.department_name;
      positionSelect.value = app.position_name;
      document.getElementById("expectedSalary").value = app.expected_salary;
      document.getElementById("experience").value = app.experience_years;
      document.getElementById("qualification").value = app.qualification;
      document.getElementById("stageSelect").value = app.status;
      document.getElementById("notes").value = app.notes;
      interviewerSelect.value = app.interviewer_name || "";
      secondInterviewerSelect.value = app.second_interviewer_name || "";
      firstInterviewInput.value = app.first_interview ? app.first_interview.split("T")[0] : "";
      secondInterviewInput.value = app.second_interview ? app.second_interview.split("T")[0] : "";
      selectedRating = app.rating || 0;
      updateStars(selectedRating);

      if (app.pdf_file) {
        uploadedPDFBase64 = app.pdf_file;
        pdfPreview.innerHTML = `<embed src="data:application/pdf;base64,${app.pdf_file}" type="application/pdf" width="100%" height="300px">`;
      }
    } else {
      editingIndex = null;
      formTitle.textContent = "Create Application";
    }
  }

  addNewApp.addEventListener("click", () => openForm());
  cancelForm.addEventListener("click", () => formContainer.classList.add("hidden"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newApp = {
      applicant_name: document.getElementById("applicantName").value,
      email: document.getElementById("applicantEmail").value,
      phone: document.getElementById("applicantPhone").value,
      cnic: document.getElementById("applicantCnic").value,
      department_name: deptSelect.value,
      position_name: positionSelect.value,
      expected_salary: parseFloat(document.getElementById("expectedSalary").value),
      experience_years: parseInt(document.getElementById("experience").value),
      qualification: document.getElementById("qualification").value,
      status: document.getElementById("stageSelect").value,
      notes: document.getElementById("notes").value,
      rating: selectedRating,
      interviewer_name: interviewerSelect.value,
      second_interviewer_name: secondInterviewerSelect.value,
      first_interview: firstInterviewInput.value,
      second_interview: secondInterviewInput.value,
      pdf_file: uploadedPDFBase64,
      created_on: new Date().toISOString()
    };

    try {
      if (editingIndex !== null) {
        const appId = applications[editingIndex].applicant_id;
        await fetch(`${APP_API}/${appId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newApp)
        });
        alert("✏️ Application updated successfully!");
      } else {
        await fetch(APP_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newApp)
        });
        alert("✅ Application created successfully!");
      }
          if (newApp.status === "Contract Signed") {
      const applicantName = encodeURIComponent(newApp.applicant_name);
      const employeeURL = `http://127.0.0.1:5500/Html/html/employee.html?recruitment=${applicantName}`;
      window.open(employeeURL, "_blank"); // Opens the Employee page
      console.log("Employee creation URL:", employeeURL);
    }

      await fetchApplications();
      formContainer.classList.add("hidden");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save application!");
    }
  });

  fetchEmployees();
  fetchJobs();
  fetchApplications();
});
