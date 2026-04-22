const services = [
  { id: 1, name: "Haircut", price: 200, duration: "30 min" },
  { id: 2, name: "Beard Trim", price: 100, duration: "20 min" },
  { id: 3, name: "Hair Wash", price: 150, duration: "20 min" },
  { id: 4, name: "Head Massage", price: 300, duration: "30 min" },
  { id: 5, name: "Facial", price: 500, duration: "45 min" },
  { id: 6, name: "Hair Coloring", price: 1000, duration: "90 min" },
  { id: 7, name: "Hair Straightening", price: 1500, duration: "120 min" },
  { id: 8, name: "Dandruff Treatment", price: 400, duration: "40 min" },
  { id: 9, name: "Shaving", price: 120, duration: "20 min" },
  { id: 10, name: "Kids Haircut", price: 150, duration: "25 min" }
];

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
  const selected = [...document.querySelectorAll(".service-check:checked")].map(el => Number(el.value));
  const total = services
    .filter(s => selected.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const totalEl = document.getElementById("bookingTotal");
  if (totalEl) totalEl.textContent = `₹${total}`;
}

function getBookings() {
  return JSON.parse(localStorage.getItem("kreativeBookings") || "[]");
}

function saveBookings(bookings) {
  localStorage.setItem("kreativeBookings", JSON.stringify(bookings));
}

function setupBookingForm() {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("customerName")?.value.trim() || "";
    const phone = document.getElementById("customerPhone")?.value.trim() || "";
    const date = document.getElementById("bookingDate")?.value || "";
    const time = document.getElementById("bookingTime")?.value || "";
    const notes = document.getElementById("bookingNotes")?.value.trim() || "";

    const selectedIds = [...document.querySelectorAll(".service-check:checked")].map(el => Number(el.value));
    const selectedServices = services.filter(s => selectedIds.includes(s.id));

    if (!selectedServices.length) {
      alert("Please select at least one service.");
      return;
    }

    const total = selectedServices.reduce((sum, s) => sum + s.price, 0);

    const booking = {
      id: Date.now(),
      name,
      phone,
      date,
      time,
      notes,
      services: selectedServices.map(s => s.name),
      total
    };

    const bookings = getBookings();
    bookings.unshift(booking);
    saveBookings(bookings);

    const success = document.getElementById("bookingSuccess");
    if (success) {
      success.classList.remove("d-none");
      success.textContent = `Booking confirmed for ${name}. Total: ₹${total}`;
    }

    form.reset();
    updateBookingTotal();
  });
}

function renderBookings() {
  const container = document.getElementById("bookingsList");
  if (!container) return;

  const bookings = getBookings();

  if (!bookings.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-secondary">No bookings yet. Book your first appointment.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = bookings.map(booking => `
    <div class="col-md-6">
      <div class="card border-0 shadow-sm rounded-4 h-100">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="fw-bold mb-0">${booking.name}</h5>
            <span class="badge text-bg-primary">₹${booking.total}</span>
          </div>
          <p class="mb-2"><strong>Services:</strong> ${booking.services.join(", ")}</p>
          <p class="mb-2"><strong>Date:</strong> ${booking.date}</p>
          <p class="mb-2"><strong>Time:</strong> ${booking.time}</p>
          <p class="mb-0"><strong>Phone:</strong> ${booking.phone}</p>
        </div>
      </div>
    </div>
  `).join("");
}

function renderAdmin() {
  const bookings = getBookings();
  const table = document.getElementById("adminBookingsTable");
  const serviceList = document.getElementById("adminServiceList");
  const totalBookings = document.getElementById("adminTotalBookings");
  const todayBookings = document.getElementById("adminTodayBookings");
  const totalRevenue = document.getElementById("adminTotalRevenue");

  if (!table || !serviceList || !totalBookings || !todayBookings || !totalRevenue) return;

  totalBookings.textContent = bookings.length;
  const today = new Date().toISOString().split("T")[0];
  todayBookings.textContent = bookings.filter(b => b.date === today).length;
  totalRevenue.textContent = `₹${bookings.reduce((sum, b) => sum + b.total, 0)}`;

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
      <td>${b.name}</td>
      <td>${b.services.join(", ")}</td>
      <td>${b.date}</td>
      <td>${b.time}</td>
      <td>₹${b.total}</td>
    </tr>
  `).join("");
}

// Initialize only after DOM is ready
window.addEventListener("DOMContentLoaded", async () => {
  if (window.Auth) {
    await Auth.initAuth();
  }

  renderServiceCards("popularServices", services.slice(0, 6));
  renderServiceCards("allServices", services);
  renderCheckboxes();
  updateBookingTotal();
  setupBookingForm();
  renderBookings();
  renderAdmin();
});
