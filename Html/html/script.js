window.addEventListener("load", () => {

  // Splash screen
  setTimeout(() => {
    document.getElementById("splash-screen").style.display = "none";
    const loginPage = document.getElementById("login-page");
    loginPage.classList.remove("hidden");
    setTimeout(() => loginPage.classList.add("show"), 100);
  }, 2000);

  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("error-msg");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      // Fetch users
      const res = await fetch("http://localhost:5228/api/users");
      const users = await res.json();

      // Validate user
      const user = users.find(
        u => u.email === email && u.password === password
      );

      if (!user) {
        errorMsg.textContent = "❌ Invalid email or password!";
        errorMsg.classList.add("show");
        loginForm.classList.add("shake");
        setTimeout(() => loginForm.classList.remove("shake"), 400);
        return;
      }

      // Save logged-in user
      localStorage.setItem("logged_user", JSON.stringify(user));

      alert("✅ Login successful!");

      /* =======================
         ROLE BASED REDIRECT
      ======================== */
      let redirectUrl = "dashboard.html"; // default

      switch ((user.menu_access || "").toLowerCase()) {
        case "admin":
          redirectUrl = "dashboard.html";
          break;
        case "finance":
          redirectUrl = "finance.html";
          break;
        case "recruitment":
          redirectUrl = "recruitment._dash.html";
          break;
        case "hr":
          redirectUrl = "hr.html";
          break;
        default:
          redirectUrl = "dashboard.html";
      }

      window.location.href = redirectUrl;

    } catch (err) {
      console.error(err);
      errorMsg.textContent = "⚠ Server error! Try again later.";
      errorMsg.classList.add("show");
    }
  });

});
