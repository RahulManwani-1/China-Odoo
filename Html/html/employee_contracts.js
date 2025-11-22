document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("contractTable").querySelector("tbody");
  const addNewBtn = document.getElementById("addNewContract");
  const formContainer = document.getElementById("contractFormContainer");
  const form = document.getElementById("contractForm");
  const cancelForm = document.getElementById("cancelContractForm");
  const formTitle = document.getElementById("contractFormTitle");

  let contracts = [];
  let editIndex = null;

  const API_URL = "https://localhost:7228/api/EmployeeContract";

  // Fetch contracts from API
  async function fetchContracts() {
    try {
      const res = await fetch(API_URL);
      contracts = await res.json();
      renderContracts();
    } catch (err) {
      console.error("Error fetching contracts:", err);
      alert("❌ Failed to fetch contracts!");
    }
  }

  function renderContracts() {
    tableBody.innerHTML = "";
    contracts.forEach((contract, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${contract.employee_name}</td>
        <td>${contract.contract_type}</td>
        <td>${new Date(contract.start_date).toLocaleDateString()}</td>
        <td>${new Date(contract.end_date).toLocaleDateString()}</td>
        <td>${contract.salary}</td>
        <td>${contract.working_hours}</td>
        <td>${contract.status}</td>
      `;
      tr.addEventListener("click", () => openForm(index));
      tableBody.appendChild(tr);
    });
  }

  function openForm(index = null) {
    formContainer.classList.remove("hidden");
    form.reset();

    if (index !== null) {
      const c = contracts[index];
      editIndex = index;
      formTitle.textContent = "Edit Contract - " + c.employee_name;
      document.getElementById("employeeName").value = c.employee_name;
      document.getElementById("contractType").value = c.contract_type;
      document.getElementById("startDate").value = c.start_date.split("T")[0];
      document.getElementById("endDate").value = c.end_date ? c.end_date.split("T")[0] : "";
      document.getElementById("salary").value = c.salary;
      document.getElementById("workingHours").value = c.working_hours;
      document.getElementById("status").value = c.status;
      document.getElementById("notes").value = c.notes;
    } else {
      editIndex = null;
      formTitle.textContent = "Create Contract";
    }
  }

  addNewBtn.addEventListener("click", () => openForm());

  cancelForm.addEventListener("click", () => {
    formContainer.classList.add("hidden");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const contractData = {
      employee_name: document.getElementById("employeeName").value,
      employee_id:1,
      contract_type: document.getElementById("contractType").value,
      start_date: document.getElementById("startDate").value,
      end_date: document.getElementById("endDate").value,
      salary: parseFloat(document.getElementById("salary").value),
      working_hours: document.getElementById("workingHours").value,
      status: document.getElementById("status").value,
      notes: document.getElementById("notes").value,
      created_on: new Date().toISOString()
    };

    try {
      if (editIndex !== null) {
        // PUT
        const id = contracts[editIndex].contract_id;
        await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contractData)
        });
      } else {
        // POST
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contractData)
        });
      }

      await fetchContracts();
      formContainer.classList.add("hidden");
    } catch (err) {
      console.error("Error saving contract:", err);
      alert("❌ Failed to save contract!");
    }
  });

  // Initial fetch
  fetchContracts();
});
