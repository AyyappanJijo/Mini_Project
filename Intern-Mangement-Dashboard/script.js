const internForm = document.getElementById("internForm");
const internContainer = document.getElementById("internContainer");
const filterStatus = document.getElementById("filterStatus");
const searchInput = document.getElementById("searchInput");
const editIndexField = document.getElementById("editIndex");
const darkModeToggle = document.getElementById("darkModeToggle");

const exportBtn = document.getElementById("exportBtn");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

let currentPage = 1;
const itemsPerPage = 4;

let interns = JSON.parse(localStorage.getItem("interns")) || [];

function saveToLocalStorage() {
    localStorage.setItem("interns", JSON.stringify(interns));
}

function updateStats() {
    document.getElementById("totalCount").innerText = interns.length;
    document.getElementById("activeCount").innerText =
        interns.filter(i => i.status === "ACTIVE").length;
    document.getElementById("completedCount").innerText =
        interns.filter(i => i.status === "COMPLETED").length;
    document.getElementById("onHoldCount").innerText =
        interns.filter(i => i.status === "DROPPED").length;
}

function renderInterns() {
    internContainer.innerHTML = "";

    const filter = filterStatus.value;
    const search = searchInput.value.toLowerCase();

    let filtered = interns.filter(intern =>
        (filter === "All" || intern.status === filter) &&
        (intern.internName.toLowerCase().includes(search) ||
         intern.internId.toLowerCase().includes(search))
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedInterns = filtered.slice(start, end);

    paginatedInterns.forEach((intern, index) => {
        const card = document.createElement("div");
        card.classList.add("intern-card");

        card.innerHTML = `
            <h3>${intern.internName} (${intern.internId})</h3>
            <p><strong>Email:</strong> ${intern.email}</p>
            <p><strong>Phone:</strong> ${intern.phoneNumber}</p>
            <p><strong>College:</strong> ${intern.college}</p>
            <p><strong>Domain:</strong> ${intern.domain}</p>
            <p><strong>Start:</strong> ${intern.internshipStartDate}</p>
            <p><strong>End:</strong> ${intern.internshipEndDate}</p>
            <p><strong>Status:</strong> 
            <span class="status-${intern.status.toLowerCase()}">
            ${intern.status}
            </span>
            </p>
            <div class="card-buttons">
                <button onclick="editIntern(${start + index})">Edit</button>
                <button class="delete-btn" onclick="deleteIntern(${start + index})">Delete</button>
            </div>
        `;

        internContainer.appendChild(card);
    });

    pageInfo.innerText = `Page ${currentPage} of ${totalPages || 1}`;

    updateStats();
}

function deleteIntern(index) {
    interns.splice(index, 1);
    saveToLocalStorage();
    renderInterns();
}

function editIntern(index) {
    const intern = interns[index];

    document.getElementById("internId").value = intern.internId;
    document.getElementById("internName").value = intern.internName;
    document.getElementById("email").value = intern.email;
    document.getElementById("phoneNumber").value = intern.phoneNumber;
    document.getElementById("college").value = intern.college;
    document.getElementById("domain").value = intern.domain;
    document.getElementById("internshipStartDate").value = intern.internshipStartDate;
    document.getElementById("internshipEndDate").value = intern.internshipEndDate;
    document.getElementById("status").value = intern.status;

    editIndexField.value = index;
}

internForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const internData = {
        internId: document.getElementById("internId").value,
        internName: document.getElementById("internName").value,
        email: document.getElementById("email").value,
        phoneNumber: document.getElementById("phoneNumber").value,
        college: document.getElementById("college").value,
        domain: document.getElementById("domain").value,
        internshipStartDate: document.getElementById("internshipStartDate").value,
        internshipEndDate: document.getElementById("internshipEndDate").value,
        status: document.getElementById("status").value
    };

    const editIndex = editIndexField.value;

    if (editIndex === "") {
        interns.push(internData);
    } else {
        interns[editIndex] = internData;
        editIndexField.value = "";
    }

    saveToLocalStorage();
    internForm.reset();
    renderInterns();
});

filterStatus.addEventListener("change", () => {
    currentPage = 1;
    renderInterns();
});

searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderInterns();
});

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderInterns();
    }
});

nextPageBtn.addEventListener("click", () => {
    currentPage++;
    renderInterns();
});

exportBtn.addEventListener("click", () => {
    if (interns.length === 0) {
        alert("No interns to export!");
        return;
    }

    let csvContent =
        "Intern ID,Intern Name,Email,Phone,College,Domain,Start Date,End Date,Status\n";

    interns.forEach(intern => {
        csvContent += `${intern.internId},${intern.internName},${intern.email},${intern.phoneNumber},${intern.college},${intern.domain},${intern.internshipStartDate},${intern.internshipEndDate},${intern.status}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "interns_data.csv";
    a.click();

    window.URL.revokeObjectURL(url);
});

renderInterns();
