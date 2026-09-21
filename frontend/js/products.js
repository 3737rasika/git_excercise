const API_URL = "http://127.0.0.1:5000/products";

function loadProducts() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            let rows = "";
            data.forEach(p => {
                rows += `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.name}</td>
                        <td>${p.stock}</td>
                        <td>${p.price}</td>
                        <td>
                            <button onclick="editProduct(${p.id}, '${p.name}', ${p.stock}, ${p.price})">Edit</button>
                            <button class="danger" onclick="deleteProduct(${p.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
            document.getElementById("productTable").innerHTML = rows;
        });
}

function addProduct() {
    const name = document.getElementById("name").value.trim();
    const stock = document.getElementById("stock").value;
    const price = document.getElementById("price").value;

    if (!name || !stock || !price) {
        alert("All fields are required");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, stock, price })
    }).then(() => {
        loadProducts();
        document.getElementById("name").value = "";
        document.getElementById("stock").value = "";
        document.getElementById("price").value = "";
    });
}

function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(() => loadProducts());
}

function editProduct(id, name, stock, price) {
    const newName = prompt("Product Name:", name);
    const newStock = prompt("Stock:", stock);
    const newPrice = prompt("Price:", price);

    if (!newName || !newStock || !newPrice) return;

    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: newName,
            stock: newStock,
            price: newPrice
        })
    }).then(() => loadProducts());
}

window.onload = loadProducts;