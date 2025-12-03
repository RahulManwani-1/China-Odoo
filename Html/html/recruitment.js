document.addEventListener("DOMContentLoaded", function () {
  const deptForm = document.getElementById("departmentForm");
  const deptTableBody = document.getElementById("departmentTableBody");
  const parentDeptSelect = document.getElementById("parentDept");
const managerSelect = document.getElementById("managerName");
let employees = [];
let departments = [];

// Fetch employees for manager dropdown
async function fetchEmployees() {
  try {
    const res = await fetch("https://localhost:7228/api/employee");
    employees = await res.json();
    managerSelect.innerHTML = '<option value="">Select Manager</option>';
    employees.forEach(emp => {
      const option = document.createElement("option");
      option.value = emp.first_name + " " + emp.last_name;
      option.textContent = emp.first_name + " " + emp.last_name;
      managerSelect.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
}

// Fetch departments for parent department dropdown
async function fetchParentDepartments() {
  try {
    const res = await fetch("https://localhost:7228/api/Department");
    departments = await res.json();
    parentDeptSelect.innerHTML = '<option value="">Select Parent Department</option>';
    departments.forEach(dept => {
      const option = document.createElement("option");
      option.value = dept.department_name;
      option.textContent = dept.department_name;
      parentDeptSelect.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
}

// Call both on load
fetchEmployees();
fetchParentDepartments();

  const API_URL = "https://localhost:7228/api/Department";

  // Load Departments From API
  async function fetchDepartments() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      renderDepartments(data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  }

  // Render Table
  function renderDepartments(departments = []) {
    if (!deptTableBody) return;

    deptTableBody.innerHTML = "";

    departments.forEach((dept) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>Dept/${String(dept.department_id).padStart(3, "0")}</td>
        <td>${dept.department_name}</td>
        <td>${dept.manager_name}</td>
        <td>${dept.number_of_employees}</td>
           <td>${dept.parent_department_name || "-"}</td>
      <td>${new Date(dept.created_on).toLocaleString()}</td>
      `;

      deptTableBody.appendChild(row);
    });
  }

deptForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("deptName").value.trim();
  const manager = managerSelect.value.trim();
  const employeesCount = parseInt(document.getElementById("numEmployees").value);
  const parentDept = parentDeptSelect.value;

  // Validation
  if (!name || !manager) {
    alert("Please fill department name and manager");
    return;
  }

  if (employeesCount <= 0) {
    alert("Number of employees must be greater than 0");
    return;
  }

  const payload = {
    department_name: name,
    manager_name: manager,
    number_of_employees: employeesCount,
    parent_department_name: parentDept || null,
  };

  try {
    const res = await fetch("https://localhost:7228/api/Department", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to save department");

    alert("✅ Department saved successfully!");
    deptForm.reset();
    fetchDepartments();
  } catch (err) {
    console.error(err);
    alert("❌ Failed to save department!");
  }
});


  // First Load
  fetchDepartments();
});

document.addEventListener("DOMContentLoaded", async function() {
  const jobForm = document.getElementById("jobForm");
  const jobTableBody = document.querySelector("#jobTable tbody");

  const deptSelect = document.getElementById("jobDept"); // Make sure your HTML <select id="jobDept">
  let departments = [];

  // Fetch departments for Job Department dropdown
  async function fetchDepartmentsForJob() {
    try {
      const res = await fetch("https://localhost:7228/api/Department");
      departments = await res.json();
      deptSelect.innerHTML = '<option value="">Select Department</option>';
      departments.forEach(dept => {
        const option = document.createElement("option");
        option.value = dept.department_name;
        option.textContent = dept.department_name;
        deptSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error fetching departments for job:", err);
    }
  }

  await fetchDepartmentsForJob();

  const JOB_API = "https://localhost:7228/api/jobposition";
  let jobPositions = [];

  // Fetch job positions
  const fetchJobs = async () => {
    try {
      const res = await fetch(JOB_API);
      jobPositions = await res.json();
      renderJobs();
    } catch (err) {
      console.error("Error fetching job positions:", err);
    }
  };

  // Render job positions table
function renderJobs() {
  jobTableBody.innerHTML = "";

  jobPositions.forEach(job => {
    const encodedName = encodeURIComponent(job.position_name);
    const shortUrl = `http://127.0.0.1:5500/Html/html/recruitment_application.html?position=${encodedName}`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.position_id}</td>
      <td>${job.position_name}</td>
      <td>${job.department_name}</td>
      <td>${job.no_of_employees_required}</td>
      <td>${job.job_description}</td>
      <td>
        <a href="${shortUrl}" target="_blank" style="color:blue; text-decoration:underline;">
          Open Form
        </a>
      </td>
    `;
    jobTableBody.appendChild(row);
  });
}


  // Submit Job Form
  jobForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const positionName = document.getElementById("positionName").value.trim();
    const department = deptSelect.value;
    const required = parseInt(document.getElementById("employeesRequired").value);
    const description = document.getElementById("description").value.trim();

    // Validation
    if (!positionName || !department || !description || isNaN(required) || required <= 0) {
      alert("Please fill all required fields and number of employees must be greater than 0.");
      return;
    }

    const newJob = {
      position_name: positionName,
      department_name: department,
      no_of_employees_required: required,
      job_description: description,
    };

    try {
      const res = await fetch(JOB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob)
      });

      if (!res.ok) throw new Error("Failed to save job position");

      alert("✅ Job position saved successfully!");
      jobForm.reset();
      await fetchJobs();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save job position!");
    }
  });

  // Initial fetch
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

  const deptSelect = document.getElementById("applicantDept");
  const positionSelect = document.getElementById("applicantPosition");

  const APP_API = "https://localhost:7228/api/RecruitmentApplicant";
  const EMP_API = "https://localhost:7228/api/employee";
  const JOB_API = "https://localhost:7228/api/jobposition";
const pdfInput = document.getElementById("pdfUpload");
const pdfPreview = document.getElementById("pdfPreview");
let uploadedPDFBase64 = null;
// Handle PDF selection
pdfInput.addEventListener("change", () => {
  const file = pdfInput.files[0];
  if (file && file.type === "application/pdf") {
    const reader = new FileReader();
    reader.onload = () => {
      uploadedPDFBase64 = reader.result.split(',')[1]; // Get Base64 without prefix
      pdfPreview.innerHTML = `
        <embed src="${reader.result}" type="application/pdf" width="100%" height="300px">
      `;
    };
    reader.readAsDataURL(file);
  } else {
    uploadedPDFBase64 = null;
    pdfPreview.innerHTML = "❌ Invalid file type. Please upload a PDF.";
  }
});
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

  function renderStars(rating) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += `<span style="color:${i <= rating ? 'gold' : '#ccc'}">★</span>`;
    }
    return html;
  }

  // 🌐 Fetch Employees for interviewer dropdown
  async function fetchEmployees() {
    try {
      const res = await fetch(EMP_API);
      employees = await res.json();
      interviewerSelect.innerHTML = '<option value="">Select Interviewer</option>';
      employees.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.first_name + " " + emp.last_name;
        option.textContent = emp.first_name + " " + emp.last_name;
        interviewerSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error fetching employees:", err);
      alert("❌ Failed to load interviewers");
    }
  }

  // 🌐 Fetch Job Positions for Department & Position dropdowns
  async function fetchJobs() {
    try {
      const res = await fetch(JOB_API);
      jobs = await res.json();

      // Clear and populate Department dropdown
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

      // Clear and populate Position dropdown
      positionSelect.innerHTML = '<option value="">Select Position</option>';
      jobs.forEach(job => {
        const option = document.createElement("option");
        option.value = job.position_name;
        option.textContent = job.position_name;
        positionSelect.appendChild(option);
      });

    } catch (err) {
      console.error("Error fetching jobs:", err);
      alert("❌ Failed to load job positions");
    }
  }

  // 🌐 Fetch existing applications
  async function fetchApplications() {
    try {
      const res = await fetch(APP_API);
      applications = await res.json();
      renderApplications();
    } catch (err) {
      console.error("Error fetching applications:", err);
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
        <td>${renderStars(app.rating || 0)}</td>
      `;
      tr.addEventListener("click", () => openForm(index));
      appTable.appendChild(tr);
    });
  }

  // Open Form
  function openForm(index = null) {
    formContainer.classList.remove("hidden");
    form.reset();
    updateStars(0);
    selectedRating = 0;

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
      selectedRating = app.rating || 0;
      updateStars(selectedRating);
      
   
  // ✅ Show previously uploaded PDF if exists
  if (app.pdf_file) {
    uploadedPDFBase64 = app.pdf_file;
    pdfPreview.innerHTML = `<embed src="data:application/pdf;base64,${app.pdf_file}" type="application/pdf" width="100%" height="300px">`;
  } else {
    uploadedPDFBase64 = null;
    pdfPreview.innerHTML = "";
  }
} else {
  editingIndex = null;
  formTitle.textContent = "Create Application";
  uploadedPDFBase64 = null;
  pdfPreview.innerHTML = "";
}
  }

  addNewApp.addEventListener("click", () => openForm());
  cancelForm.addEventListener("click", () => formContainer.classList.add("hidden"));

  // Submit Form
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
  pdf_file: uploadedPDFBase64, // ✅ Pass Base64 here
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
      await fetchApplications();
      formContainer.classList.add("hidden");
    } catch (err) {
      console.error("Error saving application:", err);
      alert("❌ Failed to save application!");
    }
  });

  // Initial fetches
  fetchEmployees();
  fetchJobs();
  fetchApplications();
});
