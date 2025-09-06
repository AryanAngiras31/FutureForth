// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Utility Functions
function showMessage(message, type = 'info') {
  const messageEl = document.getElementById('message');
  const messageIcon = document.getElementById('message-icon');
  const messageText = document.getElementById('message-text');
  
  if (messageEl) {
    // Set icon based on message type
    if (messageIcon) {
      if (type === 'success') {
        messageIcon.innerHTML = '✅';
      } else if (type === 'error') {
        messageIcon.innerHTML = '❌';
      } else {
        messageIcon.innerHTML = 'ℹ️';
      }
    }
    
    // Set message text
    if (messageText) {
      messageText.textContent = message;
    } else {
      messageEl.textContent = message;
    }
    
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }
}

function getAuthToken() {
  return localStorage.getItem('authToken');
}

function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

function removeAuthToken() {
  localStorage.removeItem('authToken');
}

function isAuthenticated() {
  return !!getAuthToken();
}

function redirectToLogin() {
  window.location.href = 'login.html';
}

// API Functions
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    console.log('Making API request to:', url);
    console.log('Headers:', finalOptions.headers);
    
    const response = await fetch(url, finalOptions);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid response from server');
    }
    
    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication Functions
async function registerUser(userData) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function getUserProfile() {
  try {
    const response = await apiRequest('/auth/profile');
    return response;
  } catch (error) {
    throw error;
  }
}

// Product Functions
async function getProducts(category = '', search = '') {
  try {
    let endpoint = '/products';
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (search) params.append('keyword', search);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const response = await apiRequest(endpoint);
    return response;
  } catch (error) {
    throw error;
  }
}

async function addProduct(productData) {
  try {
    const response = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function getMyProducts() {
  try {
    const response = await apiRequest('/products/my-products');
    return response;
  } catch (error) {
    throw error;
  }
}

// Cart Functions
async function getCartItems() {
  try {
    const response = await apiRequest('/cart');
    return response;
  } catch (error) {
    throw error;
  }
}

async function addToCart(productId, quantity = 1) {
  try {
    const response = await apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity })
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function removeFromCart(productId) {
  try {
    const response = await apiRequest(`/cart/${productId}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function updateCartQuantity(cartId, quantity) {
  try {
    const response = await apiRequest(`/cart/${cartId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    return response;
  } catch (error) {
    throw error;
  }
}

// UI Functions
function updateCartCount() {
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCountEl.textContent = cart.length;
  }
}

function updateUserWelcome() {
  const userWelcomeEl = document.getElementById('user-welcome');
  if (userWelcomeEl) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    userWelcomeEl.textContent = `Welcome, ${user.username || 'User'}`;
  }
}

function renderProductCard(product) {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${product.image_url}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      </div>
      <div class="product-info">
        <h3>${product.title}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-meta">
          <span class="product-category">${product.category_name || 'Other'}</span>
          <span class="product-price">$${parseFloat(product.price).toFixed(2)}</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderCartItem(item) {
  return `
    <div class="cart-item" data-cart-id="${item.id}">
      <div class="item-image">
        <img src="${item.image_url}" alt="${item.title}">
      </div>
      <div class="item-details">
        <h3>${item.title}</h3>
        <p class="item-price">$${parseFloat(item.price).toFixed(2)}</p>
      </div>
      <div class="item-quantity">
        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
      </div>
      <div class="item-total">
        $${(parseFloat(item.price) * item.quantity).toFixed(2)}
      </div>
      <div class="item-actions">
        <button class="btn btn-danger" onclick="removeFromCartItem(${item.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status
  if (window.location.pathname.includes('dashboard') || 
      window.location.pathname.includes('products') || 
      window.location.pathname.includes('add-product') || 
      window.location.pathname.includes('cart')) {
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }
    updateUserWelcome();
  }

  // Update cart count
  updateCartCount();

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await loginUser(email, password);
        console.log('Login response:', response);
        
        if (!response.access_token) {
          throw new Error('No access token received');
        }
        
        setAuthToken(response.access_token);
        console.log('Token stored:', response.access_token);
        
        // Get user profile
        try {
          const profile = await getUserProfile();
          console.log('Profile response:', profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
          // Still proceed to dashboard even if profile fails
          localStorage.setItem('user', JSON.stringify({ email, username: 'User' }));
        }
        
        showMessage('Login successful!', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message, 'error');
      }
    });
  }

  // Signup form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    // Add real-time validation
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Username validation
    usernameInput.addEventListener('input', function() {
      validateUsername(this.value);
    });
    
    // Email validation
    emailInput.addEventListener('input', function() {
      validateEmail(this.value);
    });
    
    // Password validation
    passwordInput.addEventListener('input', function() {
      validatePassword(this.value);
      // Re-validate confirm password if it has a value
      if (confirmPasswordInput.value) {
        validateConfirmPassword(confirmPasswordInput.value, this.value);
      }
    });
    
    // Confirm password validation
    confirmPasswordInput.addEventListener('input', function() {
      validateConfirmPassword(this.value, passwordInput.value);
    });
    
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      
      // Validate all fields
      const isUsernameValid = validateUsername(username);
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);
      const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);
      
      if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
        showMessage('Please fix the errors above', 'error');
        return;
      }
      
      const signupBtn = document.getElementById('signup-btn');
      signupBtn.disabled = true;
      signupBtn.textContent = 'Creating Account...';
      
      try {
        await registerUser({ username, email, password });
        showMessage('Registration successful! Please login.', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } catch (error) {
        console.error('Signup error:', error);
        showMessage(error.message || 'Registration failed. Please try again.', 'error');
      } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Sign Up';
      }
    });
  }

  // Add product form
  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
      const formData = new FormData(addProductForm);
      const productData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        image_url: formData.get('image_url')
      };
      
      try {
        await addProduct(productData);
        showMessage('Product added successfully!', 'success');
        addProductForm.reset();
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 2000);
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      removeAuthToken();
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      window.location.href = 'index.html';
    });
  }

  // Add to cart buttons
  document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
      const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
      const productId = button.dataset.productId;
      
      try {
        await addToCart(productId);
        showMessage('Product added to cart!', 'success');
        updateCartCount();
      } catch (error) {
        showMessage(error.message, 'error');
      }
    }
  });

  // Load products on products page
  if (window.location.pathname.includes('products.html')) {
    loadProducts();
  }

  // Load cart on cart page
  if (window.location.pathname.includes('cart.html')) {
    loadCart();
  }

  // Load listings on listings page
  if (window.location.pathname.includes('listings.html')) {
    loadListings();
  }

  // Load dashboard data on dashboard page
  if (window.location.pathname.includes('dashboard.html')) {
    loadDashboard();
  }

  // Load featured products on index page
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    loadFeaturedProducts();
  }
});

// Load functions
async function loadProducts() {
  const container = document.getElementById('products-container');
  const loading = document.getElementById('loading');
  const noProducts = document.getElementById('no-products');
  
  if (loading) loading.style.display = 'block';
  
  try {
    const products = await getProducts();
    
    if (loading) loading.style.display = 'none';
    
    if (products.length === 0) {
      if (noProducts) noProducts.style.display = 'block';
      return;
    }
    
    if (container) {
      container.innerHTML = products.map(renderProductCard).join('');
    }
  } catch (error) {
    if (loading) loading.style.display = 'none';
    showMessage('Failed to load products', 'error');
  }
}

async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');
  
  try {
    const products = await getProducts();
    const featuredProducts = products.slice(0, 6); // Show first 6 products
    
    if (container) {
      container.innerHTML = featuredProducts.map(renderProductCard).join('');
    }
  } catch (error) {
    console.error('Failed to load featured products:', error);
  }
}

async function loadCart() {
  const container = document.getElementById('cart-items');
  const emptyCart = document.getElementById('empty-cart');
  const cartSummary = document.getElementById('cart-summary');
  
  try {
    const cartItems = await getCartItems();
    
    if (cartItems.length === 0) {
      if (emptyCart) emptyCart.style.display = 'block';
      if (cartSummary) cartSummary.style.display = 'none';
      return;
    }
    
    if (container) {
      container.innerHTML = cartItems.map(renderCartItem).join('');
    }
    
    updateCartSummary(cartItems);
  } catch (error) {
    showMessage('Failed to load cart', 'error');
  }
}

function updateCartSummary(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  if (checkoutBtn) checkoutBtn.disabled = false;
}

async function loadListings() {
  const container = document.getElementById('listings-container');
  const loading = document.getElementById('loading');
  const noListings = document.getElementById('no-listings');
  
  if (loading) loading.style.display = 'block';
  
  try {
    const products = await getMyProducts();
    
    if (loading) loading.style.display = 'none';
    
    if (products.length === 0) {
      if (noListings) noListings.style.display = 'block';
      return;
    }
    
    if (container) {
      container.innerHTML = products.map(renderProductCard).join('');
    }
  } catch (error) {
    if (loading) loading.style.display = 'none';
    showMessage('Failed to load listings', 'error');
  }
}

async function loadDashboard() {
  try {
    // Load user's products
    const products = await getMyProducts();
    const productsCountEl = document.getElementById('products-count');
    if (productsCountEl) {
      productsCountEl.textContent = products.length;
    }
    
    // Load user's products in the recent section
    const userProductsEl = document.getElementById('user-products');
    if (userProductsEl && products.length > 0) {
      const recentProducts = products.slice(0, 6); // Show first 6 products
      userProductsEl.innerHTML = recentProducts.map(renderProductCard).join('');
    }
    
    // Load cart items count
    const cartItems = await getCartItems();
    const cartItemsEl = document.getElementById('cart-items');
    if (cartItemsEl) {
      cartItemsEl.textContent = cartItems.length;
    }
    
    // Calculate total sales (simplified - would need purchase history)
    const totalSalesEl = document.getElementById('total-sales');
    if (totalSalesEl) {
      totalSalesEl.textContent = '$0.00'; // Placeholder
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

// Validation Functions
function validateUsername(username) {
  const errorEl = document.getElementById('username-error');
  const inputEl = document.getElementById('username');
  
  if (!username) {
    showFieldError(inputEl, errorEl, 'Username is required');
    return false;
  }
  
  if (username.length < 3) {
    showFieldError(inputEl, errorEl, 'Username must be at least 3 characters');
    return false;
  }
  
  if (username.length > 50) {
    showFieldError(inputEl, errorEl, 'Username must be less than 50 characters');
    return false;
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showFieldError(inputEl, errorEl, 'Username can only contain letters, numbers, and underscores');
    return false;
  }
  
  showFieldSuccess(inputEl, errorEl);
  return true;
}

function validateEmail(email) {
  const errorEl = document.getElementById('email-error');
  const inputEl = document.getElementById('email');
  
  if (!email) {
    showFieldError(inputEl, errorEl, 'Email is required');
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFieldError(inputEl, errorEl, 'Please enter a valid email address');
    return false;
  }
  
  showFieldSuccess(inputEl, errorEl);
  return true;
}

function validatePassword(password) {
  const errorEl = document.getElementById('password-error');
  const inputEl = document.getElementById('password');
  
  if (!password) {
    showFieldError(inputEl, errorEl, 'Password is required');
    return false;
  }
  
  if (password.length < 6) {
    showFieldError(inputEl, errorEl, 'Password must be at least 6 characters');
    return false;
  }
  
  if (password.length > 100) {
    showFieldError(inputEl, errorEl, 'Password must be less than 100 characters');
    return false;
  }
  
  showFieldSuccess(inputEl, errorEl);
  return true;
}

function validateConfirmPassword(confirmPassword, password) {
  const errorEl = document.getElementById('confirm-password-error');
  const inputEl = document.getElementById('confirmPassword');
  
  if (!confirmPassword) {
    showFieldError(inputEl, errorEl, 'Please confirm your password');
    return false;
  }
  
  if (confirmPassword !== password) {
    showFieldError(inputEl, errorEl, 'Passwords do not match');
    return false;
  }
  
  showFieldSuccess(inputEl, errorEl);
  return true;
}

function showFieldError(inputEl, errorEl, message) {
  inputEl.classList.remove('success');
  inputEl.classList.add('error');
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

function showFieldSuccess(inputEl, errorEl) {
  inputEl.classList.remove('error');
  inputEl.classList.add('success');
  errorEl.classList.remove('show');
}

// Global functions for cart operations
async function updateQuantity(cartId, newQuantity) {
  if (newQuantity <= 0) {
    await removeFromCart(cartId);
    return;
  }
  
  try {
    await updateCartQuantity(cartId, newQuantity);
    loadCart();
    updateCartCount();
  } catch (error) {
    showMessage('Failed to update quantity', 'error');
  }
}

async function removeFromCartItem(cartId) {
  try {
    await removeFromCart(cartId);
    loadCart();
    updateCartCount();
    showMessage('Item removed from cart', 'success');
  } catch (error) {
    showMessage('Failed to remove item', 'error');
  }
}