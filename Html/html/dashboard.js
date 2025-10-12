document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector(".logout-btn");

  logoutBtn.addEventListener("click", () => {
    alert("👋 You have been logged out.");
    window.location.href = "index.html";
  });
});
