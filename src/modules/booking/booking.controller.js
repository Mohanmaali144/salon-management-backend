import Booking from "./booking.model.js";
import Service from "../service/service.model.js";
import User from "../user/user.model.js";
import { customPaginate } from "../../utils/customPaginate.js";
import { failure, success } from "../../utils/responseHandler.js";

// Helper to calculate end time
const addMinutes = (time, minutes) => {
  const [h, m] = time.split(":").map(Number);
  const date = new Date(0, 0, 0, h, m + minutes);
  return date.toTimeString().slice(0, 5); // HH:mm
};

// -----------------------------------------
// 1️⃣ Create Booking
// -----------------------------------------
export const createBooking = async (req, res) => {
  try {
    const { customer, staffId, serviceId, date, startTime, price, notes } = req.body;

    // Validation
    if (!customer || !customer.name || !customer.mobile || !staffId || !serviceId || !date || !startTime || !price) {
      return res.status(400).json(
        failure({
          message: "All required fields must be provided",
          code: "VALIDATION_ERROR",
        })
      );
    }

    // Check service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json(failure({ message: "Service not found", code: "SERVICE_NOT_FOUND" }));
    }

    // Check staff exists
    const staff = await User.findById(staffId);
    if (!staff || staff.deletedAt) {
      return res.status(404).json(failure({ message: "Staff not found", code: "STAFF_NOT_FOUND" }));
    }

    // Calculate endTime
    const endTime = addMinutes(startTime, service.duration);

    // Check overlap
    const conflict = await Booking.findOne({
      staff: staffId,
      date,
      deletedAt: null,
      status: "booked",
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return res.status(409).json(failure({
        message: "Staff is already booked for this time",
        code: "STAFF_BUSY",
      }));
    }

    // Create bookingId (simple, can improve)
    const bookingId = "BK-" + Date.now();

    const booking = await Booking.create({
      bookingId,
      customer,
      staff: staffId,
      service: serviceId,
      date,
      startTime,
      endTime,
      price,
      notes,
    });

    return res.status(201).json(success({
      data: booking,
      message: "Booking created successfully",
      code: "BOOKING_CREATED",
    }));

  } catch (err) {
    console.error(err);
    return res.status(500).json(failure({
      message: "Internal server error",
      code: "SERVER_ERROR",
    }));
  }
};

// -----------------------------------------
// 2️⃣ Update Booking
// -----------------------------------------
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const booking = await Booking.findById(id);
    if (!booking || booking.deletedAt) {
      return res.status(404).json(failure({ message: "Booking not found", code: "BOOKING_NOT_FOUND" }));
    }

    // If startTime/serviceId/staffId changes, re-calc endTime & check overlap
    let newStartTime = updateData.startTime || booking.startTime;
    let newServiceId = updateData.serviceId || booking.service;
    let newStaffId = updateData.staff || booking.staff;

    const service = await Service.findById(newServiceId);
    if (!service) {
      return res.status(404).json(failure({ message: "Service not found", code: "SERVICE_NOT_FOUND" }));
    }

    const newEndTime = addMinutes(newStartTime, service.duration);

    // Check overlap
    const conflict = await Booking.findOne({
      _id: { $ne: id },
      staff: newStaffId,
      date: updateData.date || booking.date,
      deletedAt: null,
      status: "booked",
      startTime: { $lt: newEndTime },
      endTime: { $gt: newStartTime },
    });

    if (conflict) {
      return res.status(409).json(failure({
        message: "Staff is already booked for this time",
        code: "STAFF_BUSY",
      }));
    }

    // Update endTime automatically
    updateData.endTime = newEndTime;

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json(success({
      data: updatedBooking,
      message: "Booking updated successfully",
      code: "BOOKING_UPDATED",
    }));

  } catch (err) {
    console.error(err);
    return res.status(500).json(failure({ message: "Internal server error", code: "SERVER_ERROR" }));
  }
};

// -----------------------------------------
// 3️⃣ Get Booking by ID
// -----------------------------------------
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("staff service");
    if (!booking || booking.deletedAt) {
      return res.status(404).json(failure({ message: "Booking not found", code: "BOOKING_NOT_FOUND" }));
    }

    return res.status(200).json(success({
      data: booking,
      message: "Booking fetched successfully",
      code: "BOOKING_FETCHED",
    }));

  } catch (err) {
    console.error(err);
    return res.status(500).json(failure({ message: "Internal server error", code: "SERVER_ERROR" }));
  }
};

// -----------------------------------------
// 4️⃣ Get All Bookings (Paginated)
// -----------------------------------------

// -----------------------------------------
// 6️⃣ Get Bookings by Customer Mobile
// -----------------------------------------
export const getBookingsByMobile = async (req, res) => {
  try {
    const { mobile, page, limit, sort } = req.query;

    if (!mobile) {
      return res.status(400).json(
        failure({
          message: "Customer mobile number is required",
          code: "VALIDATION_ERROR",
        })
      );
    }

    // Use custom pagination
    const bookings = await customPaginate(
      Booking,
      { "customer.mobile": mobile, deletedAt: null },
      { page, limit, sort },
      [] // no aggregation needed
    );

    if (!bookings.results.length) {
      return res.status(404).json(
        failure({
          message: "No bookings found for this mobile number",
          code: "BOOKINGS_NOT_FOUND",
        })
      );
    }

    return res.status(200).json(
      success({
        data: bookings,
        message: "Bookings fetched successfully",
        code: "BOOKINGS_FETCHED",
      })
    );

  } catch (err) {
    console.error(err);
    return res.status(500).json(
      failure({
        message: "Internal server error",
        code: "SERVER_ERROR",
      })
    );
  }
};


export const getAllBookings = async (req, res) => {
  try {
    const { page, limit, sort } = req.query;
    const bookings = await customPaginate(
      Booking,
      { deletedAt: null },
      { page, limit, sort },
      []
    );

    return res.status(200).json(success({
      data: bookings,
      message: "Bookings fetched successfully",
      code: "BOOKINGS_FETCHED",
    }));

  } catch (err) {
    console.error(err);
    return res.status(500).json(failure({ message: "Internal server error", code: "SERVER_ERROR" }));
  }
};

// -----------------------------------------
// 5️⃣ Trash, Restore & Permanent Delete
// -----------------------------------------

// Soft delete
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!booking) {
      return res.status(404).json(failure({ message: "Booking not found", code: "BOOKING_NOT_FOUND" }));
    }

    return res.status(200).json(success({
      data: booking,
      message: "Booking deleted successfully",
      code: "BOOKING_DELETED",
    }));

  } catch (err) {
    console.error(err);
    return res.status(500).json(failure({ message: "Internal server error", code: "SERVER_ERROR" }));
  }
};

// Restore
export const restoreBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
    if (!booking) {
      return res.status(404).json(failure({ message: "Booking not found", code: "BOOKING_NOT_FOUND" }));
    }

    return res.status(200).json(success({
      data: booking,
      message: "Booking restored successfully",
      code: "BOOKING_RESTORED",
    }));

  } catch (err) {
    console.error(err);
    return res.status(500).json(failure({ message: "Internal server error", code: "SERVER_ERROR" }));
  }
};

// Permanent delete
export const permanentDeleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json(failure({ message: "Booking not found", code: "BOOKING_NOT_FOUND" }));
    }

    return res.status(200).json(success({
      data: null,
      message: "Booking permanently deleted",
      code: "BOOKING_PERMANENTLY_DELETED",
    }));

  } catch (err) {
    console.error(err);
    return res.status(500).json(failure({ message: "Internal server error", code: "SERVER_ERROR" }));
  }
};
