const API_URL = "http://127.0.0.1:5000/weavers";

function loadWeavers() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            let rows = "";

            data.forEach(w => {
                rows += `
                    <tr>
                        <td>${w.id}</td>
                        <td>${w.date || "-"}</td>
                        <td>${w.name}</td>
                        <td>${w.phone}</td>
                        <td>${w.gender || "-"}</td>
                        <td>${w.address || "-"}</td>
                        <td>
                            <button onclick="editWeaver(${w.id})">Edit</button>
                            <button class="danger" onclick="deleteWeaver(${w.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });

            document.getElementById("weaversTable").innerHTML = rows;
        });
}

function addWeaver() {
    const date = document.getElementById("date").value;
    const name = document.getElementById("weaver_name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const gender = document.getElementById("gender").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!name || !phone) {
        alert("Weaver name and phone are required");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, name, phone, gender, address })
    })
    .then(res => res.json())
    .then(() => {
        loadWeavers();
    });

    document.getElementById("date").value = "";
    document.getElementById("weaver_name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("gender").value = "";
    document.getElementById("address").value = "";
}

function deleteWeaver(id) {
    if (!confirm("Delete this weaver?")) return;

    fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(() => loadWeavers());
}

function editWeaver(id) {
    const date = prompt("Enter date (YYYY-MM-DD):");
    const name = prompt("Enter new name:");
    const phone = prompt("Enter new phone:");
    const gender = prompt("Enter gender:");
    const address = prompt("Enter address:");

    if (!name || !phone) return;

    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, name, phone, gender, address })
    }).then(() => {
        loadWeavers();
    });
}

window.onload = loadWeavers;