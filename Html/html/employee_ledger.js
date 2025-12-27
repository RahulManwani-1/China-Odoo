  function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
}

const API_LEDGER = "http://localhost:5228/api/EmployeeLedger";
const API_EMPLOYEES = "http://localhost:5228/api/employee";

const ledgerForm = document.getElementById("ledgerForm");
const employeeSelect = document.getElementById("employeeSelect");
const ledgerTableBody = document.getElementById("ledgerTableBody");

// Fetch employees for dropdown
const fetchEmployees = async () => {
  const res = await fetch(API_EMPLOYEES);
  const employees = await res.json();

  employeeSelect.innerHTML = '<option value="">Select Employee</option>';
  employees.forEach(emp => {
    const option = document.createElement("option");
    option.value = emp.employee_id;
    option.textContent = `${emp.first_name} ${emp.last_name} (${emp.department_name})`;
    option.dataset.department = emp.department_name;
    employeeSelect.appendChild(option);
  });
};

// Fetch and render ledger entries
const fetchLedgers = async () => {
  const res = await fetch(API_LEDGER);
  const ledgers = await res.json();

  ledgerTableBody.innerHTML = "";
  ledgers.forEach(l => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${l.ledger_id}</td>
      <td>${l.employee_name}</td>
      <td>${l.department_name}</td>
      <td>${l.ref_type}</td>
      <td>${l.ref_code}</td>
      <td>${l.debit}</td>
      <td>${l.credit}</td>
      <td>${l.balance}</td>
      <td>${l.description}</td>
      <td>${new Date(l.created_on).toLocaleString()}</td>
    `;
    ledgerTableBody.appendChild(row);
  });
};

// Auto-fill department when employee selected
employeeSelect.addEventListener("change", (e) => {
  const selected = e.target.selectedOptions[0];
  if (selected) {
    document.getElementById("description").value = `Ledger for ${selected.textContent}`;
  }
});

// Handle form submission
ledgerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selected = employeeSelect.selectedOptions[0];
  if (!selected) return alert("Please select an employee.");

  const ledger = {
    employee_id: parseInt(selected.value),
    employee_name: selected.textContent.split("(")[0].trim(),
    department_name: selected.dataset.department,
    ref_type: document.getElementById("refType").value,
    ref_code: document.getElementById("refCode").value,
    debit: parseFloat(document.getElementById("debit").value),
    credit: parseFloat(document.getElementById("credit").value),
    description: document.getElementById("description").value
  };

  try {
    await fetch(API_LEDGER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ledger)
    });

    ledgerForm.reset();
    await fetchLedgers();
    alert("✅ Ledger entry added!");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to add ledger entry.");
  }
});

// Initial load
fetchEmployees();
fetchLedgers();
