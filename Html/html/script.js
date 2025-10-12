window.addEventListener("load", () => {
  // Handle splash transition
  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    const loginPage = document.getElementById("login-page");

    splash.style.display = "none";
    loginPage.classList.remove("hidden");
    setTimeout(() => loginPage.classList.add("show"), 100);
  }, 3500);

  // Handle login validation
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("error-msg");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

if (username === "Asad" && password === "Asad123") {
  errorMsg.classList.remove("show");
  alert("✅ Login successful! Welcome, Asad.");
  window.location.href = "dashboard.html";  // 👈 Redirect to dashboard
}
 else {
      errorMsg.textContent = "❌ Invalid username or password!";
      errorMsg.classList.add("show");

      // Shake animation
      loginForm.classList.add("shake");
      setTimeout(() => loginForm.classList.remove("shake"), 400);
    }
  });
});
