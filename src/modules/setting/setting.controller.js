import { failure, success } from '../../utils/responseHandler.js';
import Setting from './setting.model.js';

export const getSettings = async (req, res) => {
    try {
        // Only fetches where deletedAt is null due to schema middleware
        const settings = await Setting.findOne().sort({ createdAt: -1 });
        return res.status(200).json(
            success({
                data: settings ?? {},
                message: "Setting fetched successfully",
                code: "SETTING_FETCH_SUCCESS",
            })
        );
    } catch (error) {
        return res.status(500).json(
            failure({
                message: err.message,
                code: "SERVER_ERROR",
                details: err,
            })
        );
    }
};


export const updateSettings = async (req, res) => {
    try {
        const updatedSettings = await Setting.findOneAndUpdate(
            { deletedAt: null },
            { ...req.body, deletedAt: null },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(200).json(
            success({
                success: true,
                data: updatedSettings,
                message: "Setting created successfully",
                code: "SETTING_FETCH_SUCCESS",
            })
        );
    } catch (error) {
        return res.status(500).json(
            failure({
                message: err.message,
                code: "SERVER_ERROR",
                details: err,
            })
        );
    }
};


export const deleteSettings = async (req, res) => {
    try {
        await Setting.updateOne({ deletedAt: null }, { deletedAt: new Date() });

        return res.status(200).json(
            success({
                success: true,
                data: updatedSettings,
                message: "Settings soft-deleted",
                code: "SETTING_FETCH_SUCCESS",
            })
        );

    } catch (error) {
        return res.status(500).json(
            failure({
                message: err.message,
                code: "SERVER_ERROR",
                details: err,
            })
        );
    }
};



export const permanentDeleteSettings = async (req, res) => {
    try {
        const { id } = req.params;
        await Setting.findByIdAndDelete(id);
        success({
            success: true,
            data: updatedSettings,
            message: "Settings permanent deleted",
            code: "SETTING_FETCH_SUCCESS",
        })
    } catch (error) {
        return res.status(500).json(
            failure({
                message: err.message,
                code: "SERVER_ERROR",
                details: err,
            })
        );
    }
};