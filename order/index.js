const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const JWT_SECRET = "my_super_secret_key";

// Docker service names
const USER_SERVICE_URL = "http://back:5000/api/users/sync";
const PRODUCT_SERVICE_URL = "http://product:8001/products";

/* ---------------- JWT MIDDLEWARE ---------------- */
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // store decoded info
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

/* ---------------- ORDER API ---------------- */
app.post("/orders", verifyJWT, async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
    // 1️⃣ REST call → USER SERVICE
    const userRes = await axios.get(
      `${USER_SERVICE_URL}/${user_id}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    // 2️⃣ REST call → PRODUCT SERVICE
    const productRes = await axios.get(
      `${PRODUCT_SERVICE_URL}/${product_id}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    const user = userRes.data;
    const product = productRes.data;

    // 3️⃣ Business logic
    const totalPrice = product.price * quantity;

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    if (user.userBalance < totalPrice) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 4️⃣ Final order response
    res.json({
      userName: user.userName,
      productName: product.productName,
      quantity,
      totalPrice,
      status: "ORDER_CONFIRMED"
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Service communication error" });
  }
});

app.listen(8000, () => {
  console.log("✅ Order Service running on port 8000");
});
