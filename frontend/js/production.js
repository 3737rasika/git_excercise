const API_URL = "http://127.0.0.1:5000/production";

function loadProduction() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            let rows = "";
            data.forEach(p => {
                rows += `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.product_name}</td>
                        <td>${p.quantity}</td>
                        <td>${p.date}</td>
                        <td>
                            <button class="danger" onclick="deleteProduction(${p.id})">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            });
            document.getElementById("productionTable").innerHTML = rows;
        });
}

function addProduction() {
    const product_id = document.getElementById("product_id").value;
    const quantity = document.getElementById("quantity").value;
    const date = document.getElementById("date").value;

    if (!product_id || !quantity || !date) {
        alert("All fields are required");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id, quantity, date })
    }).then(() => {
        loadProduction();
        document.getElementById("product_id").value = "";
        document.getElementById("quantity").value = "";
        document.getElementById("date").value = "";
    });
}

function deleteProduction(id) {
    if (!confirm("Delete this production entry?")) return;

    fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(() => loadProduction());
}

window.onload = loadProduction;