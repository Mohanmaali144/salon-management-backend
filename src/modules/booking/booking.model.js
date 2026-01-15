import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

  
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      mobile: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },

    startTime: {
      type: String, // HH:mm
      required: true,
    },

    endTime: {
      type: String, // HH:mm
      required: true,
    },

    status: {
      type: String,
      enum: ["booked", "completed", "cancelled"],
      default: "booked",
    },

    price: {
      type: Number,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ staff: 1, date: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
