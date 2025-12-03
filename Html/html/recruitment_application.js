document.addEventListener("DOMContentLoaded", async () => {
    const JOB_API = "https://localhost:7228/api/jobposition";
    const APP_API = "https://localhost:7228/api/RecruitmentApplicant";

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

    // 1️⃣ Get position from query string
    const urlParams = new URLSearchParams(window.location.search);
    const positionName = urlParams.get("position");

    if (!positionName) {
        messageDiv.textContent = "❌ No position specified!";
        messageDiv.classList.remove("hidden");
        return;
    }

    // 2️⃣ Fetch positions and applications
    let jobPositions = [];
    let applications = [];

    try {
        const jobRes = await fetch(JOB_API);
        jobPositions = await jobRes.json();

        const appRes = await fetch(APP_API);
        applications = await appRes.json();
    } catch (err) {
        console.error("Failed to fetch data:", err);
        messageDiv.textContent = "❌ Failed to load data!";
        messageDiv.classList.remove("hidden");
        return;
    }

    // 3️⃣ Find position object
    const position = jobPositions.find(j => j.position_name === positionName);

    if (!position) {
        messageDiv.textContent = "❌ Position not found!";
        messageDiv.classList.remove("hidden");
        return;
    }

    // 4️⃣ Count current applications
    const currentApplications = applications.filter(a => a.position_name === positionName).length;

    if (currentApplications >= position.no_of_employees_required) {
        messageDiv.textContent = "❌ Recruitment link expired. Maximum applicants reached.";
        messageDiv.classList.remove("hidden");
        return;
    }

    // 5️⃣ Show form
    formContainer.classList.remove("hidden");
    positionInput.value = position.position_name;
    departmentInput.value = position.department_name;

    // 6️⃣ Submit application
    applyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            applicant_name: applicantName.value,
            email: email.value,
            phone: phone.value,
            cnic: cnic.value,
            position_name: positionInput.value,
            department_name: departmentInput.value,
            expected_salary: parseFloat(expectedSalary.value) || 0,
            experience_years: parseInt(experienceYears.value) || 0,
            qualification: qualification.value,
            notes: notes.value,
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
        } catch (err) {
            console.error(err);
            alert("❌ Failed to submit application!");
        }
    });
});
