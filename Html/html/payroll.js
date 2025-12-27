  function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5228/api/Payroll";
  const payrollTableBody = document.getElementById("payrollTableBody");
  const runPayrollBtn = document.getElementById("runPayrollBtn");
  const payrollMonth = document.getElementById("payrollMonth");
  const logout = document.getElementById("logout");

  let payrolls = [];

  // Fetch payroll records
  const fetchPayrolls = async () => {
    try {
      const res = await fetch(API_URL);
      payrolls = await res.json();

      payrollTableBody.innerHTML = "";
      payrolls.forEach(p => {
        const row = document.createElement("tr");
  row.innerHTML = `
  <td>${p.payroll_code}</td>
  <td>${p.employee_name}</td>
  <td>${p.department_name}</td>
  <td>${p.basic_salary}</td>
  <td>${p.allowances_amount}</td>
  <td>${p.loan_deduction}</td>
  <td>${p.no_of_days}</td>
  <td>${p.no_of_hours}</td>
  <td>${p.paid_day_offs}</td>
  <td>${p.unpaid_day_offs}</td>
  <td>${p.net_salary}</td>
  <td>${p.payroll_month}</td>
`;

        payrollTableBody.appendChild(row);
      });
    } catch (err) {
      console.error("Error fetching payroll:", err);
      alert("❌ Failed to fetch payroll records!");
    }
  };

  fetchPayrolls();

  // Run Payroll
  runPayrollBtn.addEventListener("click", async () => {
    const selectedDate = payrollMonth.value; // YYYY-MM-DD
    if (!selectedDate) return alert("❌ Please select a date");

    const dateObj = new Date(selectedDate);
    const monthOnly = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM

    // Check if payroll for this month already exists
    const payrollExists = payrolls.some(p => p.payroll_month.startsWith(monthOnly));
    if (payrollExists) {
      return alert(`❌ Payroll for ${monthOnly} has already been run!`);
    }

    try {
      const res = await fetch(`${API_URL}/run?month=${monthOnly}`, {
        method: "POST",
      });
      const msg = await res.text();
      alert(msg);
      fetchPayrolls(); // refresh table
    } catch (err) {
      console.error("Error running payroll:", err);
      alert("❌ Failed to run payroll!");
    }
  });

  // Logout
  logout.addEventListener("click", () => {
    alert("👋 You have been logged out.");
    window.location.href = "index.html";
  });
});
