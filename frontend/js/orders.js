const API_URL = "http://127.0.0.1:5000/orders";
const PRODUCTS_URL = "http://127.0.0.1:5000/products";


/* ===============================
   LOAD PRODUCTS INTO DROPDOWN
================================ */
function loadProducts() {

    const select =
        document.getElementById("product") ||
        document.getElementById("product_name");

    if (!select) return;

    fetch(PRODUCTS_URL)
        .then(res => res.json())
        .then(data => {

            select.innerHTML = '<option value="">Select Product</option>';

            data.forEach(p => {
                const option = document.createElement("option");
                option.value = p.name;
                option.textContent = p.name;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Product Load Error:", err);
        });
}

/* ===============================
   LOAD ORDERS TABLE
================================ */
function loadOrders() {

    fetch(API_URL)
        .then(res => res.json())
        .then(data => {

            let rows = "";

            const isAdminPage =
                window.location.pathname.includes("orders.html");

            let userOrders =
                JSON.parse(sessionStorage.getItem("userOrders")) || [];

            data.forEach(o => {

                // 👤 USER PANEL → show only session orders
                if (!isAdminPage) {
                    if (!userOrders.includes(o.id)) {
                        return;
                    }
                }

                let actionColumn = "";

                // 👨‍💼 ADMIN PANEL
                if (isAdminPage) {
                    actionColumn = `
                        <td>
                            <button class="danger" onclick="deleteOrder(${o.id})">
                                Delete
                            </button>
                        </td>
                    `;
                }

                rows += `
                    <tr>
                        <td>${o.id}</td>
                        <td>${o.user_name}</td>
                        <td>${o.phone}</td>
                        <td>${o.address}</td>
                        <td>${o.product_name}</td>
                        <td>${o.quantity}</td>
                        <td>${o.expected_date}</td>
                        <td>₹${o.total}</td>
                        ${actionColumn}
                    </tr>
                `;
            });

            const table = document.getElementById("ordersTable");
            if (table) table.innerHTML = rows;
        })
        .catch(err => {
            console.error("Order Load Error:", err);
        });
}


/* ===============================
   PLACE ORDER
================================ */
function addOrder() {

    const usernameField =
        document.getElementById("username") ||
        document.getElementById("user_name");

    const phoneField = document.getElementById("phone");
    const addressField = document.getElementById("address");

    const productField =
        document.getElementById("product") ||
        document.getElementById("product_name");

    const quantityField = document.getElementById("quantity");

    const dateField =
        document.getElementById("date") ||
        document.getElementById("expected_date");

    const orderData = {
        user_name: usernameField?.value,
        phone: phoneField?.value,
        address: addressField?.value,
        product_name: productField?.value,
        quantity: Number(quantityField?.value),
        expected_date: dateField?.value
    };

    if (!orderData.user_name ||
        !orderData.phone ||
        !orderData.address ||
        !orderData.product_name ||
        !orderData.quantity ||
        !orderData.expected_date) {

        alert("All fields are required!");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => {
                throw new Error(err.error);
            });
        }
        return res.json();
    })
    .then(data => {

    alert("Order placed successfully!\nTotal Amount: ₹" + data.total);

    if (!window.location.pathname.includes("orders.html")) {

        let userOrders =
            JSON.parse(sessionStorage.getItem("userOrders")) || [];

        userOrders.push(Number(data.id));   // 🔥 FORCE NUMBER

        sessionStorage.setItem(
            "userOrders",
            JSON.stringify(userOrders)
        );
    }

    loadOrders();

        // Clear form
        usernameField.value = "";
        phoneField.value = "";
        addressField.value = "";
        productField.value = "";
        quantityField.value = "";
        dateField.value = "";
    })
    .catch(err => {
        alert("Error: " + err.message);
    });
}


/* ===============================
   DELETE ORDER (ADMIN ONLY)
================================ */
function deleteOrder(id) {

    if (!window.location.pathname.includes("orders.html")) {
        return; // extra safety
    }

    if (!confirm("Delete this order?")) return;

    fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => {
            alert("Order deleted");
            loadOrders();
        })
        .catch(err => {
            console.error("Delete Error:", err);
        });
}


/* ===============================
   PAGE LOAD
================================ */
window.onload = function () {
    loadProducts();
    loadOrders();
};