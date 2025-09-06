document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Fake login for now (replace with backend/axios later)
  if (email && password) {
    localStorage.setItem("user", JSON.stringify({ email }));
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } else {
    alert("Please fill in both fields.");
  }
});
