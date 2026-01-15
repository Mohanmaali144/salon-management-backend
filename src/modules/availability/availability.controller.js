import { customPaginate } from "../../utils/customPaginate.js";
import { failure, success } from "../../utils/responseHandler.js";
import Availability from "./availability.model.js";
import Booking from "../booking/booking.model.js";
import Service from "../service/service.model.js";
import User from "../user/user.model.js";

const addMinutes = (time, minutes) => {
  const [h, m] = time.split(":").map(Number);
  const date = new Date(0, 0, 0, h, m + minutes);   
  return date.toTimeString().slice(0, 5); // HH:mm
};


// TEST
// Check if requested slot overlaps with existing slot
const isSlotAvailable = (slotStart, slotEnd, requestedStart, requestedEnd) => {
  return !(requestedStart < slotEnd && requestedEnd > slotStart);
};
export const addAvailability = async (req, res) => {
    try {
        const { staffId, date, timeSlots, isDayOff } = req.body;
        // Basic validation
        if (!staffId || !date) {
            return res.status(400).json(
                failure({
                    message: "staffId and date are required",
                    code: "VALIDATION_ERROR",
                })
            );
        }
        if (!isDayOff && (!Array.isArray(timeSlots) || timeSlots.length === 0)) {
            return res.status(400).json(
                failure({
                    message: "timeSlots are required unless it is a day off",
                    code: "VALIDATION_ERROR",
                })
            );
        }

        // Check if availability already exists for same staff + date
        const existingAvailability = await Availability.findOne({
            staffId,
            date,
            deletedAt: null,
        });

        if (existingAvailability) {
            return res.status(409).json(
                failure({
                    message: "Availability already exists for this staff on this date",
                    code: "AVAILABILITY_EXISTS",
                })
            );
        }

        const availability = await Availability.create({
            staffId,
            date,
            timeSlots: isDayOff ? [] : timeSlots,
            isDayOff: isDayOff || false,
        });

        return res.status(201).json(
            success({
                data: availability,
                message: "Availability added successfully",
                code: "AVAILABILITY_CREATED",
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


export const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { timeSlots, isDayOff } = req.body;

        const availability = await Availability.findOne({
            _id: id,
            deletedAt: null,
        });

        if (!availability) {
            return res.status(404).json(
                failure({
                    message: "Availability not found",
                    code: "AVAILABILITY_NOT_FOUND",
                })
            );
        }

        if (typeof isDayOff === "boolean") {
            availability.isDayOff = isDayOff;
            availability.timeSlots = isDayOff ? [] : availability.timeSlots;
        }

        if (!availability.isDayOff && Array.isArray(timeSlots)) {
            availability.timeSlots = timeSlots;
        }

        await availability.save();

        return res.status(200).json(
            success({
                data: availability,
                message: "Availability updated successfully",
                code: "AVAILABILITY_UPDATED",
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



export const getAvailableStaff = async (req, res) => {
  try {
    const { date, startTime, serviceId } = req.query;

    // 1️⃣ Validate input
    if (!date || !startTime || !serviceId) {
      return res.status(400).json(
        failure({ message: "date, startTime and serviceId are required", code: "VALIDATION_ERROR" })
      );
    }

    // 2️⃣ Get service duration
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json(
        failure({ message: "Service not found", code: "SERVICE_NOT_FOUND" })
      );
    }

    const requestedStart = startTime;
    const requestedEnd = addMinutes(startTime, service.duration);

    // 3️⃣ Get all staff
    const staffList = await User.find({ role: "staff", deletedAt: null });

    const availableStaff = [];

    for (const staff of staffList) {
      // 4️⃣ Get availability for this date
      const availability = await Availability.findOne({
        staffId: staff._id,
        date,
        deletedAt: null,
      });

      if (!availability || availability.isDayOff) continue;

      // 5️⃣ Check timeSlots
      let slotAvailable = false;
      for (const slot of availability.timeSlots) {
        if (!slot.isBooked && isSlotAvailable(slot.start, slot.end, requestedStart, requestedEnd)) {
          slotAvailable = true;
          break;
        }
      }

      if (!slotAvailable) continue;

      // 6️⃣ Check bookings overlap
      const conflict = await Booking.findOne({
        staff: staff._id,
        date,
        status: "booked",
        deletedAt: null,
        startTime: { $lt: requestedEnd },
        endTime: { $gt: requestedStart },
      });

      if (conflict) continue;

      // ✅ Staff is available
      availableStaff.push(staff);
    }

    return res.status(200).json(
      success({
        data: availableStaff,
        message: "Available staff fetched successfully",
        code: "AVAILABLE_STAFF_FOUND",
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      failure({ message: "Internal server error", code: "SERVER_ERROR" })
    );
  }
};



export const getAvailabilityById = async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await Availability.findOne({
      _id: id,
      deletedAt: null,
    }).populate("staffId", "firstName lastName role");

    if (!availability) {
      return res.status(404).json(
        failure({
          message: "Availability not found",
          code: "AVAILABILITY_NOT_FOUND",
        })
      );
    }

    return res.status(200).json(
      success({
        data: availability,
        message: "Availability fetched successfully",
        code: "AVAILABILITY_FETCHED",
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

export const getAvailabilityByStaff = async (req, res) => {
    try {
        const { staffId } = req.params;

        const data = await customPaginate(
            Availability,
            { staffId, deletedAt: null },
            req.query
        );

        return res.status(200).json(
            success({
                data,
                message: "Staff availability fetched successfully",
                code: "STAFF_AVAILABILITY_LIST",
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

export const getAvailabilityByStaffAndDate = async (req, res) => {
  try {
    const { staffId, date } = req.query;

    if (!staffId || !date) {
      return res.status(400).json(
        failure({
          message: "staffId and date are required",
          code: "VALIDATION_ERROR",
        })
      );
    }

    const availability = await Availability.findOne({
      staffId,
      date,
      deletedAt: null,
    });

    if (!availability) {
      return res.status(404).json(
        failure({
          message: "Availability not found",
          code: "AVAILABILITY_NOT_FOUND",
        })
      );
    }

    return res.status(200).json(
      success({
        data: availability,
        message: "Availability fetched successfully",
        code: "AVAILABILITY_FETCHED",
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


export const getTrashedAvailability = async (req, res) => {
    try {
        const data = await customPaginate(
            Availability,
            { deletedAt: { $ne: null } },
            req.query
        );

        return res.status(200).json(
            success({
                data,
                message: "Trashed availability fetched successfully",
                code: "TRASHED_AVAILABILITY_LIST",
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

export const trashAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const availability = await Availability.findOne({
            _id: id,
            deletedAt: null,
        });

        if (!availability) {
            return res.status(404).json(
                failure({
                    message: "Availability not found",
                    code: "AVAILABILITY_NOT_FOUND",
                })
            );
        }

        availability.deletedAt = new Date();
        await availability.save();

        return res.status(200).json(
            success({
                data: availability,
                message: "Availability moved to trash",
                code: "AVAILABILITY_TRASHED",
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

export const restoreAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const availability = await Availability.findOne({
            _id: id,
            deletedAt: { $ne: null },
        });

        if (!availability) {
            return res.status(404).json(
                failure({
                    message: "Availability not found in trash",
                    code: "AVAILABILITY_NOT_FOUND",
                })
            );
        }

        availability.deletedAt = null;
        await availability.save();

        return res.status(200).json(
            success({
                data: availability,
                message: "Availability restored successfully",
                code: "AVAILABILITY_RESTORED",
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


export const permanentDeleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const availability = await Availability.findOne({
            _id: id,
            deletedAt: { $ne: null },
        });

        if (!availability) {
            return res.status(404).json(
                failure({
                    message: "Availability not found or not trashed",
                    code: "AVAILABILITY_NOT_FOUND",
                })
            );
        }

        await Availability.deleteOne({ _id: id });

        return res.status(200).json(
            success({
                message: "Availability permanently deleted",
                code: "AVAILABILITY_DELETED",
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
