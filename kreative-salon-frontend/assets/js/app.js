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
  const pendingTable = document.getElementById("pendingRequestsTable");
  const serviceList = document.getElementById("adminServiceList");
  const totalBookingsEl = document.getElementById("adminTotalBookings");
  const todayBookingsEl = document.getElementById("adminTodayBookings");
  const totalRevenueEl = document.getElementById("adminTotalRevenue");
  const noRequestsMsg = document.getElementById("noRequestsMsg");

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

    // Load pending requests
    const pendingRes = await fetch("http://localhost:5003/api/bookings/admin/requests", {
      cache: "no-store",
      headers: {
        "Authorization": localStorage.getItem("authToken") ? `Bearer ${localStorage.getItem("authToken")}` : ""
      }
    });
    const pendingRequests = await pendingRes.json();

    // Render pending requests
    if (!pendingRequests.length) {
      pendingTable.innerHTML = "";
      if (noRequestsMsg) noRequestsMsg.classList.remove("d-none");
    } else {
      if (noRequestsMsg) noRequestsMsg.classList.add("d-none");
      pendingTable.innerHTML = pendingRequests.map(b => `
        <tr>
          <td>${b.name || b.userId?.name || 'Customer'}</td>
          <td>${Array.isArray(b.services) ? b.services.join(", ") : b.services}</td>
          <td>${b.appointmentDate}</td>
          <td>${b.appointmentTime}</td>
          <td>
            <button class="btn btn-sm btn-success" onclick="confirmBookingRequest('${b._id}')">
              Confirm
            </button>
          </td>
        </tr>
      `).join("");
    }

    // Load confirmed bookings only
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

    // Filter confirmed bookings only
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    
if (!confirmedBookings.length) {
      table.innerHTML = `<tr><td colspan="6" class="text-muted">No confirmed bookings yet.</td></tr>`;
      return;
    }

table.innerHTML = confirmedBookings.map(b => `
      <tr>
        <td>${b.name || b.userId?.name || 'Customer'}</td>
        <td>${Array.isArray(b.services) ? b.services.join(", ") : b.services}</td>
        <td>${b.phone || b.userId?.phone || 'N/A'}</td>
        <td>${b.appointmentDate}</td>
        <td>${b.appointmentTime}</td>
        <td>₹${b.totalAmount}</td>
      </tr>
    `).join("");
} catch (error) {
    console.error("Admin dashboard load error:", error);
    table.innerHTML = `<tr><td colspan="6" class="text-danger">Failed to load data</td></tr>`;
  }
}

// Confirm a booking request (called from admin dashboard)
async function confirmBookingRequest(bookingId) {
  if (!confirm("Are you sure you want to confirm this booking?")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:5003/api/bookings/${bookingId}/confirm`, {
      method: "PUT",
      headers: {
        "Authorization": localStorage.getItem("authToken") ? `Bearer ${localStorage.getItem("authToken")}` : ""
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to confirm booking");
    }

    alert("Booking confirmed successfully!");
    
    // Refresh the admin dashboard
    renderAdmin();
  } catch (error) {
    console.error("Confirm booking error:", error);
    alert(error.message || "Failed to confirm booking");
  }
}

// Load analytics data for admin dashboard
async function loadAnalytics() {
  const periodSelect = document.getElementById("analyticsPeriod");
  const period = periodSelect ? periodSelect.value : 30;

  const analyticsTotalBookings = document.getElementById("analyticsTotalBookings");
  const analyticsRevenue = document.getElementById("analyticsRevenue");
  const analyticsAvgValue = document.getElementById("analyticsAvgValue");
  const analyticsCustomers = document.getElementById("analyticsCustomers");
  const popularServicesList = document.getElementById("popularServicesList");

  if (!analyticsTotalBookings) return;

  try {
    // Load booking analytics
    const analyticsRes = await fetch(`http://localhost:5003/api/analytics/bookings?period=${period}`, {
      headers: {
        "Authorization": localStorage.getItem("authToken") ? `Bearer ${localStorage.getItem("authToken")}` : ""
      }
    });
    const analytics = await analyticsRes.json();

    analyticsTotalBookings.textContent = analytics.totalBookings || 0;
    analyticsRevenue.textContent = `₹${analytics.totalRevenue || 0}`;
    analyticsAvgValue.textContent = `₹${analytics.avgBookingValue || 0}`;
    analyticsCustomers.textContent = analytics.totalCustomers || 0;

    // Render popular services
    if (analytics.popularServices && analytics.popularServices.length) {
      popularServicesList.innerHTML = analytics.popularServices.map(s => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
          <div class="fw-semibold">${s._id || 'Unknown'}</div>
          <span class="badge text-bg-primary">${s.count} bookings</span>
        </div>
      `).join("");
    } else {
      popularServicesList.innerHTML = '<div class="text-muted">No data available</div>';
    }
  } catch (error) {
    console.error("Error loading analytics:", error);
  }

  try {
    // Load monthly stats
    const monthlyRes = await fetch("http://localhost:5003/api/analytics/monthly", {
      headers: {
        "Authorization": localStorage.getItem("authToken") ? `Bearer ${localStorage.getItem("authToken")}` : ""
      }
    });
    const monthly = await monthlyRes.json();

    const thisMonthBookings = document.getElementById("thisMonthBookings");
    const thisMonthRevenue = document.getElementById("thisMonthRevenue");
    const lastMonthBookings = document.getElementById("lastMonthBookings");
    const lastMonthRevenue = document.getElementById("lastMonthRevenue");
    const bookingsGrowth = document.getElementById("bookingsGrowth");
    const revenueGrowth = document.getElementById("revenueGrowth");

    if (thisMonthBookings) {
      thisMonthBookings.textContent = `${monthly.currentMonth?.bookings || 0} bookings`;
      thisMonthRevenue.textContent = `₹${monthly.currentMonth?.revenue || 0}`;
    }
    if (lastMonthBookings) {
      lastMonthBookings.textContent = `${monthly.lastMonth?.bookings || 0} bookings`;
      lastMonthRevenue.textContent = `₹${monthly.lastMonth?.revenue || 0}`;
    }
    if (bookingsGrowth) {
      const bg = monthly.growth?.bookings || 0;
      bookingsGrowth.textContent = bg >= 0 ? `↑ ${bg}% bookings` : `↓ ${Math.abs(bg)}% bookings`;
      bookingsGrowth.className = bg >= 0 ? "text-success" : "text-danger";
    }
    if (revenueGrowth) {
      const rg = monthly.growth?.revenue || 0;
      revenueGrowth.textContent = rg >= 0 ? `↑ ${rg}% revenue` : `↓ ${Math.abs(rg)}% revenue`;
      revenueGrowth.className = rg >= 0 ? "text-success" : "text-danger";
    }
  } catch (error) {
    console.error("Error loading monthly stats:", error);
  }
}

// Make loadAnalytics available globally
window.loadAnalytics = loadAnalytics;

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
