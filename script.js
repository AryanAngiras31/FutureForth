// =======================
// AUTH SCREEN
// =======================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Fake login for now (replace with backend/axios later)
    if (email && password) {
      localStorage.setItem("user", JSON.stringify({ email }));
      alert("Login successful!");
      window.location.href = "listings.html";
    } else {
      alert("Please fill in both fields.");
    }
  });
}

// =======================
// PRODUCT LISTING FEED
// =======================

// Filter products by category
function filterCategory(category) {
  const products = document.querySelectorAll(".product-card");
  products.forEach(product => {
    if (category === "all" || product.dataset.category === category) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}

// Search products by title
function searchProducts() {
  const searchValue = document.getElementById("search").value.toLowerCase();
  const products = document.querySelectorAll(".product-card");
  products.forEach(product => {
    const title = product.querySelector("h3").textContent.toLowerCase();
    product.style.display = title.includes(searchValue) ? "block" : "none";
  });
}

// Add product placeholder
function addProduct() {
  alert("Add Product functionality will be implemented later!");
}
