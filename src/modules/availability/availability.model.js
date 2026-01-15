import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    start: {
      type: String, // "09:00"
      required: true,
    },
    end: {
      type: String, // "10:30"
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: {
      type: String, // "2026-01-20"
      required: true,
      index: true,
    },

    isDayOff: {
      type: Boolean,
      default: false,
    },

    timeSlots: {
      type: [timeSlotSchema],
      default: [],
    },

    
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate availability for same staff + date
availabilitySchema.index({ staffId: 1, date: 1 }, { unique: true });

const  Availability = mongoose.model(
  "Availability",
  availabilitySchema
);
export default Availability