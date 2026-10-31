const express = require("express");

const app = express();
app.use(express.json());

// Enable CORS for testing from dashboard
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Sirf synthetic demo data
const users = {
  "user-a-token": { id: "user-a", name: "Aarav" },
  "user-b-token": { id: "user-b", name: "Riya" },
};

const bookings = [
  {
    id: "booking-101",
    userId: "user-a",
    hotel: "Demo Hotel A",
    amount: 2000,
  },
  {
    id: "booking-202",
    userId: "user-b",
    hotel: "Demo Hotel B",
    amount: 3500,
  },
];

// Demo authentication: valid synthetic token required
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const user = users[token];

  if (!user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  req.user = user;
  next();
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "demo-target" });
});

// INTENTIONALLY VULNERABLE: ownership check missing
app.get("/vulnerable/bookings/:id", authenticate, (req, res) => {
  const booking = bookings.find(
    (item) => item.id === req.params.id
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  // BUG: booking ke owner aur logged-in user ko compare nahi kiya
  return res.json(booking);
});


// SECURE: ownership check implemented
app.get("/secure/bookings/:id", authenticate, (req, res) => {
  const booking = bookings.find(
    (item) => item.id === req.params.id
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.userId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden: Not resource owner" });
  }

  return res.json(booking);
});

// Demo-only API inventory for the security scanner
app.get("/__security/routes", (req, res) => {
  res.json({
    routes: [
      {
        method: "GET",
        path: "/vulnerable/bookings/:id",
        resourceType: "booking",
        ownershipField: "userId",
        sampleIds: ["booking-101", "booking-202"],
      },
      {
        method: "GET",
        path: "/secure/bookings/:id",
        resourceType: "booking",
        ownershipField: "userId",
        sampleIds: ["booking-101", "booking-202"],
      },
    ],
  });
});

const PORT = 4000;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Demo target running at http://127.0.0.1:${PORT}`);
});
