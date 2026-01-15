import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
    // Footer Section
    copyrightText: { type: String, default: '© 2025 Your Brand Name' },
    contactEmail: { type: String, default: '' },
    footerDescription: { type: String, default: '' },

    // Social Section
    facebookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },

    // Identity Section
    siteName: { type: String, default: 'My Professional Admin' },
    language: { type: String, default: 'English (United States)' },

    // Soft Delete Field
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true
});

// Middleware to prevent fetching "soft-deleted" settings
SettingSchema.pre('find', function () {
    this.where({ deletedAt: null });
});

SettingSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});

export default mongoose.model('Setting', SettingSchema);