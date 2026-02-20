const internForm = document.getElementById("internForm");
const internContainer = document.getElementById("internContainer");
const filterStatus = document.getElementById("filterStatus");

let interns = JSON.parse(localStorage.getItem("interns")) || [];

function saveToLocalStorage() {
    localStorage.setItem("interns", JSON.stringify(interns));
}

function renderInterns(filter = "All") {
    internContainer.innerHTML = "";

    const filteredInterns = filter === "All"
        ? interns
        : interns.filter(intern => intern.status === filter);

    filteredInterns.forEach((intern, index) => {
        const card = document.createElement("div");
        card.classList.add("intern-card");

        card.innerHTML = `
            <h3>${intern.name}</h3>
            <p><strong>Email:</strong> ${intern.email}</p>
            <p><strong>Domain:</strong> ${intern.domain}</p>
            <p class="status"><strong>Status:</strong> ${intern.status}</p>
            <button class="delete-btn" onclick="deleteIntern(${index})">Delete</button>
        `;

        internContainer.appendChild(card);
    });
}

function deleteIntern(index) {
    interns.splice(index, 1);
    saveToLocalStorage();
    renderInterns(filterStatus.value);
}

internForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const domain = document.getElementById("domain").value;
    const status = document.getElementById("status").value;

    const newIntern = { name, email, domain, status };

    interns.push(newIntern);
    saveToLocalStorage();
    renderInterns();

    internForm.reset();
});

filterStatus.addEventListener("change", function() {
    renderInterns(this.value);
});

renderInterns();