  function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
    const JOB_API = "http://localhost:5228/api/jobposition";
    const APP_API = "http://localhost:5228/api/RecruitmentApplicant";

    const formContainer = document.getElementById("formContainer");
    const messageDiv = document.getElementById("message");
    const applyForm = document.getElementById("applyForm");

    const positionInput = document.getElementById("position_name");
    const departmentInput = document.getElementById("department_name");

    const applicantName = document.getElementById("applicant_name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const cnic = document.getElementById("cnic");
    const expectedSalary = document.getElementById("expected_salary");
    const experienceYears = document.getElementById("experience_years");
    const qualification = document.getElementById("qualification");
    const notes = document.getElementById("notes");

    // ✅ PDF Upload
    const pdfInput = document.getElementById("resume_pdf");
    let uploadedPDFBase64 = null;

    pdfInput.addEventListener("change", () => {
        const file = pdfInput.files[0];
        if (file && file.type === "application/pdf") {
            const reader = new FileReader();
            reader.onload = () => {
                uploadedPDFBase64 = reader.result.split(',')[1]; // only Base64
            };
            reader.readAsDataURL(file);
        } else {
            uploadedPDFBase64 = null;
            alert("❌ Please select a valid PDF file");
        }
    });

    // 1️⃣ Get position from URL
    const urlParams = new URLSearchParams(window.location.search);
    const positionName = urlParams.get("position");

    if (!positionName) {
        messageDiv.textContent = "❌ No position specified!";
        messageDiv.classList.remove("hidden");
        return;
    }

    // 2️⃣ Fetch job positions
    let jobPositions = [];
    try {
        const jobRes = await fetch(JOB_API);
        jobPositions = await jobRes.json();
    } catch (err) {
        console.error("Failed to fetch job positions:", err);
        messageDiv.textContent = "❌ Failed to load job data!";
        messageDiv.classList.remove("hidden");
        return;
    }

    // 3️⃣ Find position
    const position = jobPositions.find(j => j.position_name === positionName);
    if (!position) {
        messageDiv.textContent = "❌ Position not found!";
        messageDiv.classList.remove("hidden");
        return;
    }

    // 4️⃣ Check expiry
    const now = new Date();
    const expireOn = new Date(position.expire_on);
    if (expireOn && now > expireOn) {
        messageDiv.textContent = "❌ Recruitment link expired.";
        messageDiv.classList.remove("hidden");
        return;
    }

    // 5️⃣ Show form & autofill
    formContainer.classList.remove("hidden");
    positionInput.value = position.position_name;
    departmentInput.value = position.department_name;

    // 6️⃣ Submit application
    applyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const salaryValue = parseFloat(expectedSalary.value);
        const experienceValue = parseInt(experienceYears.value);

        // Validation
        if (salaryValue < 0) {
            alert("❌ Expected salary cannot be negative.");
            return;
        }
        if (experienceValue < 0) {
            alert("❌ Experience (years) cannot be negative.");
            return;
        }
        if (!uploadedPDFBase64) {
            alert("❌ Please upload your resume PDF.");
            return;
        }

        const payload = {
            applicant_name: applicantName.value,
            email: email.value,
            phone: phone.value,
            cnic: cnic.value,
            position_name: positionInput.value,
            department_name: departmentInput.value,
            expected_salary: salaryValue || 0,
            experience_years: experienceValue || 0,
            qualification: qualification.value,
            notes: notes.value,
            pdf_file: uploadedPDFBase64, // ✅ Pass Base64 here
            status: "New",
            rating: 0,
            created_on: new Date().toISOString()
        };

        try {
            const res = await fetch(APP_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to submit application");

            alert("✅ Application submitted successfully!");
            applyForm.reset();
            uploadedPDFBase64 = null;
        } catch (err) {
            console.error(err);
            alert("❌ Failed to submit application!");
        }
    });
});
