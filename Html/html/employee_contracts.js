  function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const tableBody = document.querySelector("#contractTable tbody");
  const addNewBtn = document.getElementById("addNewContract");
  const formContainer = document.getElementById("contractFormContainer");
  const form = document.getElementById("contractForm");
  const cancelForm = document.getElementById("cancelContractForm");
  const formTitle = document.getElementById("contractFormTitle");

  const empSelect = document.getElementById("employeeName");
  const scheduleSelect = document.getElementById("workingSchedule");

  const API_URL = "http://localhost:5228/api/EmployeeContract";
  const EMP_API = "http://localhost:5228/api/employee";
  const SCHEDULE_API = "http://localhost:5228/api/WorkSchedule";

  let contracts = [];
  let editIndex = null;

  /* ================= FETCH CONTRACTS ================= */

  async function fetchContracts() {
    try {
      const res = await fetch(API_URL);
      contracts = await res.json();
      renderContracts();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load contracts");
    }
  }

  function renderContracts() {
    tableBody.innerHTML = "";
    contracts.forEach((c, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${c.employee_name}</td>
        <td>${c.contract_type}</td>
        <td>${new Date(c.start_date).toLocaleDateString()}</td>
        <td>${c.end_date ? new Date(c.end_date).toLocaleDateString() : "-"}</td>
        <td>${c.salary}</td>
        <td>${c.shift_name || "-"}</td>
        <td>${c.status}</td>
      `;
      tr.addEventListener("click", () => openForm(index));
      tableBody.appendChild(tr);
    });
  }

  /* ================= FETCH EMPLOYEES ================= */

  async function fetchEmployees(selectedId = null) {
    const res = await fetch(EMP_API);
    const employees = await res.json();

    empSelect.innerHTML = `<option value="">Select Employee</option>`;
    employees.forEach(emp => {
      const option = document.createElement("option");
      option.value = emp.employee_id;
      option.textContent = `${emp.first_name} ${emp.last_name}`;
      option.dataset.name = `${emp.first_name} ${emp.last_name}`;
      empSelect.appendChild(option);
    });

    if (selectedId) empSelect.value = selectedId;
  }

  /* ================= FETCH SCHEDULES ================= */

  async function fetchSchedules(selectedId = null) {
    const res = await fetch(SCHEDULE_API);
    const schedules = await res.json();

    scheduleSelect.innerHTML = `<option value="">Select Schedule</option>`;
    schedules.forEach(s => {
      const option = document.createElement("option");
      option.value = s.schedule_id;
      option.textContent = `${s.shift_name} (${s.shift_start_time} - ${s.shift_end_time})`;
      scheduleSelect.appendChild(option);
    });

    if (selectedId) scheduleSelect.value = selectedId;
  }

  /* ================= OPEN FORM ================= */

  function openForm(index = null) {
    formContainer.classList.remove("hidden");
    form.reset();
    editIndex = index;

    if (index !== null) {
      const c = contracts[index];
      formTitle.textContent = "Edit Contract - " + c.employee_name;

      fetchEmployees(c.employee_id);
      fetchSchedules(c.schedule_id);

      document.getElementById("contractType").value = c.contract_type;
      document.getElementById("startDate").value = c.start_date.split("T")[0];
      document.getElementById("endDate").value = c.end_date ? c.end_date.split("T")[0] : "";
      document.getElementById("salary").value = c.salary;
      document.getElementById("workingHours").value = c.working_hours;
      document.getElementById("status").value = c.status;
      document.getElementById("notes").value = c.notes || "";

    } else {
      formTitle.textContent = "Create Contract";
      fetchEmployees();
      fetchSchedules();
    }
  }

  addNewBtn.addEventListener("click", () => openForm());

  cancelForm.addEventListener("click", () => {
    formContainer.classList.add("hidden");
  });

  /* ================= SAVE CONTRACT ================= */

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const employeeId = Number(empSelect.value);
    const employeeName = empSelect.options[empSelect.selectedIndex]?.dataset.name;
    const scheduleId = Number(scheduleSelect.value);

    if (!employeeId || !scheduleId) {
      alert("❌ Employee & Schedule both required");
      return;
    }

    // Duplicate contract check
    const duplicate = contracts.some((c, idx) =>
      idx !== editIndex && c.employee_id === employeeId
    );

    if (duplicate) {
      alert("❌ This employee already has a contract");
      return;
    }

    const contractData = {
      employee_id: employeeId,
      employee_name: employeeName,
      schedule_id: scheduleId,
      contract_type: document.getElementById("contractType").value,
      start_date: document.getElementById("startDate").value,
      end_date: document.getElementById("endDate").value || null,
      salary: Number(document.getElementById("salary").value),
      working_hours: document.getElementById("workingHours").value,
      status: document.getElementById("status").value,
      notes: document.getElementById("notes").value
    };

    try {
      if (editIndex !== null) {
        const id = contracts[editIndex].contract_id;
        await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contractData)
        });
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contractData)
        });
      }

      await fetchContracts();
      formContainer.classList.add("hidden");

    } catch (err) {
      console.error(err);
      alert("❌ Failed to save contract");
    }
  });

  fetchContracts();
});
