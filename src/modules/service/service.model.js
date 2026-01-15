import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        duration: {
            type: Number, // in minutes
            required: true,
            enum: [15, 30, 45, 60],
        },

        image: {
            url: {
                type: String,
                trim: true,
            },
            publicId: {
                type: String,
                trim: true,
            },
        },

        isActive: {
            type: Boolean,
            default: true,
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

const Service =  mongoose.model("Service", serviceSchema);
export default Service
