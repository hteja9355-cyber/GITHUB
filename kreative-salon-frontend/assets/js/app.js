let services = [];

async function fetchServices() {
  try {
    const res = await fetch("http://localhost:5003/api/services");
    if (!res.ok) throw new Error("Failed to fetch services");
    const data = await res.json();
    
    // Map the backend data to the format expected by the frontend
    services = data.map(s => ({
      id: s._id,
      name: s.name,
      price: s.price,
      duration: `${s.durationMinutes} min`,
      description: s.description
    }));
  } catch (error) {
    console.error("Error fetching services:", error);
  }
}

async function addService(serviceData) {
  try {
    const res = await fetch("http://localhost:5003/api/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("authToken") ? `Bearer ${localStorage.getItem("authToken")}` : ""
      },
      body: JSON.stringify(serviceData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to add service");
    }

    return await res.json();
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
}

function renderServiceCards(targetId, data) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = data.map(service => `
    <div class="col-md-6 col-lg-4">
      <div class="card service-card h-100">
        <div class="card-body p-4">
          <span class="badge badge-soft mb-2">${service.duration}</span>
          <h4 class="card-title fw-bold">${service.name}</h4>
          <p class="text-muted mb-3">Professional service for a polished look.</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold text-primary fs-5">₹${service.price}</span>
            <a href="booking.html" class="btn btn-outline-primary btn-sm">Book</a>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function renderCheckboxes() {
  const container = document.getElementById("serviceCheckboxes");
  if (!container) return;

  container.innerHTML = services.map(service => `
    <div class="col-md-6">
      <label class="form-check border rounded-3 p-3 d-flex justify-content-between align-items-center">
        <span>
          <input class="form-check-input me-2 service-check" type="checkbox" value="${service.id}">
          ${service.name}
        </span>
        <strong>₹${service.price}</strong>
      </label>
    </div>
  `).join("");

  document.querySelectorAll(".service-check").forEach(input => {
    input.addEventListener("change", updateBookingTotal);
  });
}

function updateBookingTotal() {
  const selected = [...document.querySelectorAll(".service-check:checked")].map(el => el.value);
  const total = services
    .filter(s => selected.includes(String(s.id)))
    .reduce((sum, s) => sum + s.price, 0);

  const totalEl = document.getElementById("bookingTotal");
  if (totalEl) totalEl.textContent = `₹${total}`;
}

async function renderAdmin() {
  const table = document.getElementById("adminBookingsTable");
  const serviceList = document.getElementById("adminServiceList");
  const totalBookingsEl = document.getElementById("adminTotalBookings");
  const todayBookingsEl = document.getElementById("adminTodayBookings");
  const totalRevenueEl = document.getElementById("adminTotalRevenue");

  if (!table || !serviceList || !totalBookingsEl || !todayBookingsEl || !totalRevenueEl) return;

  try {
    // Load stats
    const statsRes = await fetch("http://localhost:5003/api/bookings/admin/stats", {
      cache: "no-store",
      headers: {
        "Authorization": localStorage.getItem("authToken") ? `Bearer ${localStorage.getItem("authToken")}` : ""
      }
    });
    const stats = await statsRes.json();
    totalBookingsEl.textContent = stats.totalBookings || 0;
    todayBookingsEl.textContent = stats.todayBookings || 0;
    totalRevenueEl.textContent = `₹${stats.expectedRevenue || 0}`;

    // Load recent bookings
    const recentRes = await fetch("http://localhost:5003/api/bookings/admin/recent", {
      cache: "no-store",
      headers: {
        "Authorization": localStorage.getItem("authToken") ? `Bearer ${localStorage.getItem("authToken")}` : ""
      }
    });
    const bookings = await recentRes.json();

    serviceList.innerHTML = services.map(s => `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-semibold">${s.name}</div>
          <small class="text-muted">${s.duration}</small>
        </div>
        <span class="badge text-bg-primary">₹${s.price}</span>
      </div>
    `).join("");

    if (!bookings.length) {
      table.innerHTML = `<tr><td colspan="5" class="text-muted">No bookings yet.</td></tr>`;
      return;
    }

    table.innerHTML = bookings.map(b => `
      <tr>
        <td>${b.name || b.userId?.name || 'Customer'}</td>
        <td>${Array.isArray(b.services) ? b.services.join(", ") : b.services}</td>
        <td>${b.appointmentDate}</td>
        <td>${b.appointmentTime}</td>
        <td>₹${b.totalAmount}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Admin dashboard load error:", error);
    table.innerHTML = `<tr><td colspan="5" class="text-danger">Failed to load data</td></tr>`;
  }
}

// Initialize only after DOM is ready
window.addEventListener("DOMContentLoaded", async () => {
  if (window.Auth) {
    await Auth.initAuth();
  }

  await fetchServices();

  renderServiceCards("popularServices", services.slice(0, 6));
  renderServiceCards("allServices", services);
  renderCheckboxes();
  updateBookingTotal();
  renderAdmin();
});
