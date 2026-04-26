const API_BASE = "http://localhost:5003/api/auth";

let currentUser = null;
let authToken = null;

function loadAuthState() {
  authToken = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("authUser");

  if (userStr) {
    currentUser = JSON.parse(userStr);
  }

  return !!authToken && !!currentUser;
}

function saveAuthState(token, user) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("authUser", JSON.stringify(user));
  authToken = token;
  currentUser = user;
}

function clearAuthState() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  authToken = null;
  currentUser = null;
}

function isLoggedIn() {
  return !!currentUser;
}

function getUser() {
  return currentUser;
}

function getUserRole() {
  return currentUser?.role || null;
}

function getAuthHeader() {
  return authToken ? `Bearer ${authToken}` : "";
}

function updateNavbar() {
  const navContainer = document.getElementById("navbarLinks");
  if (!navContainer) return;

  // Hide navbar on login page
  if (window.location.pathname.includes("login.html")) {
    const nav = document.getElementById("loginNavbar");
    if (nav) nav.style.display = "none";
    return;
  }

  const role = getUserRole();
  const loggedIn = isLoggedIn();

  if (!loggedIn) {
    navContainer.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
      <li class="nav-item"><a class="nav-link" href="services.html">Services</a></li>
      <li class="nav-item"><a class="nav-link" href="login.html">Login/Signup</a></li>
    `;
  } else {
    let navHtml = `
      <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
      <li class="nav-item"><a class="nav-link" href="services.html">Services</a></li>
      <li class="nav-item"><a class="nav-link" href="booking.html">Booking</a></li>
      <li class="nav-item"><a class="nav-link" href="my-bookings.html">My Bookings</a></li>
    `;

    if (role === 'admin') {
      navHtml += `<li class="nav-item"><a class="nav-link" href="admin.html">Admin</a></li>`;
    }

    navHtml += `<li class="nav-item"><a class="nav-link" href="#" id="logoutBtn">Logout</a></li>`;
    navContainer.innerHTML = navHtml;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    }
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

async function login(email, password) {
  const data = await apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password: String(password).trim()
    })
  });

  saveAuthState(data.token, data.user);
  updateNavbar();
  return data.user;
}

async function register(name, email, password, role = "user") {
  const data = await apiRequest("/register", {
    method: "POST",
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: String(password).trim(),
      role
    })
  });

  saveAuthState(data.token, data.user);
  updateNavbar();
  return data.user;
}

async function getMe() {
  const user = await apiRequest("/me", { method: "GET" });
  currentUser = user;
  saveAuthState(authToken, user);
  return user;
}

function logout() {
  clearAuthState();
  updateNavbar();
  window.location.replace("login.html");
}

async function initAuth() {
  loadAuthState();
  updateNavbar();

  // Do not do protected-page redirects on login page
  if (window.location.pathname.includes("login.html")) {
    return;
  }

  // Validate token if present (skip for fake admin token)
  if (isLoggedIn() && authToken !== 'admin-fake-token') {
    try {
      await getMe();
    } catch (err) {
      console.error("Token invalid, logging out:", err);
      logout();
      return;
    }
  }

  // Protected page checks
  if (document.body.classList.contains("protected") && !isLoggedIn()) {
    window.location.replace("login.html");
    return;
  }

  if (
    document.body.classList.contains("admin-protected") &&
    getUserRole() !== "admin"
  ) {
    alert("Access denied. Admin only.");
    window.location.replace("index.html");
  }
}

function showAlert(message, type = "danger") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);
}

window.Auth = {
  login,
  register,
  logout,
  getUser,
  isLoggedIn,
  getUserRole,
  initAuth,
  updateNavbar,
  showAlert
};
