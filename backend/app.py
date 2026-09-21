from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "../frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)

DB_NAME = os.path.join(BASE_DIR, "handloom.db")


# ================= DATABASE =================
def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():
    conn = get_db()
    cur = conn.cursor()

    # USERS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
    )
    """)

    # PRODUCTS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        stock INTEGER,
        price REAL
    )
    """)

    # ORDERS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT,
        phone TEXT,
        address TEXT,
        product_id INTEGER,
        quantity INTEGER,
        expected_date TEXT,
        total REAL
    )
    """)

    # RAW MATERIALS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS rawmaterials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        quantity INTEGER
    )
    """)

    # WEAVERS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS weavers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        name TEXT,
        phone TEXT,
        gender TEXT,
        address TEXT
    )
    """)

    # PRODUCTION
    cur.execute("""
    CREATE TABLE IF NOT EXISTS production (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity INTEGER,
        date TEXT
    )
    """)

    # Insert default products (ONLY if empty)
    cur.execute("SELECT COUNT(*) FROM products")
    if cur.fetchone()[0] == 0:
        products = [
            ("Tissue Silk Saree", 50, 18500),
            ("Banarasi Silk Saree", 40, 17300),
            ("Soft Silk Saree", 30, 17500),
            ("Silk Shirt", 25, 5600),
            ("Linen Shirt", 20, 4000),
            ("Silk Salwar", 20, 8700),
            ("SilkCotton Salwar", 20, 5900),
            ("Kanchivaram Silk Saree", 20, 21600),
            ("Cotton Salwar", 20, 5070)
        ]
        cur.executemany(
            "INSERT INTO products (name, stock, price) VALUES (?,?,?)",
            products
        )

     # Insert default admin
    cur.execute("SELECT COUNT(*) FROM users WHERE username='admin'")
    if cur.fetchone()[0] == 0:
        cur.execute(
            "INSERT INTO users (username,password,role) VALUES (?,?,?)",
            ("admin", "admin", "admin")
        )

    # Insert default user
    cur.execute("SELECT COUNT(*) FROM users WHERE username='user'")
    if cur.fetchone()[0] == 0:
        cur.execute(
            "INSERT INTO users (username,password,role) VALUES (?,?,?)",
            ("user", "user", "user")
        )
    conn.commit()
    conn.close()


create_tables()

# ================= ROUTES =================

@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "login.html")

@app.route("/index.html")
def admin_page():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/user_index.html")
def user_page():
    return send_from_directory(FRONTEND_DIR, "user_index.html")



# ================= RAW MATERIALS =================

@app.route("/rawmaterials", methods=["GET"])
def get_materials():
    conn = get_db()
    rows = conn.execute("SELECT * FROM rawmaterials").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/rawmaterials", methods=["POST"])
def add_material():
    data = request.get_json()
    conn = get_db()
    conn.execute(
        "INSERT INTO rawmaterials (name, quantity) VALUES (?,?)",
        (data["name"], data["quantity"])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Material added"})


@app.route("/rawmaterials/<int:id>", methods=["DELETE"])
def delete_material(id):
    conn = get_db()
    conn.execute("DELETE FROM rawmaterials WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Deleted"})


@app.route("/rawmaterials/<int:id>", methods=["PUT"])
def edit_material(id):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        "UPDATE rawmaterials SET name=?, quantity=? WHERE id=?",
        (data["name"], data["quantity"], id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Updated"})


# ================= WEAVERS =================

@app.route("/weavers", methods=["GET"])
def get_weavers():
    conn = get_db()
    rows = conn.execute("SELECT * FROM weavers").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/weavers", methods=["POST"])
def add_weaver():
    data = request.get_json()
    conn = get_db()
    conn.execute("""
        INSERT INTO weavers (date, name, phone, gender, address)
        VALUES (?,?,?,?,?)
    """, (
        data.get("date"),
        data.get("name"),
        data.get("phone"),
        data.get("gender"),
        data.get("address")
    ))
    conn.commit()
    conn.close()
    return jsonify({"message": "Weaver added"})


@app.route("/weavers/<int:id>", methods=["DELETE"])
def delete_weaver(id):
    conn = get_db()
    conn.execute("DELETE FROM weavers WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Deleted"})


@app.route("/weavers/<int:id>", methods=["PUT"])
def edit_weaver(id):
    data = request.get_json()
    conn = get_db()
    conn.execute("""
        UPDATE weavers
        SET date=?, name=?, phone=?, gender=?, address=?
        WHERE id=?
    """, (
        data.get("date"),
        data.get("name"),
        data.get("phone"),
        data.get("gender"),
        data.get("address"),
        id
    ))
    conn.commit()
    conn.close()
    return jsonify({"message": "Updated"})


# ================= PRODUCTION =================

@app.route("/production", methods=["GET"])
def get_production():
    conn = get_db()#
    rows = conn.execute("""
        SELECT p.id, pr.name as product_name, p.quantity, p.date
        FROM production p
        JOIN products pr ON pr.id = p.product_id
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/production", methods=["POST"])
def add_production():
    data = request.get_json()
    conn = get_db()

    conn.execute("""
        INSERT INTO production (product_id, quantity, date)
        VALUES (?,?,?)
    """, (
        data["product_id"],
        data["quantity"],
        data["date"]
    ))

    # Increase stock automatically
    conn.execute(
        "UPDATE products SET stock = stock + ? WHERE id=?",
        (data["quantity"], data["product_id"])
    )

    conn.commit()
    conn.close()
    return jsonify({"message": "Production added"})


@app.route("/production/<int:id>", methods=["DELETE"])
def delete_production(id):
    conn = get_db()
    conn.execute("DELETE FROM production WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Deleted"})




# ================= INVENTORY APIs =================

@app.route("/inventory/daily-production", methods=["GET"])
def daily_production():
    conn = get_db()
    rows = conn.execute("""
        SELECT date, SUM(quantity) AS total_quantity
        FROM production
        GROUP BY date
        ORDER BY date
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/inventory/current-stock", methods=["GET"])
def current_stock():
    conn = get_db()
    rows = conn.execute("""
        SELECT name, stock FROM products ORDER BY name
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ================= PRODUCTS (existing) =================

@app.route("/products", methods=["GET"])
def view_products():
    conn = get_db()
    rows = conn.execute("SELECT * FROM products").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


 #--------------- ADD ORDER ----------------
@app.route("/orders", methods=["POST"])
def add_order():
    try:
        data = request.get_json()

        user_name = data.get("user_name")
        phone = data.get("phone")
        address = data.get("address")
        product_name = data.get("product_name")
        quantity = int(data.get("quantity"))
        expected_date = data.get("expected_date")

        if not all([user_name, phone, address, product_name, quantity, expected_date]):
            return jsonify({"error": "All fields required"}), 400

        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            "SELECT id, price, stock FROM products WHERE name=?",
            (product_name,)
        )
        product = cur.fetchone()

        if not product:
            conn.close()
            return jsonify({"error": "Product not found"}), 400

        if quantity > product["stock"]:
            conn.close()
            return jsonify({
                "error": "Insufficient stock",
                "available_stock": product["stock"]
            }), 400

        total = product["price"] * quantity

        cur.execute("""
            INSERT INTO orders
            (user_name, phone, address, product_id, quantity, expected_date, total)
            VALUES (?,?,?,?,?,?,?)
        """, (
            user_name,
            phone,
            address,
            product["id"],
            quantity,
            expected_date,
            total
        ))

        order_id = cur.lastrowid   # ✅ IMPORTANT FIX

        cur.execute(
            "UPDATE products SET stock = stock - ? WHERE id=?",
            (quantity, product["id"])
        )

        conn.commit()
        conn.close()

        return jsonify({
            "message": "Order placed",
            "total": total,
            "id": order_id      # ✅ NOW ID IS RETURNED
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- VIEW ORDERS ----------------
@app.route("/orders", methods=["GET"])
def view_orders():
    conn = get_db()
    rows = conn.execute("""
        SELECT o.id,
               o.user_name,
               o.phone,
               o.address,
               p.name AS product_name,
               o.quantity,
               o.expected_date,
               o.total
        FROM orders o
        JOIN products p ON p.id = o.product_id
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ---------------- DELETE ORDER ----------------
@app.route("/orders/<int:id>", methods=["DELETE"])
def delete_order(id):
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT product_id, quantity FROM orders WHERE id=?", (id,))
        order = cur.fetchone()

        if not order:
            conn.close()
            return jsonify({"error": "Order not found"}), 404

        # Restore stock
        cur.execute(
            "UPDATE products SET stock = stock + ? WHERE id=?",
            (order["quantity"], order["product_id"])
        )

        # Delete order
        cur.execute("DELETE FROM orders WHERE id=?", (id,))

        conn.commit()
        conn.close()

        return jsonify({"message": "Order deleted"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    # ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        username = data.get("username")
        password = data.get("password")

        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            "SELECT * FROM users WHERE username=? AND password=?",
            (username, password)
        )
        user = cur.fetchone()
        conn.close()

        if user:
            return jsonify({
                "username": user["username"],
                "role": user["role"]
            })
        else:
            return jsonify({"error": "Invalid Login"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    




# ================= RUN =================

if __name__ == "__main__":
    app.run(debug=True)