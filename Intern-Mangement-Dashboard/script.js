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
        interns.filter(i => i.status === "Active").length;
    document.getElementById("completedCount").innerText =
        interns.filter(i => i.status === "Completed").length;
    document.getElementById("onHoldCount").innerText =
        interns.filter(i => i.status === "On Hold").length;
}

function renderInterns() {
    internContainer.innerHTML = "";

    const filter = filterStatus.value;
    const search = searchInput.value.toLowerCase();

    let filtered = interns.filter(intern =>
        (filter === "All" || intern.status === filter) &&
        intern.name.toLowerCase().includes(search)
    );

    filtered.forEach((intern, index) => {
        const card = document.createElement("div");
        card.classList.add("intern-card");

        card.innerHTML = `
            <h3>${intern.name}</h3>
            <p><strong>Email:</strong> ${intern.email}</p>
            <p><strong>Domain:</strong> ${intern.domain}</p>
            <p><strong>Status:</strong> ${intern.status}</p>
            <div class="card-buttons">
                <button onclick="editIntern(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteIntern(${index})">Delete</button>
            </div>
        `;

        internContainer.appendChild(card);
    });

    updateStats();
}

function deleteIntern(index) {
    interns.splice(index, 1);
    saveToLocalStorage();
    renderInterns();
}

function editIntern(index) {
    const intern = interns[index];

    document.getElementById("name").value = intern.name;
    document.getElementById("email").value = intern.email;
    document.getElementById("domain").value = intern.domain;
    document.getElementById("status").value = intern.status;

    editIndexField.value = index;
}

internForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const domain = document.getElementById("domain").value;
    const status = document.getElementById("status").value;

    const editIndex = editIndexField.value;

    if (editIndex === "") {
        interns.push({ name, email, domain, status });
    } else {
        interns[editIndex] = { name, email, domain, status };
        editIndexField.value = "";
    }

    saveToLocalStorage();
    internForm.reset();
    renderInterns();
});

filterStatus.addEventListener("change", renderInterns);
searchInput.addEventListener("input", renderInterns);

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});


function renderInterns() {
    internContainer.innerHTML = "";

    const filter = filterStatus.value;
    const search = searchInput.value.toLowerCase();

    let filtered = interns.filter(intern =>
        (filter === "All" || intern.status === filter) &&
        intern.name.toLowerCase().includes(search)
    );

    // Pagination Logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedInterns = filtered.slice(start, end);

    paginatedInterns.forEach((intern, index) => {
        const card = document.createElement("div");
        card.classList.add("intern-card");

        card.innerHTML = `
            <h3>${intern.name}</h3>
            <p><strong>Email:</strong> ${intern.email}</p>
            <p><strong>Domain:</strong> ${intern.domain}</p>
            <p><strong>Status:</strong> ${intern.status}</p>
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



prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderInterns();
    }
});

nextPageBtn.addEventListener("click", () => {
    const filteredLength = interns.filter(intern =>
        (filterStatus.value === "All" || intern.status === filterStatus.value) &&
        intern.name.toLowerCase().includes(searchInput.value.toLowerCase())
    ).length;

    const totalPages = Math.ceil(filteredLength / itemsPerPage);

    if (currentPage < totalPages) {
        currentPage++;
        renderInterns();
    }
});


exportBtn.addEventListener("click", () => {

    if (interns.length === 0) {
        alert("No interns to export!");
        return;
    }

    let csvContent = "Name,Email,Domain,Status\n";

    interns.forEach(intern => {
        csvContent += `${intern.name},${intern.email},${intern.domain},${intern.status}\n`;
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
