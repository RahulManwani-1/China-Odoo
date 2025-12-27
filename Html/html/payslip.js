  function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("payslipTableBody");
  const monthFilter = document.getElementById("monthFilter");
  const employeeFilter = document.getElementById("employeeFilter");
  const filterBtn = document.getElementById("filterBtn");
  const logout = document.getElementById("logout");

  const payslipModal = document.getElementById("payslipModal");
  const closeModal = document.getElementById("closePayslipModal");
  const payslipDetails = document.getElementById("payslipDetails");
  const changeStatusBtn = document.getElementById("changeStatusBtn");
  const printPayslipBtn = document.getElementById("printPayslipBtn");

  let payslips = [];
  let employees = [];
  let selectedPayslip = null;

  const API_URL = "http://localhost:5228/api/PaySlip";
  const EMP_API_URL = "http://localhost:5228/api/employee";

  // ---------------- Fetch Employees ----------------
  const fetchEmployees = async () => {
    try {
      const res = await fetch(EMP_API_URL);
      const data = await res.json();
      employees = data;

      // Populate employee filter
      employeeFilter.innerHTML = '<option value="">All Employees</option>';
      employees.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.employee_id;
        option.textContent = `${emp.first_name} ${emp.last_name || ""}`;
        employeeFilter.appendChild(option);
      });
    } catch (err) {
      console.error("Error fetching employees:", err);
      alert("❌ Failed to fetch employees!");
    }
  };
  fetchEmployees();

  // ---------------- Get employee name ----------------
  const getEmployeeName = (employee_id) => {
    const emp = employees.find(e => e.employee_id == employee_id);
    return emp ? `${emp.first_name} ${emp.last_name || ""}` : "Unknown";
  };

  // ---------------- Fetch Payslips ----------------
  const fetchPayslips = async (url = API_URL) => {
    try {
      const res = await fetch(url);
      payslips = await res.json();
      renderTable();
    } catch (err) {
      console.error("Error fetching payslips:", err);
      alert("❌ Failed to fetch payslips!");
    }
  };
  fetchPayslips();

  // ---------------- Render Table ----------------
  const renderTable = () => {
    tableBody.innerHTML = "";
    payslips.forEach((p, index) => {
      const empName = getEmployeeName(p.employee_id);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.id}</td>
        <td>${empName}</td>
        <td>${p.payroll_month}</td>
        <td>${p.gross_salary}</td>
        <td>${p.net_salary}</td>
        <td>${p.status}</td>
        <td>
          <button class="view-btn" data-index="${index}">🔍 View</button>
        </td>`;
      tableBody.appendChild(row);
    });
  };

  // ---------------- Filter Payslips ----------------
  filterBtn.addEventListener("click", () => {
    const month = monthFilter.value;
    const employeeId = employeeFilter.value;
    let url = API_URL;
    const params = [];
    if (month) params.push(`month=${month}`);
    if (employeeId) params.push(`employee_id=${employeeId}`);
    if (params.length) url += "?" + params.join("&");
    fetchPayslips(url);
  });

  // ---------------- View Payslip Modal ----------------
  tableBody.addEventListener("click", (e) => {
    if (!e.target.classList.contains("view-btn")) return;
    const index = e.target.dataset.index;
    selectedPayslip = payslips[index];
    showPayslipModal(selectedPayslip);
  });

  const showPayslipModal = (p) => {
    const empName = getEmployeeName(p.employee_id);
    payslipDetails.innerHTML = `
      <p><strong>Employee:</strong> ${empName}</p>
      <p><strong>Month:</strong> ${p.payroll_month}</p>
      <p><strong>Basic Salary:</strong> ${p.basic_salary}</p>
      <p><strong>Allowances:</strong> ${p.allowances}</p>
      <p><strong>Overtime:</strong> ${p.overtime}</p>
      <p><strong>Loan Deduction:</strong> ${p.loan_deduction}</p>
      <p><strong>Advance Adjustment:</strong> ${p.advance_adjustment}</p>
      <p><strong>Other Deductions:</strong> ${p.other_deductions}</p>
      <p><strong>Gross Salary:</strong> ${p.gross_salary}</p>
      <p><strong>Net Salary:</strong> ${p.net_salary}</p>
      <p><strong>Status:</strong> ${p.status}</p>
      <p><strong>Journal Reference:</strong> ${p.journal_reference}</p>
    `;
    payslipModal.classList.remove("hidden");
    changeStatusBtn.style.display = p.status === "draft" ? "inline-block" : "none";
  };

  closeModal.addEventListener("click", () => payslipModal.classList.add("hidden"));

  // ---------------- Change Status draft -> posted ----------------
  changeStatusBtn.addEventListener("click", async () => {
    if (!selectedPayslip) return;
    if (confirm("✅ Are you sure you want to post this payslip?")) {
      try {
        await fetch(`${API_URL}/${selectedPayslip.id}/post`, { method: "PUT" });
        alert("✅ Payslip posted successfully!");
        payslipModal.classList.add("hidden");
        fetchPayslips();
      } catch (err) {
        console.error("Error posting payslip:", err);
        alert("❌ Failed to post payslip!");
      }
    }
  });

  // ---------------- Print PDF ----------------
  printPayslipBtn.addEventListener("click", () => {
    if (!selectedPayslip) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("PaySlip", 105, 20, null, null, "center");
    doc.setFontSize(12);
    let y = 30;
    const empName = getEmployeeName(selectedPayslip.employee_id);
    const data = { "Employee": empName, ...selectedPayslip };
    for (const [key, value] of Object.entries(data)) {
      doc.text(`${key}: ${value}`, 20, y);
      y += 8;
    }
    doc.save(`Payslip-${empName}-${selectedPayslip.payroll_month}.pdf`);
  });

  // ---------------- Logout ----------------
  logout.addEventListener("click", () => {
    alert("👋 You have been logged out.");
    window.location.href = "index.html";
  });
});
