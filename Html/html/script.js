window.addEventListener("load", () => {

  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    const loginPage = document.getElementById("login-page");

    splash.style.display = "none";
    loginPage.classList.remove("hidden");
    setTimeout(() => loginPage.classList.add("show"), 100);
  }, 3500);


  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("error-msg");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === "Asad" && password === "Asad123") {
      
      // ✔ SEND EMAIL
      emailjs.send("service_t5h3h9c", "template_ezsj3fi", {
        to_email: "aa5391328@gmail.com",
        username: username,
        message: "User logged in successfully."
      })
      .then(function(response) {
          console.log("Email sent!", response.status);
      }, function(error) {
          console.error("Email Error:", error);
      });

      alert("✅ Login successful! Welcome, Asad.");
      window.location.href = "dashboard.html";

    } else {
      errorMsg.textContent = "❌ Invalid username or password!";
      errorMsg.classList.add("show");

      loginForm.classList.add("shake");
      setTimeout(() => loginForm.classList.remove("shake"), 400);
    }
  });
});

// window.addEventListener("load", () => {
//   // Handle splash transition
//   setTimeout(() => {
//     const splash = document.getElementById("splash-screen");
//     const loginPage = document.getElementById("login-page");

//     splash.style.display = "none";
//     loginPage.classList.remove("hidden");
//     setTimeout(() => loginPage.classList.add("show"), 100);
//   }, 3500);

//   // Handle login validation
//   const loginForm = document.getElementById("loginForm");
//   const usernameInput = document.getElementById("username");
//   const passwordInput = document.getElementById("password");
//   const errorMsg = document.getElementById("error-msg");

//   loginForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const username = usernameInput.value.trim();
//     const password = passwordInput.value.trim();

//     try {
//       // Fetch credentials from your backend API
//       const response = await fetch("https://localhost:7104/check-credentials");
//       if (!response.ok) throw new Error("Server error");

//       const data = await response.json();

//       // Validate credentials
//       if (username === data.username && password === data.password) {
//         errorMsg.classList.remove("show");
//         alert(`✅ Login successful! Welcome, ${data.username}.`);
//         window.location.href = "dashboard.html"; // 👈 Redirect to dashboard
//       } else {
//         errorMsg.textContent = "❌ Invalid username or password!";
//         errorMsg.classList.add("show");

//         // Shake animation
//         loginForm.classList.add("shake");
//         setTimeout(() => loginForm.classList.remove("shake"), 400);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       errorMsg.textContent = "⚠️ Unable to connect to server!";
//       errorMsg.classList.add("show");
//     }
//   });
// });
