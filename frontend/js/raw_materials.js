const API_URL = "http://127.0.0.1:5000/rawmaterials";

function addMaterial() {
    const name = document.getElementById("name").value.trim();
    const quantity = document.getElementById("quantity").value.trim();

    if (!name || !quantity) {
        alert("Please enter all fields");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        document.getElementById("name").value = "";
        document.getElementById("quantity").value = "";
        loadMaterials();
    });
}

function loadMaterials() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            const table = document.getElementById("materialTable");
            table.innerHTML = "";

            data.forEach(row => {
                table.innerHTML += `
                    <tr>
                        <td>${row.id}</td>
                        <td>${row.name}</td>
                        <td>${row.quantity}</td>
                        <td>
                            <button onclick="editMaterial(${row.id}, '${row.name}', ${row.quantity})">Edit</button>
                            <button onclick="deleteMaterial(${row.id})" style="background:red;">Delete</button>
                        </td>
                    </tr>
                `;
            });
        });
}

function deleteMaterial(id) {
    if (!confirm("Are you sure you want to delete this material?")) return;

    fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadMaterials();
    });
}

function editMaterial(id, oldName, oldQuantity) {
    const name = prompt("Enter new material name:", oldName);
    const quantity = prompt("Enter new quantity:", oldQuantity);

    if (!name || !quantity) return;

    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadMaterials();
    });
}

loadMaterials();