  function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "http://localhost:5228/api/users";

  const form = document.getElementById("userForm");
  const addNewBtn = document.getElementById("addNewBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const tableBody = document.getElementById("userTableBody");

  let users = [];
  let editIndex = null;

  /* =======================
     FETCH USERS (GET)
  ======================== */
  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      users = await res.json();
      renderTable();
    } catch (err) {
      console.error("Fetch Users Error:", err);
    }
  };

  /* =======================
     RENDER TABLE
  ======================== */
  const renderTable = () => {
    tableBody.innerHTML = "";

    users.forEach((u, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u.user_id}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.gender ?? ""}</td>
        <td>${u.status}</td>
        <td>
          <button class="edit-btn" data-index="${index}">✏️ Edit</button>
          <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  };

  fetchUsers();

  /* =======================
     ADD NEW USER
  ======================== */
addNewBtn.addEventListener("click", () => {
  form.reset();
  editIndex = null;

  document.getElementById("username").readOnly = false;
  document.getElementById("email").readOnly = false;
  document.getElementById("cnic").readOnly = false;

  form.classList.remove("hidden");
  addNewBtn.style.display = "none";
});


  cancelBtn.addEventListener("click", () => {
    form.classList.add("hidden");
    addNewBtn.style.display = "inline-block";
  });

  /* =======================
     SAVE USER (POST / PUT)
  ======================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      email: document.getElementById("email").value,
      gender: document.getElementById("gender").value,
      cnic: document.getElementById("cnic").value,
      contact: document.getElementById("contact").value,
      address: document.getElementById("address").value,
      status: document.getElementById("status").value,
      menu_access: document.getElementById("menu_access").value
    };

    try {
      // ❌ Duplicate check only on CREATE
if (editIndex === null) {
  const emailExists = users.some(
    u => u.email.toLowerCase() === user.email.toLowerCase()
  );

  const cnicExists = users.some(
    u => u.cnic === user.cnic
  );

  if (emailExists) {
    alert("❌ Email already exists");
    return;
  }

  if (cnicExists) {
    alert("❌ CNIC already exists");
    return;
  }
}

      /* UPDATE USER */
      if (editIndex !== null) {
        const id = users[editIndex].user_id;

        await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user)
        });

        alert("✔ User updated successfully");
      }
      /* CREATE USER */
      else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user)
        });

        alert("✔ User created successfully");
      }

      form.classList.add("hidden");
      addNewBtn.style.display = "inline-block";
      await fetchUsers();

    } catch (err) {
      console.error("Save Error:", err);
      alert("❌ Failed to save user");
    }
  });

  /* =======================
     EDIT & DELETE
  ======================== */
  tableBody.addEventListener("click", async (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    /* DELETE USER */
    if (e.target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this user?")) {
        const id = users[index].user_id;
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        fetchUsers();
      }
      return;
    }

    /* EDIT USER */
if (e.target.classList.contains("edit-btn")) {
  const u = users[index];
  editIndex = index;

  document.getElementById("username").value = u.username;
  document.getElementById("email").value = u.email;
  document.getElementById("cnic").value = u.cnic;

  document.getElementById("password").value = "";
  document.getElementById("gender").value = u.gender;
  document.getElementById("contact").value = u.contact;
  document.getElementById("address").value = u.address;
  document.getElementById("status").value = u.status;
  document.getElementById("menu_access").value = u.menu_access;

  // 🔒 READONLY fields
  document.getElementById("username").readOnly = true;
  document.getElementById("email").readOnly = true;
  document.getElementById("cnic").readOnly = true;

  form.classList.remove("hidden");
  addNewBtn.style.display = "none";
}

  });

});
