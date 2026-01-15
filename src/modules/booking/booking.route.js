import express from "express";
import {
  createBooking,
  updateBooking,
  getBookingById,
  getAllBookings,
  deleteBooking,
  restoreBooking,
  permanentDeleteBooking,
  getBookingsByMobile,
} from "./booking.controller.js";

const router = express.Router();

// -----------------------------------------
// 1️⃣ Create booking
// POST /api/booking
// -----------------------------------------
router.post("/", createBooking);

// -----------------------------------------
// 2️⃣ Update booking
// PUT /api/booking/:id
// -----------------------------------------
router.put("/:id", updateBooking);

// -----------------------------------------
// 3️⃣ Get booking by ID
// GET /api/booking/:id
// -----------------------------------------
router.get("/:id", getBookingById);

// -----------------------------------------
// 4️⃣ Get all bookings (paginated)
// GET /api/booking
// -----------------------------------------
router.get("/", getAllBookings);

// -----------------------------------------
// 5️⃣ Delete booking (soft delete)
// DELETE /api/booking/:id
// -----------------------------------------
router.delete("/:id", deleteBooking);

// -----------------------------------------
// 6️⃣ Restore booking
// PATCH /api/booking/restore/:id
// -----------------------------------------
router.patch("/restore/:id", restoreBooking);

// -----------------------------------------
// 7️⃣ Permanent delete
// DELETE /api/booking/permanent/:id
// -----------------------------------------
router.delete("/permanent/:id", permanentDeleteBooking);

// -----------------------------------------
// 8️⃣ Get bookings by customer mobile
// GET /api/booking/mobile?mobile=1234567890
// -----------------------------------------
router.get("/mobile/search", getBookingsByMobile);

export default router;
