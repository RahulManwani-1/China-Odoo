document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("employeeForm");
  const logout = document.getElementById("logout");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("✅ Employee record saved successfully!");
    form.reset();
  });

  logout.addEventListener("click", () => {
    alert("👋 You have been logged out.");
    window.location.href = "index.html";
  });
});
